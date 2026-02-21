
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Stethoscope, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Enhanced schema to capture specific risk factors
const formSchema = z.object({
  zipCode: z.string().min(5, "Zip code must be at least 5 digits"),
  maxDistance: z.number().min(5).max(100),
  
  // Risk Assessment Questions
  isHighRiskSelfReported: z.boolean().default(false),
  priorCSection: z.boolean().default(false),
  
  // Checklist conditions
  conditions: z.object({
    highBloodPressure: z.boolean().default(false),
    diabetes: z.boolean().default(false),
    multiples: z.boolean().default(false), // twins, triplets
    pretermHistory: z.boolean().default(false),
  })
});

// Helper to determine risk level from form data
const calculateRiskLevel = (data: z.infer<typeof formSchema>): 'low' | 'medium' | 'high' => {
  if (data.isHighRiskSelfReported) return 'high';
  if (data.conditions.multiples || data.conditions.highBloodPressure || data.conditions.diabetes) return 'high';
  if (data.priorCSection || data.conditions.pretermHistory) return 'medium';
  return 'low';
};

interface SearchFormProps {
  onSearch: (data: { zipCode: string; maxDistance: number; riskLevel: 'low' | 'medium' | 'high' }) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zipCode: '',
      maxDistance: 25,
      isHighRiskSelfReported: false,
      priorCSection: false,
      conditions: {
        highBloodPressure: false,
        diabetes: false,
        multiples: false,
        pretermHistory: false,
      }
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const calculatedRisk = calculateRiskLevel(data);
    onSearch({
      zipCode: data.zipCode,
      maxDistance: data.maxDistance,
      riskLevel: calculatedRisk
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-t-4 border-t-secondary relative bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-primary flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-secondary" />
          Find Your Maternity Care
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Location Section */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 mb-4">1. Location</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code, City, or County</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. 44114 or Cleveland" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxDistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Travel Distance: {field.value} miles</FormLabel>
                        <FormControl>
                          <Slider
                            min={5}
                            max={100}
                            step={5}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
            </div>

            {/* Risk Assessment Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
                2. Pregnancy Profile <span className="text-xs font-normal text-muted-foreground normal-case">(Helps us find the safest hospital for you)</span>
              </h3>
              
              <div className="grid gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                <FormField
                  control={form.control}
                  name="isHighRiskSelfReported"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Is this pregnancy considered high-risk by your doctor?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priorCSection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Have you had a prior C-section?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="conditions" className="border-none">
                    <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline hover:text-primary">
                      Any specific medical conditions? (Optional)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 pt-2">
                        <FormField
                          control={form.control}
                          name="conditions.highBloodPressure"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">High Blood Pressure / Preeclampsia</FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="conditions.diabetes"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Diabetes (Type 1, 2, or Gestational)</FormLabel>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="conditions.multiples"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Twins or Multiples</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-md transition-all hover:scale-[1.01]" disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Find Best Matches"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
