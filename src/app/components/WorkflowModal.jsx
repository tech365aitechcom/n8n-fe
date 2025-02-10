"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WorkflowModal = ({ isOpen, onClose, jsonData }) => {
  const [resource, setResource] = useState("");
  const [operation, setOperation] = useState("");
  const [fields, setFields] = useState([]);
  const [useDefaultReminders, setUseDefaultReminders] = useState(false);

  const resources =
    jsonData?.properties.find((p) => p.name === "resource")?.options || [];

  const handleResourceChange = (value) => {
    setResource(value);
    setOperation("");
    setFields([]);
  };

  const operations =
    jsonData?.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource.includes(resource)
    )?.options || [];

  const handleOperationChange = (value) => {
    setOperation(value);
    const relevantFields = jsonData?.properties.filter(
      (p) =>
        p.displayOptions?.show?.operation?.includes(value) &&
        p.displayOptions?.show?.resource?.includes(resource)
    );
    setFields(relevantFields);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6 w-full max-w-lg">
        <DialogTitle>Select Action</DialogTitle>

        {/* Resource Selector */}
        <div className="mt-4">
          <Label>Resource</Label>
          <Select value={resource} onValueChange={handleResourceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a resource" />
            </SelectTrigger>
            <SelectContent>
              {resources.map((res) => (
                <SelectItem key={res.value} value={res.value}>
                  {res.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operation Selector */}
        <div className="mt-4">
          <Label>Operation</Label>
          <Select
            value={operation}
            onValueChange={handleOperationChange}
            disabled={!resource}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an operation" />
            </SelectTrigger>
            <SelectContent>
              {operations.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Use Default Reminders Switch */}
        <div className="mt-4 flex items-center gap-2">
          <Label>Use Default Reminders</Label>
          <Switch
            checked={useDefaultReminders}
            onCheckedChange={setUseDefaultReminders}
          />
        </div>

        {/* Dynamic Fields */}
        {fields.length > 0 && (
          <div className="mt-4">
            <Label>Fields</Label>
            {fields.map((field, index) => (
              <div key={`${field.name}-${index}`} className="mt-2">
                <Label>{field.displayName}</Label>
                {field.type === "string" && (
                  <Input
                    type="text"
                    placeholder={field.placeholder || "Enter value..."}
                  />
                )}
                {field.type === "dateTime" && <Input type="datetime-local" />}
                {field.type === "options" && field.options?.length > 0 && (
                  <Select>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${field.displayName}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowModal;
