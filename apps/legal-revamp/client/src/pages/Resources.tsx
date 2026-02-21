import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Download, FileText, BookOpen, CheckSquare, ExternalLink, Star } from "lucide-react";

export default function Resources() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const typeParam = params.get('type');

  useEffect(() => {
    document.title = "Free Legal Marketing Resources | Rainstar Digital";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Download free legal marketing resources including SEO guides, checklists, and e-books. Proven strategies from 30+ years of experience."
      );
    }
  }, []);

  const freeDownloads = [
    {
      title: "Marketing Plan Template",
      description: "A comprehensive marketing plan template specifically designed for law firms to organize and execute successful marketing strategies.",
      type: "Template",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/06/Marketing-Plan-Template.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/FD-3.png",
      featured: true
    },
    {
      title: "Technical SEO Checklist",
      description: "Essential technical SEO checklist to ensure your law firm website meets all technical requirements for search engines.",
      type: "Checklist",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/06/Technical-SEO-Checklist.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/FD-3.png"
    },
    {
      title: "On-page SEO Checklist",
      description: "Complete on-page SEO checklist to optimize your law firm website content for better search engine rankings.",
      type: "Checklist",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/06/On-page-SEO-Checklist.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/FD-3.png"
    },
    {
      title: "Webinar Planning and Launch Checklist",
      description: "Step-by-step checklist for planning and launching successful webinars for your legal practice.",
      type: "Checklist",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/06/Webinar-Planning-and-Launch-Checklist.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/FD-3.png"
    },
    {
      title: "Hiring In-House Versus Outsourcing List of Marketing Tasks",
      description: "Comprehensive guide to help law firms decide between hiring in-house marketing staff or outsourcing marketing tasks.",
      type: "Guide",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/06/Hiring-In-House-Versus-Outsourcing-List-of-Marketing-Tasks.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/FD-3.png"
    },
    {
      title: "Top 10 Reasons Law Firm Content Marketing and SEO Fails",
      description: "Identify and avoid the most common mistakes that cause law firm content marketing and SEO strategies to fail.",
      type: "Report",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/06/Top-10-Reasons-Law-Firm-Content-Marketing-and-SEO-Fails.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/FD-3.png"
    },
    {
      title: "Types of Content for Digital Marketing Checklist",
      description: "Comprehensive checklist of different content types that can drive your digital marketing success.",
      type: "Checklist",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/06/Types-of-Content-for-Digital-Marketing-Checklist.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/FD-3.png"
    },
    {
      title: "Competitor Analysis Considerations Checklist and Tools",
      description: "Essential checklist and tools for conducting effective competitor analysis in the legal industry.",
      type: "Checklist",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/06/Competitor-Analysis-Considerations-Checklist-and-Tools.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/FD-3.png"
    }
  ];

  const webinarSlides = [
    {
      id: "podcast-youtube-optimization",
      title: "How to Start a Successful Podcast and Optimize Your YouTube Channel",
      partner: "Mass Lawyers Weekly",
      description: "Learn how to create engaging podcast content and optimize YouTube channels for maximum legal marketing impact.",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/05/John-Maher-Podcasts-and-YouTube-Optimization-SLL-2021-07-21.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/2B9A9863-5137-42FA-8831-ED8D73A89979.png",
      registerUrl: "https://go2.mcdougallinteractive.com/content-marketing-and-seo-2021-webinar",
      featured: true
    },
    {
      id: "content-marketing-2021",
      title: "How to Develop an Effective Law Firm Content Marketing Plan for 2021",
      partner: "The National Law Review",
      description: "Strategic content marketing planning specifically designed for law firms to drive engagement and generate leads.",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/05/John-McDougall-Law-Firm-Content-Marketing-SEO-Action-Plan-SLL-2021-07-21-1.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/2057610A-0BE0-4FC5-9A54-4194F9925B20.png"
    },
    {
      id: "seo-action-plan-2021",
      title: "How to Develop an Effective Law Firm SEO Action Plan for 2021",
      partner: "The National Law Review", 
      description: "Comprehensive SEO action plan development guide for law firms to improve search rankings and organic visibility.",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/05/John-McDougall-Law-Firm-Content-Marketing-SEO-Action-Plan-SLL-2021-07-21-1.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/2057610A-0BE0-4FC5-9A54-4194F9925B20.png"
    },
    {
      id: "content-marketing-seo-2020",
      title: "How to Develop an Effective Law Firm Content Marketing and SEO Action Plan for 2020",
      partner: "Mass Lawyers Weekly",
      date: "Jan 2020",
      description: "Complete content marketing and SEO strategy development for law firms.",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/05/Content-Marketing-and-SEO-for-Law-Firms-John-McDougall-Webinar-1-15-2020.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/2057610A-0BE0-4FC5-9A54-4194F9925B20.png"
    },
    {
      id: "law-firm-content-marketing-seo",
      title: "Law Firm Content Marketing SEO Action Plan",
      partner: "Social Law Library",
      date: "March 10, 2020",
      description: "Actionable SEO and content marketing strategies specifically for legal practices.",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/05/law-firm-content-marketing-seo-action-plan_social-law-library.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/2057610A-0BE0-4FC5-9A54-4194F9925B20.png"
    },
    {
      id: "podcasting-video-optimization",
      title: "Podcasting and Video Optimization",
      partner: "Social Law Library",
      date: "March 10, 2020",
      description: "Master podcasting and video optimization strategies for legal marketing success.",
      downloadUrl: "https://rainstardigital.com/wp-content/uploads/2025/05/podcasting-and-video-optimization_social-law-library.pdf",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/EFF5277E-CA89-415B-975F-766B8B9C8ACA1.png"
    }
  ];

  const books = [
    {
      id: "content-marketing-seo-book",
      title: "Content Marketing and SEO for Law Firms", 
      author: "John McDougall",
      description: "Position yourself as an expert and be seen as the 'big dog' in your niche with proven content marketing and SEO strategies.",
      sampleUrl: "http://go2.mcdougallinteractive.com/content-marketing-and-seo-sample-chapter",
      image: "https://rainstardigital.com/wp-content/uploads/2025/05/1.png",
      featured: true
    },
    {
      id: "web-marketing-cylinders",
      title: "Web Marketing on All Cylinders",
      author: "John McDougall", 
      description: "The complete guide to web marketing strategies that drive results for law firms and professional services.",
      purchaseUrl: "https://rainstardigital.com/resource/web-marketing-on-all-cylinders/",
      image: "https://rainstardigital.com/wp-content/uploads/2025/04/Group-286.png"
    },
    {
      id: "big-dog-authority",
      title: "The Big Dog Authority Marketing Checklist",
      author: "John McDougall",
      description: "Essential checklist for building authority and establishing your firm as the leader in your practice area.",
      purchaseUrl: "https://rainstardigital.com/resource/the-big-dog-authority-marketing-checklist/",
      image: "https://rainstardigital.com/wp-content/uploads/2025/04/Group-286.png"
    }
  ];

  const selectedResource = typeParam && books.find(book => book.id === typeParam);

  return (
    <main className="pt-24">
      {/* Resources Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-light-bg to-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral mb-6">
              Free Downloads
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Make All Your Rainstar Digital Problems Go Away Once and For All With Our Blueprints and Checklists
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className={`${!typeParam || typeParam === 'downloads' ? 'bg-gradient-to-r from-accent to-secondary text-white' : 'bg-white/80 border-2 border-accent text-accent hover:bg-accent hover:text-white'} transition-all duration-300`}
              data-testid="resources-downloads-tab"
            >
              <Link href="/resources?type=downloads">
                <Download className="w-5 h-5 mr-3" />
                Free Downloads
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className={`${typeParam && typeParam !== 'downloads' ? 'bg-gradient-to-r from-accent to-secondary text-white' : 'bg-white/80 border-2 border-accent text-accent hover:bg-accent hover:text-white'} transition-all duration-300`}
              data-testid="resources-books-tab"
            >
              <Link href="/resources?type=books">
                <BookOpen className="w-5 h-5 mr-3" />
                Books & Guides
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Free Downloads Section */}
      {(!typeParam || typeParam === 'downloads') && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-neutral mb-6">
                Free <span className="text-accent">Downloads</span>
              </h2>
              <p className="text-xl text-secondary max-w-3xl mx-auto">
                Get instant access to our most valuable resources. No forms, no spam – just practical tools you can use immediately.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {freeDownloads.map((resource, index) => (
                <div
                  key={resource.title}
                  className={`group bg-gradient-to-br from-white to-primary/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up ${
                    resource.featured ? 'ring-2 ring-accent' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`free-download-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {resource.featured && (
                    <div className="bg-accent text-white text-center py-2 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="h-48 overflow-hidden">
                    <img
                      src={resource.image}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-semibold">
                        {resource.type}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-xl font-bold text-neutral mb-3">
                      {resource.title}
                    </h3>
                    
                    <p className="text-secondary mb-6 leading-relaxed">
                      {resource.description}
                    </p>
                    
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      data-testid={`download-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <a href={resource.downloadUrl}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Free
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Books Section */}
      {typeParam && typeParam !== 'downloads' && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-neutral mb-6">
                Books & <span className="text-accent">Comprehensive Guides</span>
              </h2>
              <p className="text-xl text-secondary max-w-3xl mx-auto">
                In-depth resources that provide complete strategies and frameworks for legal marketing success.
              </p>
            </div>

            <div className="space-y-12">
              {books.map((book, index) => (
                <div
                  key={book.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center animate-slide-up ${
                    book.featured ? 'bg-gradient-to-br from-accent/5 to-secondary/10 rounded-3xl p-8' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`book-${book.id}`}
                >
                  <div className={index % 2 === 1 ? "order-2 lg:order-1" : "order-2 lg:order-1"}>
                    <div className="flex items-center mb-4">
                      {book.featured && (
                        <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-display text-3xl font-bold text-neutral mb-2">
                      {book.title}
                    </h3>
                    <p className="text-lg text-secondary mb-4">By {book.author}</p>
                    <p className="text-secondary mb-6 leading-relaxed">{book.description}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {book.purchaseUrl && (
                        <Button
                          asChild
                          className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                          data-testid={`book-purchase-${book.id}`}
                        >
                          <a href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">
                            View Book
                          </a>
                        </Button>
                      )}
                      {book.sampleUrl && (
                        <Button
                          asChild
                          variant="outline"
                          className="border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
                          data-testid={`book-sample-${book.id}`}
                        >
                          <a href={book.sampleUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4 mr-2" />
                            Download Sample
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className={index % 2 === 1 ? "order-1 lg:order-2" : "order-1 lg:order-2"}>
                    <img
                      src={book.image}
                      alt={book.title}
                      className="rounded-2xl shadow-2xl w-full h-auto max-w-md mx-auto"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Webinar Slides Section - Additional Resources */}
      <section className="py-20 bg-gradient-to-b from-light-bg to-primary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-neutral mb-6">
              Webinar <span className="text-accent">Slide Decks</span>
            </h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              Presentation materials from our webinars with legal marketing partners including The National Law Review, Social Law Library, and Mass Lawyers Weekly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinarSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up ${
                  slide.featured ? 'ring-2 ring-accent' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`webinar-slide-${slide.id}`}
              >
                {slide.featured && (
                  <div className="bg-accent text-white text-center py-2 text-sm font-semibold">
                    Featured
                  </div>
                )}
                
                <div className="h-48 overflow-hidden">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {slide.partner}
                    </span>
                    {slide.date && (
                      <span className="text-sm text-secondary">{slide.date}</span>
                    )}
                  </div>
                  
                  <h3 className="font-display text-lg font-bold text-neutral mb-3">
                    {slide.title}
                  </h3>
                  
                  <p className="text-secondary mb-6 leading-relaxed text-sm">
                    {slide.description}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      data-testid={`download-slide-${slide.id}`}
                    >
                      <a href={slide.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download Slides
                      </a>
                    </Button>
                    {slide.registerUrl && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
                        data-testid={`register-${slide.id}`}
                      >
                        <a href={slide.registerUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          More Info
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Need Customized Marketing Strategies?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            While our resources provide great foundations, every law firm is unique. 
            Let's discuss how to customize these strategies for your specific practice.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-accent hover:bg-primary hover:text-white shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            data-testid="resources-consultation-cta"
          >
            <Link href="/contact">
              Schedule Free Consultation
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
