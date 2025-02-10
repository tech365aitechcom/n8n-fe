"use client";
import React, { useState, useEffect } from "react";
import { Plus, Workflow, Loader2, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import WorkflowView from "./components/workflow-view";
import { baseURL } from "./baseURL";

export default function Home() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const router = useRouter();

  const fetchWorkflows = async () => {
    try {
      const response = await fetch(`${baseURL}/api/workflows`);
      const data = await response.json();
      setWorkflows(data.data);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">
                Manage and monitor your automated workflows
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/create-workflow")}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Create Workflow
          </Button>
        </div>
        <div className="flex items-center mb-4 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`p-1 ${
              viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
          >
            <LayoutGrid size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`p-1 ${
              viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
          >
            <List size={20} />
          </Button>
        </div>

        {/* Workflows Display */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <WorkflowView workflows={workflows} viewMode={viewMode} />
        )}

        {/* Empty State */}
        {!loading && workflows.length === 0 && (
          <div className="text-center py-12">
            <Workflow className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No workflows
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new workflow.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push("/create-workflow")}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Create Workflow
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
