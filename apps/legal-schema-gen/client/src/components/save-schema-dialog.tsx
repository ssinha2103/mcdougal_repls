import { useState } from "react";
import { LegalServiceData } from "@shared/schema";
import { saveSchema } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaveSchemaDialogProps {
  getData: () => LegalServiceData;
  defaultName?: string;
}

export function SaveSchemaDialog({ getData, defaultName }: SaveSchemaDialogProps) {
  const [open, setOpen] = useState(false);
  const [schemaName, setSchemaName] = useState(defaultName || "");
  const { toast } = useToast();

  const handleSave = () => {
    if (!schemaName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this schema.",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentData = getData();
      saveSchema(currentData, schemaName.trim());
      toast({
        title: "Schema saved",
        description: `"${schemaName}" has been saved successfully.`,
      });
      setOpen(false);
      setSchemaName("");
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save schema.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen && defaultName) {
        setSchemaName(defaultName);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-open-save-dialog">
          <Save className="w-4 h-4 mr-2" />
          Save Schema
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Schema</DialogTitle>
          <DialogDescription>
            Give this schema a name so you can load it later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="schema-name">Schema Name</Label>
            <Input
              id="schema-name"
              placeholder="e.g., Smith Law Firm - Main Office"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              data-testid="input-schema-name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-save">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-confirm-save">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
