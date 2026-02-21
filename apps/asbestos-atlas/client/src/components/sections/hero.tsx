export default function Hero() {
  const scrollToMap = () => {
    const mapSection = document.getElementById('map');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-gradient text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Featured Kentucky Asbestos Exposure Sites
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-blue-100 leading-snug">
            Interactive map of confirmed asbestos exposure locations across Kentucky
          </p>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Were you or a loved one exposed to asbestos at one of these sites? Contact us for a free case evaluation. 
            Our experienced attorneys are here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg sm:max-w-none mx-auto">
            <a 
              href="tel:855-385-9532" 
              className="bg-legal-red hover:bg-red-700 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold transition-colors"
            >
              Call Now: 855-385-9532
            </a>
            <button 
              onClick={scrollToMap}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold transition-colors"
            >
              View Exposure Sites
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
