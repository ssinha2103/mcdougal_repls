import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Scale, Award, ChevronRight, FileText, ArrowLeft, Home } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const verdictData = [
  {
    id: "35700000",
    amount: "$35,700,000",
    type: "Mesothelioma & Asbestos",
    description: "Verdict for 67 year old man who died from asbestosis as a result of exposure to insulating company's thermal insulation over several years.",
    category: "asbestos",
    year: "Recent"
  },
  {
    id: "9323660",
    amount: "$9,323,660",
    type: "Amputation",
    description: "90% apportioned to defendant verdict for a 28 year old man, against his employer, railroad for a leg amputation resulting from the employer's negligence.",
    category: "railroad",
    year: "Recent"
  },
  {
    id: "5977482",
    amount: "$5,977,482",
    type: "Mesothelioma & Asbestos",
    description: "Verdict (50% apportioned to defendant) for a 69 year old man who died from malignant mesothelioma caused by a lifetime exposure to asbestos containing gaskets.",
    category: "asbestos",
    year: "Recent"
  },
  {
    id: "5650000",
    amount: "$5,650,000",
    type: "Mesothelioma & Asbestos",
    description: "Verdict (70% apportioned to defendant) for a 68 year old woman, exposed to asbestos containing talc at a tile manufacturing plant. Diagnosed with and died from malignant mesothelioma.",
    category: "asbestos",
    year: "Recent"
  },
  {
    id: "5000000",
    amount: "$5,000,000",
    type: "Chronic Toxic Encephalopathy & Asbestosis",
    description: "Verdict for a 67 year old man diagnosed with chronic toxic encephalopathy after being forced to work with toxic cleaning solvents and asbestos products by his railroad employer.",
    category: "railroad",
    year: "Recent"
  },
  {
    id: "3000000",
    amount: "$3,000,000",
    type: "Chronic Toxic Encephalopathy",
    description: "Verdict (65% apportionment to defendant) for a 56 year old man diagnosed with chronic toxic encephalopathy caused by exposure to solvents while employed by railroad in the 1970s and 80s.",
    category: "railroad",
    year: "Recent"
  },
  {
    id: "2740000",
    amount: "$2,740,000",
    type: "Traumatic Brain Injury",
    description: "Verdict for a 51 year old man required to work with toxic cleaning solvents while employed as a machinist for CSX Railroad in the 1970s and 80s. Suffered irreversible brain damage.",
    category: "railroad",
    year: "Recent"
  },
  {
    id: "1889375",
    amount: "$1,889,375",
    type: "Mesothelioma & Asbestos",
    description: "Verdict (25% apportioned to defendant) for a 63 year old man who died from mesothelioma from exposure to asbestos gaskets while employed as a lifelong pipefitter.",
    category: "asbestos",
    year: "Recent"
  },
  {
    id: "1521938",
    amount: "$1,521,938",
    type: "Lung Cancer",
    description: "Verdict for a 79 year old pipefitter, who suffered lung cancer from exposure to asbestos containing gaskets and asbestos containing cement pipe.",
    category: "asbestos",
    year: "Recent"
  },
  {
    id: "1521870",
    amount: "$1,521,870",
    type: "Asbestos Exposure",
    description: "Verdict for 64 year old pipefitter who was exposed to asbestos containing gaskets for decades.",
    category: "asbestos",
    year: "Recent"
  },
  {
    id: "1498500",
    amount: "$1,498,500",
    type: "Traumatic Brain Injury",
    description: "Verdict for 59 year old man, diagnosed with a traumatic brain injury from exposure to toxic cleaning solvents while working in a railroad machinist shop.",
    category: "railroad",
    year: "Recent"
  },
  {
    id: "815946",
    amount: "$815,946",
    type: "Traumatic Brain Injury",
    description: "Verdict for a 62 year old man, who suffered a permanent brain injury as a result of exposure to harmful chemicals while working for a railroad for many years.",
    category: "railroad",
    year: "Recent"
  },
  {
    id: "461600",
    amount: "$461,600",
    type: "Brain Injury",
    description: "Verdict for a 74 year old man diagnosed with a permanent brain injury as a result of exposure to cleaning chemicals while working for a railroad in the 1970s and 80s.",
    category: "railroad",
    year: "Recent"
  },
  {
    id: "150125",
    amount: "$150,125",
    type: "Asbestosis",
    description: "Judgment for a 63 year old pipefitter, who suffered asbestosis from exposure to defendant's asbestos containing gaskets.",
    category: "asbestos",
    year: "Recent"
  },
  {
    id: "111914",
    amount: "$111,914",
    type: "Dog Attack",
    description: "Judgment for minor child who suffered a fractured orbital bone and facial lacerations from a dog attack.",
    category: "other",
    year: "Recent"
  }
];

const appellateDecisions = [
  {
    case: "CertainTeed Corp. v. Dexter",
    citation: "330 S.W.3d 64 (Ky. 2010)",
    type: "Published",
    summary: "A $5 million asbestos verdict was initially thrown out due to jury's failure to apportion fault to 'empty-chair' defendants. Supreme Court reinstated new trial order.",
    outcome: "New trial ordered",
    significance: "Clarified fault allocation requirements in multi-defendant asbestos cases"
  },
  {
    case: "Clephas v. Garlock, Inc.",
    citation: "168 S.W.3d 389 (Ky. App. 2004)",
    type: "Published",
    summary: "Court of Appeals vacated defense verdict and ordered new trial due to discovery violations and inadequate expert disclosure by Garlock.",
    outcome: "Defense verdict vacated, new trial ordered",
    significance: "Reinforced strict expert disclosure requirements in asbestos litigation"
  },
  {
    case: "Owens-Corning Fiberglas Corp. v. Golightly",
    citation: "976 S.W.2d 409 (Ky. 1998)",
    type: "Published",
    summary: "Former insulator won $290,000 compensatory and $435,000 punitive damages. Kentucky Supreme Court upheld punitive damages award.",
    outcome: "Punitive damages upheld",
    significance: "Established framework for punitive damages in asbestos cases"
  },
  {
    case: "Parker v. Henry A. Petter Supply Co.",
    citation: "165 S.W.3d 474 (Ky. App. 2005)",
    type: "Published",
    summary: "Industrial worker with lung cancer sued product distributors. Court of Appeals reversed summary judgment, limiting distributor immunity.",
    outcome: "Summary judgment reversed",
    significance: "Limited distributor immunity under Kentucky's middleman statute"
  },
  {
    case: "R.T. Vanderbilt Co., Inc. v. Franklin",
    citation: "290 S.W.3d 654 (Ky. App. 2009)",
    type: "Published",
    summary: "$4+ million verdict for family of Flora Franklin, who died of mesothelioma from asbestos-contaminated talc exposure.",
    outcome: "Verdict affirmed",
    significance: "Addressed liability for asbestos contamination in consumer products"
  },
  {
    case: "Becht v. Owens-Corning Fiberglas Corp.",
    citation: "196 F.3d 650 (6th Cir. 1999)",
    type: "Published",
    summary: "Sixth Circuit applying Kentucky law rejected Owens-Corning's workers' compensation immunity defense in mesothelioma case.",
    outcome: "Immunity defense rejected",
    significance: "Clarified limits of workers' comp immunity in asbestos cases"
  },
  {
    case: "CSX Transp., Inc. v. Moody",
    citation: "313 S.W.3d 72 (Ky. 2010)",
    type: "Published",
    summary: "FELA railroad worker case establishing evidentiary standards for admitting evidence of other workers' injuries and railroad's knowledge.",
    outcome: "Evidentiary rulings affirmed",
    significance: "Established evidentiary standards for FELA asbestos cases"
  },
  {
    case: "General Electric Co. v. Cain",
    citation: "236 S.W.3d 579 (Ky. 2007)",
    type: "Published",
    summary: "Premises liability case clarifying when property owners qualify as 'contractors' under Kentucky workers' compensation immunity.",
    outcome: "Immunity standards clarified",
    significance: "Set forth test for determining statutory employer status"
  },
  {
    case: "Anderson v. Motorola Solutions, Inc.",
    citation: "2015 WL 5308091 (Ky. App. Sept. 11, 2015)",
    type: "Unpublished",
    summary: "Estate of radio repairman who died of mesothelioma from electronics exposure. Court of Appeals reversed summary judgment.",
    outcome: "Summary judgment reversed",
    significance: "Lowered bar for product identification in electronics cases"
  },
  {
    case: "Schneider Electric USA, Inc. v. Williams",
    citation: "2019 WL 3763537 (Ky. App. Aug. 19, 2019)",
    type: "Unpublished",
    summary: "Mesothelioma case involving brief summer job exposure at electrical factory. Court upheld verdict for plaintiff.",
    outcome: "Verdict upheld",
    significance: "Confirmed liability for brief but intense exposures"
  },
  {
    case: "Hayes v. Johnson & Johnson",
    citation: "2021 WL 2988377 (Ky. App. Jan. 29, 2021)",
    type: "Unpublished",
    summary: "Recent talc/asbestos case where Court of Appeals reversed summary judgment, finding sufficient evidence of contaminated talc exposure.",
    outcome: "Summary judgment reversed",
    significance: "Recent precedent in talc litigation"
  }
];

export default function ResultsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAppellate, setShowAppellate] = useState(false);
  const [, setLocation] = useLocation();

  const filteredVerdicts = selectedCategory === "all" 
    ? verdictData 
    : verdictData.filter(verdict => verdict.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "asbestos":
        return "bg-red-100 text-red-800";
      case "railroad":
        return "bg-blue-100 text-blue-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalAmount = verdictData.reduce((sum, verdict) => {
    const amount = parseFloat(verdict.amount.replace(/[$,]/g, ''));
    return sum + amount;
  }, 0);

  const averageAmount = totalAmount / verdictData.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Buttons */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Try to go back, but fallback to home if no history
                try {
                  if (document.referrer && document.referrer !== window.location.href) {
                    window.history.back();
                  } else {
                    setLocation('/');
                  }
                } catch {
                  setLocation('/');
                }
              }}
              className="text-gray-600 hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-navy"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Our Results</h1>
            <p className="text-xl text-blue-100 mb-4">
              Track record of verdicts and settlements for Kentucky families
            </p>
            <p className="text-sm text-blue-200 italic mb-8">
              Past results do not guarantee future outcomes. Each case is unique and results depend on specific facts and circumstances.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <DollarSign className="h-12 w-12 text-blue-300" />
                </div>
                <div className="text-3xl font-bold mb-2">${(totalAmount / 1000000).toFixed(1)}M+</div>
                <div className="text-blue-200">Total Recovered*</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Scale className="h-12 w-12 text-blue-300" />
                </div>
                <div className="text-3xl font-bold mb-2">{verdictData.length}</div>
                <div className="text-blue-200">Major Verdicts*</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Award className="h-12 w-12 text-blue-300" />
                </div>
                <div className="text-3xl font-bold mb-2">${(averageAmount / 1000000).toFixed(1)}M</div>
                <div className="text-blue-200">Average Settlement*</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Options */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-navy hover:bg-blue-900" : ""}
            >
              All Cases
            </Button>
            <Button
              variant={selectedCategory === "asbestos" ? "default" : "outline"}
              onClick={() => setSelectedCategory("asbestos")}
              className={selectedCategory === "asbestos" ? "bg-navy hover:bg-blue-900" : ""}
            >
              Asbestos & Mesothelioma
            </Button>
            <Button
              variant={selectedCategory === "railroad" ? "default" : "outline"}
              onClick={() => setSelectedCategory("railroad")}
              className={selectedCategory === "railroad" ? "bg-navy hover:bg-blue-900" : ""}
            >
              Railroad Injuries
            </Button>
          </div>
        </div>

        {/* Toggle between Verdicts and Appellate */}
        <div className="mb-8">
          <div className="flex gap-4">
            <Button
              variant={!showAppellate ? "default" : "outline"}
              onClick={() => setShowAppellate(false)}
              className={!showAppellate ? "bg-navy hover:bg-blue-900" : ""}
            >
              <Scale className="h-4 w-4 mr-2" />
              Verdicts & Settlements
            </Button>
            <Button
              variant={showAppellate ? "default" : "outline"}
              onClick={() => setShowAppellate(true)}
              className={showAppellate ? "bg-navy hover:bg-blue-900" : ""}
            >
              <FileText className="h-4 w-4 mr-2" />
              Appellate Decisions
            </Button>
          </div>
        </div>

        {/* Verdicts & Settlements */}
        {!showAppellate && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredVerdicts.map((verdict) => (
              <Card 
                key={verdict.id} 
                className="legal-shadow hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                onClick={() => {
                  // Navigate to individual verdict detail page using the verdict ID
                  window.location.href = `/verdict/${verdict.id}`;
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-navy mb-2">
                        {verdict.amount}
                      </CardTitle>
                      <Badge className={getCategoryColor(verdict.category)}>
                        {verdict.type}
                      </Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-legal-gray group-hover:text-navy group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-legal-gray leading-relaxed">
                    {verdict.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Appellate Decisions */}
        {showAppellate && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {appellateDecisions.map((decision, index) => (
                <Card 
                  key={index} 
                  className="legal-shadow hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.01]"
                  onClick={() => {
                    // Navigate to individual decision detail page using pre-defined IDs
                    const decisionMap: { [key: string]: string } = {
                      "CertainTeed Corp. v. Dexter": "certainteed-corp-v-dexter",
                      "Clephas v. Garlock, Inc.": "clephas-v-garlock-inc", 
                      "Owens-Corning Fiberglas Corp. v. Golightly": "owens-corning-fiberglas-corp-v-golightly",
                      "Parker v. Henry A. Petter Supply Co.": "parker-v-henry-a-petter-supply-co",
                      "R.T. Vanderbilt Co., Inc. v. Franklin": "rt-vanderbilt-co-inc-v-franklin",
                      "Becht v. Owens-Corning Fiberglas Corp.": "becht-v-owens-corning-fiberglas-corp",
                      "CSX Transp., Inc. v. Moody": "csx-transp-inc-v-moody",
                      "General Electric Co. v. Cain": "general-electric-co-v-cain",
                      "Anderson v. Motorola Solutions, Inc.": "anderson-v-motorola-solutions-inc",
                      "Schneider Electric USA, Inc. v. Williams": "schneider-electric-usa-inc-v-williams",
                      "Hayes v. Johnson & Johnson": "hayes-v-johnson-johnson"
                    };
                    const decisionId = decisionMap[decision.case];
                    if (decisionId) {
                      window.location.href = `/appellate-decision/${decisionId}`;
                    }
                  }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={decision.type === "Published" ? "default" : "secondary"} className={decision.type === "Published" ? "bg-navy text-white" : "bg-gray-100 text-gray-700"}>
                        {decision.type}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-legal-gray group-hover:text-navy group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="text-lg leading-tight text-navy">
                      {decision.case}
                    </CardTitle>
                    <p className="text-sm text-legal-gray font-medium">{decision.citation}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {decision.summary}
                      </p>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Scale className="h-4 w-4 text-navy mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-navy mb-1">Outcome</p>
                            <p className="text-xs text-navy">{decision.outcome}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-semibold text-navy mb-1">Legal Significance</p>
                        <p className="text-xs text-gray-600">{decision.significance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                className="border-navy text-navy hover:bg-navy hover:text-white"
                onClick={() => window.location.href = '/appellate-decisions'}
              >
                View All Appellate Decisions
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Separator className="mb-8" />
          <h2 className="text-3xl font-bold text-navy mb-4">
            Ready to Discuss Your Case?
          </h2>
          <p className="text-lg text-legal-gray mb-8 max-w-2xl mx-auto">
            Our experienced attorneys have recovered millions for Kentucky families affected by asbestos exposure. 
            Contact us today for a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-legal-red hover:bg-red-700 text-white px-8 py-3">
              <a href="tel:855-385-2532" className="flex items-center">
                Call (855) 385-2532
              </a>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              <a href="/#contact" className="flex items-center">
                Free Case Evaluation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}