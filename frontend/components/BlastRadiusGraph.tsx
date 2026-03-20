"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "service" | "module" | "file";
  risk: "critical" | "high" | "medium" | "low";
  isDirectTarget?: boolean;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

interface BlastRadiusGraphProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
  height?: number;
  width?: number;
  showMaximize?: boolean;
}

export function BlastRadiusGraph({ data, height = 500, width = 800, showMaximize = true }: BlastRadiusGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Define zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoomBehavior);
    
    // Automatically reset zoom when data changes to ensure nodes are visible
    svg.transition().duration(500).call(zoomBehavior.transform as any, d3.zoomIdentity);

    // Filter nodes to prevent large initial velocity
    const centerX = width / 2;
    const centerY = height / 2;
    data.nodes.forEach(n => {
        if (n.x === undefined) n.x = centerX + (Math.random() - 0.5) * 50;
        if (n.y === undefined) n.y = centerY + (Math.random() - 0.5) * 50;
    });

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force("link", d3.forceLink<Node, Link>(data.links).id((d) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(centerX, centerY).strength(1))
      .force("collision", d3.forceCollide().radius(60));

    // Define link styles (Increased visibility)
    const link = g.append("g")
      .attr("stroke", "#71717a") // Brighter edge (zinc-400 equivalent for darker backgrounds)
      .attr("stroke-opacity", 0.5)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value) * 3)
      .attr("class", "transition-all duration-300");

    // Define node style maps
    const nodeColors = {
      critical: "#f43f5e",
      high: "#f97316",
      medium: "#eab308",
      low: "#10b981",
    };

    // Define visual node groups
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "cursor-pointer group")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any
      )
      .on("mouseenter", (event, d) => {
        setHoveredNode(d);
        
        const connectedNodes = new Set<string>([d.id]);
        data.links.forEach((l: any) => {
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
          const targetId = typeof l.target === 'string' ? l.target : l.target.id;
          if (sourceId === d.id) connectedNodes.add(targetId);
          if (targetId === d.id) connectedNodes.add(sourceId);
        });

        node.transition().duration(250)
            .attr("opacity", n => connectedNodes.has(n.id) ? 1 : 0.1)
            .style("filter", n => connectedNodes.has(n.id) ? "none" : "grayscale(80%)");
        
        link.transition().duration(250)
            .attr("stroke-opacity", l => {
               const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
               const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
               return sourceId === d.id || targetId === d.id ? 1 : 0.03;
            })
            .attr("stroke", l => {
               const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
               const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
               return sourceId === d.id || targetId === d.id ? "#6366f1" : "#1a1a1a";
            })
            .attr("stroke-width", l => {
               const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
               const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
               return sourceId === d.id || targetId === d.id ? 4 : Math.sqrt((l as any).value) * 3;
            });
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
        node.transition().duration(250)
            .attr("opacity", 1)
            .style("filter", "none");
        link.transition().duration(250)
            .attr("stroke-opacity", 0.5)
            .attr("stroke", "#71717a")
            .attr("stroke-width", (d) => Math.sqrt(d.value) * 3);
      });

    // Draw background glow for critical nodes (Improved pulse effect)
    node.filter(d => d.risk === "critical")
      .append("circle")
      .attr("r", 32)
      .attr("fill", nodeColors.critical)
      .attr("fill-opacity", 0)
      .attr("class", "pointer-events-none")
      .append("animate")
      .attr("attributeName", "fill-opacity")
      .attr("values", "0;0.15;0")
      .attr("dur", "1.5s")
      .attr("repeatCount", "indefinite");

    node.filter(d => d.risk === "critical")
      .append("circle")
      .attr("r", 20)
      .attr("fill", nodeColors.critical)
      .attr("fill-opacity", 0.2)
      .attr("stroke", nodeColors.critical)
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.3)
      .attr("class", "pointer-events-none")
      .append("animate")
      .attr("attributeName", "r")
      .attr("values", "20;30;20")
      .attr("dur", "1.5s")
      .attr("repeatCount", "indefinite");

    // Draw main circle shape for nodes (Increased size and improved style)
    node.append("circle")
      .attr("r", (d) => (d.isDirectTarget ? 24 : 16))
      .attr("fill", "#09090b")
      .attr("stroke", (d) => nodeColors[d.risk])
      .attr("stroke-width", (d) => (d.isDirectTarget ? 6 : 4))
      .attr("class", "transition-all duration-300");

    // Add labels (positioned better relative to larger nodes)
    node.append("text")
      .text((d) => d.name)
      .attr("x", (d) => (d.isDirectTarget ? 30 : 22))
      .attr("y", 5)
      .attr("fill", "#f4f4f5")
      .attr("font-size", "12px")
      .attr("font-weight", "800")
      .attr("font-family", "inherit")
      .attr("class", "opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]")
      .attr("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, width, height]);

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom().on("zoom", (event) => {
        d3.select(svgRef.current).select("g").attr("transform", event.transform);
    });
    
    if (type === 'reset') {
        svg.transition().duration(750)
           .call(zoomBehavior.transform as any, d3.zoomIdentity);
    } else {
        svg.transition().duration(300)
           .call(zoomBehavior.scaleBy as any, type === 'in' ? 1.3 : 0.7);
    }
  };


  return (
    <div className="relative w-full h-full overflow-hidden group">

      {/* Zoom Controls Card */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-10 backdrop-blur-2xl px-3 py-1.5 rounded-2xl border border-white/5 bg-zinc-950/40 shadow-2xl">
         <button 
           onClick={() => handleZoom('in')}
           className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-zinc-800/80 rounded-xl active:scale-90"
         >
           <ZoomIn className="w-4 h-4" />
         </button>
         <button 
           onClick={() => handleZoom('out')}
           className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-zinc-800/80 rounded-xl active:scale-90"
         >
           <ZoomOut className="w-4 h-4" />
         </button>
         <div className="w-px h-6 bg-white/5 mx-1" />
         <button 
           onClick={() => handleZoom('reset')}
           className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-zinc-800/80 rounded-xl active:scale-90"
         >
           <RefreshCw className="w-4 h-4" />
         </button>
         {showMaximize && (
           <button className="p-2 text-zinc-500 hover:text-white transition-all hover:bg-zinc-800/80 rounded-xl active:scale-90">
             <Maximize2 className="w-4 h-4" />
           </button>
         )}
      </div>

      <div ref={containerRef} className="w-full h-full flex items-center justify-center cursor-move bg-linear-to-br from-black to-zinc-950/20">
        <svg ref={svgRef} width={width} height={height} className="max-w-full h-auto" />
      </div>

      {/* Node Tooltip/Info - Re-styled for premium feel */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-24 left-8 p-6 rounded-[24px] border border-white/5 bg-zinc-900/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 pointer-events-none min-w-[240px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  hoveredNode.risk === "critical" ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" :
                  hoveredNode.risk === "high" ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" :
                  hoveredNode.risk === "medium" ? "bg-yellow-500" : "bg-emerald-500"
                }`} />
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">{hoveredNode.type}</span>
              </div>
              {hoveredNode.isDirectTarget && (
                 <span className="text-[8px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Target</span>
              )}
            </div>
            <div className="text-base font-black text-white mb-1 tracking-tight">{hoveredNode.name}</div>
            <div className="text-[10px] text-zinc-500 font-mono mb-4 break-all opacity-60">ID: {hoveredNode.id}</div>
            <div className="flex flex-col gap-2.5 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Severity</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        hoveredNode.risk === "critical" ? "bg-rose-500/10 text-rose-500" :
                        hoveredNode.risk === "high" ? "bg-orange-500/10 text-orange-500" :
                        hoveredNode.risk === "medium" ? "bg-yellow-500/10 text-yellow-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>{hoveredNode.risk}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Dependency Depth</span>
                    <span className="text-[10px] font-black text-zinc-300">TRANSITIVE: 3</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Legend Card - Bottom Right Fix */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-4 z-10 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/5 bg-zinc-950/40 shadow-2xl">
         <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Risk Severity Legend</div>
         <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> 
              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Critical</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500" /> 
              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">High</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500" /> 
              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Medium</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> 
              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Low</span>
            </div>
         </div>
      </div>
    </div>
  );
}
