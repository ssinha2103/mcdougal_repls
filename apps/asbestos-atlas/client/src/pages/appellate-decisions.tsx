import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Scale, FileText, Calendar, ExternalLink, Building2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface AppellateDecision {
  id: string;
  title: string;
  citation: string;
  court: string;
  year: number;
  type: "published" | "unpublished";
  summary: string;
  keyIssues: string[];
  significance: string;
  outcome: string;
  plaintiff: string;
  defendant: string;
}

const appellateDecisions: AppellateDecision[] = [
  {
    id: "certainteed-corp-v-dexter",
    title: "CertainTeed Corp. v. Dexter",
    citation: "330 S.W.3d 64 (Ky. 2010)",
    court: "Kentucky Supreme Court",
    year: 2010,
    type: "published",
    summary: "A $5 million asbestos verdict was initially thrown out by the trial judge due to the jury's failure to apportion any fault to numerous 'empty-chair' defendants (settled or dismissed parties). The Supreme Court reinstated the trial judge's order for a new trial, holding that there was substantial evidence that those other companies had also contributed to the plaintiff's lung cancer.",
    keyIssues: ["Fault apportionment", "Empty-chair defendants", "Substantial evidence standard"],
    significance: "Clarified requirements for fault allocation in multi-defendant asbestos cases",
    outcome: "New trial ordered",
    plaintiff: "Dexter",
    defendant: "CertainTeed Corp."
  },
  {
    id: "clephas-v-garlock-inc",
    title: "Clephas v. Garlock, Inc.",
    citation: "168 S.W.3d 389 (Ky. App. 2004)",
    court: "Kentucky Court of Appeals",
    year: 2004,
    type: "published",
    summary: "This case arose from a jury verdict in favor of Garlock in an asbestos exposure lawsuit brought by former pipefitter Charles Clephas and his wife. The Kentucky Court of Appeals vacated that defense verdict and ordered a new trial due to discovery violations and evidentiary errors. Garlock had failed to adequately disclose the specific opinions of its medical expert before trial.",
    keyIssues: ["Discovery violations", "Expert disclosure", "Medical testimony"],
    significance: "Reinforced strict expert disclosure requirements in asbestos litigation",
    outcome: "Defense verdict vacated, new trial ordered",
    plaintiff: "Charles Clephas",
    defendant: "Garlock, Inc."
  },
  {
    id: "owens-corning-fiberglas-corp-v-golightly",
    title: "Owens-Corning Fiberglas Corp. v. Golightly",
    citation: "976 S.W.2d 409 (Ky. 1998)",
    court: "Kentucky Supreme Court",
    year: 1998,
    type: "published",
    summary: "In this products liability suit, a former insulator (Golightly) won a judgment against Owens-Corning for illnesses caused by asbestos exposure, including $290,000 in compensatory damages and $435,000 in punitive damages. The Kentucky Supreme Court upheld the punitive damages, using this case to clarify due process requirements for punitive awards.",
    keyIssues: ["Punitive damages", "Products liability", "Due process"],
    significance: "Established framework for punitive damages in asbestos cases",
    outcome: "Punitive damages upheld",
    plaintiff: "Golightly",
    defendant: "Owens-Corning Fiberglas Corp."
  },
  {
    id: "parker-v-henry-a-petter-supply-co",
    title: "Parker v. Henry A. Petter Supply Co.",
    citation: "165 S.W.3d 474 (Ky. App. 2005)",
    court: "Kentucky Court of Appeals",
    year: 2005,
    type: "published",
    summary: "This case involved a former industrial worker (Leon Parker) who developed lung cancer allegedly from workplace asbestos exposure, and sued several product distributors for supplying asbestos-containing materials. The Court of Appeals reversed summary judgment, finding that distributors could be held liable despite Kentucky's 'middleman statute.'",
    keyIssues: ["Middleman statute immunity", "Distributor liability", "Product identification"],
    significance: "Limited distributor immunity in asbestos cases",
    outcome: "Summary judgment reversed",
    plaintiff: "Leon Parker",
    defendant: "Henry A. Petter Supply Co."
  },
  {
    id: "rt-vanderbilt-co-inc-v-franklin",
    title: "R.T. Vanderbilt Co., Inc. v. Franklin",
    citation: "290 S.W.3d 654 (Ky. App. 2009)",
    court: "Kentucky Court of Appeals",
    year: 2009,
    type: "published",
    summary: "This complex case arose from a $4+ million jury verdict in favor of the family of Flora Franklin, who died of mesothelioma after exposure to asbestos-contaminated talc. R.T. Vanderbilt Co., the talc supplier, appealed on numerous grounds. The Kentucky Court of Appeals affirmed the bulk of the trial court's rulings.",
    keyIssues: ["Asbestos-contaminated talc", "Statute of limitations", "Discovery sanctions"],
    significance: "Addressed liability for asbestos contamination in consumer products",
    outcome: "Verdict affirmed",
    plaintiff: "Franklin family",
    defendant: "R.T. Vanderbilt Co., Inc."
  },
  {
    id: "becht-v-owens-corning-fiberglas-corp",
    title: "Becht v. Owens-Corning Fiberglas Corp.",
    citation: "196 F.3d 650 (6th Cir. 1999)",
    court: "6th Circuit (applying Kentucky law)",
    year: 1999,
    type: "published",
    summary: "A Sixth Circuit decision applying Kentucky law, addressing whether Owens-Corning could escape tort liability by claiming workers' compensation immunity. The plaintiff's decedent, Donald Becht, had worked as an insulator for multiple contractors and died of mesothelioma.",
    keyIssues: ["Workers' compensation immunity", "Employee status", "Mesothelioma"],
    significance: "Clarified limits of workers' comp immunity in asbestos cases",
    outcome: "Immunity defense rejected",
    plaintiff: "Donald Becht (estate)",
    defendant: "Owens-Corning Fiberglas Corp."
  },
  {
    id: "csx-transp-inc-v-moody",
    title: "CSX Transp., Inc. v. Moody",
    citation: "313 S.W.3d 72 (Ky. 2010)",
    court: "Kentucky Supreme Court",
    year: 2010,
    type: "published",
    summary: "A Federal Employers' Liability Act (FELA) case brought by a railroad worker for asbestos-related illness. The Kentucky Supreme Court addressed important evidentiary rulings, approving the admission of evidence of other workers' injuries and the railroad's knowledge of asbestos hazards.",
    keyIssues: ["FELA claims", "Notice evidence", "Railroad liability"],
    significance: "Established evidentiary standards for FELA asbestos cases",
    outcome: "Evidentiary rulings affirmed",
    plaintiff: "Moody (estate)",
    defendant: "CSX Transp., Inc."
  },
  {
    id: "rehm-v-clayton",
    title: "Rehm v. Clayton",
    citation: "132 S.W.3d 864 (Ky. 2004)",
    court: "Kentucky Supreme Court",
    year: 2004,
    type: "published",
    summary: "This was an interlocutory writ proceeding arising from a large asbestos lawsuit pending in Jefferson Circuit Court. The plaintiffs sought a writ of prohibition to overturn the trial judge's order that had stayed all discovery while some defendants' appeals were pending. The Kentucky Supreme Court granted the writ.",
    keyIssues: ["Discovery stays", "Interlocutory appeals", "Case management"],
    significance: "Limited trial courts' ability to stay discovery during appeals",
    outcome: "Writ of prohibition granted",
    plaintiff: "Rehm family",
    defendant: "Multiple defendants"
  },
  {
    id: "general-electric-co-v-cain",
    title: "General Electric Co. v. Cain",
    citation: "236 S.W.3d 579 (Ky. 2007)",
    court: "Kentucky Supreme Court",
    year: 2007,
    type: "published",
    summary: "A premises liability case that clarified when a premises owner is deemed a 'contractor' under Kentucky workers' compensation law. Multiple industrial workers had sued property owners like GE for asbestos exposure on the owners' premises.",
    keyIssues: ["Premises liability", "Statutory employer immunity", "Up-the-ladder immunity"],
    significance: "Set forth test for determining statutory employer status",
    outcome: "Immunity standards clarified",
    plaintiff: "Cain and others",
    defendant: "General Electric Co."
  },
  {
    id: "anderson-v-motorola-solutions-inc",
    title: "Anderson v. Motorola Solutions, Inc.",
    citation: "2015 WL 5308091 (Ky. App. Sept. 11, 2015)",
    court: "Kentucky Court of Appeals",
    year: 2015,
    type: "unpublished",
    summary: "A products liability case by the estate of a radio repairman (Mr. Anderson) who died of mesothelioma. He alleged exposure to asbestos in Motorola and Zenith brand radios he serviced. The trial court had granted summary judgment to the manufacturers, but the Court of Appeals reversed.",
    keyIssues: ["Product identification", "Electronics industry exposure", "Summary judgment standards"],
    significance: "Lowered bar for product identification in electronics cases",
    outcome: "Summary judgment reversed",
    plaintiff: "Anderson (estate)",
    defendant: "Motorola Solutions, Inc."
  },
  {
    id: "schneider-electric-usa-inc-v-williams",
    title: "Schneider Electric USA, Inc. v. Williams",
    citation: "2019 WL 3763537 (Ky. App. Aug. 19, 2019)",
    court: "Kentucky Court of Appeals",
    year: 2019,
    type: "unpublished",
    summary: "A mesothelioma lawsuit wherein the plaintiff (Williams) alleged exposure to asbestos at a Square D electrical factory during a summer job as a college student. The jury returned a verdict for the plaintiff, and the Court of Appeals upheld the result.",
    keyIssues: ["Short-term exposure", "Student worker status", "Electrical manufacturing"],
    significance: "Confirmed liability for brief but intense exposures",
    outcome: "Verdict upheld",
    plaintiff: "Williams",
    defendant: "Schneider Electric USA, Inc."
  },
  {
    id: "hayes-v-johnson-johnson",
    title: "Hayes v. Johnson & Johnson",
    citation: "2021 WL 2988377 (Ky. App. Jan. 29, 2021)",
    court: "Kentucky Court of Appeals",
    year: 2021,
    type: "unpublished",
    summary: "A recent talc/asbestos case where the Estate of Mr. Hayes claimed that his use of Johnson's Baby Powder caused mesothelioma. The trial court had granted summary judgment to Johnson & Johnson, but the Court of Appeals reversed, finding sufficient evidence of exposure to contaminated talc.",
    keyIssues: ["Talc contamination", "Consumer product liability", "Daily use exposure"],
    significance: "Recent precedent in talc litigation",
    outcome: "Summary judgment reversed",
    plaintiff: "Hayes (estate)",
    defendant: "Johnson & Johnson"
  }
];

export default function AppellateDecisions() {
  const publishedDecisions = appellateDecisions.filter(d => d.type === "published");
  const unpublishedDecisions = appellateDecisions.filter(d => d.type === "unpublished");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-navy hover:text-navy/80 hover:bg-blue-50"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Scale className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kentucky Appellate Decisions
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Comprehensive analysis of Kentucky's most significant asbestos and mesothelioma appellate court decisions, 
              providing crucial precedent for current and future litigation.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Published Decisions Section */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <FileText className="h-8 w-8 text-navy mr-4" />
            <div>
              <h2 className="text-3xl font-bold text-navy">Published Appellate Decisions</h2>
              <p className="text-legal-gray mt-2">Binding precedential decisions from Kentucky appellate courts</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedDecisions.map((decision) => (
              <Card 
                key={decision.id} 
                className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group hover:scale-[1.02]"
                onClick={() => {
                  window.location.href = `/appellate-decision/${decision.id}`;
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="default" className="bg-navy text-white">
                      Published
                    </Badge>
                    <div className="flex items-center text-sm text-legal-gray">
                      <Calendar className="h-4 w-4 mr-1" />
                      {decision.year}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight text-navy">
                    {decision.title}
                  </CardTitle>
                  <div className="space-y-2 text-sm text-legal-gray">
                    <p className="font-medium">{decision.citation}</p>
                    <p className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {decision.court}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-navy mb-2">Case Summary</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {decision.summary}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-navy mb-2">Key Issues</h4>
                      <div className="flex flex-wrap gap-1">
                        {decision.keyIssues.map((issue, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-navy mb-2">Significance</h4>
                      <p className="text-sm text-gray-700">
                        {decision.significance}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-navy mb-1">Outcome</h4>
                      <p className="text-sm text-navy font-medium">
                        {decision.outcome}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Unpublished Decisions Section */}
        <div>
          <div className="flex items-center mb-8">
            <FileText className="h-8 w-8 text-legal-gray mr-4" />
            <div>
              <h2 className="text-3xl font-bold text-navy">Unpublished Appellate Decisions</h2>
              <p className="text-legal-gray mt-2">Persuasive but non-precedential decisions providing valuable insights</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unpublishedDecisions.map((decision) => (
              <Card 
                key={decision.id} 
                className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group hover:scale-[1.02]"
                onClick={() => {
                  window.location.href = `/appellate-decision/${decision.id}`;
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      Unpublished
                    </Badge>
                    <div className="flex items-center text-sm text-legal-gray">
                      <Calendar className="h-4 w-4 mr-1" />
                      {decision.year}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight text-navy">
                    {decision.title}
                  </CardTitle>
                  <div className="space-y-2 text-sm text-legal-gray">
                    <p className="font-medium">{decision.citation}</p>
                    <p className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {decision.court}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-navy mb-2">Case Summary</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {decision.summary}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-navy mb-2">Key Issues</h4>
                      <div className="flex flex-wrap gap-1">
                        {decision.keyIssues.map((issue, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-navy mb-2">Significance</h4>
                      <p className="text-sm text-gray-700">
                        {decision.significance}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-navy mb-1">Outcome</h4>
                      <p className="text-sm text-navy font-medium">
                        {decision.outcome}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-16 bg-blue-50 p-6 rounded-lg border-l-4 border-navy">
          <h3 className="font-bold text-navy mb-2">Legal Notice</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            The information provided above is for educational and informational purposes only and should not be construed as legal advice. 
            Published decisions are binding precedent, while unpublished decisions are persuasive but not precedential. 
            Each case is unique and requires individual legal analysis. If you have been exposed to asbestos or diagnosed with mesothelioma, 
            consult with qualified legal counsel immediately as statutes of limitations may apply.
          </p>
        </div>
      </div>
    </div>
  );
}