import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calculator, Sliders, MapPin, Globe, Cog, Ruler, DoorOpen, ArrowUpDown, Shield, Square, Sun, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { btuCalculationInputSchema, type BTUCalculationInput, type BTUCalculationResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ResultsPanel } from "./results-panel";

const ceilingHeightOptions = [
  { value: "8", label: "8 ft (Standard)" },
  { value: "9", label: "9 ft (Above Standard)" },
  { value: "10", label: "10 ft (High Ceiling)" },
  { value: "12", label: "12 ft (Very High Ceiling)" },
  { value: "custom", label: "Custom Height" },
];

export default function BTUCalculator() {
  const [calculationResult, setCalculationResult] = useState<BTUCalculationResult | null>(null);
  const [customCeilingHeight, setCustomCeilingHeight] = useState<string>("");
  const [ceilingHeightMode, setCeilingHeightMode] = useState<"preset" | "custom">("preset");
  const { toast } = useToast();

  const form = useForm<BTUCalculationInput>({
    resolver: zodResolver(btuCalculationInputSchema),
    defaultValues: {
      zipCode: "",
      systemType: "ductless",
      squareFootage: 2000,
      numberOfRooms: 8,
      ceilingHeight: 8,
      insulationQuality: "average",
      windowArea: 200,
      sunExposure: "medium",
      numberOfOccupants: 4,
    },
  });

  // Watch ZIP code for climate zone lookup
  const zipCode = form.watch("zipCode");
  
  const { data: climateZoneData } = useQuery({
    queryKey: ["/api/climate-zone", zipCode],
    enabled: zipCode?.length === 5,
  });

  const calculateBTUMutation = useMutation({
    mutationFn: async (data: BTUCalculationInput) => {
      const response = await apiRequest("POST", "/api/calculate-btu", data);
      return response.json() as Promise<BTUCalculationResult & { calculationId: string }>;
    },
    onSuccess: (result) => {
      setCalculationResult(result);
      toast({
        title: "Calculation Complete",
        description: "BTU requirements calculated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate BTU requirements.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BTUCalculationInput) => {
    calculateBTUMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-none mx-auto">
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 w-full">
        
        {/* Input Form */}
        <div className="lg:col-span-2 w-full">
          <div className="glass-card rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl w-full overflow-hidden">
          <h3 className="text-2xl font-semibold text-netr-blue mb-6 flex items-center">
            <Sliders className="mr-3" />
            System Configuration
          </h3>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 w-full">
              
              {/* ZIP Code and Climate Zone */}
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-800">
                        <MapPin className="mr-2 h-4 w-4 text-netr-accent" />
                        ZIP Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 01845"
                          className="glass-input rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label className="flex items-center text-gray-800">
                    <Globe className="mr-2 h-4 w-4 text-netr-accent" />
                    Climate Zone
                  </Label>
                  <Input
                    value={climateZoneData && typeof climateZoneData === 'object' && 'climateZone' in climateZoneData ? `Zone ${climateZoneData.climateZone}` : ""}
                    placeholder="Auto-detected"
                    readOnly
                    className="glass-surface rounded-xl text-gray-600"
                  />
                </div>
              </div>

              {/* HVAC System Type */}
              <FormField
                control={form.control}
                name="systemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-800">
                      <Cog className="mr-2 h-4 w-4 text-netr-accent" />
                      HVAC System Type
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: "ductless", label: "Ductless Mini-Split", description: "Zone control system", icon: "💨" },
                          { value: "central", label: "Central AC", description: "Ducted system", icon: "🏠" },
                          { value: "boiler", label: "Gas Boiler", description: "Radiant heating", icon: "🔥" }
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <input
                              type="radio"
                              id={option.value}
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="sr-only peer"
                            />
                            <Label 
                              htmlFor={option.value}
                              className={`p-4 rounded-xl transition-all duration-200 cursor-pointer block ${
                                field.value === option.value 
                                  ? 'system-card selected' 
                                  : 'system-card'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-2xl text-netr-accent mb-2">{option.icon}</div>
                                <div className="font-medium text-gray-800">{option.label}</div>
                                <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Home Specifications */}
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="squareFootage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-800">
                        <Ruler className="mr-2 h-4 w-4 text-netr-accent" />
                        Square Footage
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 2000"
                          min={100}
                          max={10000}
                          className="glass-input rounded-xl"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-800">
                        <DoorOpen className="mr-2 h-4 w-4 text-netr-accent" />
                        Number of Rooms
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 8"
                          min={1}
                          max={20}
                          className="glass-input rounded-xl"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ceiling Height and Insulation */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ceilingHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-800">
                        <ArrowUpDown className="mr-2 h-4 w-4 text-netr-accent" />
                        Ceiling Height (ft)
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Select 
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setCeilingHeightMode("custom");
                                if (customCeilingHeight) {
                                  field.onChange(Number(customCeilingHeight));
                                }
                              } else {
                                setCeilingHeightMode("preset");
                                field.onChange(Number(value));
                              }
                            }}
                            value={ceilingHeightMode === "custom" ? "custom" : field.value?.toString()}
                          >
                            <SelectTrigger className="glass-input rounded-xl">
                              <SelectValue placeholder="Select ceiling height" />
                            </SelectTrigger>
                            <SelectContent>
                              {ceilingHeightOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {ceilingHeightMode === "custom" && (
                            <Input
                              type="number"
                              placeholder="Enter custom height (ft)"
                              min={7}
                              max={20}
                              step={0.5}
                              className="glass-input rounded-xl"
                              value={customCeilingHeight}
                              onChange={(e) => {
                                setCustomCeilingHeight(e.target.value);
                                field.onChange(Number(e.target.value));
                              }}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insulationQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-800">
                        <Shield className="mr-2 h-4 w-4 text-netr-accent" />
                        Insulation Quality
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="form-input rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor (Old home, minimal insulation)</SelectItem>
                          <SelectItem value="average">Average (Standard insulation)</SelectItem>
                          <SelectItem value="good">Good (Well-insulated, modern)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Window Area and Sun Exposure */}
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="windowArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-800">
                        <Square className="mr-2 h-4 w-4 text-netr-accent" />
                        Window Coverage
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="glass-input rounded-xl">
                            <SelectValue placeholder="Select window coverage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="50">Few Windows (50 sq ft)</SelectItem>
                          <SelectItem value="100">Average Windows (100 sq ft)</SelectItem>
                          <SelectItem value="150">Many Windows (150 sq ft)</SelectItem>
                          <SelectItem value="200">Large Windows (200 sq ft)</SelectItem>
                          <SelectItem value="300">Lots of Windows (300 sq ft)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sunExposure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-800">
                        <Sun className="mr-2 h-4 w-4 text-netr-accent" />
                        Sun Exposure
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="form-input rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low (North-facing, shaded)</SelectItem>
                          <SelectItem value="medium">Medium (Mixed exposure)</SelectItem>
                          <SelectItem value="high">High (South-facing, lots of sun)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Number of Occupants */}
              <FormField
                control={form.control}
                name="numberOfOccupants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-gray-800">
                      <Users className="mr-2 h-4 w-4 text-netr-accent" />
                      Number of Occupants
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 4"
                        min={1}
                        max={12}
                        className="form-input rounded-xl"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Calculate Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={calculateBTUMutation.isPending}
                  className="w-full netr-button py-4 px-8 rounded-xl text-lg"
                >
                  <Calculator className="mr-3 h-5 w-5" />
                  {calculateBTUMutation.isPending ? "Calculating..." : "Calculate BTU Requirements"}
                </Button>
              </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1 w-full">
          <div className="lg:sticky lg:top-8">
            <ResultsPanel results={calculationResult} />
          </div>
        </div>
      </div>
    </div>
  );
}
