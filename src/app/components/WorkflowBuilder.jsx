"use client";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Plus,
  GripHorizontal,
  Settings,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { baseURL } from "../baseURL";
import axios from "axios";
import { debounce } from "lodash";
import { getActions } from "../actionConverter";
import WorkflowModal from "./WorkflowModal";

const CustomNode = ({ data, id }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 w-64 nodrag">
      <div className="p-3 border-b border-gray-100 rounded-t-lg flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-gray-900">{data.appName}</span>
        </div>
        <div className="flex items-center gap-3">
          <GripHorizontal className="h-4 w-4 text-gray-400" />
          <Settings
            className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              data.onConfigure?.(id);
            }}
          />
          <Trash2
            className="h-4 w-4 text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.(id);
            }}
          />
        </div>
      </div>
      <div className="p-4 bg-white">
        <div className="text-sm text-gray-600">{data.action}</div>
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {Object.entries(data.config).map(([key, value]) => (
              <div key={key} className="truncate">
                {key}:{" "}
                <span className="font-medium text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 !bg-white hover:!bg-gray-50 transition-colors"
        style={{ borderRadius: "50%", borderColor: "#E5E7EB" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 !bg-white hover:!bg-gray-50 transition-colors"
        style={{ borderRadius: "50%", borderColor: "#E5E7EB" }}
      />
    </div>
  );
};

const customNodeTypes = {
  custom: CustomNode,
};

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
  style: {
    stroke: "#4A5568",
    strokeWidth: 2,
  },
};

const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");

  const fetchNodes = async (search, currentPage) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${baseURL}/get-nodes-names?search=${search}&page=${currentPage}&limit=${limit}`
      );
      setNodeTypes(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching nodes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${baseURL}/get-existing-credentials`);
        setCredentials(response.data);
      } catch (error) {
        console.error("Error fetching credentials:", error);
      }
    }
    fetchData();
  }, []);

  const fetchNodeDetails = async (nodeId) => {
    try {
      const response = await axios.get(`${baseURL}/get-node/${nodeId}`);
      setSelectedNodeDetails(response.data);
      setShowNodeDetails(true);
    } catch (error) {
      console.error("Error fetching node details:", error);
    }
  };

  useEffect(() => {
    if (selectedNode) {
      fetchNodeDetails(selectedNode);
    }
  }, [selectedNode]);

  const debouncedFetch = useMemo(
    () => debounce((search, page) => fetchNodes(search, page), 300),
    []
  );

  useEffect(() => {
    debouncedFetch(searchTerm, page);
    return () => debouncedFetch.cancel();
  }, [searchTerm, page, debouncedFetch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const onNodeClick = useCallback((id) => {
    if (id) {
      fetchNodeDetails(id);
    }
  }, []);

  const calculateNewNodePosition = (count) => {
    const baseX = 100;
    const baseY = 100;
    const horizontalGap = 300;
    const nodesPerRow = 3;

    const row = Math.floor(count / nodesPerRow);
    const col = count % nodesPerRow;

    return {
      x: baseX + col * horizontalGap,
      y: baseY + row * 150,
    };
  };

  const createNode = (type, action) => {
    const position = calculateNewNodePosition(nodeCount);

    const newNode = {
      id: `node_${nodeCount}`,
      type: "custom",
      data: {
        appName: nodeTypes[type].displayName,
        action: action,
        color: nodeTypes[type].color,
        onDelete: deleteNode,
        nodeId: nodeTypes[type].id,
      },
      position,
      dragHandle: ".nodrag",
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeCount((count) => count + 1);
  };

  const actions = getActions(selectedNodeDetails, () => {
    console.warn("No properties found, returning default actions.");
    return [];
  });

  const handleSaveWorkflow = async () => {
    try {
      const formattedNodes = nodes.map((node) => ({
        type: node.data.nodeId,
        data: node.data.config || {},
      }));

      const formattedEdges = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
      }));

      const workflowData = {
        name: workflowName,
        nodes: formattedNodes,
        edges: formattedEdges,
      };

      const response = await axios.post(
        `${baseURL}/api/create-workflows`,
        workflowData
      );

      toast({
        title: "Success",
        description: "Workflow saved successfully!",
        duration: 3000,
      });

      console.log("Workflow created:", response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error saving workflow:", error);
    }
  };

  console.log(credentials, "raju");

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    // <div className="h-screen w-full bg-gray-50">
    //   <div className="p-4 border-b border-gray-100 bg-white">
    //     <Dialog>
    //       <DialogTrigger asChild>
    //         <Button variant="outline" className="gap-2 hover:bg-gray-50">
    //           <Plus className="h-4 w-4" />
    //           Add Node
    //         </Button>
    //       </DialogTrigger>
    //       <DialogContent className="bg-white">
    //         <DialogHeader>
    //           <DialogTitle>Add Workflow Node</DialogTitle>
    //         </DialogHeader>
    //         <div className="relative">
    //           <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
    //           <Input
    //             placeholder="Search nodes..."
    //             value={searchTerm}
    //             onChange={handleSearch}
    //             className="pl-8 border-gray-200 focus-visible:ring-gray-200"
    //           />
    //         </div>
    //         <div className="grid grid-cols-2 gap-4 min-h-[300px]">
    //           {isLoading ? (
    //             <div className="col-span-2 flex items-center justify-center text-gray-500">
    //               Loading...
    //             </div>
    //           ) : nodeTypes.length === 0 ? (
    //             <div className="col-span-2 flex items-center justify-center text-gray-500">
    //               No nodes found
    //             </div>
    //           ) : (
    //             Object.entries(nodeTypes).map(([type, config]) => (
    //               <Card
    //                 key={type}
    //                 className="p-4 cursor-pointer border border-gray-100 hover:bg-gray-50 transition-colors group"
    //                 onClick={() => {
    //                   setSelectedNode(config._id);
    //                   setIsModalOpen(true);
    //                 }}
    //               >
    //                 <div className="flex items-center gap-2">
    //                   <img
    //                     src={`https://hireagent.app.n8n.cloud/${
    //                       typeof config.iconUrl === "object"
    //                         ? config.iconUrl.light
    //                         : config.iconUrl
    //                     }`}
    //                     className="w-6 h-6 group-hover:opacity-80 transition-opacity"
    //                   />
    //                   <h3 className="font-medium text-gray-900">
    //                     {config.displayName}
    //                   </h3>
    //                 </div>
    //               </Card>
    //             ))
    //           )}
    //         </div>
    //         <div className="flex justify-between mt-4">
    //           <Button
    //             variant="outline"
    //             onClick={goToPreviousPage}
    //             disabled={page === 1}
    //             className="flex items-center gap-2 disabled:opacity-50"
    //           >
    //             <ChevronLeft className="h-4 w-4" />
    //             Previous
    //           </Button>
    //           <span className="flex items-center text-gray-600">
    //             Page {page} of {totalPages}
    //           </span>
    //           <Button
    //             variant="outline"
    //             onClick={goToNextPage}
    //             disabled={page === totalPages}
    //             className="flex items-center gap-2 disabled:opacity-50"
    //           >
    //             Next
    //             <ChevronRight className="h-4 w-4" />
    //           </Button>
    //         </div>
    //         {selectedNode && (
    //           <div className="mt-4">
    //             <h4 className="font-bold mb-2">Select Action</h4>
    //             <div className="space-y-2">
    //               {actions
    //                 .flatMap((action) =>
    //                   action.options.map((opt) => opt.action)
    //                 )
    //                 .filter(Boolean)
    //                 .map((actionName) => (
    //                   <Button
    //                     key={actionName}
    //                     variant="outline"
    //                     className="w-full justify-start"
    //                     onClick={() => {
    //                       createNode(selectedNode, actionName);
    //                       setSelectedNode(null);
    //                     }}
    //                   >
    //                     {actionName}
    //                   </Button>
    //                 ))}
    //             </div>
    //           </div>
    //         )}
    //       </DialogContent>
    //     </Dialog>
    //     <Dialog open={selectedNode} onOpenChange={setSelectedNode}>
    //       <DialogContent className="bg-white">
    //         <DialogHeader>
    //           <DialogTitle>Node Details</DialogTitle>
    //         </DialogHeader>
    //         {selectedNode ? (
    //           <div className="mt-4">
    //             <h4 className="font-bold mb-2">Select Action</h4>
    //             <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
    //               {actions
    //                 .flatMap((action, actionIndex) =>
    //                   action.options.map((opt, optIndex) => ({
    //                     action: opt.action,
    //                     key: `${actionIndex}-${optIndex}-${opt.action}`,
    //                   }))
    //                 )
    //                 .filter((item) => Boolean(item.action))
    //                 .map(({ action, key }) => (
    //                   <Button
    //                     key={key}
    //                     variant="outline"
    //                     className="w-full justify-start"
    //                     onClick={() => {
    //                       createNode(selectedNode, action);
    //                       setSelectedNode(null);
    //                     }}
    //                   >
    //                     {action}
    //                   </Button>
    //                 ))}
    //             </div>
    //           </div>
    //         ) : (
    //           <div className="text-center text-gray-500">
    //             Loading node details...
    //           </div>
    //         )}
    //       </DialogContent>
    //     </Dialog>
    //     <WorkflowModal
    //       isOpen={isModalOpen}
    //       onClose={() => setIsModalOpen(false)}
    //       jsonData={selectedNodeDetails}
    //     />
    //   </div>
    //   <div className="h-[calc(100vh-73px)]">
    //     <ReactFlow
    //       nodes={nodes}
    //       edges={edges}
    //       onNodesChange={onNodesChange}
    //       onEdgesChange={onEdgesChange}
    //       onConnect={onConnect}
    //       nodeTypes={customNodeTypes}
    //       defaultEdgeOptions={defaultEdgeOptions}
    //       fitView
    //       deleteKeyCode={["Backspace", "Delete"]}
    //       minZoom={0.2}
    //       maxZoom={1.5}
    //       snapToGrid={false}
    //       snapGrid={[15, 15]}
    //     >
    //       <Background color="#E2E8F0" gap={16} />
    //       <Controls className="!bg-white !border-gray-100" />
    //     </ReactFlow>
    //   </div>
    // </div>
    <div className="h-screen w-full bg-gray-50">
      <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="max-w-xs border-gray-200 focus-visible:ring-gray-200"
            placeholder="Enter workflow name"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 hover:bg-gray-50">
                <Plus className="h-4 w-4" />
                Add Node
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Add Workflow Node</DialogTitle>
              </DialogHeader>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-8 border-gray-200 focus-visible:ring-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 min-h-[300px]">
                {isLoading ? (
                  <div className="col-span-2 flex items-center justify-center text-gray-500">
                    Loading...
                  </div>
                ) : nodeTypes.length === 0 ? (
                  <div className="col-span-2 flex items-center justify-center text-gray-500">
                    No nodes found
                  </div>
                ) : (
                  Object.entries(nodeTypes).map(([type, config]) => (
                    <Card
                      key={type}
                      className="p-4 cursor-pointer border border-gray-100 hover:bg-gray-50 transition-colors group"
                      onClick={() => {
                        setSelectedNode(config._id);
                        setIsModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://hireagent.app.n8n.cloud/${
                            typeof config.iconUrl === "object"
                              ? config.iconUrl.light
                              : config.iconUrl
                          }`}
                          className="w-6 h-6 group-hover:opacity-80 transition-opacity"
                        />
                        <h3 className="font-medium text-gray-900">
                          {config.displayName}
                        </h3>
                      </div>
                    </Card>
                  ))
                )}
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={page === 1}
                  className="flex items-center gap-2 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="flex items-center text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {selectedNode && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Select Action</h4>
                  <div className="space-y-2">
                    {actions
                      .flatMap((action) =>
                        action.options.map((opt) => opt.action)
                      )
                      .filter(Boolean)
                      .map((actionName) => (
                        <Button
                          key={actionName}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            createNode(selectedNode, actionName);
                            setSelectedNode(null);
                          }}
                        >
                          {actionName}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={selectedNode} onOpenChange={setSelectedNode}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Node Details</DialogTitle>
              </DialogHeader>
              {selectedNode ? (
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Select Action</h4>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {actions
                      .flatMap((action, actionIndex) =>
                        action.options.map((opt, optIndex) => ({
                          action: opt.action,
                          key: `${actionIndex}-${optIndex}-${opt.action}`,
                        }))
                      )
                      .filter((item) => Boolean(item.action))
                      .map(({ action, key }) => (
                        <Button
                          key={key}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            createNode(selectedNode, action);
                            setSelectedNode(null);
                          }}
                        >
                          {action}
                        </Button>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Loading node details...
                </div>
              )}
            </DialogContent>
          </Dialog>
          <WorkflowModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            jsonData={selectedNodeDetails}
          />
        </div>
        <Button onClick={handleSaveWorkflow} className="gap-2">
          <Save className="h-4 w-4" />
          Save Workflow
        </Button>
      </div>
      <div className="h-[calc(100vh-73px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={customNodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
          minZoom={0.2}
          maxZoom={1.5}
          snapToGrid={false}
          snapGrid={[15, 15]}
        >
          <Background color="#E2E8F0" gap={16} />
          <Controls className="!bg-white !border-gray-100" />
        </ReactFlow>
      </div>
      <WorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jsonData={selectedNodeDetails}
      />
    </div>
  );
};

export default WorkflowBuilder;
