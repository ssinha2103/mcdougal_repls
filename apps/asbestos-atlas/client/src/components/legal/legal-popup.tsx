import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LegalPopupProps {
  type: "disclaimer" | "privacy";
  children: React.ReactNode;
}

export default function LegalPopup({ type, children }: LegalPopupProps) {
  const [open, setOpen] = useState(false);

  const content = type === "disclaimer" ? (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Attorney Advertising Disclaimer</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          This website is attorney advertising. The information contained on this website is not intended to create, 
          and receipt of it does not constitute, an attorney-client relationship. Past results do not guarantee future outcomes. 
          Any information sent through this site is not secure and is done so on a non-confidential basis.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Legal Representation</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Satterley & Kelley PLLC represents clients with mesothelioma and other asbestos-related diseases. 
          We work on a contingency fee basis, meaning you pay no attorney fees unless we recover compensation for you.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Case results depend on the specific facts and legal circumstances of each case. Results shown on this website 
          should not be taken as a guarantee, warranty, or prediction regarding the outcome of your legal matter.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Medical Information</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          The information on this website is not intended as medical advice. If you believe you have been exposed to asbestos 
          or have symptoms related to asbestos exposure, please consult with a qualified medical professional immediately.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Jurisdictional Notice</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Satterley & Kelley PLLC is licensed to practice law in Kentucky. We may associate with local counsel in other jurisdictions 
          as needed. This website may be considered attorney advertising in some jurisdictions.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 font-medium">
          <strong>Important:</strong> Time limits may apply to your case. Contact us immediately for a free consultation 
          to discuss your legal rights and options.
        </p>
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Information Collection</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          We collect information you provide directly to us through our contact forms, including your name, contact information, 
          and details about your potential case. We also collect information automatically when you visit our website, 
          such as your IP address, browser type, and pages visited.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Use of Information</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          We use the information we collect to:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-4">
          <li>• Evaluate your potential legal case</li>
          <li>• Communicate with you about legal services</li>
          <li>• Improve our website and services</li>
          <li>• Comply with legal obligations</li>
        </ul>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Information Sharing</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          We do not sell, trade, or rent your personal information to third parties. We may share your information with 
          trusted service providers who assist us in operating our website and conducting our business, provided they 
          agree to keep this information confidential.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Data Security</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          We implement appropriate security measures to protect your personal information. However, no method of transmission 
          over the internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-navy mb-3">Contact Information</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          If you have questions about this privacy policy or our data practices, please contact us at 855-385-9532 or 
          visit our offices in Louisville, Kentucky.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Last Updated:</strong> This privacy policy was last updated on August 2, 2025.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy">
            {type === "disclaimer" ? "Legal Disclaimer" : "Privacy Policy"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}