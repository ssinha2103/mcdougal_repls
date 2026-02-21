import { UseFormReturn, useFieldArray } from "react-hook-form";
import { LegalServiceData } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, User } from "lucide-react";
import { nanoid } from "nanoid";
import { FieldTooltipIcon } from "@/components/field-tooltip";
import { getTooltip } from "@/lib/tooltips";

interface AttorneysFormProps {
  form: UseFormReturn<LegalServiceData>;
}

export function AttorneysForm({ form }: AttorneysFormProps) {
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attorneys",
  });

  const addAttorney = () => {
    append({
      id: nanoid(),
      name: "",
      jobTitle: "",
      credentials: "",
      barNumber: "",
      education: "",
      yearsOfExperience: undefined,
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold tracking-tight">Attorney Information</h3>
              {getTooltip("attorneys") && <FieldTooltipIcon tooltip={getTooltip("attorneys")!} />}
            </div>
            <p className="text-sm text-muted-foreground">
              Add details about attorneys at your firm to enhance credibility and local SEO.
            </p>
          </div>
          <Button
            type="button"
            onClick={addAttorney}
            size="sm"
            data-testid="button-add-attorney"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Attorney
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No attorneys added yet</p>
            <Button
              type="button"
              onClick={addAttorney}
              variant="outline"
              data-testid="button-add-first-attorney"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Attorney
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-6 space-y-4 relative hover-elevate"
                data-testid={`card-attorney-${index}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Attorney #{index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    data-testid={`button-remove-attorney-${index}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor={`attorneys.${index}.name`}>
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        {getTooltip("attorneyName") && <FieldTooltipIcon tooltip={getTooltip("attorneyName")!} />}
                      </div>
                      <Input
                        {...register(`attorneys.${index}.name`)}
                        placeholder="John Smith"
                        data-testid={`input-attorney-name-${index}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor={`attorneys.${index}.jobTitle`}>Job Title</Label>
                        {getTooltip("attorneyJobTitle") && <FieldTooltipIcon tooltip={getTooltip("attorneyJobTitle")!} />}
                      </div>
                      <Input
                        {...register(`attorneys.${index}.jobTitle`)}
                        placeholder="Senior Partner"
                        data-testid={`input-attorney-title-${index}`}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`attorneys.${index}.credentials`}>Credentials</Label>
                      <Input
                        {...register(`attorneys.${index}.credentials`)}
                        placeholder="J.D., LL.M."
                        data-testid={`input-attorney-credentials-${index}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor={`attorneys.${index}.barNumber`}>Bar Number</Label>
                        {getTooltip("barNumber") && <FieldTooltipIcon tooltip={getTooltip("barNumber")!} />}
                      </div>
                      <Input
                        {...register(`attorneys.${index}.barNumber`)}
                        placeholder="CA12345"
                        data-testid={`input-attorney-bar-${index}`}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor={`attorneys.${index}.education`}>Education</Label>
                        {getTooltip("education") && <FieldTooltipIcon tooltip={getTooltip("education")!} />}
                      </div>
                      <Input
                        {...register(`attorneys.${index}.education`)}
                        placeholder="Harvard Law School"
                        data-testid={`input-attorney-education-${index}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor={`attorneys.${index}.yearsOfExperience`}>
                          Years of Experience
                        </Label>
                        {getTooltip("yearsOfExperience") && <FieldTooltipIcon tooltip={getTooltip("yearsOfExperience")!} />}
                      </div>
                      <Input
                        {...register(`attorneys.${index}.yearsOfExperience`, {
                          setValueAs: (v) => {
                            if (v === "" || v === null || v === undefined) return undefined;
                            const num = Number(v);
                            return isNaN(num) ? undefined : num;
                          },
                        })}
                        type="number"
                        min="0"
                        placeholder="15"
                        data-testid={`input-attorney-experience-${index}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
