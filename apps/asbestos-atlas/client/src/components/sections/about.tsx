import { CheckCircle } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-navy mb-6">You Do Not Have To Stand Alone</h2>
            <p className="text-lg text-legal-gray mb-6">
              At Satterley & Kelley PLLC, we are known for handling complex personal injury and wrongful death cases 
              that other law firms do not have the experience, resources, ability or desire to pursue. Our attorneys 
              are dedicated to pursuing justice for those who cannot do so alone, with 30+ years of collective experience.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-navy">30+ Years Experience</h4>
                  <p className="text-legal-gray">Successfully handling complex mesothelioma and asbestos litigation nationwide</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-navy">Significant Case Results</h4>
                  <p className="text-legal-gray">Secured significant verdicts and settlements for clients. Past results do not guarantee future outcomes.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-navy">Integrity & Commitment</h4>
                  <p className="text-legal-gray">Treating clients with care and respect while fighting for compensation</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="tel:855-385-9532" 
                className="bg-legal-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
              >
                Free Consultation: 855-385-9532
              </a>
              <button 
                onClick={() => window.location.href = '/results'}
                className="border border-navy text-navy hover:bg-navy hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View Our Results
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg legal-shadow">
              <h3 className="text-xl font-bold text-navy mb-4">Leading Attorneys</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-navy">Joseph D. Satterley</h4>
                  <p className="text-sm text-legal-gray mb-2">Founding Partner</p>
                  <p className="text-xs text-legal-gray">
                    • Trial Lawyer of the Year, ABOTA (2022)<br/>
                    • President, Kentucky Justice Association (2013-14)<br/>
                    • Bar Admissions: KY, PA, CA, U.S. Supreme Court<br/>
                    • J.D. Temple University Beasley School of Law
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-navy">Paul J. Kelley</h4>
                  <p className="text-sm text-legal-gray mb-2">Partner</p>
                  <p className="text-xs text-legal-gray">
                    • Kentucky Super Lawyers (2021-2024)<br/>
                    • President, Kentucky Justice Association (2022-23)<br/>
                    • Board of Governors, American Association of Justice<br/>
                    • J.D. University of Dayton School of Law
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg legal-shadow">
              <h4 className="font-semibold text-navy mb-3">Office Location</h4>
              <div className="text-sm text-legal-gray space-y-1">
                <p>8700 Westport Road, Suite 202</p>
                <p>Louisville, KY 40242</p>
                <p className="mt-3 font-medium text-legal-red">Phone: 855-385-9532</p>
                <p>Fax: 502-814-5500</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
