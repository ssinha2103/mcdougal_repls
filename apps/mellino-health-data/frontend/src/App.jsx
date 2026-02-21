import { useState } from 'react'
import axios from 'axios'
import Header from './components/Header'
import SearchPanel from './components/SearchPanel'
import MapView from './components/MapView'
import ResultsList from './components/ResultsList'

function App() {
  const [zipCode, setZipCode] = useState('')
  const [maxDistance, setMaxDistance] = useState(50)
  const [isHighRisk, setIsHighRisk] = useState(false)
  const [priorCSection, setPriorCSection] = useState(false)
  const [conditions, setConditions] = useState({
    diabetes: false,
    hypertension: false,
    preeclampsia: false,
    multiples: false,
    advanced_age: false
  })
  const [preferBirthingFriendly, setPreferBirthingFriendly] = useState(false)

  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchLocation, setSearchLocation] = useState(null)
  const [isDesert, setIsDesert] = useState(false)
  const [desertMessage, setDesertMessage] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const [mapCenter, setMapCenter] = useState([39.9612, -82.9988])
  const [mapZoom, setMapZoom] = useState(7)

  const calculateRiskLevel = () => {
    const conditionCount = Object.values(conditions).filter(Boolean).length
    if (isHighRisk || priorCSection || conditionCount >= 2) return 'high'
    if (conditionCount === 1) return 'medium'
    return 'low'
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!zipCode || zipCode.length < 5) {
      setError('Please enter a valid 5-digit ZIP code')
      return
    }

    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const riskLevel = calculateRiskLevel()
      const maxDistanceKm = maxDistance * 1.60934

      const response = await axios.get('/api/hospitals/search', {
        params: {
          zip: zipCode,
          max_distance_km: maxDistanceKm,
          risk_level: riskLevel,
          prefer_birthing_friendly: preferBirthingFriendly
        }
      })

      setHospitals(response.data.hospitals)
      setSearchLocation(response.data.search_location)
      setIsDesert(response.data.is_desert)
      setDesertMessage(response.data.message)

      if (response.data.search_location) {
        setMapCenter([response.data.search_location.lat, response.data.search_location.lng])
        setMapZoom(9)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while searching')
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const handleConditionChange = (condition) => {
    setConditions(prev => ({
      ...prev,
      [condition]: !prev[condition]
    }))
  }

  return (
    <div className="min-h-screen bg-light flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-6">
              <SearchPanel
                zipCode={zipCode}
                setZipCode={setZipCode}
                maxDistance={maxDistance}
                setMaxDistance={setMaxDistance}
                isHighRisk={isHighRisk}
                setIsHighRisk={setIsHighRisk}
                priorCSection={priorCSection}
                setPriorCSection={setPriorCSection}
                conditions={conditions}
                handleConditionChange={handleConditionChange}
                preferBirthingFriendly={preferBirthingFriendly}
                setPreferBirthingFriendly={setPreferBirthingFriendly}
                loading={loading}
                error={error}
                onSearch={handleSearch}
              />
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <MapView
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              searchLocation={searchLocation}
              hospitals={hospitals}
            />

            <ResultsList
              hospitals={hospitals}
              loading={loading}
              hasSearched={hasSearched}
              isDesert={isDesert}
              desertMessage={desertMessage}
            />
          </div>
        </div>
      </main>

      <footer className="bg-navy text-white/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm">
                Data sourced from{' '}
                <a
                  href="https://data.cms.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors underline underline-offset-2"
                >
                  CMS.gov
                </a>
                {' '}— Centers for Medicare & Medicaid Services
              </p>
              <p className="text-xs mt-1 text-white/40">
                This tool is for informational purposes only and does not constitute medical advice.
              </p>
            </div>
            <div className="text-xs text-white/40">
              © {new Date().getFullYear()} Ohio Maternity Care Finder
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
