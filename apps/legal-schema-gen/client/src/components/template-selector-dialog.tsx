import { useState } from "react";
import { LegalServiceData } from "@shared/schema";
import { SCHEMA_TEMPLATES, applyTemplate, SchemaTemplate } from "@/lib/templates";
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
import { FileStack, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface TemplateSelectorDialogProps {
  onApplyTemplate: (data: Partial<LegalServiceData>) => void;
}

export function TemplateSelectorDialog({ onApplyTemplate }: TemplateSelectorDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SchemaTemplate | null>(null);
  const { toast } = useToast();

  const handleApply = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a template first.",
        variant: "destructive",
      });
      return;
    }

    const templateData = applyTemplate(selectedTemplate);
    onApplyTemplate(templateData);
    setOpen(false);
    setSelectedTemplate(null);
    
    toast({
      title: "Template applied",
      description: `"${selectedTemplate.name}" template has been loaded.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSelectedTemplate(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-open-templates">
          <FileStack className="w-4 h-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Schema Templates</DialogTitle>
          <DialogDescription>
            Choose a template to quickly start with pre-configured practice areas and settings.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-3">
            {SCHEMA_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover-elevate ${
                  selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTemplate(template)}
                data-testid={`card-template-${template.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {selectedTemplate?.id === template.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <CardDescription className="mb-2">{template.description}</CardDescription>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {template.schemaType}
                        </Badge>
                        {template.data.practiceAreas?.slice(0, 3).map((area, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {template.data.practiceAreas && template.data.practiceAreas.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.data.practiceAreas.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-template">
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!selectedTemplate} data-testid="button-apply-template">
            Apply Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
