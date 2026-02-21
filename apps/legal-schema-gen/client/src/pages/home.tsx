import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { legalServiceSchema, LegalServiceData } from "@shared/schema";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FirmInfoForm } from "@/components/firm-info-form";
import { PracticeAreasForm } from "@/components/practice-areas-form";
import { AttorneysForm } from "@/components/attorneys-form";
import { OfficeLocationsForm } from "@/components/office-locations-form";
import { SchemaPreview } from "@/components/schema-preview";
import { BenefitsSection } from "@/components/benefits-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { Footer } from "@/components/footer";
import { SavedSchemasDialog } from "@/components/saved-schemas-dialog";
import { SaveSchemaDialog } from "@/components/save-schema-dialog";
import { TemplateSelectorDialog } from "@/components/template-selector-dialog";
import { Button } from "@/components/ui/button";
import { FileText, RotateCcw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { generateSchemaMarkup, validateSchema } from "@/lib/schema-generator";
import { SchemaOutput } from "@shared/schema";
import { saveDraft, loadDraft, clearDraft } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_DATA: LegalServiceData = {
  name: "Smith & Associates Law Firm",
  description: "Premier law firm serving clients in personal injury, criminal defense, and family law matters with over 20 years of experience in California.",
  url: "https://www.smithlawfirm.com",
  telephone: "(555) 123-4567",
  email: "info@smithlawfirm.com",
  address: {
    streetAddress: "123 Main Street, Suite 100",
    addressLocality: "Los Angeles",
    addressRegion: "CA",
    postalCode: "90001",
    addressCountry: "US",
  },
  foundingDate: "2003-05-15",
  logo: "https://www.smithlawfirm.com/logo.png",
  priceRange: "$$$",
  practiceAreas: ["Personal Injury", "Criminal Defense", "Family Law"],
  attorneys: [
    {
      id: "1",
      name: "John Smith",
      jobTitle: "Senior Partner",
      credentials: "J.D., LL.M.",
      barNumber: "CA123456",
      education: "Harvard Law School",
      yearsOfExperience: 20,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      jobTitle: "Partner",
      credentials: "J.D.",
      barNumber: "CA789012",
      education: "Stanford Law School",
      yearsOfExperience: 15,
    },
  ],
  additionalLocations: [
    {
      id: "1",
      name: "Downtown Office",
      address: {
        streetAddress: "456 Oak Avenue, Floor 2",
        addressLocality: "San Francisco",
        addressRegion: "CA",
        postalCode: "94102",
        addressCountry: "US",
      },
      telephone: "(555) 987-6543",
    },
  ],
};

const DEFAULT_VALUES: LegalServiceData = {
  name: "",
  description: "",
  url: "",
  telephone: "",
  email: "",
  address: {
    streetAddress: "",
    addressLocality: "",
    addressRegion: "",
    postalCode: "",
    addressCountry: "US",
  },
  foundingDate: "",
  logo: "",
  priceRange: "",
  practiceAreas: [],
  attorneys: [],
  additionalLocations: [],
};

export default function Home() {
  const { toast } = useToast();
  const [draftLoaded, setDraftLoaded] = useState(false);
  
  const form = useForm<LegalServiceData>({
    resolver: zodResolver(legalServiceSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const [schema, setSchema] = useState<SchemaOutput | null>(null);
  const [validation, setValidation] = useState({ isValid: false, errors: [] as string[], warnings: [] as string[] });

  const watchedValues = form.watch();

  useEffect(() => {
    const draft = loadDraft();
    if (draft && !draftLoaded) {
      const hasContent = draft.name || draft.telephone;
      
      if (hasContent) {
        form.reset({ ...DEFAULT_VALUES, ...draft });
        setDraftLoaded(true);
        toast({
          title: "Draft restored",
          description: "Your previous work has been restored.",
        });
      }
    }
  }, [draftLoaded, form, toast]);

  useEffect(() => {
    const hasContent = watchedValues.name || watchedValues.telephone;
    
    if (!hasContent) return;
    
    const timer = setTimeout(() => {
      saveDraft(watchedValues);
    }, 1000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  useEffect(() => {
    const validationResult = validateSchema(watchedValues);
    setValidation(validationResult);

    if (validationResult.isValid) {
      const generatedSchema = generateSchemaMarkup(watchedValues as LegalServiceData);
      setSchema(generatedSchema);
    } else {
      setSchema(null);
    }
  }, [watchedValues]);

  const loadSampleData = () => {
    form.reset(SAMPLE_DATA);
  };

  const clearForm = () => {
    form.reset(DEFAULT_VALUES);
    clearDraft();
  };

  const loadSchema = useCallback((data: LegalServiceData) => {
    form.reset(data);
    clearDraft();
  }, [form]);

  const applyTemplate = useCallback((data: Partial<LegalServiceData>) => {
    form.reset({ ...DEFAULT_VALUES, ...data });
    clearDraft();
  }, [form]);

  const completionPercentage = () => {
    const totalFields = 8;
    let completed = 0;
    if (watchedValues.name) completed++;
    if (watchedValues.telephone) completed++;
    if (watchedValues.address?.streetAddress) completed++;
    if (watchedValues.address?.addressLocality) completed++;
    if (watchedValues.address?.addressRegion) completed++;
    if (watchedValues.address?.postalCode) completed++;
    if (watchedValues.practiceAreas && watchedValues.practiceAreas.length > 0) completed++;
    if (watchedValues.description) completed++;
    return Math.round((completed / totalFields) * 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Hero />

      <div className="flex-1">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Form Completion</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${completionPercentage()}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {completionPercentage()}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <TemplateSelectorDialog onApplyTemplate={applyTemplate} />
              <SavedSchemasDialog onLoadSchema={loadSchema} />
              {validation.isValid && (
                <SaveSchemaDialog 
                  getData={() => form.getValues() as LegalServiceData} 
                  defaultName={watchedValues.name} 
                />
              )}
              <Button
                onClick={loadSampleData}
                variant="outline"
                size="sm"
                data-testid="button-load-sample"
              >
                <FileText className="h-4 w-4 mr-2" />
                Load Sample Data
              </Button>
              <Button
                onClick={clearForm}
                variant="outline"
                size="sm"
                data-testid="button-clear-form"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Form
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6" data-testid="container-form-sections">
              <FirmInfoForm form={form} />
              <PracticeAreasForm form={form} />
              <AttorneysForm form={form} />
              <OfficeLocationsForm form={form} />
            </div>

            <div>
              <SchemaPreview
                schema={schema}
                isValid={validation.isValid}
                errors={validation.errors}
                warnings={validation.warnings}
              />
            </div>
          </div>
        </div>
      </div>

      <BenefitsSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
}
