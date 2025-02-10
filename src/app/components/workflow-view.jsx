import { differenceInDays, format } from "date-fns";
import { enUS } from "date-fns/locale";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical, Workflow } from "lucide-react";

const getDayDifference = (date) => {
  const days = differenceInDays(new Date(), new Date(date));
  return days;
};

function WorkflowView({ workflows, viewMode }) {
  return (
    <div
      className={`
            ${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-2"
            }
          `}
    >
      {workflows.map((workflow) => (
        <Card
          key={workflow.id}
          className={`
                  hover:shadow-sm transition-shadow duration-200 border border-gray-200
                  ${viewMode === "list" ? "flex items-center py-2 px-4" : ""}
                `}
        >
          {viewMode === "list" ? (
            // List View Layout
            <Link
              href={`/workflow/${workflow.id}`}
              className="flex items-center justify-between w-full"
            >
              <div className="flex flex-col gap-4 flex-1">
                <div className="w-full flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {workflow.name}
                  </span>
                </div>
                <div className="w-fit flex gap-6">
                  <span className="text-xs text-gray-500">
                    Last updated {""}
                    {getDayDifference(workflow.updatedAt) === 0
                      ? "today"
                      : `${getDayDifference(workflow.updatedAt)} days ago`}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created {""}
                    {format(new Date(workflow.createdAt), "do MMMM", {
                      locale: enUS,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {workflow.active ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Link href={`/workflow/${workflow.id}`}>
                      <DropdownMenuLabel>Open</DropdownMenuLabel>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Link>
          ) : (
            // Grid View Layout
            <Link href={`/workflow/${workflow.id}`}>
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
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Last updated {""}
                    {getDayDifference(workflow.updatedAt) === 0
                      ? "today"
                      : `${getDayDifference(workflow.updatedAt)} days ago`}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created {""}
                    {format(new Date(workflow.createdAt), "do MMMM", {
                      locale: enUS,
                    })}
                  </span>
                </div>
              </CardContent>
            </Link>
          )}
        </Card>
      ))}
    </div>
  );
}

export default WorkflowView;
