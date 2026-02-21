export default function StatsBanner() {
  return (
    <section className="bg-white py-8 sm:py-12 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-navy mb-1 sm:mb-2">126</div>
              <div className="text-sm sm:text-base text-legal-gray">Kentucky Sites</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-navy mb-1 sm:mb-2">$35.7M</div>
              <div className="text-sm sm:text-base text-legal-gray">Top Settlement*</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-navy mb-1 sm:mb-2">15+</div>
              <div className="text-sm sm:text-base text-legal-gray">Major Verdicts*</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-navy mb-1 sm:mb-2">$2.4M+</div>
              <div className="text-sm sm:text-base text-legal-gray">Average Settlement*</div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-legal-gray italic">
              *Past results do not guarantee future outcomes. Each case is unique and results depend on specific facts and circumstances.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
