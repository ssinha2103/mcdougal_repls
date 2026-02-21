import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Christopher Newman",
      title: "Cooley LLP",
      content:
        "John delivered a compelling program at the Legal Marketing Associations chapter's regional conference on Internet marketing that left the audience with practical strategies on the best ways to increase your ROI. It was quite apparent that John has an in-depth understanding of web marketing strategy, as well as Google algorithms and how they impact search results.",
    },
    {
      name: "Attorney Michael Bowser",
      title: "P.C.",
      content:
        "I learned more today about web-based marketing than I have in the last 10-12 years. It feels like some very dynamic, strong, smart people 'have my back' on the web, while I wail away in court day after day. The reduction in my stress level from a business/practice perspective can't be overstated. Thanks again for all you are doing.",
    },
    {
      name: "John F. Murphy",
      title: "Esq. – The Whistleblower Lawyer",
      content:
        "Picture a blind man (me) being guided (by you) through a (Google) minefield. Everything you (and the 'McDougall Team') have done for me and my website is more than I ever could have imagined. I'm trying not to sound 'unprofessional,' but it's wonderful! Again, thank you!",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral mb-6">
            Here's a Small Sample of What
            <br />
            <span className="text-accent">Our Customers</span> are Saying
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-gradient-to-br from-white to-primary/10 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`testimonial-${testimonial.name.toLowerCase().replace(/ /g, '-')}`}
            >
              <div className="mb-6">
                <div className="flex text-accent mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-secondary leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
              <div className="flex items-center">
                <img
                  src="https://rainstardigital.com/wp-content/uploads/2021/12/Ellipse-8-1-77x77.png"
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                  data-testid={`testimonial-avatar-${testimonial.name.toLowerCase().replace(/ /g, '-')}`}
                />
                <div>
                  <h4 className="font-semibold text-neutral">{testimonial.name}</h4>
                  <p className="text-secondary text-sm">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
