"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { baseURL } from "../baseURL";
import CredentialForm from "../components/CredentialForm";

const CredentialsDropdown = () => {
  const [credentials, setCredentials] = useState([]);
  const [credentialSchema, setCredentialSchema] = useState({});
  const [selectedCredential, setSelectedCredential] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const LIMIT = 10;

  const fetchCredentials = async (pageNum, search) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum,
        limit: LIMIT,
        ...(search && { search }),
      });

      const response = await fetch(
        `${baseURL}/get-credentials-names?${queryParams}`
      );
      const data = await response.json();

      if (pageNum === 1) {
        setCredentials(data);
      } else {
        setCredentials((prev) => [...new Set([...prev, ...data])]);
      }

      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error("Error fetching credentials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchCredentials(1, searchQuery);
  }, [searchQuery]);

  const fetchCredentialSchema = async () => {
    try {
      const res = await fetch(
        `${baseURL}/api/get-credentials-schema/${selectedCredential}`
      );
      const data = await res.json();
      setCredentialSchema(data);
    } catch (error) {
      console.error("Error fetching credential schema:", error);
    }
  };

  useEffect(() => {
    if (selectedCredential) {
      fetchCredentialSchema();
    }
  }, [selectedCredential]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        setPage(1);
        fetchCredentials(1, searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCredentials(nextPage, searchQuery);
  };

  console.log(credentialSchema, "raju");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-96 shadow-xl rounded-xl bg-white">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-center text-lg font-semibold text-gray-800">
              Select Credentials
            </label>
            <div className="relative">
              <Select
                onValueChange={setSelectedCredential}
                disabled={isLoading && page === 1}
                open={isOpen}
                onOpenChange={(open) => {
                  setIsOpen(open);
                  if (open && credentials.length === 0) {
                    fetchCredentials(1, searchQuery);
                  }
                }}
              >
                <SelectTrigger className="w-full bg-white transition-colors hover:bg-gray-50 rounded-lg border-gray-200 shadow-sm">
                  <SelectValue placeholder="Choose a credential" />
                  {isLoading && page === 1 && (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-[300px] rounded-lg shadow-lg">
                  <div className="p-3 sticky top-0 bg-white border-b z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search credentials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-lg border-gray-200"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    {credentials.length === 0 ? (
                      <div className="py-8 text-center text-sm text-gray-500">
                        No credentials found
                      </div>
                    ) : (
                      <>
                        {credentials.map((cred, index) => (
                          <SelectItem
                            key={`${cred}-${index}`}
                            value={cred}
                            className="cursor-pointer transition-colors hover:bg-gray-100 px-4 py-2"
                          >
                            {cred}
                          </SelectItem>
                        ))}
                        {hasMore && (
                          <div className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                loadMore();
                              }}
                              disabled={isLoading}
                              className="w-full text-sm hover:bg-gray-100 text-gray-600"
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Load more"
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CredentialForm schema={credentialSchema} />
      </Card>
    </div>
  );
};

export default CredentialsDropdown;
