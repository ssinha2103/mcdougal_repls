function getCsectionBadge(rate) {
  if (!rate || rate === 'Not Available') return null;
  const rateNum = parseFloat(rate.replace('%', ''));
  if (isNaN(rateNum)) return null;
  if (rateNum <= 23.9) return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Low' };
  if (rateNum <= 29.9) return { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Moderate' };
  return { color: 'bg-red-50 text-red-700 border-red-200', label: 'High' };
}

function getSmmBadge(rate) {
  if (!rate || rate === 'Not Available') return null;
  const rateNum = parseFloat(rate.replace('%', ''));
  if (isNaN(rateNum)) return null;
  if (rateNum <= 1.5) return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Low' };
  if (rateNum <= 3.0) return { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Moderate' };
  return { color: 'bg-red-50 text-red-700 border-red-200', label: 'High' };
}

export default function HospitalCard({ hospital, rank }) {
  const cBadge = getCsectionBadge(hospital.cesarean_rate);
  const smmBadge = getSmmBadge(hospital.smm_rate);
  const hasAnyMetric = cBadge || smmBadge;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fade-in"
      style={{ animationDelay: `${rank * 50}ms` }}
    >
      <div className="flex">
        <div className="w-14 sm:w-16 flex-shrink-0 bg-gradient-to-b from-navy to-blue flex flex-col items-center justify-center text-white py-4">
          <span className="text-xs font-medium opacity-70">#</span>
          <span className="text-xl font-bold">{rank}</span>
        </div>

        <div className="flex-1 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2">
                <h3 className="font-serif font-bold text-lg text-navy leading-snug">
                  {hospital.facility_name}
                </h3>
                {hospital.is_birthing_friendly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gold to-gold-light text-white shadow-sm whitespace-nowrap">
                    ★ Birthing Friendly
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 flex items-start gap-1.5">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>{hospital.address}, {hospital.city}, {hospital.state} {hospital.zip_code}</span>
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
                  <span>{hospital.county} County</span>
                </p>
                {hospital.phone && (
                  <p className="text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    <a href={`tel:${hospital.phone}`} className="text-blue hover:text-navy hover:underline transition-colors font-medium">
                      {hospital.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="sm:text-right flex-shrink-0">
              <div className="inline-flex sm:flex sm:flex-col items-center sm:items-end gap-1 bg-light rounded-xl px-4 py-2.5">
                <span className="text-2xl font-bold text-navy">{hospital.distance_miles}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">miles</span>
              </div>
            </div>
          </div>

          {(hasAnyMetric || true) && (
            <div className="mt-4 pt-3.5 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Quality Metrics</h4>
              <div className="flex flex-wrap gap-2">
                {cBadge ? (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${cBadge.color}`}>
                    <span className="font-semibold">C-Section:</span> {hospital.cesarean_rate} ({cBadge.label})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                    <span>C-Section:</span> Data pending
                  </span>
                )}
                {smmBadge ? (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${smmBadge.color}`}>
                    <span className="font-semibold">SMM Rate:</span> {hospital.smm_rate} ({smmBadge.label})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                    <span>SMM Rate:</span> Data pending
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
