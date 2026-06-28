import React, { useState } from "react";
import { MindMapNode } from "../types";
import { ChevronRight, ChevronDown, Award, Circle, Sparkles } from "lucide-react";

interface MindMapVisualizerProps {
  node: MindMapNode;
}

export default function MindMapVisualizer({ node }: MindMapVisualizerProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (nodeName: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeName]: !prev[nodeName],
    }));
  };

  // Helper to render tree nodes recursively
  const renderNode = (currentNode: MindMapNode, depth: number = 0, index: number = 0) => {
    const isCollapsed = collapsedNodes[currentNode.name];
    const hasChildren = currentNode.children && currentNode.children.length > 0;

    // Custom depth styling
    const getBgColor = (d: number) => {
      if (d === 0) return "bg-indigo-600 text-white shadow-lg border border-indigo-700 font-bold";
      if (d === 1) return "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm font-semibold hover:bg-indigo-100 transition-colors";
      return "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs text-xs";
    };

    return (
      <div key={currentNode.name} className="flex flex-col ml-6 relative">
        {/* Left connector lines */}
        {depth > 0 && (
          <div className="absolute -left-4 top-5 w-4 h-[1px] bg-slate-300" />
        )}
        {depth > 0 && index > 0 && (
          <div className="absolute -left-4 -top-5 w-[1px] h-10 bg-slate-300" />
        )}

        <div className="flex items-center gap-2 my-1.5">
          <div
            onClick={() => hasChildren && toggleCollapse(currentNode.name)}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg border cursor-pointer select-none ${getBgColor(depth)}`}
            style={{ maxWidth: "280px" }}
          >
            {depth === 0 ? (
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
            ) : depth === 1 ? (
              <Award className="w-4 h-4 text-indigo-500 shrink-0" />
            ) : (
              <Circle className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            )}

            <span className="truncate">{currentNode.name}</span>

            {hasChildren && (
              <span className="ml-1 text-slate-400">
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            )}
          </div>
          
          {hasChildren && isCollapsed && (
            <span className="text-xs bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded-full border border-slate-200 animate-pulse">
              +{currentNode.children?.length} topics
            </span>
          )}
        </div>

        {hasChildren && !isCollapsed && (
          <div className="flex flex-col relative pl-2">
            {/* Vertical connector guide for children */}
            <div className="absolute left-2 top-0 bottom-5 w-[1px] bg-slate-300" />
            {currentNode.children?.map((child, i) => renderNode(child, depth + 1, i))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto min-h-[400px]">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
          Interactive Mind Map Taxonomy
        </h4>
        <p className="text-xs text-slate-500">
          Click on parent nodes to collapse branches and customize your focus. Use this to visualize core concepts hierarchically.
        </p>
      </div>

      <div className="py-4 select-none">
        {renderNode(node)}
      </div>
    </div>
  );
}
