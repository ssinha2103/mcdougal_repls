import { UseFormReturn, useFieldArray } from "react-hook-form";
import { LegalServiceData } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin } from "lucide-react";
import { nanoid } from "nanoid";

interface OfficeLocationsFormProps {
  form: UseFormReturn<LegalServiceData>;
}

export function OfficeLocationsForm({ form }: OfficeLocationsFormProps) {
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalLocations",
  });

  const addLocation = () => {
    append({
      id: nanoid(),
      name: "",
      address: {
        streetAddress: "",
        addressLocality: "",
        addressRegion: "",
        postalCode: "",
        addressCountry: "US",
      },
      telephone: "",
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight mb-2">Additional Office Locations</h3>
            <p className="text-sm text-muted-foreground">
              If your firm has multiple offices, add them here to improve local search visibility.
            </p>
          </div>
          <Button
            type="button"
            onClick={addLocation}
            size="sm"
            variant="outline"
            data-testid="button-add-location"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No additional locations added</p>
            <Button
              type="button"
              onClick={addLocation}
              variant="outline"
              data-testid="button-add-first-location"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Additional Location
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-6 space-y-4 relative hover-elevate"
                data-testid={`card-location-${index}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Location #{index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    data-testid={`button-remove-location-${index}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`additionalLocations.${index}.name`}>
                        Location Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...register(`additionalLocations.${index}.name`)}
                        placeholder="Downtown Office"
                        data-testid={`input-location-name-${index}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`additionalLocations.${index}.telephone`}>Phone Number</Label>
                      <Input
                        {...register(`additionalLocations.${index}.telephone`)}
                        type="tel"
                        placeholder="(555) 987-6543"
                        data-testid={`input-location-phone-${index}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`additionalLocations.${index}.address.streetAddress`}>
                      Street Address
                    </Label>
                    <Input
                      {...register(`additionalLocations.${index}.address.streetAddress`)}
                      placeholder="456 Oak Avenue, Floor 2"
                      data-testid={`input-location-street-${index}`}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`additionalLocations.${index}.address.addressLocality`}>
                        City
                      </Label>
                      <Input
                        {...register(`additionalLocations.${index}.address.addressLocality`)}
                        placeholder="San Francisco"
                        data-testid={`input-location-city-${index}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`additionalLocations.${index}.address.addressRegion`}>
                        State
                      </Label>
                      <Input
                        {...register(`additionalLocations.${index}.address.addressRegion`)}
                        placeholder="CA"
                        data-testid={`input-location-state-${index}`}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`additionalLocations.${index}.address.postalCode`}>
                        ZIP Code
                      </Label>
                      <Input
                        {...register(`additionalLocations.${index}.address.postalCode`)}
                        placeholder="94102"
                        data-testid={`input-location-zip-${index}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`additionalLocations.${index}.address.addressCountry`}>
                        Country
                      </Label>
                      <Input
                        {...register(`additionalLocations.${index}.address.addressCountry`)}
                        defaultValue="US"
                        placeholder="US"
                        data-testid={`input-location-country-${index}`}
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
