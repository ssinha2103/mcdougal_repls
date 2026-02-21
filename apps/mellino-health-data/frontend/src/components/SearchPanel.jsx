export default function SearchPanel({
  zipCode, setZipCode,
  maxDistance, setMaxDistance,
  isHighRisk, setIsHighRisk,
  priorCSection, setPriorCSection,
  conditions, handleConditionChange,
  preferBirthingFriendly, setPreferBirthingFriendly,
  loading, error, onSearch
}) {
  const riskLevel = (() => {
    const conditionCount = Object.values(conditions).filter(Boolean).length;
    if (isHighRisk || priorCSection || conditionCount >= 2) return 'high';
    if (conditionCount === 1) return 'medium';
    return 'low';
  })();

  const riskColors = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200'
  };

  const riskLabels = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden">
      <div className="bg-gradient-to-r from-navy to-navy-light px-6 py-4">
        <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          Search Criteria
        </h2>
      </div>

      <form onSubmit={onSearch} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Enter Ohio ZIP code"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/40 focus:border-blue bg-gray-50/50 text-gray-800 placeholder-gray-400 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Maximum Distance: <span className="text-blue font-bold">{maxDistance} miles</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseInt(e.target.value))}
            className="w-full mt-1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-0.5">
            <span>10 mi</span>
            <span>25 mi</span>
            <span>50 mi</span>
            <span>75 mi</span>
            <span>100 mi</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Risk Assessment</h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${riskColors[riskLevel]}`}>
              {riskLabels[riskLevel]}
            </span>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isHighRisk}
                onChange={(e) => setIsHighRisk(e.target.checked)}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">High-risk pregnancy</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={priorCSection}
                onChange={(e) => setPriorCSection(e.target.checked)}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Prior C-section</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Medical Conditions</h3>
          <div className="space-y-2.5">
            {[
              { key: 'diabetes', label: 'Diabetes' },
              { key: 'hypertension', label: 'Hypertension' },
              { key: 'preeclampsia', label: 'History of Preeclampsia' },
              { key: 'multiples', label: 'Multiple Pregnancy (twins, etc.)' },
              { key: 'advanced_age', label: 'Advanced Maternal Age (35+)' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={conditions[key]}
                  onChange={() => handleConditionChange(key)}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={preferBirthingFriendly}
              onChange={(e) => setPreferBirthingFriendly(e.target.checked)}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Prefer Birthing-Friendly hospitals
              </span>
              <p className="text-xs text-gray-400 mt-0.5">Prioritize hospitals with Birthing-Friendly designation</p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy text-white px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-blue hover:shadow-lg hover:shadow-blue/20 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Search Hospitals
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2 animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
