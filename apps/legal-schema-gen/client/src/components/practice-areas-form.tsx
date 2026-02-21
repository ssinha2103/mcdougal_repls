import { UseFormReturn } from "react-hook-form";
import { LegalServiceData, PRACTICE_AREAS } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldTooltipIcon } from "@/components/field-tooltip";
import { getTooltip } from "@/lib/tooltips";

interface PracticeAreasFormProps {
  form: UseFormReturn<LegalServiceData>;
}

export function PracticeAreasForm({ form }: PracticeAreasFormProps) {
  const { watch, setValue, formState: { errors } } = form;
  const [customArea, setCustomArea] = useState("");
  const selectedAreas = watch("practiceAreas") || [];

  const toggleArea = (area: string) => {
    const current = selectedAreas;
    if (current.includes(area)) {
      setValue("practiceAreas", current.filter(a => a !== area));
    } else {
      setValue("practiceAreas", [...current, area]);
    }
  };

  const addCustomArea = () => {
    if (customArea.trim() && !selectedAreas.includes(customArea.trim())) {
      setValue("practiceAreas", [...selectedAreas, customArea.trim()]);
      setCustomArea("");
    }
  };

  const removeArea = (area: string) => {
    setValue("practiceAreas", selectedAreas.filter(a => a !== area));
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold tracking-tight">
              Practice Areas <span className="text-destructive">*</span>
            </h3>
            {getTooltip("practiceAreas") && <FieldTooltipIcon tooltip={getTooltip("practiceAreas")!} />}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Select the areas of law your firm specializes in. This helps potential clients find you for specific legal needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRACTICE_AREAS.map((area) => (
            <div key={area} className="flex items-center space-x-2">
              <Checkbox
                id={`area-${area}`}
                checked={selectedAreas.includes(area)}
                onCheckedChange={() => toggleArea(area)}
                data-testid={`checkbox-practice-area-${area.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <Label
                htmlFor={`area-${area}`}
                className="text-sm font-normal cursor-pointer"
              >
                {area}
              </Label>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 space-y-4">
          <Label htmlFor="customArea">Add Custom Practice Area</Label>
          <div className="flex gap-2">
            <Input
              id="customArea"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              placeholder="Enter custom practice area"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomArea())}
              data-testid="input-custom-practice-area"
            />
            <Button
              type="button"
              onClick={addCustomArea}
              size="icon"
              variant="secondary"
              data-testid="button-add-custom-area"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedAreas.length > 0 && (
          <div className="border-t pt-6 space-y-3">
            <Label>Selected Practice Areas ({selectedAreas.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedAreas.map((area) => (
                <Badge
                  key={area}
                  variant="secondary"
                  className="gap-1 pr-1"
                  data-testid={`badge-selected-area-${area.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => removeArea(area)}
                    className="ml-1 hover-elevate rounded-full p-0.5"
                    data-testid={`button-remove-area-${area.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {errors.practiceAreas && (
          <p className="text-sm text-destructive">{errors.practiceAreas.message}</p>
        )}
      </div>
    </Card>
  );
}
