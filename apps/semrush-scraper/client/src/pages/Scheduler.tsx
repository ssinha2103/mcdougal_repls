import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CronSchedulePicker } from "@/components/CronSchedulePicker";
import { Plus, Trash2, Play, Pause, Clock, Calendar } from "lucide-react";
import type { ScheduledRun } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Scheduler() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    domains: "",
    cronSchedule: "0 2 * * *",
    dailyCap: 100,
    cooldownStart: "",
    cooldownEnd: "",
    config: {
      database: "us",
      maxRequestsPerHour: 120,
      enableAI: true,
    },
  });

  const { data: scheduledRuns = [], isLoading } = useQuery<ScheduledRun[]>({
    queryKey: ["/api/scheduled-runs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/scheduled-runs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-runs"] });
      toast({
        title: "Success",
        description: "Scheduled run created successfully",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create scheduled run",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/scheduled-runs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-runs"] });
      toast({
        title: "Success",
        description: "Scheduled run updated successfully",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update scheduled run",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/scheduled-runs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-runs"] });
      toast({
        title: "Success",
        description: "Scheduled run deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete scheduled run",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/scheduled-runs/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-runs"] });
      toast({
        title: "Success",
        description: "Scheduled run status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle scheduled run",
        variant: "destructive",
      });
    },
  });

  const runNowMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/scheduled-runs/${id}/run-now`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scheduled run triggered successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger scheduled run",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      domains: "",
      cronSchedule: "0 2 * * *",
      dailyCap: 100,
      cooldownStart: "",
      cooldownEnd: "",
      config: {
        database: "us",
        maxRequestsPerHour: 120,
        enableAI: true,
      },
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (run: ScheduledRun) => {
    setFormData({
      name: run.name,
      description: run.description || "",
      domains: run.domains.join("\n"),
      cronSchedule: run.cronSchedule,
      dailyCap: run.dailyCap,
      cooldownStart: run.cooldownStart || "",
      cooldownEnd: run.cooldownEnd || "",
      config: run.config as any || {
        database: "us",
        maxRequestsPerHour: 120,
        enableAI: true,
      },
    });
    setEditingId(run.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const domains = formData.domains
      .split(/[\n,]/)
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    if (domains.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one domain is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      domains,
      cronSchedule: formData.cronSchedule,
      dailyCap: formData.dailyCap,
      cooldownStart: formData.cooldownStart || null,
      cooldownEnd: formData.cooldownEnd || null,
      config: formData.config,
      enabled: true,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading scheduled runs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-scheduler">
            Scheduler
          </h1>
          <p className="text-muted-foreground mt-1">
            Automate recurring domain crawls with cron-based scheduling
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-new-scheduled-run"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "New Scheduled Run"}
        </Button>
      </div>

      {showForm && (
        <Card data-testid="card-scheduled-run-form">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{editingId ? "Edit" : "Create"} Scheduled Run</CardTitle>
              <CardDescription>
                Configure a recurring crawl schedule with rate limiting and cooldown windows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" data-testid="label-name">
                  Name *
                </Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Daily SEO Crawl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" data-testid="label-description">
                  Description
                </Label>
                <Input
                  id="description"
                  data-testid="input-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domains" data-testid="label-domains">
                  Domains * (one per line or comma-separated)
                </Label>
                <Textarea
                  id="domains"
                  data-testid="input-domains"
                  value={formData.domains}
                  onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                  placeholder="example.com&#10;another-domain.com"
                  rows={5}
                  required
                />
              </div>

              <CronSchedulePicker
                value={formData.cronSchedule}
                onChange={(value) => setFormData({ ...formData, cronSchedule: value })}
              />

              <div className="space-y-2">
                <Label data-testid="label-daily-cap">
                  Daily Cap: {formData.dailyCap} domains
                </Label>
                <Slider
                  value={[formData.dailyCap]}
                  onValueChange={([value]) => setFormData({ ...formData, dailyCap: value })}
                  min={1}
                  max={1000}
                  step={10}
                  data-testid="slider-daily-cap"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of domains to crawl per day
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cooldownStart" data-testid="label-cooldown-start">
                    Cooldown Start (HH:MM)
                  </Label>
                  <Input
                    id="cooldownStart"
                    data-testid="input-cooldown-start"
                    type="time"
                    value={formData.cooldownStart}
                    onChange={(e) => setFormData({ ...formData, cooldownStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cooldownEnd" data-testid="label-cooldown-end">
                    Cooldown End (HH:MM)
                  </Label>
                  <Input
                    id="cooldownEnd"
                    data-testid="input-cooldown-end"
                    type="time"
                    value={formData.cooldownEnd}
                    onChange={(e) => setFormData({ ...formData, cooldownEnd: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Optional: Skip crawls during specified time window (e.g., 22:00 to 06:00)
              </p>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Crawler Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="database" data-testid="label-database">
                    SEMrush Database
                  </Label>
                  <Select
                    value={formData.config.database}
                    onValueChange={(value) =>
                      setFormData({ ...formData, config: { ...formData.config, database: value } })
                    }
                  >
                    <SelectTrigger id="database" data-testid="select-database">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label data-testid="label-rate-limit">
                    Rate Limit: {formData.config.maxRequestsPerHour} requests/hour
                  </Label>
                  <Slider
                    value={[formData.config.maxRequestsPerHour]}
                    onValueChange={([value]) =>
                      setFormData({ ...formData, config: { ...formData.config, maxRequestsPerHour: value } })
                    }
                    min={10}
                    max={300}
                    step={10}
                    data-testid="slider-rate-limit"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableAI"
                    checked={formData.config.enableAI}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, config: { ...formData.config, enableAI: checked } })
                    }
                    data-testid="switch-enable-ai"
                  />
                  <Label htmlFor="enableAI" data-testid="label-enable-ai">
                    Enable AI Analysis
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {editingId ? "Update" : "Create"} Scheduled Run
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {scheduledRuns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-no-schedules">
                No scheduled runs
              </h3>
              <p className="text-muted-foreground">
                Create your first scheduled run to automate domain crawling
              </p>
            </CardContent>
          </Card>
        ) : (
          scheduledRuns.map((run) => (
            <Card key={run.id} data-testid={`card-scheduled-run-${run.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle data-testid={`text-name-${run.id}`}>{run.name}</CardTitle>
                      <Badge
                        variant={run.enabled ? "default" : "secondary"}
                        data-testid={`badge-status-${run.id}`}
                      >
                        {run.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    {run.description && (
                      <CardDescription className="mt-1" data-testid={`text-description-${run.id}`}>
                        {run.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => toggleMutation.mutate(run.id)}
                      disabled={toggleMutation.isPending}
                      data-testid={`button-toggle-${run.id}`}
                    >
                      {run.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => runNowMutation.mutate(run.id)}
                      disabled={runNowMutation.isPending}
                      data-testid={`button-run-now-${run.id}`}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(run)}
                      data-testid={`button-edit-${run.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(run.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${run.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Schedule:</span>{" "}
                    <span className="font-mono" data-testid={`text-schedule-${run.id}`}>
                      {run.cronSchedule}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Daily Cap:</span>{" "}
                    <span data-testid={`text-daily-cap-${run.id}`}>{run.dailyCap} domains</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Domains:</span>{" "}
                    <span data-testid={`text-domains-count-${run.id}`}>{run.domains.length}</span>
                  </div>
                  {run.cooldownStart && run.cooldownEnd && (
                    <div>
                      <span className="text-muted-foreground">Cooldown:</span>{" "}
                      <span data-testid={`text-cooldown-${run.id}`}>
                        {run.cooldownStart} - {run.cooldownEnd}
                      </span>
                    </div>
                  )}
                  {run.lastRunAt && (
                    <div>
                      <span className="text-muted-foreground">Last Run:</span>{" "}
                      <span data-testid={`text-last-run-${run.id}`}>
                        {formatDistanceToNow(new Date(run.lastRunAt), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  {run.nextRunAt && (
                    <div>
                      <span className="text-muted-foreground">Next Run:</span>{" "}
                      <span data-testid={`text-next-run-${run.id}`}>
                        {formatDistanceToNow(new Date(run.nextRunAt), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold">Domains:</span> {run.domains.join(", ")}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
