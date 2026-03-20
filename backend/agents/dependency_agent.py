"""
PRISM Dependency Agent — AST-based import analysis and NetworkX graph construction.
"""
import os
import re
import glob
import asyncio
from typing import Optional

import networkx as nx
import tree_sitter_python as tspython
from tree_sitter import Language, Parser

from config import settings
from models.schemas import DependencyResult


# Initialize tree-sitter Python parser (v0.21 API)
PY_LANGUAGE = Language(tspython.language(), "python")


def _create_python_parser() -> Parser:
    """Create a tree-sitter parser for Python."""
    parser = Parser()
    parser.set_language(PY_LANGUAGE)
    return parser


def extract_imports_python(file_path: str) -> list[str]:
    """Use tree-sitter to parse Python AST and extract all import module names."""
    parser = _create_python_parser()

    try:
        with open(file_path, "rb") as f:
            source = f.read()
    except (OSError, IOError):
        return []

    tree = parser.parse(source)
    imports: list[str] = []

    def _traverse(node) -> None:
        if node.type == "import_statement":
            # import foo, import foo.bar
            for child in node.children:
                if child.type == "dotted_name":
                    imports.append(child.text.decode("utf-8"))
                elif child.type == "aliased_import":
                    for sub in child.children:
                        if sub.type == "dotted_name":
                            imports.append(sub.text.decode("utf-8"))
                            break

        elif node.type == "import_from_statement":
            # from foo import bar, from foo.bar import baz
            for child in node.children:
                if child.type == "dotted_name":
                    imports.append(child.text.decode("utf-8"))
                    break
                elif child.type == "relative_import":
                    # Handle relative imports: from . import x, from ..foo import y
                    for sub in child.children:
                        if sub.type == "dotted_name":
                            imports.append(sub.text.decode("utf-8"))
                            break

        for child in node.children:
            _traverse(child)

    _traverse(tree.root_node)
    return imports


def extract_imports_javascript(file_path: str) -> list[str]:
    """Regex-based fallback for JavaScript/TypeScript import extraction."""
    imports: list[str] = []

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except (OSError, IOError):
        return []

    # Match: import ... from 'module'
    # Match: import ... from "module"
    pattern_import = re.compile(
        r"""import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]""",
        re.MULTILINE,
    )
    for match in pattern_import.finditer(content):
        imports.append(match.group(1))

    # Match: const x = require('module')
    pattern_require = re.compile(r"""require\s*\(\s*['"]([^'"]+)['"]\s*\)""")
    for match in pattern_require.finditer(content):
        imports.append(match.group(1))

    return imports


def resolve_import_to_path(import_name: str, repo_path: str) -> Optional[str]:
    """Convert a dotted Python module name to a relative file path within the repo.
    
    e.g. 'auth.middleware' → 'auth/middleware.py'
    """
    # Convert dots to path separators
    parts = import_name.split(".")
    
    # Try as a module file: auth/middleware.py
    candidate = os.path.join(*parts) + ".py"
    if os.path.isfile(os.path.join(repo_path, candidate)):
        return candidate.replace("\\", "/")

    # Try as a package init: auth/middleware/__init__.py
    candidate_init = os.path.join(*parts, "__init__.py")
    if os.path.isfile(os.path.join(repo_path, candidate_init)):
        return os.path.join(*parts).replace("\\", "/") + "/__init__.py"

    # Try partial resolution (just the top-level module)
    if len(parts) > 1:
        candidate_partial = os.path.join(parts[0]) + ".py"
        if os.path.isfile(os.path.join(repo_path, candidate_partial)):
            return candidate_partial.replace("\\", "/")

    return None


def build_dependency_graph(repo_path: str) -> nx.DiGraph:
    """Walk all .py files in a repo and build a directed dependency graph.
    
    Nodes = relative file paths, Edges = import dependencies.
    """
    G = nx.DiGraph()

    py_files = glob.glob(os.path.join(repo_path, "**", "*.py"), recursive=True)

    for py_file in py_files:
        rel = os.path.relpath(py_file, repo_path).replace("\\", "/")
        G.add_node(rel)

        imports = extract_imports_python(py_file)
        for imp in imports:
            resolved = resolve_import_to_path(imp, repo_path)
            if resolved and resolved != rel:
                G.add_edge(rel, resolved)

    return G


class DependencyAgent:
    """Builds dependency graphs and computes blast radius for changed files."""

    async def build_graph(
        self, changed_files: list[str], repo_path: str
    ) -> DependencyResult:
        """Build the dependency graph and compute blast radius via BFS."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self._build_graph_sync, changed_files, repo_path
        )

    def _build_graph_sync(
        self, changed_files: list[str], repo_path: str
    ) -> DependencyResult:
        """Synchronous graph build + blast radius computation."""

        # Build the full project dependency graph
        G = build_dependency_graph(repo_path)

        # Also build the reverse graph to find who depends ON the changed files
        G_reverse = G.reverse()

        # Compute blast radius using BFS on the reverse graph
        blast: dict[str, int] = {}
        max_depth = settings.max_graph_depth

        for changed_file in changed_files:
            if changed_file not in G_reverse:
                continue

            # BFS: find all files that (transitively) depend on this changed file
            for node, depth in nx.single_source_shortest_path_length(
                G_reverse, changed_file, cutoff=max_depth
            ).items():
                if node != changed_file:
                    # Keep the maximum depth among all changed files
                    if node not in blast or depth > blast[node]:
                        blast[node] = depth

        blast_radius = list(blast.keys())
        max_impact_depth = max(blast.values(), default=0)
        total_affected = len(blast)

        # Build subgraph containing changed files + affected files
        relevant_nodes = set(changed_files) | set(blast_radius)
        existing_nodes = [n for n in relevant_nodes if n in G]
        subgraph = G.subgraph(existing_nodes).copy()

        # Add metadata to nodes
        for node in subgraph.nodes:
            subgraph.nodes[node]["is_changed"] = node in changed_files
            if node in blast:
                depth_val = blast[node]
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

        # Serialize to node-link format for D3.js
        graph_json = nx.node_link_data(subgraph)

        return DependencyResult(
            dependency_graph=graph_json,
            blast_radius=blast_radius,
            impact_depth=blast,
            max_impact_depth=max_impact_depth,
            total_affected=total_affected,
            changed_files=changed_files,
        )
