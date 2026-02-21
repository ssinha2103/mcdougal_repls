import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LegalPopup from "@/components/legal/legal-popup";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  exposureDetails: z.string().optional(),
  disclaimerAccepted: z.boolean().refine(val => val === true, "You must accept the disclaimer"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      exposureDetails: "",
      disclaimerAccepted: false,
    },
  });

  const submitContactForm = useMutation({
    mutationFn: async (data: Omit<ContactFormData, 'disclaimerAccepted'>) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form Submitted Successfully",
        description: "Thank you for contacting us. We will reach out to you within 24 hours.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or call us directly at 855-385-9532",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    const { disclaimerAccepted, ...submitData } = data;
    submitContactForm.mutate(submitData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Contact Form */}
      <div className="bg-gray-50 rounded-lg p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-navy mb-4 sm:mb-6">Free Case Review</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} className="focus:ring-navy focus:border-navy" />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="focus:ring-navy focus:border-navy" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" className="focus:ring-navy focus:border-navy" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="exposureDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="Share any details about your situation that might help us assist you..."
                      className="focus:ring-navy focus:border-navy"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="disclaimerAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-legal-gray">
                      I agree to be contacted by Satterley & Kelley PLLC regarding my potential case *
                    </FormLabel>
                    <p className="text-xs text-legal-gray leading-relaxed">
                      By checking this box, you consent to receive communications from our law firm regarding your potential asbestos exposure case. 
                      Please read our{" "}
                      <LegalPopup type="disclaimer">
                        <button type="button" className="text-navy hover:underline">disclaimer</button>
                      </LegalPopup>
                      {" "}and{" "}
                      <LegalPopup type="privacy">
                        <button type="button" className="text-navy hover:underline">privacy policy</button>
                      </LegalPopup>
                      .
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-legal-red hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              disabled={submitContactForm.isPending}
            >
              {submitContactForm.isPending ? "Submitting..." : "Submit Free Case Review"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Contact Information */}
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-navy mb-3 sm:mb-4">Contact Information</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-legal-red flex-shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-semibold text-navy">Phone</div>
                <a href="tel:855-385-9532" className="text-sm sm:text-base text-legal-red hover:underline font-medium">
                  855-385-9532
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-legal-red flex-shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-semibold text-navy">Office Address</div>
                <div className="text-sm text-legal-gray">8700 Westport Road, Suite 202</div>
                <div className="text-sm text-legal-gray">Louisville, KY 40242</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-legal-red flex-shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-semibold text-navy">Available</div>
                <div className="text-sm text-legal-gray">24/7 for urgent cases</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-navy mb-3 sm:mb-4">Professional Credentials</h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <div className="text-xs sm:text-sm font-medium text-legal-gray">American Association</div>
              <div className="text-xs text-legal-gray">for Justice</div>
            </div>
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <div className="text-xs sm:text-sm font-medium text-legal-gray">Kentucky</div>
              <div className="text-xs text-legal-gray">Justice Association</div>
            </div>
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <div className="text-xs sm:text-sm font-medium text-legal-gray">American</div>
              <div className="text-xs text-legal-gray">Bar Association</div>
            </div>
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <div className="text-xs sm:text-sm font-medium text-legal-gray">20+ Years</div>
              <div className="text-xs text-legal-gray">Experience</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
