
import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/layout';
import { SearchForm } from '@/components/search-form';
import { HospitalCard } from '@/components/hospital-card';
import { HospitalMap } from '@/components/hospital-map';
import { searchHospitals, Hospital } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Activity, ShieldCheck, Award } from 'lucide-react';

export default function Home() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLElement>(null);
  const [, setLocation] = useLocation();

  const handleHospitalClick = (hospitalId: number) => {
    setLocation(`/hospital/${hospitalId}`);
  };

  const handleSearch = async (data: any) => {
    setIsLoading(true);
    try {
      const results = await searchHospitals(data.zipCode, data.riskLevel, data.maxDistance);
      setHospitals(results);
      setHasSearched(true);
      
      if (results.length === 0) {
        toast({
          title: "No hospitals found",
          description: "Try increasing the search distance.",
          variant: "destructive"
        });
      } else {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search hospitals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary relative py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
              Find Safe, High-Quality Maternity Care in Ohio
            </h2>
            <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto font-light">
              Your health and your baby's safety matter. Compare local hospitals based on C-section rates, complications, and birthing-friendly status.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section - Overlapping Hero */}
      <section className="container mx-auto px-4 -mt-6 relative z-20 mb-6">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </section>

      {/* Results Section */}
      {hasSearched && (
        <section ref={resultsRef} className="container mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col-reverse lg:flex-row gap-6">
            {/* List View */}
            <div className="lg:w-[400px] xl:w-[450px] space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-bold text-primary">
                  {hospitals.length} Hospitals Found
                </h3>
                <span className="text-xs text-muted-foreground">Sorted by Quality & Distance</span>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {hospitals.map((hospital, index) => (
                  <HospitalCard key={hospital.id} hospital={hospital} rank={index + 1} />
                ))}
                {hospitals.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">No hospitals found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map View - Main Focus */}
            <div className="flex-1 h-[400px] lg:h-[600px] sticky top-4 self-start rounded-xl overflow-hidden shadow-lg border border-slate-200">
               <HospitalMap hospitals={hospitals} onHospitalClick={handleHospitalClick} />
            </div>
          </div>
        </section>
      )}

      {/* Info/Trust Section */}
      {!hasSearched && (
        <section className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <Activity className="h-6 w-6" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2 text-primary">Data-Driven Choices</h4>
                    <p className="text-muted-foreground">We use official CMS data to evaluate hospitals on safety metrics that matter.</p>
                </div>
                <div className="p-6 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                     <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2 text-primary">Risk-Appropriate Care</h4>
                    <p className="text-muted-foreground">Find facilities equipped to handle your specific pregnancy risk level.</p>
                </div>
                <div className="p-6 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                     <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <Award className="h-6 w-6" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2 text-primary">Quality Transparency</h4>
                    <p className="text-muted-foreground">See C-section rates and complication data before you choose.</p>
                </div>
            </div>
        </section>
      )}
    </Layout>
  );
}
