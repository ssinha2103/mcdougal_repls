import { UseFormReturn } from "react-hook-form";
import { LegalServiceData } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FieldTooltipIcon } from "@/components/field-tooltip";
import { getTooltip } from "@/lib/tooltips";

interface FirmInfoFormProps {
  form: UseFormReturn<LegalServiceData>;
}

export function FirmInfoForm({ form }: FirmInfoFormProps) {
  const { register, formState: { errors } } = form;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight mb-4">Firm Information</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Basic details about your law firm that will appear in search results.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="name">
                Firm Name <span className="text-destructive">*</span>
              </Label>
              {getTooltip("name") && <FieldTooltipIcon tooltip={getTooltip("name")!} />}
            </div>
            <Input
              id="name"
              {...register("name")}
              placeholder="Smith & Associates Law Firm"
              data-testid="input-firm-name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="description">Description</Label>
              {getTooltip("description") && <FieldTooltipIcon tooltip={getTooltip("description")!} />}
            </div>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Premier law firm serving clients in personal injury, criminal defense, and family law matters..."
              rows={3}
              data-testid="input-firm-description"
            />
            <p className="text-xs text-muted-foreground">
              Brief description of your firm (recommended for SEO)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="url">Website URL</Label>
                {getTooltip("url") && <FieldTooltipIcon tooltip={getTooltip("url")!} />}
              </div>
              <Input
                id="url"
                {...register("url")}
                type="url"
                placeholder="https://www.yourfirm.com"
                data-testid="input-firm-url"
                className={errors.url ? "border-destructive" : ""}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="telephone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                {getTooltip("telephone") && <FieldTooltipIcon tooltip={getTooltip("telephone")!} />}
              </div>
              <Input
                id="telephone"
                {...register("telephone")}
                type="tel"
                placeholder="(555) 123-4567"
                data-testid="input-firm-phone"
                className={errors.telephone ? "border-destructive" : ""}
              />
              {errors.telephone && (
                <p className="text-sm text-destructive">{errors.telephone.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="email">Email Address</Label>
                {getTooltip("email") && <FieldTooltipIcon tooltip={getTooltip("email")!} />}
              </div>
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="contact@yourfirm.com"
                data-testid="input-firm-email"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="foundingDate">Founding Date</Label>
                {getTooltip("foundingDate") && <FieldTooltipIcon tooltip={getTooltip("foundingDate")!} />}
              </div>
              <Input
                id="foundingDate"
                {...register("foundingDate")}
                type="date"
                data-testid="input-firm-founding-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              {...register("logo")}
              type="url"
              placeholder="https://www.yourfirm.com/logo.png"
              data-testid="input-firm-logo"
              className={errors.logo ? "border-destructive" : ""}
            />
            {errors.logo && (
              <p className="text-sm text-destructive">{errors.logo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="priceRange">Price Range</Label>
              {getTooltip("priceRange") && <FieldTooltipIcon tooltip={getTooltip("priceRange")!} />}
            </div>
            <Input
              id="priceRange"
              {...register("priceRange")}
              placeholder="$$-$$$"
              data-testid="input-firm-price-range"
            />
            <p className="text-xs text-muted-foreground">
              Use $ symbols to indicate pricing level (e.g., $$, $$$, $$$$)
            </p>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h4 className="font-medium">Address <span className="text-destructive">*</span></h4>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="streetAddress">Street Address</Label>
                {getTooltip("address") && <FieldTooltipIcon tooltip={getTooltip("address")!} />}
              </div>
              <Input
                id="streetAddress"
                {...register("address.streetAddress")}
                placeholder="123 Main Street, Suite 100"
                data-testid="input-address-street"
                className={errors.address?.streetAddress ? "border-destructive" : ""}
              />
              {errors.address?.streetAddress && (
                <p className="text-sm text-destructive">{errors.address.streetAddress.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="addressLocality">City</Label>
                  {getTooltip("city") && <FieldTooltipIcon tooltip={getTooltip("city")!} />}
                </div>
                <Input
                  id="addressLocality"
                  {...register("address.addressLocality")}
                  placeholder="Los Angeles"
                  data-testid="input-address-city"
                  className={errors.address?.addressLocality ? "border-destructive" : ""}
                />
                {errors.address?.addressLocality && (
                  <p className="text-sm text-destructive">{errors.address.addressLocality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="addressRegion">State</Label>
                  {getTooltip("state") && <FieldTooltipIcon tooltip={getTooltip("state")!} />}
                </div>
                <Input
                  id="addressRegion"
                  {...register("address.addressRegion")}
                  placeholder="CA"
                  data-testid="input-address-state"
                  className={errors.address?.addressRegion ? "border-destructive" : ""}
                />
                {errors.address?.addressRegion && (
                  <p className="text-sm text-destructive">{errors.address.addressRegion.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="postalCode">ZIP Code</Label>
                  {getTooltip("postalCode") && <FieldTooltipIcon tooltip={getTooltip("postalCode")!} />}
                </div>
                <Input
                  id="postalCode"
                  {...register("address.postalCode")}
                  placeholder="90001"
                  data-testid="input-address-zip"
                  className={errors.address?.postalCode ? "border-destructive" : ""}
                />
                {errors.address?.postalCode && (
                  <p className="text-sm text-destructive">{errors.address.postalCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressCountry">Country</Label>
                <Input
                  id="addressCountry"
                  {...register("address.addressCountry")}
                  defaultValue="US"
                  placeholder="US"
                  data-testid="input-address-country"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
