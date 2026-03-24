"""
PRISM Dependency Agent — Native Tree-Sitter AST parsers and JS imports calculating cross-module blast radiuses.
"""
import asyncio
import os
import re
from pathlib import Path
from typing import Any

import networkx as nx
import tree_sitter_python as tspython
from tree_sitter import Language, Parser

from config import settings
from models.schemas import DependencyAnalysisResult

PY_LANGUAGE: Language = Language(tspython.language(), "python")

SUPPORTED_EXTENSIONS = {'.py', '.js', '.ts', '.jsx', '.tsx'}


def _create_python_parser() -> Parser:
    """Instantiate a secure thread-safe C-binding AST parser for Python analysis."""
    parser = Parser()
    parser.set_language(PY_LANGUAGE)
    return parser


def extract_imports_python(file_path: str) -> list[str]:
    """
    Statically mine Python imports via AST traversal.
    """
    parser: Parser = _create_python_parser()

    try:
        with open(file_path, "rb") as file_stream:
            source: bytes = file_stream.read()
    except (OSError, IOError):
        return []

    tree = parser.parse(source)
    imports: list[str] = []

    def _traverse(node) -> None:
        if node.type == "import_statement":
            for child in node.children:
                if child.type == "dotted_name":
                    imports.append(child.text.decode("utf-8"))
                elif child.type == "aliased_import":
                    for sub in child.children:
                        if sub.type == "dotted_name":
                            imports.append(sub.text.decode("utf-8"))
                            break

        elif node.type == "import_from_statement":
            for child in node.children:
                if child.type == "dotted_name":
                    imports.append(child.text.decode("utf-8"))
                    break
                elif child.type == "relative_import":
                    for sub in child.children:
                        if sub.type == "dotted_name":
                            imports.append(sub.text.decode("utf-8"))
                            break

        for child in node.children:
            _traverse(child)

    _traverse(tree.root_node)
    return imports


def extract_imports_javascript(file_path: str) -> list[str]:
    """
    Extract ES module imports and CommonJS requires from JS/TS files.
    Uses regex as fallback since tree-sitter-javascript may not be installed.
    Handles: import x from 'y', import {x} from 'y', require('y')
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            source = f.read()
    except OSError:
        return []
    
    imports = []
    
    # ES module imports: import x from './module'
    es_pattern = re.compile(
        r"""import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]""",
        re.MULTILINE
    )
    imports.extend(es_pattern.findall(source))
    
    # CommonJS requires: require('./module')  
    cjs_pattern = re.compile(
        r"""require\s*\(\s*['"]([^'"]+)['"]\s*\)""",
        re.MULTILINE
    )
    imports.extend(cjs_pattern.findall(source))
    
    # Filter to relative imports only (starting with ./ or ../)
    return [imp for imp in imports if imp.startswith('.')]


def extract_imports_for_file(file_path: str) -> list[str]:
    """
    Route to the correct import extractor based on file extension.
    Supports: .py, .js, .ts, .jsx, .tsx
    """
    path = Path(file_path)
    suffix = path.suffix.lower()
    
    if suffix == '.py':
        return extract_imports_python(file_path)
    elif suffix in {'.js', '.ts', '.jsx', '.tsx'}:
        return extract_imports_javascript(file_path)
    
    return []


def resolve_import_to_path(
    import_str: str, 
    repo_path: str, 
    source_file: str
) -> str | None:
    """
    Resolve a relative import string to a file path within the repo.
    Handles both Python module paths and JS/TS relative paths.
    """
    source_dir = Path(repo_path) / Path(source_file).parent
    
    # JS/TS relative imports (./module, ../utils/helper)
    if import_str.startswith('.'):
        candidate = (source_dir / import_str).resolve()
        
        # Try with common extensions
        for ext in ['.ts', '.tsx', '.js', '.jsx', '.py', '']:
            test_path = Path(str(candidate) + ext)
            if test_path.exists():
                try:
                    return str(test_path.relative_to(repo_path)).replace("\\", "/")
                except ValueError:
                    return None
        
        # Try as directory with index file
        for index in ['index.ts', 'index.tsx', 'index.js']:
            test_path = candidate / index
            if test_path.exists():
                try:
                    return str(test_path.relative_to(repo_path)).replace("\\", "/")
                except ValueError:
                    return None
    
    # Python dotted imports (auth.middleware → auth/middleware.py)
    else:
        py_path = Path(repo_path) / Path(import_str.replace('.', '/'))
        
        for suffix in ['.py', '/__init__.py']:
            test_path = Path(str(py_path) + suffix)
            if test_path.exists():
                try:
                    return str(test_path.relative_to(repo_path)).replace("\\", "/")
                except ValueError:
                    return None
    
    return None


def build_dependency_graph(repo_path: str) -> nx.DiGraph:
    """
    Sweep the materialized filesystem and forge the global directed application network mapping components to consumers.
    """
    G = nx.DiGraph()
    
    for ext in SUPPORTED_EXTENSIONS:
        for source_file in Path(repo_path).rglob(f'*{ext}'):
            # Skip node_modules, .git, __pycache__, dist, build
            if any(part in source_file.parts for part in {
                'node_modules', '.git', '__pycache__', 
                'dist', 'build', '.next', 'venv', '.venv'
            }):
                continue
                
            rel_path = str(source_file.relative_to(repo_path)).replace("\\", "/")
            G.add_node(rel_path)
            
            for imp in extract_imports_for_file(str(source_file)):
                resolved = resolve_import_to_path(imp, repo_path, rel_path)
                if resolved and resolved != rel_path:
                    G.add_edge(rel_path, resolved)
    
    return G


class DependencyAgent:
    """
    Executes deep BFS traversals to unearth unintended architectural couplings originating from PR scope.
    """

    async def build_graph(
        self, changed_files: list[str], repo_path: str
    ) -> DependencyAnalysisResult:
        """Asynchronously bootstrap structural graph matrices outside the execution loop to save thread limits."""
        loop: asyncio.AbstractEventLoop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self._build_graph_sync, changed_files, repo_path
        )

    def _build_graph_sync(
        self, changed_files: list[str], repo_path: str
    ) -> DependencyAnalysisResult:
        """
        Synchronously compute graph impacts.
        Deduces what modules break if the PR scope introduces instability.
        """
        forward_graph = build_dependency_graph(repo_path)
        reverse_graph = forward_graph.reverse()
        
        blast: dict[str, int] = {}
        max_depth: int = settings.max_graph_depth

        for changed_file in changed_files:
            if changed_file not in reverse_graph:
                continue

            shortest_paths = nx.single_source_shortest_path_length(
                reverse_graph, changed_file, cutoff=max_depth
            )
            for node, depth in shortest_paths.items():
                if node != changed_file:
                    if node not in blast or depth > blast[node]:
                        blast[node] = depth

        blast_radius: list[str] = list(blast.keys())
        max_impact_depth: int = max(blast.values(), default=0)
        total_affected: int = len(blast)

        relevant_nodes: set[str] = set(changed_files) | set(blast_radius)
        existing_nodes: list[str] = [n for n in relevant_nodes if n in forward_graph]
        subgraph = forward_graph.subgraph(existing_nodes).copy()

        for node in subgraph.nodes:
            subgraph.nodes[node]["is_changed"] = node in changed_files
            if node in blast:
                depth_val: int = blast[node]
                if depth_val >= 3:
                    subgraph.nodes[node]["risk_level"] = "high"
                elif depth_val >= 2:
                    subgraph.nodes[node]["risk_level"] = "medium"
                else:
                    subgraph.nodes[node]["risk_level"] = "low"
            elif node in changed_files:
                subgraph.nodes[node]["risk_level"] = "changed"
            else:
                subgraph.nodes[node]["risk_level"] = "safe"

        graph_json: dict[str, Any] = nx.node_link_data(subgraph)

        return DependencyAnalysisResult(
            dependency_graph=graph_json,
            blast_radius=blast_radius,
            impact_depth=blast,
            max_impact_depth=max_impact_depth,
            total_affected=total_affected,
            changed_files=changed_files,
        )
