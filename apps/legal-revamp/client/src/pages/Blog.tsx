import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Clock, ArrowRight, Search, Tag } from "lucide-react";

export default function Blog() {
  useEffect(() => {
    document.title = "Legal Marketing Blog | Expert Insights from Rainstar Digital";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Expert legal marketing insights, SEO strategies, and digital growth tactics for law firms. Stay updated with the latest trends and best practices."
      );
    }
  }, []);

  const featuredPost = {
    title: "Yes, Your Legal Practice NEEDS an Active Blog",
    excerpt: "Discover why maintaining an active blog is essential for law firms to establish authority, improve SEO, and attract qualified clients.",
    date: "Aug 08",
    readTime: "Blog post",
    author: "John McDougall",
    category: "Blogging",
    image: "https://rainstardigital.com/wp-content/uploads/2025/08/Blog-370x265.png",
    url: "https://rainstardigital.com/blog/why-law-firms-need-an-active-blog/",
    featured: true
  };

  const blogPosts = [
    {
      title: "8 Benefits of Podcasting For Lawyers That You Can't Ignore",
      excerpt: "Learn how podcasting can significantly boost your law firm's marketing efforts and help you connect with potential clients.",
      date: "Jul 28",
      readTime: "Blog post",
      author: "John McDougall",
      category: "Content Marketing",
      image: "https://rainstardigital.com/wp-content/uploads/2025/07/Podcast-370x265.png",
      url: "https://rainstardigital.com/blog/podcasting-benefits-for-lawyers/"
    },
    {
      title: "How to Get More Google Reviews For Your Law Firm",
      excerpt: "Proven strategies to encourage clients to leave positive Google reviews and improve your law firm's online reputation.",
      date: "Jul 18",
      readTime: "Blog post",
      author: "John McDougall",
      category: "SEO",
      image: "https://rainstardigital.com/wp-content/uploads/2025/07/Leave-a-Google-Review-370x265.png",
      url: "https://rainstardigital.com/blog/get-google-reviews-for-law-firm/"
    },
    {
      title: "FindLaw Review: Legal SEO and Website Marketing Horror Stories",
      excerpt: "Real-world experiences and lessons learned from working with FindLaw's legal marketing services.",
      date: "Mar 06",
      readTime: "Blog post",
      author: "John McDougall",
      category: "Content Marketing",
      image: "https://rainstardigital.com/wp-content/uploads/2023/03/14-370x265.jpg",
      url: "https://rainstardigital.com/blog/findlaw-review-legal-seo-and-website-marketing-horror-stories/"
    },
    {
      title: "What is Lawyer SEO Worth Now That Ads Are So Expensive?",
      excerpt: "Analyze the value of SEO investment for law firms as Google Ads costs continue to rise in competitive legal markets.",
      date: "Mar 31",
      readTime: "Blog post",
      author: "John McDougall",
      category: "SEO",
      image: "https://rainstardigital.com/wp-content/uploads/2022/03/53-370x265.jpg",
      url: "https://rainstardigital.com/blog/what-is-lawyer-seo-worth-now-that-ads-are-so-expensive/"
    },
    {
      title: "Omnichannel Marketing Guide For Lawyers and Law Firms",
      excerpt: "Comprehensive guide to implementing omnichannel marketing strategies that create consistent client experiences across all touchpoints.",
      date: "Feb 16",
      readTime: "Blog post",
      author: "John McDougall",
      category: "Content Marketing",
      image: "https://rainstardigital.com/wp-content/uploads/2022/02/Omnichannel-Marketing-Guide-For-Law-370x265.jpg",
      url: "https://rainstardigital.com/blog/omnichannel-marketing-guide-for-lawyers-and-law-firms/"
    }
  ];

  const categories = [
    "All Posts",
    "SEO",
    "PPC", 
    "Content Marketing",
    "Local SEO",
    "Technical SEO",
    "Social Media",
    "AI & Technology"
  ];

  return (
    <main className="pt-24">
      {/* Blog Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-light-bg to-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral mb-6">
              Legal Marketing <span className="text-accent">Insights</span>
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Expert strategies, proven tactics, and industry insights to help your law firm 
              grow through effective digital marketing. Real advice from 30+ years of experience.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Search legal marketing topics..."
                className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-lg border border-primary/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-300"
                data-testid="blog-search-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="font-display text-3xl font-bold text-neutral mb-2">Featured Article</h2>
            <p className="text-secondary">Our latest insights on legal marketing trends</p>
          </div>

          <div className="bg-gradient-to-br from-white to-primary/10 rounded-3xl overflow-hidden shadow-2xl hover:shadow-premium transform hover:-translate-y-2 transition-all duration-300 animate-slide-up">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12">
                <div className="flex items-center mb-4">
                  <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                    {featuredPost.category}
                  </span>
                  <span className="text-sm text-secondary">Featured</span>
                </div>
                
                <h3 className="font-display text-3xl font-bold text-neutral mb-4">
                  {featuredPost.title}
                </h3>
                
                <p className="text-lg text-secondary mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center mb-8">
                  <div className="flex items-center mr-6">
                    <Calendar className="w-4 h-4 text-accent mr-2" />
                    <span className="text-sm text-secondary">{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center mr-6">
                    <Clock className="w-4 h-4 text-accent mr-2" />
                    <span className="text-sm text-secondary">{featuredPost.readTime}</span>
                  </div>
                  <div className="text-sm text-secondary">
                    By {featuredPost.author}
                  </div>
                </div>
                
                <Button
                  asChild
                  className="bg-gradient-to-r from-accent to-secondary text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  data-testid="featured-post-read-more"
                >
                  <Link href="/contact">
                    Read Full Article <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              <div className="h-64 lg:h-auto">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                  data-testid="featured-post-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-12 bg-gradient-to-b from-light-bg to-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={index === 0 ? "default" : "outline"}
                className={`${index === 0 
                  ? 'bg-gradient-to-r from-accent to-secondary text-white' 
                  : 'bg-white/80 border-accent text-accent hover:bg-accent hover:text-white'
                } transition-all duration-300`}
                data-testid={`category-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Tag className="w-4 h-4 mr-2" />
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article
                key={post.title}
                className="bg-gradient-to-br from-white to-primary/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`blog-post-${post.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-full text-xs font-semibold">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-xl font-bold text-neutral mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-secondary mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-secondary mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {post.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">
                      By {post.author}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
                      data-testid={`blog-post-read-${post.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        Read More
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-16">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
              data-testid="blog-load-more"
            >
              <Link href="/contact">
                Load More Articles
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-r from-accent to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Stay Updated with Legal Marketing Trends
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get the latest insights, case studies, and proven strategies delivered to your inbox. 
            Join 5,000+ legal professionals who trust our expertise.
          </p>
          
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white"
              data-testid="newsletter-email-input"
            />
            <Button
              className="bg-white text-accent hover:bg-primary hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300"
              data-testid="newsletter-subscribe-button"
            >
              Subscribe
            </Button>
          </div>
          
          <p className="text-white/70 text-sm mt-4">
            No spam. Unsubscribe anytime. Privacy policy applies.
          </p>
        </div>
      </section>
    </main>
  );
}
