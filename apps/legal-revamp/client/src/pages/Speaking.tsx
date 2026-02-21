import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Users, Play, Clock, ExternalLink, Mic, Video } from "lucide-react";

export default function Speaking() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const typeParam = params.get('type');

  useEffect(() => {
    document.title = "Speaking Engagements & Podcasts | Rainstar Digital";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Join John McDougall's webinars and listen to the Legal Marketing Review podcast. Expert insights on legal marketing, SEO, and digital strategies for law firms."
      );
    }
  }, []);

  const webinars = [
    {
      title: "Legal SEO Strategies for 2024",
      date: "March 25, 2024",
      time: "2:00 PM EST",
      description: "Learn the latest Google algorithm updates and how they affect legal websites. Discover proven SEO tactics that drive results for law firms.",
      partner: "The National Law Review",
      status: "upcoming",
      seats: "Limited seats available",
      topics: [
        "Google's latest algorithm changes",
        "Local SEO for law firms",
        "Content strategy best practices",
        "Technical SEO audits"
      ]
    },
    {
      title: "AI and Legal Marketing Ethics",
      date: "February 15, 2024",
      time: "1:00 PM EST",
      description: "Exploring how law firms can leverage AI tools while maintaining ethical standards and Google compliance.",
      partner: "Social Law Library",
      status: "past",
      recording: true,
      topics: [
        "Ethical use of AI in legal marketing",
        "Google's AI content guidelines",
        "ChatGPT for law firms",
        "Compliance considerations"
      ]
    },
    {
      title: "PPC Advertising for Legal Practices",
      date: "January 18, 2024",
      time: "3:00 PM EST",
      description: "Master Google Ads for legal services with insights from a Google Premier Partner.",
      partner: "Mass Lawyers Weekly",
      status: "past",
      recording: true,
      topics: [
        "Google Ads campaign structure",
        "Legal advertising compliance",
        "Bid strategies and budget optimization",
        "Landing page best practices"
      ]
    }
  ];

  const podcastEpisodes = [
    {
      title: "AI and Legal Marketing Ethics",
      episodeNumber: 45,
      date: "March 10, 2024",
      duration: "42 min",
      description: "John McDougall discusses the ethical implications of AI in legal marketing and how law firms can leverage these tools responsibly.",
      guest: "Dr. Sarah Martinez, Legal Ethics Expert",
      topics: [
        "Current AI tools for legal marketing",
        "Ethical considerations and bar regulations",
        "Best practices for implementation",
        "Future trends in legal tech"
      ],
      platforms: {
        spotify: "https://open.spotify.com/",
        apple: "https://podcasts.apple.com/",
        google: "https://podcasts.google.com/"
      }
    },
    {
      title: "Local SEO Mastery for Law Firms",
      episodeNumber: 44,
      date: "February 25, 2024",
      duration: "38 min",
      description: "Deep dive into local SEO strategies that help law firms dominate their local markets and attract high-value clients.",
      guest: "Mark Thompson, Personal Injury Attorney",
      topics: [
        "Google My Business optimization",
        "Local citation building",
        "Review management strategies",
        "Geographic targeting techniques"
      ],
      platforms: {
        spotify: "https://open.spotify.com/",
        apple: "https://podcasts.apple.com/",
        google: "https://podcasts.google.com/"
      }
    },
    {
      title: "Content Marketing That Converts",
      episodeNumber: 43,
      date: "February 10, 2024",
      duration: "45 min",
      description: "Learn how to create compelling content that establishes authority and drives qualified leads for your legal practice.",
      guest: "Jennifer Adams, Content Strategist",
      topics: [
        "Content strategy development",
        "Blog writing for lawyers",
        "Video content creation",
        "Measuring content ROI"
      ],
      platforms: {
        spotify: "https://open.spotify.com/",
        apple: "https://podcasts.apple.com/",
        google: "https://podcasts.google.com/"
      }
    }
  ];

  return (
    <main className="pt-24">
      {/* Speaking Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-light-bg to-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral mb-6">
              Speaking
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              I am actively seeking speaking engagements at law firm conferences and associations. Please call me if you would like to discuss having me speak about internet marketing.
            </p>
            
            <div className="max-w-4xl mx-auto mt-12 bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <p className="text-lg text-secondary italic leading-relaxed">
                  "John delivered a compelling program at the chapter's regional conference on Internet marketing that left the audience with practical strategies on the best ways to increase your ROI. It was quite apparent that John has an in-depth understanding of web marketing strategy, as well as Google Panda and Penguin algorithms and how they impact search results."
                </p>
                <div className="mt-6">
                  <p className="font-semibold text-neutral">Christopher Newman</p>
                  <p className="text-sm text-secondary">Cooley LLP</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-secondary mb-4">
                  I recently spoke to a packed room at the Rainstar Digital Association (RDA) New England Chapter annual tradeshow.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className={`${typeParam === 'webinars' || !typeParam ? 'bg-gradient-to-r from-accent to-secondary text-white' : 'bg-white/80 border-2 border-accent text-accent hover:bg-accent hover:text-white'} transition-all duration-300`}
              data-testid="speaking-webinars-tab"
            >
              <Link href="/speaking?type=webinars">
                <Video className="w-5 h-5 mr-3" />
                Webinars
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className={`${typeParam === 'podcasts' ? 'bg-gradient-to-r from-accent to-secondary text-white' : 'bg-white/80 border-2 border-accent text-accent hover:bg-accent hover:text-white'} transition-all duration-300`}
              data-testid="speaking-podcasts-tab"
            >
              <Link href="/speaking?type=podcasts">
                <Mic className="w-5 h-5 mr-3" />
                Podcasts
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Webinars Section */}
      {(typeParam === 'webinars' || !typeParam) && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-neutral mb-6">
                Some of The <span className="text-accent">Topics I Speak About in Depth</span>
              </h2>
              <p className="text-xl text-secondary max-w-3xl mx-auto">
                I cover a comprehensive range of internet marketing topics specifically tailored for legal professionals and law firms.
              </p>
            </div>
            
            {/* Speaking Topics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {[
                "Email Marketing",
                "Content Marketing", 
                "SEO Implementation",
                "HubSpot",
                "Local Search Mobile",
                "Social Media Marketing",
                "Internet Marketing Strategy",
                "Paid Search Marketing",
                "Blogging for Business",
                "Online Public Relations",
                "The Revolution of the Web",
                "SEO Essentials for Web Design",
                "Conversion Rate Optimization",
                "Actionable Analytics and Reporting"
              ].map((topic, index) => (
                <div
                  key={topic}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  data-testid={`speaking-topic-${topic.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-xl">●</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-neutral">
                    {topic}
                  </h3>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              {webinars.map((webinar, index) => (
                <div
                  key={webinar.title}
                  className="bg-gradient-to-br from-white to-primary/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`webinar-${webinar.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                      <div className="flex items-center mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold mr-4 ${
                          webinar.status === 'upcoming' 
                            ? 'bg-accent text-white' 
                            : 'bg-secondary/20 text-secondary'
                        }`}>
                          {webinar.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
                        </div>
                        <span className="text-sm text-secondary">
                          Partner: {webinar.partner}
                        </span>
                      </div>
                      
                      <h3 className="font-display text-2xl font-bold text-neutral mb-4">
                        {webinar.title}
                      </h3>
                      
                      <p className="text-secondary mb-6 leading-relaxed">
                        {webinar.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <h4 className="font-semibold text-neutral">Topics Covered:</h4>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {webinar.topics.map((topic) => (
                            <li key={topic} className="flex items-center text-sm text-secondary">
                              <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <Calendar className="w-5 h-5 text-accent mr-3" />
                        <span className="font-semibold text-neutral">{webinar.date}</span>
                      </div>
                      <div className="flex items-center mb-4">
                        <Clock className="w-5 h-5 text-accent mr-3" />
                        <span className="text-secondary">{webinar.time}</span>
                      </div>
                      
                      {webinar.seats && (
                        <div className="flex items-center mb-6 text-sm">
                          <Users className="w-4 h-4 text-secondary mr-2" />
                          <span className="text-secondary">{webinar.seats}</span>
                        </div>
                      )}
                      
                      {webinar.status === 'upcoming' ? (
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                          data-testid={`webinar-register-${webinar.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Link href="/contact">
                            Register Now
                          </Link>
                        </Button>
                      ) : webinar.recording ? (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
                          data-testid={`webinar-watch-${webinar.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <Link href="/contact">
                            <Play className="w-4 h-4 mr-2" />
                            Watch Recording
                          </Link>
                        </Button>
                      ) : (
                        <div className="text-center text-secondary text-sm">
                          Recording not available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Podcasts Section */}
      {typeParam === 'podcasts' && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-neutral mb-6">
                Legal Marketing Review <span className="text-accent">Podcast</span>
              </h2>
              <p className="text-xl text-secondary max-w-3xl mx-auto">
                Join John McDougall and expert guests as they discuss cutting-edge strategies, 
                compliance pitfalls, and the latest trends in digital marketing for attorneys.
              </p>
            </div>

            <div className="space-y-8">
              {podcastEpisodes.map((episode, index) => (
                <div
                  key={episode.episodeNumber}
                  className="bg-gradient-to-br from-white to-secondary/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`podcast-episode-${episode.episodeNumber}`}
                >
                  <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                      <div className="flex items-center mb-4">
                        <div className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                          Episode {episode.episodeNumber}
                        </div>
                        <span className="text-sm text-secondary">{episode.duration}</span>
                      </div>
                      
                      <h3 className="font-display text-2xl font-bold text-neutral mb-4">
                        {episode.title}
                      </h3>
                      
                      <p className="text-secondary mb-4 leading-relaxed">
                        {episode.description}
                      </p>
                      
                      <div className="mb-6">
                        <p className="text-sm text-accent font-semibold mb-2">
                          Guest: {episode.guest}
                        </p>
                        <p className="text-sm text-secondary">{episode.date}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-neutral">Episode Topics:</h4>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {episode.topics.map((topic) => (
                            <li key={topic} className="flex items-center text-sm text-secondary">
                              <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6">
                      <h4 className="font-semibold text-neutral mb-4">Listen On:</h4>
                      <div className="space-y-3">
                        <a
                          href={episode.platforms.spotify}
                          className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          data-testid={`podcast-spotify-${episode.episodeNumber}`}
                        >
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-neutral">Spotify</div>
                            <div className="text-xs text-secondary">Stream now</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-secondary ml-auto" />
                        </a>
                        
                        <a
                          href={episode.platforms.apple}
                          className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                          data-testid={`podcast-apple-${episode.episodeNumber}`}
                        >
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-neutral">Apple Podcasts</div>
                            <div className="text-xs text-secondary">Stream now</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-secondary ml-auto" />
                        </a>
                        
                        <a
                          href={episode.platforms.google}
                          className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          data-testid={`podcast-google-${episode.episodeNumber}`}
                        >
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-neutral">Google Podcasts</div>
                            <div className="text-xs text-secondary">Stream now</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-secondary ml-auto" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Want to Be a Guest?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Share your legal marketing expertise on the Legal Marketing Review podcast or 
            join us for an upcoming webinar presentation.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-accent hover:bg-primary hover:text-white shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            data-testid="speaking-guest-cta"
          >
            <Link href="/contact">
              Apply to Speak
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
