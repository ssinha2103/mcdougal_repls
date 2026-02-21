import { useState } from "react";
import { SavedSchema, getSavedSchemas, deleteSchema } from "@/lib/storage";
import { LegalServiceData } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderOpen, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SavedSchemasDialogProps {
  onLoadSchema: (data: LegalServiceData) => void;
}

export function SavedSchemasDialog({ onLoadSchema }: SavedSchemasDialogProps) {
  const [open, setOpen] = useState(false);
  const [schemas, setSchemas] = useState<SavedSchema[]>([]);
  const { toast } = useToast();

  const loadSchemas = () => {
    setSchemas(getSavedSchemas());
  };

  const handleDelete = (id: string, name: string) => {
    deleteSchema(id);
    setSchemas(getSavedSchemas());
    toast({
      title: "Schema deleted",
      description: `"${name}" has been removed.`,
    });
  };

  const handleLoad = (schema: SavedSchema) => {
    onLoadSchema(schema.data);
    setOpen(false);
    toast({
      title: "Schema loaded",
      description: `"${schema.name}" has been loaded into the form.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) loadSchemas();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-open-saved-schemas">
          <FolderOpen className="w-4 h-4 mr-2" />
          Saved Schemas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Saved Schemas</DialogTitle>
          <DialogDescription>
            Load a previously saved schema or delete schemas you no longer need.
          </DialogDescription>
        </DialogHeader>
        
        {schemas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="container-no-schemas">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No saved schemas yet</p>
            <p className="text-sm text-muted-foreground">Save a schema to access it later</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {schemas.map((schema) => (
                <Card key={schema.id} className="hover-elevate" data-testid={`card-saved-schema-${schema.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{schema.name}</CardTitle>
                        <CardDescription className="mt-1 space-y-1">
                          <div className="text-sm">
                            {schema.data.practiceAreas.slice(0, 3).join(", ")}
                            {schema.data.practiceAreas.length > 3 && ` +${schema.data.practiceAreas.length - 3} more`}
                          </div>
                          <div className="text-xs">
                            Updated {formatDistanceToNow(new Date(schema.updatedAt), { addSuffix: true })}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoad(schema)}
                          data-testid={`button-load-schema-${schema.id}`}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(schema.id, schema.name)}
                          data-testid={`button-delete-schema-${schema.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
