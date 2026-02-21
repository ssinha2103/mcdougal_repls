import { Button } from "@/components/ui/button";
import { ArrowRight, Download, ExternalLink } from "lucide-react";

export default function BookShowcase() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-light-bg to-accent/10">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral mb-6">
              Award-Winning <span className="text-accent">Legal Marketing</span> Expertise
            </h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Get proven strategies from the gold medal-winning marketing expert trusted by law firms nationwide.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Book Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-gradient-to-br from-blue-900 via-orange-400 to-orange-300 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-orange-300/20 rounded-3xl"></div>
                <div className="relative">
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f5f5f5'/%3E%3Cstop offset='100%25' style='stop-color:%23e5e5e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23bg)'/%3E%3Ctext x='50%25' y='15%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='24' font-weight='bold' fill='%23ff6b35'%3EContent%3C/text%3E%3Ctext x='50%25' y='20%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='24' font-weight='bold' fill='%23ff6b35'%3EMarketing%3C/text%3E%3Ctext x='50%25' y='26%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%23666'%3Eand%3C/text%3E%3Ctext x='50%25' y='32%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='36' font-weight='bold' fill='%23333'%3ESEO%3C/text%3E%3Ctext x='50%25' y='38%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%23666'%3Efor%3C/text%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='26' font-weight='bold' fill='%234a90e2'%3ELaw Firms%3C/text%3E%3Ctext x='50%25' y='52%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%23666'%3EHow to get consistent website leads by following%3C/text%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%23666'%3Ea highly actionable roadmap%3C/text%3E%3Crect x='100' y='350' width='200' height='120' fill='%23ddd' rx='10'/%3E%3Ccircle cx='130' cy='380' r='15' fill='%23ff4444'/%3E%3Ccircle cx='160' cy='380' r='15' fill='%23ffaa00'/%3E%3Ccircle cx='190' cy='380' r='15' fill='%2344ff44'/%3E%3Ccircle cx='220' cy='380' r='15' fill='%234444ff'/%3E%3Cpath d='M110 400 Q150 420 190 400 Q230 420 270 400 Q310 420 350 400' stroke='%23333' stroke-width='3' fill='none'/%3E%3Ctext x='50%25' y='88%25' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' font-weight='bold' fill='%23333'%3EJohn D. McDougall%3C/text%3E%3C/svg%3E"
                    alt="Content Marketing and SEO for Law Firms book by John D. McDougall"
                    className="w-full max-w-sm mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
                    data-testid="book-cover-image"
                  />
                </div>
              </div>
            </div>

            {/* Book Content */}
            <div className="order-1 lg:order-2">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
                  <span className="mr-2">🏆</span>
                  National Gold Medal Winner 2020
                </div>
                
                <h3 className="font-display text-3xl lg:text-4xl font-bold text-neutral">
                  Content Marketing and SEO for Law Firms
                </h3>
                
                <p className="text-lg text-secondary leading-relaxed">
                  An accessible guidebook to improve your bottom line by making your legal marketing tactics work seamlessly together. Get consistent website leads by following a highly actionable roadmap.
                </p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-neutral">What You'll Learn:</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start space-x-3">
                      <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Digital strategy and SEO best practices</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Content marketing and blogging frameworks</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Local search and mobile optimization</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Analytics and conversion optimization</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    data-testid="download-sample-button"
                  >
                    <a 
                      href="https://go2.mcdougallinteractive.com/content-marketing-and-seo-sample-chapter"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Sample Chapter
                    </a>
                  </Button>
                  
                  <Button
                    variant="outline"
                    asChild
                    className="border-accent text-accent hover:bg-accent hover:text-white"
                    data-testid="view-book-button"
                  >
                    <a 
                      href="https://rainstardigital.com/resource/content-marketing-and-seo-for-law-firms/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Book Details
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}