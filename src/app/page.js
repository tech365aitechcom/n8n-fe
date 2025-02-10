"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Workflow, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(
        "https://hireagent.app.n8n.cloud/api/v1/workflows",
        {
          headers: {
            "X-N8N-API-KEY": `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NjFkZGM4YS1hMGRmLTRkNWYtYmNiZC03YWJiNWNkZGUzZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzM5MTY5ODIzfQ.YY7IwUVZh9PRp7hhgQy2h93jlVl-77dk_hBYIiitcV0`,
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
      setWorkflows(response.data.data);
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
            <p className="text-gray-600 mt-2">
              Manage and monitor your automated workflows
            </p>
          </div>
          <Button
            onClick={() => router.push("/create-workflow")}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Create Workflow
          </Button>
        </div>

        {/* Workflows Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="hover:shadow-lg transition-shadow duration-200 border border-gray-200"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-semibold">
                    {workflow.name}
                  </CardTitle>
                  <Workflow className="w-6 h-6 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mt-2">
                    {workflow.active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-4 text-sm line-clamp-2">
                    {workflow.description || "No description available"}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
