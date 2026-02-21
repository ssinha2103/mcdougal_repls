import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Phone, MapPin, Clock, Users } from "lucide-react";
import { Link } from "wouter";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  exposureLocation: z.string().min(1, "Please specify exposure location"),
  relationship: z.string().min(1, "Please select your relationship"),
  additionalInfo: z.string().optional(),
  consent: z.boolean().refine(val => val === true, "You must agree to be contacted"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      exposureLocation: "",
      relationship: "",
      additionalInfo: "",
      consent: false,
    },
  });

  // Pre-fill form from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const site = urlParams.get('site');
    const location = urlParams.get('location');
    const type = urlParams.get('type');

    if (site && location) {
      form.setValue('exposureLocation', `${site} - ${location}`);
    }

  }, [form]);

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus("submitting");
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        form.reset();
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-green-100 border border-green-200 rounded-lg p-8 mb-8">
              <h1 className="text-2xl font-bold text-green-800 mb-4">Thank You for Contacting Us</h1>
              <p className="text-green-700 mb-4">
                We have received your information and will contact you within 24 hours to discuss your potential case.
              </p>
              <p className="text-sm text-green-600 mb-6">
                For urgent matters, please call us directly at <strong>855-385-9532</strong>
              </p>
              <Link href="/">
                <Button className="bg-navy hover:bg-blue-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-navy mb-2">Free Legal Consultation</h1>
          <p className="text-legal-gray">
            If you or a loved one was exposed to asbestos, you may be entitled to compensation. 
            Fill out this form for a free, no-obligation consultation with our experienced mesothelioma attorneys.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-navy">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
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
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Exposure Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-navy mb-4">Asbestos Exposure Details</h3>
                      
                      <FormField
                        control={form.control}
                        name="exposureLocation"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Exposure Location *</FormLabel>
                            <FormControl>
                              <Input placeholder="Where were you exposed to asbestos?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />



                      <FormField
                        control={form.control}
                        name="relationship"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Your Relationship to Exposure *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="worker">I worked at the site</SelectItem>
                                <SelectItem value="resident">I lived near the site</SelectItem>
                                <SelectItem value="family">Family member of exposed worker</SelectItem>
                                <SelectItem value="spouse">Spouse of exposed person</SelectItem>
                                <SelectItem value="child">Child of exposed person</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />



                      <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel>Additional Information</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any additional details about your exposure or case..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to be contacted by Satterley & Kelley PLLC regarding my potential case *
                              </FormLabel>
                              <p className="text-xs text-legal-gray">
                                By checking this box, you consent to receive communications from our law firm 
                                regarding your potential asbestos exposure case.
                              </p>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-legal-red hover:bg-red-700"
                      disabled={submitStatus === "submitting"}
                    >
                      {submitStatus === "submitting" ? "Submitting..." : "Get Free Consultation"}
                    </Button>

                    {submitStatus === "error" && (
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <p className="text-red-800 text-sm">
                          There was an error submitting your form. Please try again or call us directly at 855-385-9532.
                        </p>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-legal-red mr-3" />
                    <div>
                      <p className="font-semibold">Call Now</p>
                      <p className="text-legal-red font-bold">855-385-9532</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-legal-red mr-3" />
                    <div>
                      <p className="font-semibold">Office Location</p>
                      <p className="text-sm text-legal-gray">
                        8700 Westport Road, Suite 202<br />
                        Louisville, KY 40242
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-legal-red mr-3" />
                    <div>
                      <p className="font-semibold">Response Time</p>
                      <p className="text-sm text-legal-gray">Within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Why Choose Us */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy">Why Choose Our Firm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-legal-red mr-3 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">30+ Years Experience</p>
                      <p className="text-xs text-legal-gray">Specialized in asbestos litigation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-legal-red mr-3 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">No Fees Unless We Win</p>
                      <p className="text-xs text-legal-gray">Contingency fee arrangement</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-legal-red mr-3 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Award-Winning Attorneys</p>
                      <p className="text-xs text-legal-gray">Trial Lawyer of the Year 2022</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}