import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Scale, FileText, Calendar, Building2, ArrowLeft, ExternalLink } from "lucide-react";
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
  fullDetails?: {
    background: string;
    legalIssues: string[];
    holding: string;
    reasoning: string;
    impact: string;
  };
}

const appellateDecisionsData: { [key: string]: AppellateDecision } = {
  "certainteed-corp-v-dexter": {
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
    defendant: "CertainTeed Corp.",
    fullDetails: {
      background: "This landmark Kentucky Supreme Court case involved a $5 million asbestos verdict that was initially set aside by the trial court. The plaintiff, Dexter, had developed lung cancer allegedly from exposure to asbestos-containing products manufactured by CertainTeed and numerous other companies. Several defendants had settled or been dismissed before trial, creating 'empty-chair' defendants whose liability still needed consideration.",
      legalIssues: [
        "Whether the jury properly apportioned fault among defendants and empty-chair parties",
        "Standard for determining substantial evidence of empty-chair defendant involvement", 
        "Requirements for comparative fault allocation in multi-defendant asbestos cases",
        "Burden of proof regarding causation from multiple asbestos product exposures"
      ],
      holding: "The Kentucky Supreme Court held that when there is substantial evidence that empty-chair defendants contributed to the plaintiff's injury, the jury must apportion some fault to those parties. The court reinstated the trial judge's order for a new trial due to the jury's improper 0% fault allocation to empty-chair defendants.",
      reasoning: "The court found substantial evidence in the record showing that the empty-chair defendants had also manufactured or supplied asbestos products that contributed to the plaintiff's exposure and resulting lung cancer. The jury's allocation of 0% fault to these parties was not supported by the evidence and violated Kentucky's comparative fault principles. The court emphasized that all responsible parties must be considered in damage allocation.",
      impact: "This decision established crucial precedent for fault apportionment in Kentucky asbestos cases, ensuring that all responsible parties are considered in damage allocation, even if they are not present at trial. It protects plaintiffs from bearing the burden of parties who settled early while maintaining fairness in multi-defendant litigation."
    }
  },
  "clephas-v-garlock-inc": {
    id: "clephas-v-garlock-inc",
    title: "Clephas v. Garlock, Inc.",
    citation: "168 S.W.3d 389 (Ky. App. 2004)",
    court: "Kentucky Court of Appeals",
    year: 2004,
    type: "published",
    summary: "This case arose from a jury verdict in favor of Garlock in an asbestos exposure lawsuit brought by former pipefitter Charles Clephas and his wife. The Kentucky Court of Appeals vacated that defense verdict and ordered a new trial due to discovery violations and evidentiary errors. Garlock had failed to adequately disclose the specific opinions of its medical expert before trial.",
    keyIssues: ["Discovery violations", "Expert disclosure", "Medical testimony", "Pipefitter exposure"],
    significance: "Reinforced strict expert disclosure requirements in asbestos litigation",
    outcome: "Defense verdict vacated, new trial ordered",
    plaintiff: "Charles Clephas",
    defendant: "Garlock, Inc.",
    fullDetails: {
      background: "Charles Clephas, a former pipefitter with decades of experience, and his wife sued Garlock, Inc. for injuries allegedly caused by exposure to asbestos-containing gaskets and packing materials during his industrial work. Clephas had worked extensively with Garlock's asbestos products in power plants and industrial facilities throughout Kentucky. A jury initially returned a verdict in favor of Garlock, but the plaintiffs appealed based on serious discovery and evidentiary issues.",
      legalIssues: [
        "Adequacy of expert witness disclosure under Kentucky civil discovery rules",
        "Prejudicial effect of inadequate disclosure on plaintiff's ability to prepare defense",
        "Standards for granting new trials based on discovery rule violations",
        "Medical causation testimony requirements in asbestos cases",
        "Due process rights in expert witness preparation"
      ],
      holding: "The Kentucky Court of Appeals vacated the defense verdict and ordered a new trial, finding that Garlock's failure to adequately disclose its medical expert's specific opinions violated discovery rules and materially prejudiced the plaintiff's ability to prepare for trial.",
      reasoning: "The court determined that Garlock provided only broad, generic outlines of its medical expert's anticipated testimony rather than the specific opinions, methodologies, and factual bases required by Kentucky discovery rules. This inadequate disclosure prevented Clephas from properly preparing cross-examination, obtaining rebuttal experts, and conducting necessary discovery to challenge the defense medical testimony.",
      impact: "This decision reinforced the critical importance of complete and specific expert disclosure in asbestos litigation, ensuring that all parties have adequate opportunity to prepare for expert testimony. It established that generic or vague expert disclosures violate due process and can result in verdict reversal."
    }
  },
  "owens-corning-fiberglas-corp-v-golightly": {
    id: "owens-corning-fiberglas-corp-v-golightly",
    title: "Owens-Corning Fiberglas Corp. v. Golightly",
    citation: "976 S.W.2d 409 (Ky. 1998)",
    court: "Kentucky Supreme Court",
    year: 1998,
    type: "published",
    summary: "In this products liability suit, a former insulator (Golightly) won a judgment against Owens-Corning for illnesses caused by asbestos exposure, including $290,000 in compensatory damages and $435,000 in punitive damages. The Kentucky Supreme Court upheld the punitive damages, using this case to clarify due process requirements for punitive awards.",
    keyIssues: ["Punitive damages", "Products liability", "Due process", "Insulator exposure"],
    significance: "Established framework for punitive damages in asbestos cases",
    outcome: "Punitive damages upheld",
    plaintiff: "Golightly", 
    defendant: "Owens-Corning Fiberglas Corp.",
    fullDetails: {
      background: "Golightly, a career insulator with extensive experience in Kentucky industrial facilities, developed serious asbestos-related illness from decades of exposure to Owens-Corning's asbestos-containing insulation products. The case resulted in substantial compensatory damages of $290,000 and punitive damages of $435,000, with Owens-Corning challenging the punitive award as constitutionally excessive under due process analysis.",
      legalIssues: [
        "Constitutional limits on punitive damage awards under due process clause",
        "Factors for determining appropriate punitive damages in product liability cases",
        "Due process requirements for punitive damage awards",
        "Corporate knowledge and conduct standards for punitive liability",
        "Proportionality between compensatory and punitive damages"
      ],
      holding: "The Kentucky Supreme Court upheld the punitive damages award, finding it was not constitutionally excessive and met all due process requirements. The court used this case to establish the comprehensive framework for punitive damages analysis in product liability cases involving corporate defendants.",
      reasoning: "The court found that the punitive damages were justified by Owens-Corning's egregious conduct in continuing to market dangerous asbestos products despite knowledge of health hazards. The $435,000 award was proportionate to the harm caused and the defendant's financial capacity. The court applied constitutional guideposts including the degree of reprehensibility, ratio to compensatory damages, and comparison to civil penalties for similar misconduct.",
      impact: "This landmark decision established the definitive framework for punitive damages in Kentucky asbestos and product liability cases. It provides comprehensive guidance for trial courts on constitutional limits while ensuring that punitive damages can effectively punish egregious corporate conduct and deter future wrongdoing."
    }
  },
  "parker-v-henry-a-petter-supply-co": {
    id: "parker-v-henry-a-petter-supply-co",
    title: "Parker v. Henry A. Petter Supply Co.",
    citation: "165 S.W.3d 474 (Ky. App. 2005)",
    court: "Kentucky Court of Appeals",
    year: 2005,
    type: "published",
    summary: "This case involved a former industrial worker (Leon Parker) who developed lung cancer allegedly from workplace asbestos exposure, and sued several product distributors for supplying asbestos-containing materials. The trial court had granted summary judgment to the distributor defendants, accepting their argument that Kentucky's 'middleman statute' immunized them from liability as mere wholesalers.",
    keyIssues: ["Middleman statute immunity", "Distributor liability", "Product identification", "Industrial worker exposure"],
    significance: "Limited distributor immunity under Kentucky's middleman statute",
    outcome: "Summary judgment reversed",
    plaintiff: "Leon Parker",
    defendant: "Henry A. Petter Supply Co.",
    fullDetails: {
      background: "Leon Parker, a longtime industrial worker in Kentucky facilities, developed lung cancer allegedly from extensive workplace exposure to asbestos-containing products. Parker sued several product distributors, including Henry A. Petter Supply Co. and Hannan Supply Co., for their role in supplying asbestos materials to his workplace. The distributors claimed immunity under Kentucky's middleman statute (KRS 411.340), arguing they were mere wholesalers without manufacturing involvement.",
      legalIssues: [
        "Scope and application of Kentucky's middleman statute (KRS 411.340)",
        "Definition of 'wholesaler' versus 'manufacturer' for immunity purposes",
        "Product identification requirements for distributor liability",
        "Causation standards in multi-defendant asbestos cases",
        "Role of distributors in asbestos product supply chain"
      ],
      holding: "The Kentucky Court of Appeals reversed the summary judgment, finding that the middleman statute did not provide blanket immunity to all distributors and that material issues of fact existed regarding the defendants' role in the product supply chain and their potential liability.",
      reasoning: "The court found that the middleman statute's immunity was not absolute and required careful fact-specific analysis. Evidence suggested the distributor defendants may have played a more active role than mere wholesaling, potentially including product modification, repackaging, or providing installation guidance. The court emphasized that immunity determinations require full factual development.",
      impact: "This decision significantly limited the scope of distributor immunity under Kentucky's middleman statute, ensuring that asbestos product distributors cannot automatically escape liability. It established that immunity determinations require thorough factual analysis of each distributor's specific role and conduct."
    }
  },
  "rt-vanderbilt-co-inc-v-franklin": {
    id: "rt-vanderbilt-co-inc-v-franklin",
    title: "R.T. Vanderbilt Co., Inc. v. Franklin",
    citation: "290 S.W.3d 654 (Ky. App. 2009)",
    court: "Kentucky Court of Appeals",
    year: 2009,
    type: "published",
    summary: "This complex case arose from a $4+ million jury verdict in favor of the family of Flora Franklin, who died of mesothelioma after exposure to asbestos-contaminated talc. R.T. Vanderbilt Co., the talc supplier, appealed on numerous grounds – from statute of limitations, to discovery sanctions, to evidentiary rulings.",
    keyIssues: ["Asbestos-contaminated talc", "Statute of limitations", "Discovery sanctions", "Mesothelioma causation"],
    significance: "Addressed liability for asbestos contamination in consumer products",
    outcome: "Verdict affirmed",
    plaintiff: "Franklin family",
    defendant: "R.T. Vanderbilt Co., Inc.",
    fullDetails: {
      background: "Flora Franklin died of malignant mesothelioma after exposure to asbestos-contaminated talc products manufactured by R.T. Vanderbilt Co. The case involved complex product liability issues regarding contaminated industrial talc and its use in consumer and industrial applications. Franklin's family secured a substantial verdict exceeding $4 million, leading to extensive appellate challenges by Vanderbilt on multiple procedural and substantive grounds.",
      legalIssues: [
        "Statute of limitations in latent disease cases",
        "Discovery rule application for asbestos-contaminated products",
        "Standards for imposing discovery sanctions",
        "Evidentiary requirements for asbestos contamination proof",
        "Causation standards for mesothelioma from contaminated talc",
        "Corporate knowledge and duty to warn regarding contamination"
      ],
      holding: "The Kentucky Court of Appeals affirmed the jury verdict, finding no reversible error in the trial court's handling of statute of limitations, discovery sanctions, or evidentiary rulings. The court upheld the substantial damage award as supported by the evidence.",
      reasoning: "The court found that the statute of limitations was properly applied under the discovery rule, as Franklin could not reasonably have known of the connection between her talc exposure and mesothelioma until her diagnosis. Discovery sanctions were appropriate given Vanderbilt's failure to comply with court orders. The evidence sufficiently established that Vanderbilt's talc contained asbestos contamination and caused Franklin's mesothelioma.",
      impact: "This decision established important precedent for liability regarding asbestos-contaminated consumer and industrial products, particularly talc. It clarified statute of limitations analysis in latent disease cases and affirmed that manufacturers can be held liable for contaminated products even when asbestos was not an intended ingredient."
    }
  },
  "becht-v-owens-corning-fiberglas-corp": {
    id: "becht-v-owens-corning-fiberglas-corp", 
    title: "Becht v. Owens-Corning Fiberglas Corp.",
    citation: "196 F.3d 650 (6th Cir. 1999)",
    court: "6th Circuit (applying Kentucky law)",
    year: 1999,
    type: "published",
    summary: "A Sixth Circuit decision applying Kentucky law, addressing whether Owens-Corning could escape tort liability by claiming workers' compensation immunity. The plaintiff's decedent, Donald Becht, had worked as an insulator for multiple contractors and died of mesothelioma.",
    keyIssues: ["Workers' compensation immunity", "Employee status", "Mesothelioma", "Federal court interpretation"],
    significance: "Clarified limits of workers' comp immunity in asbestos cases",
    outcome: "Immunity defense rejected",
    plaintiff: "Donald Becht (estate)",
    defendant: "Owens-Corning Fiberglas Corp.",
    fullDetails: {
      background: "Donald Becht worked as an insulator for multiple contractors throughout his career, including brief periods working for an Owens-Corning affiliate company. He died of mesothelioma allegedly caused by exposure to Owens-Corning's asbestos-containing insulation products. Owens-Corning argued that because Becht was its 'employee' for approximately nine months spread over several years, Kentucky's workers' compensation exclusivity provision barred the tort lawsuit.",
      legalIssues: [
        "Workers' compensation exclusivity under Kentucky law",
        "Definition of 'employee' for immunity purposes", 
        "Dual capacity doctrine in asbestos exposure cases",
        "Product liability versus premises liability distinctions",
        "Federal court interpretation of state workers' compensation law"
      ],
      holding: "The Sixth Circuit, applying Kentucky law, rejected Owens-Corning's workers' compensation immunity defense, finding that the company's role as a product manufacturer subjected it to tort liability despite any employer-employee relationship.",
      reasoning: "The court applied Kentucky's dual capacity doctrine, finding that Owens-Corning wore 'two hats' – both as an occasional employer and as a product manufacturer. When acting in its capacity as a manufacturer of asbestos products used throughout the industry, Owens-Corning could not claim workers' compensation immunity. The court emphasized that the exposure occurred primarily from the company's products, not from the employment relationship.",
      impact: "This federal decision applying Kentucky law clarified the limits of workers' compensation immunity in asbestos cases, establishing that product manufacturers cannot escape tort liability merely because they occasionally employed the injured worker. It reinforced Kentucky's approach to dual capacity liability."
    }
  },
  "csx-transp-inc-v-moody": {
    id: "csx-transp-inc-v-moody",
    title: "CSX Transp., Inc. v. Moody", 
    citation: "313 S.W.3d 72 (Ky. 2010)",
    court: "Kentucky Supreme Court",
    year: 2010,
    type: "published",
    summary: "A Federal Employers' Liability Act (FELA) case brought by a railroad worker (or his estate) for asbestos-related illness. The Kentucky Supreme Court's published opinion addressed important evidentiary rulings in such cases, approving the admission of evidence of other workers' injuries and the railroad's knowledge of asbestos hazards.",
    keyIssues: ["FELA claims", "Notice evidence", "Railroad liability", "Evidentiary standards"],
    significance: "Established evidentiary standards for FELA asbestos cases",
    outcome: "Evidentiary rulings affirmed",
    plaintiff: "Moody (estate)",
    defendant: "CSX Transp., Inc.",
    fullDetails: {
      background: "This FELA case involved a CSX Transportation railroad worker (Moody) who developed asbestos-related illness from workplace exposure to asbestos-containing materials used in railroad operations. The case raised significant evidentiary issues about what evidence could be admitted to prove the railroad's knowledge of asbestos dangers and its failure to provide a safe workplace under FELA standards.",
      legalIssues: [
        "Evidentiary standards under Federal Employers' Liability Act (FELA)",
        "Admissibility of evidence regarding other workers' injuries",
        "Railroad knowledge and notice of asbestos hazards",
        "Standards for proving unsafe workplace conditions",
        "Relevance versus prejudice in FELA causation evidence"
      ],
      holding: "The Kentucky Supreme Court affirmed the trial court's evidentiary rulings, approving the admission of evidence of other workers' injuries and the railroad's knowledge of asbestos hazards, finding such evidence relevant to prove notice and unsafe working conditions under FELA.",
      reasoning: "The court found that evidence of other workers' asbestos-related injuries was relevant to establish the railroad's knowledge of workplace dangers and its failure to provide reasonable safety measures. Such evidence was properly offered to show notice rather than to prove causation directly. The probative value outweighed any prejudicial effect when proper jury instructions were given.",
      impact: "This decision established important evidentiary standards for FELA asbestos cases in Kentucky, clarifying that evidence of other workers' injuries and railroad knowledge is admissible to prove unsafe working conditions and corporate notice of hazards."
    }
  },
  "rehm-v-clayton": {
    id: "rehm-v-clayton",
    title: "Rehm v. Clayton",
    citation: "132 S.W.3d 864 (Ky. 2004)",
    court: "Kentucky Supreme Court", 
    year: 2004,
    type: "published",
    summary: "This was an interlocutory writ proceeding arising from a large asbestos lawsuit (the Rehm case) pending in Jefferson Circuit Court. The plaintiffs (the Rehm family) sought a writ of prohibition to overturn the trial judge's order that had stayed all discovery while some defendants' appeals were pending.",
    keyIssues: ["Discovery stays", "Interlocutory appeals", "Case management", "Multi-defendant litigation"],
    significance: "Limited trial courts' ability to stay discovery during appeals",
    outcome: "Writ of prohibition granted",
    plaintiff: "Rehm family",
    defendant: "Multiple defendants",
    fullDetails: {
      background: "The Rehm case was a major asbestos lawsuit pending in Jefferson Circuit Court involving multiple defendants and complex discovery issues. When some defendants filed interlocutory appeals, the trial judge entered a blanket order staying all discovery in the case pending resolution of the appeals. The Rehm family sought extraordinary relief through a writ of prohibition, arguing that the discovery stay was improper and prejudicial.",
      legalIssues: [
        "Authority of trial courts to stay discovery during interlocutory appeals",
        "Standards for granting writs of prohibition",
        "Case management in complex multi-defendant litigation",
        "Prejudice to plaintiffs from discovery delays",
        "Balancing interests of appellants versus non-appealing parties"
      ],
      holding: "The Kentucky Supreme Court granted the writ of prohibition, finding that the trial court abused its discretion by imposing a blanket discovery stay affecting all parties when only some defendants had appealed. The court directed the trial court to allow the case to proceed.",
      reasoning: "The court found that blanket discovery stays are inappropriate when they affect parties who have not appealed and are ready to proceed. The trial court failed to consider less restrictive alternatives and the prejudice to plaintiffs from delay. Interlocutory appeals by some defendants should not halt the entire case's progress against non-appealing parties.",
      impact: "This decision established important limits on trial courts' authority to stay discovery during interlocutory appeals, ensuring that complex multi-defendant litigation can proceed efficiently without being held hostage by individual defendants' appellate strategies."
    }
  },
  "general-electric-co-v-cain": {
    id: "general-electric-co-v-cain",
    title: "General Electric Co. v. Cain",
    citation: "236 S.W.3d 579 (Ky. 2007)",
    court: "Kentucky Supreme Court",
    year: 2007,
    type: "published",
    summary: "A premises liability case that clarified when a premises owner is deemed a 'contractor' (and thus immune from tort suit) under Kentucky workers' compensation law. Multiple industrial workers (including Mr. Cain) had sued property owners like GE for asbestos exposure on the owners' premises.",
    keyIssues: ["Premises liability", "Statutory employer immunity", "Up-the-ladder immunity", "Contractor definitions"],
    significance: "Set forth test for determining statutory employer status",
    outcome: "Immunity standards clarified",
    plaintiff: "Cain and others",
    defendant: "General Electric Co.",
    fullDetails: {
      background: "This case involved multiple industrial workers, including Mr. Cain, who were exposed to asbestos while working on General Electric's premises as employees of independent contractors. The workers sued GE under premises liability theories, while GE claimed immunity as a statutory employer under Kentucky's workers' compensation 'up-the-ladder' immunity provisions, arguing it was effectively a contractor in relation to the work being performed.",
      legalIssues: [
        "Definition of 'contractor' under Kentucky workers' compensation law",
        "Up-the-ladder immunity for premises owners",
        "Statutory employer immunity versus premises liability",
        "Factors for determining contractor status",
        "Control test for statutory employer relationship"
      ],
      holding: "The Kentucky Supreme Court established a comprehensive test for determining when a premises owner qualifies as a 'contractor' entitled to workers' compensation immunity, clarifying the factors courts must consider in analyzing statutory employer relationships.",
      reasoning: "The court set forth a multi-factor test examining the degree of control exercised by the premises owner over the work, whether the owner had the right to hire and fire workers, the extent of supervision provided, and the nature of the contractual relationships. The court emphasized that premises ownership alone does not automatically confer contractor status.",
      impact: "This landmark decision provided definitive guidance for determining statutory employer immunity in premises liability cases involving independent contractors, establishing clear standards that protect both worker rights and legitimate business immunity claims."
    }
  },
  "anderson-v-motorola-solutions-inc": {
    id: "anderson-v-motorola-solutions-inc",
    title: "Anderson v. Motorola Solutions, Inc.",
    citation: "2015 WL 5308091 (Ky. App. Sept. 11, 2015)",
    court: "Kentucky Court of Appeals",
    year: 2015,
    type: "unpublished",
    summary: "A products liability case by the estate of a radio repairman (Mr. Anderson) who died of mesothelioma. He alleged exposure to asbestos in Motorola and Zenith brand radios he serviced. The trial court had granted summary judgment to the manufacturers, claiming insufficient product identification.",
    keyIssues: ["Product identification", "Electronics industry exposure", "Summary judgment standards", "Radio repair work"],
    significance: "Lowered bar for product identification in electronics cases",
    outcome: "Summary judgment reversed",
    plaintiff: "Anderson (estate)",
    defendant: "Motorola Solutions, Inc.",
    fullDetails: {
      background: "Mr. Anderson worked as a radio repairman for decades, servicing various brands of radios and electronic equipment, including Motorola and Zenith products. He developed mesothelioma and died, with his estate alleging that his illness resulted from exposure to asbestos-containing components in the electronic equipment he repaired. The manufacturers argued that Anderson could not specifically identify which of their products contained asbestos or caused his exposure.",
      legalIssues: [
        "Product identification standards in asbestos litigation",
        "Sufficiency of circumstantial evidence for product identification",
        "Summary judgment standards in product liability cases",
        "Evidence requirements for electronics industry asbestos exposure",
        "Burden of proof in mesothelioma causation cases"
      ],
      holding: "The Kentucky Court of Appeals reversed the summary judgment, finding that the plaintiff had provided sufficient evidence to create a jury question on product identification and causation, even without specific recall of particular asbestos-containing products.",
      reasoning: "The court found that Anderson's extensive work history with defendant's products, combined with evidence that similar products from that era contained asbestos components, was sufficient to survive summary judgment. The court noted that requiring precise product identification decades after exposure would effectively bar many legitimate claims where workers used multiple similar products over long careers.",
      impact: "This decision lowered the evidentiary bar for product identification in electronics industry asbestos cases, recognizing the practical difficulties of identifying specific products decades after exposure while still requiring sufficient evidence to support causation claims."
    }
  },
  "schneider-electric-usa-inc-v-williams": {
    id: "schneider-electric-usa-inc-v-williams",
    title: "Schneider Electric USA, Inc. v. Williams",
    citation: "2019 WL 3763537 (Ky. App. Aug. 19, 2019)",
    court: "Kentucky Court of Appeals",
    year: 2019,
    type: "unpublished",
    summary: "A mesothelioma lawsuit wherein the plaintiff (Williams) alleged exposure to asbestos at a Square D electrical factory (Square D is now part of Schneider Electric). Williams had worked a summer job at the Square D plant as a college student and was exposed to asbestos dust there.",
    keyIssues: ["Short-term exposure", "Student worker status", "Electrical manufacturing", "Summer employment"],
    significance: "Confirmed liability for brief but intense exposures",
    outcome: "Verdict upheld",
    plaintiff: "Williams",
    defendant: "Schneider Electric USA, Inc.",
    fullDetails: {
      background: "Williams worked a summer job at a Square D electrical manufacturing plant as a college student, where he was exposed to asbestos dust from electrical components and insulation materials used in the manufacturing process. Despite the relatively brief duration of his employment (one summer), he later developed mesothelioma and sued Schneider Electric (Square D's successor company) for his workplace exposure. The case raised important questions about liability for short-term but intense asbestos exposures.",
      legalIssues: [
        "Causation standards for short-term asbestos exposure",
        "Liability for summer and temporary workers",
        "Corporate successor liability",
        "Workplace safety obligations to student workers",
        "Evidence standards for brief but significant exposure"
      ],
      holding: "The Kentucky Court of Appeals upheld the jury verdict for Williams, finding sufficient evidence that his brief but intense summer exposure to asbestos at the Square D facility caused his mesothelioma, and that Schneider Electric was liable as the successor company.",
      reasoning: "The court found that even brief exposures to asbestos can cause mesothelioma if the exposure is sufficiently intense. Evidence showed that Williams worked in areas with heavy asbestos dust, and medical testimony supported causation despite the short duration. The court noted that the 'every exposure' theory allows liability for any substantial exposure contributing to the disease.",
      impact: "This decision confirmed that employers can be held liable for mesothelioma caused by brief but intense asbestos exposures, including summer jobs and temporary work. It reinforced that duration of exposure is not determinative if the exposure was sufficiently substantial to contribute to disease causation."
    }
  },
  "hayes-v-johnson-johnson": {
    id: "hayes-v-johnson-johnson",
    title: "Hayes v. Johnson & Johnson",
    citation: "2021 WL 2988377 (Ky. App. Jan. 29, 2021)",
    court: "Kentucky Court of Appeals",
    year: 2021,
    type: "unpublished",
    summary: "A recent talc/asbestos case where the Estate of Mr. Hayes claimed that his use of Johnson's Baby Powder caused mesothelioma. The trial court had granted summary judgment to Johnson & Johnson, finding the plaintiffs did not prove specific exposure to contaminated talc from J&J.",
    keyIssues: ["Talc contamination", "Consumer product liability", "Daily use exposure", "Product identification"],
    significance: "Recent precedent in talc litigation", 
    outcome: "Summary judgment reversed",
    plaintiff: "Hayes (estate)",
    defendant: "Johnson & Johnson",
    fullDetails: {
      background: "Mr. Hayes used Johnson's Baby Powder daily for personal hygiene over many decades, a common practice among men of his generation. He later developed mesothelioma and died, with his estate claiming that asbestos contamination in Johnson & Johnson's talc products caused his cancer. Johnson & Johnson argued that Hayes could not prove his specific exposure came from their contaminated products rather than other sources of asbestos exposure.",
      legalIssues: [
        "Product identification standards for consumer talc products",
        "Evidence of asbestos contamination in talc",
        "Causation standards for consumer product exposure",
        "Corporate knowledge of contamination risks",
        "Summary judgment standards in talc litigation"
      ],
      holding: "The Kentucky Court of Appeals reversed the summary judgment, finding that the combination of Hayes's testimony about daily Johnson's Baby Powder use, evidence of asbestos contamination in the company's talc, and medical causation testimony was sufficient to create a jury question on liability.",
      reasoning: "The court found that Hayes's consistent daily use of Johnson's Baby Powder, combined with evidence that J&J's talc contained asbestos contamination during relevant time periods, was sufficient circumstantial evidence to survive summary judgment. The court noted that requiring more specific product identification would effectively immunize consumer product manufacturers from contamination claims.",
      impact: "This recent decision provides important guidance for talc litigation in Kentucky, establishing that consumers can prove product identification through consistent use patterns combined with evidence of contamination, without requiring impossible precision about specific contaminated batches or containers."
    }
  }
};

export default function AppellateDecisionDetail() {
  const [match, params] = useRoute("/appellate-decision/:id");
  const decisionId = params?.id;
  
  if (!match || !decisionId || !appellateDecisionsData[decisionId]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-navy mb-2">Decision Not Found</h2>
            <p className="text-gray-600 mb-6">
              The requested appellate decision could not be found.
            </p>
            <Link href="/appellate-decisions">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Decisions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const decision = appellateDecisionsData[decisionId];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/appellate-decisions">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-navy hover:text-navy/80 hover:bg-blue-50"
              data-testid="button-back-decisions"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Decisions
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge variant={decision.type === "published" ? "default" : "secondary"} 
                     className={decision.type === "published" ? "bg-navy text-white" : "bg-gray-100 text-gray-700"}>
                {decision.type === "published" ? "Published" : "Unpublished"}
              </Badge>
              <div className="flex items-center text-sm text-legal-gray">
                <Calendar className="h-4 w-4 mr-1" />
                {decision.year}
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-navy mb-2">
              {decision.title}
            </CardTitle>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-legal-gray">{decision.citation}</p>
              <div className="flex items-center text-legal-gray">
                <Building2 className="h-5 w-5 mr-2" />
                <span>{decision.court}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Case Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-navy">Case Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              {decision.summary}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-navy mb-3">Parties</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Plaintiff:</span>
                    <p className="text-gray-900">{decision.plaintiff}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Defendant:</span>
                    <p className="text-gray-900">{decision.defendant}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-navy mb-3">Outcome</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Scale className="h-5 w-5 text-navy mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-navy">{decision.outcome}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Issues */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-navy">Key Legal Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {decision.keyIssues.map((issue, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {issue}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full Details */}
        {decision.fullDetails && (
          <>
            {/* Background */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl text-navy">Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {decision.fullDetails.background}
                </p>
              </CardContent>
            </Card>

            {/* Legal Issues */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl text-navy">Legal Issues Addressed</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {decision.fullDetails.legalIssues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-navy rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{issue}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Holding & Reasoning */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Court's Holding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {decision.fullDetails.holding}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {decision.fullDetails.reasoning}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Impact */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl text-navy">Legal Impact & Significance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {decision.fullDetails.impact}
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Significance</p>
                  <p className="text-yellow-700">{decision.significance}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Call to Action */}
        <Card className="bg-navy text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">
                Need Legal Assistance with an Asbestos Case?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Our experienced attorneys understand Kentucky asbestos law and have successfully represented 
                clients in cases similar to this decision. Contact us for a free consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-navy hover:bg-gray-100">
                  <a href="tel:855-385-9532" className="flex items-center">
                    Call (855) 385-9532
                  </a>
                </Button>
                <Link href="/#contact">
                  <Button size="lg" variant="secondary" className="bg-white text-navy border-2 border-white hover:bg-blue-50 hover:text-navy font-semibold">
                    Free Case Evaluation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border-l-4 border-navy">
          <h4 className="font-bold text-navy mb-2">Legal Notice</h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            This case summary is provided for educational and informational purposes only and should not be construed as legal advice. 
            Each case is unique and requires individual legal analysis. If you have been exposed to asbestos or diagnosed with mesothelioma, 
            consult with qualified legal counsel immediately as statutes of limitations may apply.
          </p>
        </div>
      </div>
    </div>
  );
}