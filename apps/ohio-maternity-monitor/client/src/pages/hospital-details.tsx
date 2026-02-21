
import React, { useEffect, useState, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { getHospitalById, Hospital } from '@/lib/mock-data';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, Globe, Baby, AlertTriangle, CheckCircle, Activity, Share2, Navigation, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function HospitalDetails() {
  const [match, params] = useRoute('/hospital/:id');
  const [hospital, setHospital] = useState<Hospital | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (params?.id) {
      setLoading(true);
      getHospitalById(params.id).then(data => {
        setHospital(data);
        setLoading(false);
      });
    }
  }, [params?.id]);

  useEffect(() => {
    if (!hospital || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([hospital.lat, hospital.lng], 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([hospital.lat, hospital.lng], 14);
    }

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #1e3a5f; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([hospital.lat, hospital.lng], { icon: customIcon })
      .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}`)
      .addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hospital]);

  const handleCall = () => {
    if (hospital?.phone) {
      const cleanPhone = hospital.phone.replace(/\D/g, '');
      window.location.href = `tel:${cleanPhone}`;
    } else {
      toast({
        title: "Phone not available",
        description: "Phone number is not available for this hospital.",
        variant: "destructive"
      });
    }
  };

  const handleGetDirections = () => {
    if (hospital) {
      const address = encodeURIComponent(`${hospital.name}, ${hospital.address}, ${hospital.city}, OH ${hospital.zip}`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
    }
  };

  const handleShare = async () => {
    if (!hospital) return;

    const shareData = {
      title: hospital.name,
      text: `Check out ${hospital.name} - a maternity hospital in ${hospital.city}, Ohio`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Hospital link has been copied to your clipboard.",
        });
      }
    } catch (err) {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Hospital link has been copied to your clipboard.",
      });
    }
  };

  const handleContactMellino = () => {
    window.open('https://www.mellinolaw.com/contact/', '_blank');
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
            <div className="h-64 bg-slate-200 rounded w-full max-w-3xl mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hospital) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-destructive">Hospital Not Found</h2>
          <Link href="/">
            <Button variant="link">Return Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
            <Link href="/">
                <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-primary" data-testid="button-back">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
                </Button>
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary" data-testid="text-hospital-name">{hospital.name}</h1>
                        {hospital.quality.isBirthingFriendly && (
                            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-semibold" data-testid="badge-birthing-friendly">
                                <Baby className="h-3 w-3 mr-1" /> Birthing Friendly
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground text-sm mt-2">
                         <div className="flex items-center" data-testid="text-address">
                            <MapPin className="h-4 w-4 mr-1 text-secondary" />
                            {hospital.address}, {hospital.city}, OH {hospital.zip}
                         </div>
                         <div className="hidden sm:block text-slate-300">|</div>
                         <a 
                           href={hospital.phone ? `tel:${hospital.phone.replace(/\D/g, '')}` : '#'}
                           className="flex items-center hover:text-primary transition-colors cursor-pointer"
                           data-testid="link-phone"
                         >
                            <Phone className="h-4 w-4 mr-1 text-secondary" />
                            {hospital.phone ? formatPhoneNumber(hospital.phone) : 'Phone not available'}
                         </a>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleShare} data-testid="button-share">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button onClick={handleCall} data-testid="button-contact">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Hospital
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif text-xl">About This Facility</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 leading-relaxed" data-testid="text-description">
                            {hospital.description || "No description available for this facility."}
                        </p>
                        <div className="mt-6">
                            <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">Key Features & Specialties</h4>
                            <div className="flex flex-wrap gap-2">
                                {hospital.features.length > 0 ? hospital.features.map((feature, i) => (
                                    <div key={i} className="flex items-center bg-slate-50 px-3 py-2 rounded-md border border-slate-100 text-sm" data-testid={`text-feature-${i}`}>
                                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                                        {feature}
                                    </div>
                                )) : (
                                    <p className="text-muted-foreground text-sm">No features listed.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif text-xl flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Quality & Safety Metrics
                        </CardTitle>
                        <CardDescription>
                            Based on latest available CMS data. Lower numbers are generally better for complication rates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                             <div className="text-sm text-muted-foreground mb-1">C-Section Rate</div>
                             <div className="text-3xl font-bold text-primary flex items-baseline gap-2" data-testid="text-csection-rate">
                                {hospital.quality.cSectionRate}%
                                <span className="text-xs font-normal text-muted-foreground">National Avg: 31.8%</span>
                             </div>
                             <div className="mt-2 text-xs text-slate-500">
                                {hospital.quality.cSectionRate < 30 ? (
                                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> Better than average</span>
                                ) : (
                                    <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Average or higher</span>
                                )}
                             </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                             <div className="text-sm text-muted-foreground mb-1">Early Elective Delivery</div>
                             <div className="text-3xl font-bold text-primary flex items-baseline gap-2" data-testid="text-early-delivery">
                                {hospital.quality.earlyElectiveDelivery}%
                             </div>
                             <div className="mt-2 text-xs text-slate-500">
                                Percent of births scheduled early without medical necessity.
                             </div>
                        </div>

                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                             <div className="text-sm text-muted-foreground mb-1">Complication Rate</div>
                             <div className="text-3xl font-bold text-primary flex items-baseline gap-2" data-testid="text-complication-rate">
                                {hospital.quality.complicationRate}
                                <span className="text-xs font-normal text-muted-foreground">per 1,000</span>
                             </div>
                             <div className="mt-2 text-xs text-slate-500">
                                Severe Maternal Morbidity rate.
                             </div>
                        </div>

                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                             <div className="text-sm text-muted-foreground mb-1">Overall Rating</div>
                             <div className="text-3xl font-bold text-primary flex items-baseline gap-2" data-testid="text-rating">
                                {hospital.quality.rating}
                             </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Right Column - Map & Contact */}
            <div className="space-y-6">
                <Card className="overflow-hidden">
                    <div ref={mapContainerRef} className="h-48 w-full" data-testid="hospital-map" />
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-1">
                            <h4 className="font-semibold text-primary">Location</h4>
                            <p className="text-sm text-muted-foreground">
                                {hospital.address}<br/>
                                {hospital.city}, OH {hospital.zip}
                            </p>
                        </div>
                        <Separator />
                        <Button variant="outline" className="w-full" onClick={handleGetDirections} data-testid="button-directions">
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                        </Button>
                         <Button variant="outline" className="w-full" onClick={handleCall} data-testid="button-call">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Hospital
                        </Button>
                    </CardContent>
                </Card>

                 <Card className="bg-secondary/5 border-secondary/20">
                    <CardContent className="p-6">
                        <h4 className="font-serif font-bold text-primary mb-2">Need Legal Help?</h4>
                        <p className="text-sm text-slate-600 mb-4">
                            If you believe you or your baby suffered a birth injury due to medical negligence at this facility, we can help you investigate.
                        </p>
                        <Button className="w-full bg-primary text-white" onClick={handleContactMellino} data-testid="button-contact-mellino">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Contact Mellino Law
                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>
      </div>
    </Layout>
  );
}
