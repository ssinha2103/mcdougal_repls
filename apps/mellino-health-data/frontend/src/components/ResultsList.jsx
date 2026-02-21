import HospitalCard from './HospitalCard';

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
          <div className="w-16 skeleton h-24 rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="flex gap-2 mt-2">
              <div className="skeleton h-7 w-28 rounded-lg" />
              <div className="skeleton h-7 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-12 text-center">
      <div className="mx-auto w-20 h-20 bg-light rounded-2xl flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </div>
      <h3 className="font-serif text-xl font-bold text-navy mb-2">Find Maternity Care Near You</h3>
      <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
        Enter your ZIP code and set your preferences to discover maternity hospitals in your area.
      </p>
    </div>
  );
}

function DesertWarning({ message }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div>
          <h3 className="font-serif font-bold text-amber-900 text-base">Maternity Care Desert Warning</h3>
          <p className="text-amber-800 text-sm mt-1 leading-relaxed">{message}</p>
          <p className="text-amber-700/80 text-sm mt-2">
            Try increasing your search distance or contact your healthcare provider for alternative options.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsList({ hospitals, loading, hasSearched, isDesert, desertMessage }) {
  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="skeleton h-6 w-48 rounded" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="mt-8">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="mt-8">
      {isDesert && <DesertWarning message={desertMessage} />}

      {hospitals.length > 0 && (
        <>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">
                {hospitals.length} Hospital{hospitals.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">Sorted by quality and distance for your needs</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-4.5L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
              Best match first
            </div>
          </div>

          <div className="space-y-4">
            {hospitals.map((hospital, index) => (
              <HospitalCard key={hospital.id} hospital={hospital} rank={index + 1} />
            ))}
          </div>
        </>
      )}

      {hospitals.length === 0 && !isDesert && (
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg font-bold text-gray-700 mb-1">No Hospitals Found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search criteria or increasing the distance.</p>
        </div>
      )}
    </div>
  );
}
