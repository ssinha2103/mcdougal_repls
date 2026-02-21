
import React from 'react';
import { Hospital } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight, Baby, Phone, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

interface HospitalCardProps {
  hospital: Hospital;
  rank: number;
}

export function HospitalCard({ hospital, rank }: HospitalCardProps) {
  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hospital.phone) {
      const cleanPhone = hospital.phone.replace(/\D/g, '');
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const address = encodeURIComponent(`${hospital.name}, ${hospital.address}, ${hospital.city}, OH ${hospital.zip}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <Card className="group hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-secondary duration-200" data-testid={`card-hospital-${hospital.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary font-serif leading-tight mb-1" data-testid={`text-hospital-name-${hospital.id}`}>
                  {rank}. {hospital.name}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm mb-2" data-testid={`text-address-${hospital.id}`}>
                  <MapPin className="h-3 w-3 mr-1" />
                  {hospital.address}, {hospital.city} ({hospital.distance} miles)
                </div>
                {hospital.phone && (
                  <a 
                    href={`tel:${hospital.phone.replace(/\D/g, '')}`}
                    className="flex items-center text-muted-foreground text-sm hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`link-phone-${hospital.id}`}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    {formatPhoneNumber(hospital.phone)}
                  </a>
                )}
              </div>
              {hospital.quality.isBirthingFriendly && (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap font-semibold" data-testid={`badge-birthing-${hospital.id}`}>
                  <Baby className="h-3 w-3 mr-1" />
                  Birthing Friendly
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">C-Section Rate</span>
                <span className={cn("font-bold text-lg", 
                  hospital.quality.cSectionRate > 30 ? "text-destructive" : "text-emerald-600"
                )} data-testid={`text-csection-${hospital.id}`}>
                  {hospital.quality.cSectionRate}%
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Maternal Morbidity</span>
                <span className="font-bold text-lg text-primary" data-testid={`text-morbidity-${hospital.id}`}>{hospital.quality.maternalMorbidity}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {hospital.features.slice(0, 3).map((feature, i) => (
                <span key={i} className="inline-flex items-center px-2 py-1 rounded-sm bg-slate-100 text-slate-600 text-xs font-medium" data-testid={`text-feature-${hospital.id}-${i}`}>
                  {feature}
                </span>
              ))}
              {hospital.features.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-sm bg-slate-100 text-slate-600 text-xs font-medium">
                  +{hospital.features.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <div className="flex md:flex-col justify-end items-end gap-2 md:border-l md:pl-6 md:min-w-[140px]">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={handleDirections}
              data-testid={`button-directions-${hospital.id}`}
            >
              <Navigation className="h-3 w-3 mr-1" />
              Directions
            </Button>
            {hospital.phone && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={handleCall}
                data-testid={`button-call-${hospital.id}`}
              >
                <Phone className="h-3 w-3 mr-1" />
                Call
              </Button>
            )}
            <Link href={`/hospital/${hospital.id}`} className="w-full">
                <Button variant="default" className="w-full justify-between group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer" data-testid={`button-details-${hospital.id}`}>
                Details <ChevronRight className="h-4 w-4" />
                </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
