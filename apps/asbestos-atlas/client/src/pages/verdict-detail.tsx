import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Scale, Calendar, MapPin, Building2, Users, DollarSign, Home } from "lucide-react";

// Verdict data from Satterley & Kelley website
const verdictData = {
  "35700000": {
    id: "35700000",
    amount: "$35,700,000",
    title: "Mesothelioma & Asbestos",
    type: "Mesothelioma & Asbestos",
    category: "Mesothelioma",
    description: "Verdict for 67 year old man who died from asbestosis as a result of exposure to insulating company's thermal insulation over several years.",
    details: {
      age: "67 years old",
      gender: "Male",
      condition: "Asbestosis (Fatal)",
      exposureSource: "Thermal insulation from insulating company",
      exposureDuration: "Several years",
      outcome: "Death from asbestosis",
      significance: "Largest mesothelioma verdict secured by Satterley & Kelley PLLC"
    },
    legalNotes: [
      "Demonstrated clear causal relationship between thermal insulation exposure and asbestosis",
      "Established employer negligence in safety protocols",
      "Secured full compensation for family's wrongful death claim"
    ]
  },
  "5977482": {
    id: "5977482",
    amount: "$5,977,482",
    title: "Mesothelioma & Asbestos",
    type: "Mesothelioma & Asbestos", 
    category: "Mesothelioma",
    description: "Verdict (50% apportioned to defendant) for a 69 year old man who died from malignant mesothelioma caused by a lifetime exposure to asbestos containing gaskets manufactured by the defendant.",
    details: {
      age: "69 years old",
      gender: "Male",
      condition: "Malignant mesothelioma (Fatal)",
      exposureSource: "Asbestos containing gaskets",
      exposureDuration: "Lifetime exposure",
      outcome: "Death from malignant mesothelioma",
      apportionment: "50% liability to defendant"
    },
    legalNotes: [
      "Established manufacturer liability for asbestos-containing gaskets",
      "Proved decades-long exposure pattern",
      "Secured substantial compensation despite comparative fault ruling"
    ]
  },
  "5650000": {
    id: "5650000",
    amount: "$5,650,000",
    title: "Mesothelioma & Asbestos",
    type: "Mesothelioma & Asbestos",
    category: "Mesothelioma", 
    description: "Verdict (70% apportioned to the defendant) for a 68 year old woman, who was exposed to asbestos containing talc used at a tile manufacturing plant for many years. The woman was diagnosed with and ultimately died from malignant mesothelioma as a result of her substantial exposure to asbestos containing talc.",
    details: {
      age: "68 years old",
      gender: "Female",
      condition: "Malignant mesothelioma (Fatal)",
      exposureSource: "Asbestos containing talc at tile manufacturing plant",
      exposureDuration: "Many years",
      outcome: "Death from malignant mesothelioma",
      apportionment: "70% liability to defendant"
    },
    legalNotes: [
      "Demonstrated occupational exposure in tile manufacturing industry",
      "Established link between talc products and mesothelioma",
      "Achieved favorable liability apportionment for client"
    ]
  },
  "1889375": {
    id: "1889375", 
    amount: "$1,889,375",
    title: "Mesothelioma & Asbestos",
    type: "Mesothelioma & Asbestos",
    category: "Mesothelioma",
    description: "Verdict (25% apportioned to defendant) for a 63 year old man who died from mesothelioma from exposure to asbestos gaskets while employed as a lifelong pipefitter.",
    details: {
      age: "63 years old",
      gender: "Male",
      condition: "Mesothelioma (Fatal)",
      exposureSource: "Asbestos gaskets during pipefitting work",
      exposureDuration: "Lifelong career",
      outcome: "Death from mesothelioma",
      apportionment: "25% liability to defendant"
    },
    legalNotes: [
      "Established occupational exposure in pipefitting trade",
      "Proved manufacturer knowledge of asbestos dangers",
      "Secured compensation for family despite multiple defendants"
    ]
  },
  "9323660": {
    id: "9323660",
    amount: "$9,323,660",
    title: "Amputation",
    type: "Amputation",
    category: "Railroad",
    description: "90% apportioned to defendant verdict for a 28 year old man, against his employer, railroad for a leg amputation resulting from the employer's negligence.",
    details: {
      age: "28 years old",
      gender: "Male",
      condition: "Leg amputation",
      exposureSource: "Railroad employer negligence",
      exposureDuration: "Employment period",
      outcome: "Leg amputation",
      apportionment: "90% liability to defendant"
    },
    legalNotes: [
      "Established employer negligence in safety protocols",
      "Secured substantial compensation for amputation injury",
      "Achieved favorable liability apportionment for client"
    ]
  },
  "5000000": {
    id: "5000000",
    amount: "$5,000,000",
    title: "Chronic Toxic Encephalopathy & Asbestosis",
    type: "Chronic Toxic Encephalopathy & Asbestosis",
    category: "Railroad",
    description: "Verdict for a 67 year old man diagnosed with chronic toxic encephalopathy after being forced to work with toxic cleaning solvents and asbestos products by his railroad employer.",
    details: {
      age: "67 years old",
      gender: "Male",
      condition: "Chronic toxic encephalopathy & asbestosis",
      exposureSource: "Toxic cleaning solvents and asbestos products",
      exposureDuration: "Railroad employment period",
      outcome: "Chronic toxic encephalopathy diagnosis",
      significance: "Dual exposure case - chemicals and asbestos"
    },
    legalNotes: [
      "Demonstrated railroad employer forced exposure to toxic substances",
      "Established causal relationship between workplace chemicals and brain injury",
      "Secured compensation for both chemical and asbestos-related conditions"
    ]
  },
  "3000000": {
    id: "3000000",
    amount: "$3,000,000",
    title: "Chronic Toxic Encephalopathy",
    type: "Chronic Toxic Encephalopathy",
    category: "Railroad",
    description: "Verdict (65% apportionment to defendant) for a 56 year old man diagnosed with chronic toxic encephalopathy caused by exposure to solvents while employed by railroad in the 1970s and 80s.",
    details: {
      age: "56 years old",
      gender: "Male",
      condition: "Chronic toxic encephalopathy",
      exposureSource: "Railroad solvents",
      exposureDuration: "1970s and 1980s employment",
      outcome: "Chronic toxic encephalopathy diagnosis",
      apportionment: "65% liability to defendant"
    },
    legalNotes: [
      "Established historical railroad solvent exposure patterns",
      "Proved decades-long exposure in 1970s and 1980s",
      "Achieved favorable liability determination despite comparative fault"
    ]
  },
  "2740000": {
    id: "2740000",
    amount: "$2,740,000",
    title: "Traumatic Brain Injury",
    type: "Traumatic Brain Injury",
    category: "Railroad",
    description: "Verdict for a 51 year old man required to work with toxic cleaning solvents while employed as a machinist for CSX Railroad in the 1970s and 80s. Suffered irreversible brain damage.",
    details: {
      age: "51 years old",
      gender: "Male",
      condition: "Traumatic brain injury (irreversible)",
      exposureSource: "Toxic cleaning solvents at CSX Railroad",
      exposureDuration: "1970s and 1980s employment",
      outcome: "Irreversible brain damage",
      employer: "CSX Railroad"
    },
    legalNotes: [
      "Established CSX Railroad negligence in worker safety",
      "Demonstrated irreversible nature of brain damage",
      "Secured substantial compensation for permanent disability"
    ]
  },
  "1521938": {
    id: "1521938",
    amount: "$1,521,938", 
    title: "Lung Cancer",
    type: "Lung Cancer",
    category: "Asbestos",
    description: "Verdict for a 79 year old pipefitter, who suffered lung cancer from exposure to asbestos containing gaskets and asbestos containing cement pipe manufactured by the defendants.",
    details: {
      age: "79 years old",
      gender: "Male", 
      condition: "Lung cancer",
      exposureSource: "Asbestos containing gaskets and cement pipe",
      exposureDuration: "Career-long exposure",
      outcome: "Lung cancer diagnosis",
      significance: "Proved causation despite multiple exposure sources"
    },
    legalNotes: [
      "Established causation between asbestos exposure and lung cancer",
      "Demonstrated product defect in gaskets and cement pipes",
      "Achieved substantial verdict for living plaintiff"
    ]
  },
  "1521870": {
    id: "1521870",
    amount: "$1,521,870",
    title: "Asbestos Exposure",
    type: "Asbestos Exposure",
    category: "Asbestos",
    description: "Verdict for 64 year old pipefitter who was exposed to asbestos containing gaskets for decades.",
    details: {
      age: "64 years old",
      gender: "Male",
      condition: "Asbestos exposure complications",
      exposureSource: "Asbestos containing gaskets",
      exposureDuration: "Decades of occupational exposure",
      outcome: "Asbestos-related health complications",
      significance: "Long-term exposure case"
    },
    legalNotes: [
      "Demonstrated decades-long occupational asbestos exposure",
      "Established manufacturer liability for gasket products",
      "Secured compensation for asbestos-related health effects"
    ]
  },
  "1498500": {
    id: "1498500",
    amount: "$1,498,500",
    title: "Traumatic Brain Injury",
    type: "Traumatic Brain Injury",
    category: "Railroad",
    description: "Verdict for 59 year old man, diagnosed with a traumatic brain injury from exposure to toxic cleaning solvents while working in a railroad machinist shop.",
    details: {
      age: "59 years old",
      gender: "Male",
      condition: "Traumatic brain injury",
      exposureSource: "Toxic cleaning solvents in railroad machinist shop",
      exposureDuration: "Railroad employment period",
      outcome: "Traumatic brain injury diagnosis",
      workplace: "Railroad machinist shop"
    },
    legalNotes: [
      "Established railroad employer negligence in chemical safety",
      "Proved causation between solvent exposure and brain injury",
      "Secured substantial compensation for neurological damage"
    ]
  },
  "815946": {
    id: "815946",
    amount: "$815,946",
    title: "Traumatic Brain Injury",
    type: "Traumatic Brain Injury",
    category: "Railroad",
    description: "Verdict for a 62 year old man, who suffered a permanent brain injury as a result of exposure to harmful chemicals while working for a railroad for many years.",
    details: {
      age: "62 years old",
      gender: "Male",
      condition: "Permanent brain injury",
      exposureSource: "Harmful chemicals during railroad employment",
      exposureDuration: "Many years of employment",
      outcome: "Permanent brain injury",
      significance: "Long-term chemical exposure case"
    },
    legalNotes: [
      "Demonstrated long-term chemical exposure effects",
      "Established railroad employer liability for chemical safety",
      "Achieved compensation for permanent neurological disability"
    ]
  },
  "461600": {
    id: "461600",
    amount: "$461,600",
    title: "Brain Injury",
    type: "Brain Injury",
    category: "Railroad",
    description: "Verdict for a 74 year old man diagnosed with a permanent brain injury as a result of exposure to cleaning chemicals while working for a railroad in the 1970s and 80s.",
    details: {
      age: "74 years old",
      gender: "Male",
      condition: "Permanent brain injury",
      exposureSource: "Cleaning chemicals during railroad employment",
      exposureDuration: "1970s and 1980s employment",
      outcome: "Permanent brain injury diagnosis",
      timeframe: "Historical exposure case"
    },
    legalNotes: [
      "Established historical railroad chemical exposure patterns",
      "Proved long-term effects of 1970s-80s chemical exposure",
      "Secured compensation for elderly plaintiff with permanent injury"
    ]
  },
  "150125": {
    id: "150125",
    amount: "$150,125",
    title: "Asbestosis", 
    type: "Asbestosis",
    category: "Asbestos",
    description: "Judgment for a 63 year old pipefitter, who suffered asbestosis from exposure to defendant's asbestos containing gaskets.",
    details: {
      age: "63 years old",
      gender: "Male",
      condition: "Asbestosis",
      exposureSource: "Asbestos containing gaskets",
      exposureDuration: "Occupational exposure",
      outcome: "Asbestosis diagnosis",
      significance: "Established liability for non-fatal asbestos disease"
    },
    legalNotes: [
      "Proved asbestos exposure causation for non-malignant disease",
      "Secured compensation for ongoing medical needs",
      "Established precedent for asbestosis claims"
    ]
  },
  "111914": {
    id: "111914",
    amount: "$111,914",
    title: "Dog Attack",
    type: "Dog Attack",
    category: "Personal Injury",
    description: "Judgment for minor child who suffered a fractured orbital bone and facial lacerations from a dog attack.",
    details: {
      age: "Minor child",
      gender: "Not specified",
      condition: "Fractured orbital bone and facial lacerations",
      exposureSource: "Dog attack",
      exposureDuration: "Single incident",
      outcome: "Facial injuries requiring medical treatment",
      significance: "Personal injury case outside typical practice areas"
    },
    legalNotes: [
      "Secured compensation for child victim of dog attack",
      "Established liability for serious facial injuries",
      "Achieved recovery for medical expenses and trauma"
    ]
  }
};

export default function VerdictDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const verdict = verdictData[id as keyof typeof verdictData];
  
  if (!verdict) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-navy mb-2">Verdict Not Found</h2>
            <p className="text-legal-gray mb-4">The requested verdict details could not be found.</p>
            <Button onClick={() => setLocation("/results")} className="bg-navy hover:bg-blue-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Buttons */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Try to go back, but fallback to results if no history
                try {
                  if (document.referrer && document.referrer !== window.location.href) {
                    window.history.back();
                  } else {
                    setLocation('/results');
                  }
                } catch {
                  setLocation('/results');
                }
              }}
              className="text-gray-600 hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/results")}
              className="text-gray-600 hover:text-navy"
            >
              <Scale className="h-4 w-4 mr-2" />
              Results
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
      
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{verdict.amount}</h1>
              <Badge className="bg-white text-navy text-lg px-3 py-1">
                {verdict.type}
              </Badge>
            </div>
            <Scale className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Case Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-legal-gray leading-relaxed">
                  {verdict.description}
                </p>
              </CardContent>
            </Card>

            {/* Case Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Case Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-navy mb-2">Plaintiff Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Age:</strong> {verdict.details.age}</p>
                      <p><strong>Gender:</strong> {verdict.details.gender}</p>
                      <p><strong>Condition:</strong> {verdict.details.condition}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy mb-2">Exposure Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Source:</strong> {verdict.details.exposureSource}</p>
                      <p><strong>Duration:</strong> {verdict.details.exposureDuration}</p>
                      <p><strong>Outcome:</strong> {verdict.details.outcome}</p>
                    </div>
                  </div>
                </div>
                
                {'apportionment' in verdict.details && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Legal Apportionment:</strong> {verdict.details.apportionment}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legal Significance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Legal Significance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {verdict.legalNotes.map((note, index) => (
                    <li key={index} className="flex items-start text-sm text-legal-gray">
                      <span className="w-2 h-2 bg-navy rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verdict Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Verdict Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-navy">{verdict.amount}</div>
                  <div className="text-sm text-legal-gray">{verdict.type}</div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-legal-gray">Case Type:</span>
                    <span className="font-medium">{verdict.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-legal-gray">Plaintiff Age:</span>
                    <span className="font-medium">{verdict.details.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-legal-gray">Condition:</span>
                    <span className="font-medium">{verdict.details.condition}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <Card className="bg-navy text-white">
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Were You Exposed to Asbestos?</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Our experienced attorneys have recovered millions for Kentucky families affected by asbestos exposure.
                </p>
                <Button 
                  className="w-full bg-white text-navy hover:bg-gray-100"
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = '/#contact';
                    }
                  }}
                >
                  Get Free Consultation
                </Button>
                <p className="text-xs text-blue-200 mt-2">Call 855-385-9532</p>
              </CardContent>
            </Card>

            {/* Related Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-navy text-sm">Other Asbestos Verdicts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {Object.values(verdictData)
                    .filter(v => v.id !== verdict.id && v.category === "Mesothelioma")
                    .slice(0, 3)
                    .map((relatedVerdict) => (
                      <div key={relatedVerdict.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-navy">{relatedVerdict.amount}</div>
                        <div className="text-xs text-legal-gray">{relatedVerdict.type}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}