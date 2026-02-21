import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Tool, type InsertTool } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, LogOut, LayoutDashboard } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  const { data: currentUser, isLoading: userLoading } = useQuery<{
    id: string;
    username: string;
    isAdmin: boolean;
  }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!userLoading && !currentUser) {
      setLocation("/admin/login");
    }
  }, [currentUser, userLoading, setLocation]);

  const { data: tools = [], isLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", {}),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/admin/login");
    },
  });

  if (userLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-card-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage SEO tools directory</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {currentUser.username}
              </span>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tools Management</h2>
            <p className="text-muted-foreground">Add, edit, or remove SEO tools</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-tool">
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <ToolForm
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  toast({
                    title: "Tool added",
                    description: "The tool has been added successfully",
                  });
                }}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full mt-2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Card key={tool.id} className="rounded-2xl border-card-border hover-elevate" data-testid={`card-admin-tool-${tool.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{tool.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {tool.categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingTool(tool)}
                          data-testid={`button-edit-${tool.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <ToolForm
                          tool={editingTool}
                          onSuccess={() => {
                            setEditingTool(null);
                            toast({
                              title: "Tool updated",
                              description: "The tool has been updated successfully",
                            });
                          }}
                          onCancel={() => setEditingTool(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <DeleteToolButton toolId={tool.id} toolName={tool.name} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ToolFormProps {
  tool?: Tool | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function ToolForm({ tool, onSuccess, onCancel }: ToolFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InsertTool>({
    name: tool?.name || "",
    url: tool?.url || "",
    description: tool?.description || "",
    categories: tool?.categories || [],
    screenshot: tool?.screenshot || "",
    usageGuide: tool?.usageGuide || "",
  });
  const [categoryInput, setCategoryInput] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: InsertTool) => apiRequest("POST", "/api/tools", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create tool",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Tool>) => 
      apiRequest("PATCH", `/api/tools/${tool?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tool",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tool) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const addCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData({
        ...formData,
        categories: [...formData.categories, categoryInput.trim()],
      });
      setCategoryInput("");
    }
  };

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== category),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{tool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
        <DialogDescription>
          {tool ? "Update the tool information" : "Add a new SEO tool to the directory"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tool Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="input-tool-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Tool URL *</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            data-testid="input-tool-url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
            data-testid="input-tool-description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categories">Categories</Label>
          <div className="flex gap-2">
            <Input
              id="categories"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory();
                }
              }}
              placeholder="Add category"
              data-testid="input-category"
            />
            <Button type="button" onClick={addCategory} data-testid="button-add-category">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.categories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeCategory(cat)}
              >
                {cat} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="screenshot">Screenshot URL</Label>
          <Input
            id="screenshot"
            type="url"
            value={formData.screenshot || ""}
            onChange={(e) => setFormData({ ...formData, screenshot: e.target.value })}
            data-testid="input-screenshot"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="usageGuide">Usage Guide</Label>
          <Textarea
            id="usageGuide"
            value={formData.usageGuide || ""}
            onChange={(e) => setFormData({ ...formData, usageGuide: e.target.value })}
            rows={5}
            data-testid="input-usage-guide"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-save-tool"
        >
          {tool ? "Update Tool" : "Add Tool"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface DeleteToolButtonProps {
  toolId: string;
  toolName: string;
}

function DeleteToolButton({ toolId, toolName }: DeleteToolButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/tools/${toolId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "Tool deleted",
        description: `${toolName} has been removed`,
      });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete tool",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          data-testid={`button-delete-${toolId}`}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{toolName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            data-testid="button-confirm-delete"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
