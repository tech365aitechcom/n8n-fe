"use client";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CredentialForm = ({ schema }) => {
  const [formData, setFormData] = useState({ name: "", type: "", data: {} });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (schema && schema.properties) {
      const initialData = Object.keys(schema.properties).reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {});
      setFormData({ name: "", type: "", data: initialData });
      setOpen(true);
    }
  }, [schema]);

  if (!schema || !schema.properties) {
    return null; // Do not render the component if schema is not available
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/create-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      console.log("Success:", result);
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Credentials</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg">
          <div className="mb-4">
            <Label>Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Credential Name"
              required
            />
          </div>
          <div className="mb-4">
            <Label>Type</Label>
            <Input
              type="text"
              name="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              placeholder="Credential Type"
              required
            />
          </div>
          {Object.keys(schema.properties).map((key) => (
            <div key={key} className="mb-4">
              <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
              <Input
                type="text"
                name={key}
                value={formData.data[key] || ""}
                onChange={handleChange}
                placeholder={`Enter ${key}`}
                required
              />
            </div>
          ))}
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialForm;
