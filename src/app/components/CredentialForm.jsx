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
} from "@/components/ui/dialog";
import { baseURL } from "../baseURL";

const CredentialForm = ({ schema, type }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "",
    data: {},
    homeProject: {
      id: "ksZvUQ9ctM7fspJF",
      name: "AITECH   <tech@365aitech.com>",
      icon: null,
      type: "personal",
      relations: [
        {
          id: "961ddc8a-a0df-4d5f-bcbd-7abb5cdde3dd",
          email: "tech@365aitech.com",
          firstName: "AITECH",
          lastName: " ",
          role: "project:personalOwner",
        },
      ],
      scopes: [
        "annotationTag:create",
        "annotationTag:read",
        "annotationTag:update",
        "annotationTag:delete",
        "annotationTag:list",
        "auditLogs:manage",
        "banner:dismiss",
        "credential:create",
        "credential:read",
        "credential:update",
        "credential:delete",
        "credential:list",
        "credential:share",
        "credential:move",
        "community:register",
        "communityPackage:install",
        "communityPackage:uninstall",
        "communityPackage:update",
        "communityPackage:list",
        "eventBusDestination:create",
        "eventBusDestination:read",
        "eventBusDestination:update",
        "eventBusDestination:delete",
        "eventBusDestination:list",
        "eventBusDestination:test",
        "externalSecretsProvider:create",
        "externalSecretsProvider:read",
        "externalSecretsProvider:update",
        "externalSecretsProvider:delete",
        "externalSecretsProvider:list",
        "externalSecretsProvider:sync",
        "externalSecret:list",
        "externalSecret:use",
        "ldap:manage",
        "ldap:sync",
        "license:manage",
        "logStreaming:manage",
        "orchestration:read",
        "saml:manage",
        "securityAudit:generate",
        "sourceControl:pull",
        "sourceControl:push",
        "sourceControl:manage",
        "tag:create",
        "tag:read",
        "tag:update",
        "tag:delete",
        "tag:list",
        "user:create",
        "user:read",
        "user:update",
        "user:delete",
        "user:list",
        "user:resetPassword",
        "user:changeRole",
        "variable:create",
        "variable:read",
        "variable:update",
        "variable:delete",
        "variable:list",
        "workflow:create",
        "workflow:read",
        "workflow:update",
        "workflow:delete",
        "workflow:list",
        "workflow:share",
        "workflow:execute",
        "workflow:move",
        "workersView:manage",
        "project:list",
        "project:create",
        "project:read",
        "project:update",
        "project:delete",
      ],
    },
    projectId: "ksZvUQ9ctM7fspJF",
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (schema && schema.properties) {
      const initialData = Object.keys(schema.properties).reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {});
      setFormData((prev) => ({
        ...prev,
        data: initialData,
        type: type,
      }));
      setOpen(true);
    }
  }, [schema]);

  if (!schema || !schema.properties) {
    return null;
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
      const payload = {
        ...formData,
        name: formData.name,
        data: {
          user: formData.data.user,
          accessToken: formData.data.accessToken,
        },
      };

      const response = await fetch(`${baseURL}/api/create-credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("Success:", result);
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  console.log(formData, "raju");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Credentials</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Account Name"
              className="mt-1"
            />
          </div>
          {Object.keys(schema.properties).map((key) => (
            <div key={key}>
              <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
              <Input
                type={key === "accessToken" ? "password" : "text"}
                name={key}
                value={formData.data[key] || ""}
                onChange={handleChange}
                placeholder={`Enter ${key}`}
                required
                className="mt-1"
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
