import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertBiteReportSchema, type InsertBiteReport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TownData } from "@/types/town";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface BiteReportFormProps {
  selectedTown: TownData;
}

export default function BiteReportForm({ selectedTown }: BiteReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBiteReport>({
    resolver: zodResolver(insertBiteReportSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      incidentTown: selectedTown.name,
      incidentDate: "",
      description: "",
    },
  });

  const createBiteReportMutation = useMutation({
    mutationFn: async (data: InsertBiteReport) => {
      const response = await apiRequest("POST", "/api/bite-reports", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Consultation Request Submitted",
        description: "Thank you! A legal expert will contact you within 24 hours to discuss your case.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/bite-reports"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: InsertBiteReport) => {
    setIsSubmitting(true);
    createBiteReportMutation.mutate(data);
  };

  return (
    <div data-testid="bite-report-form" className="max-w-full">
      <div className="bg-legal-gold bg-opacity-10 border border-legal-gold rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-legal-blue mb-2">Free Legal Consultation</h3>
        <p className="text-gray-700 text-sm">
          Get expert legal guidance for your dog bite incident. No fees unless we win.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter your full name"
                    data-testid="input-full-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="Enter your email address"
                    data-testid="input-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel"
                    placeholder="Enter your phone number"
                    data-testid="input-phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incidentTown"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Town of Incident *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    readOnly
                    className="bg-gray-50 text-gray-600"
                    data-testid="input-incident-town"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incidentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Incident *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="date"
                    data-testid="input-incident-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe the Incident *</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    rows={4}
                    placeholder="Please describe what happened, injuries sustained, and any other relevant details..."
                    className="resize-none"
                    data-testid="textarea-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="consent" 
              required 
              data-testid="checkbox-consent"
            />
            <Label htmlFor="consent" className="text-xs text-gray-600">
              I consent to being contacted by Mazow McCullough P.C. regarding my dog bite incident 
              and understand that no attorney-client relationship is formed until a retainer agreement is signed.
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-legal-blue text-white font-semibold py-3 px-4 hover:bg-blue-800"
            disabled={isSubmitting}
            data-testid="button-submit-report"
          >
            {isSubmitting ? "Submitting..." : "Get Free Legal Consultation"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            No fees unless we win your case
          </p>
        </form>
      </Form>
    </div>
  );
}
