import React, { useEffect, useState, useMemo } from 'react';
import { fetchPrayerTimes } from './services/prayerService';
import { AppData, Mosque } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MosqueCard } from './components/MosqueCard';
import { FooterNotes } from './components/FooterNotes';
import { MapPin, Moon, Filter, ChevronDown, Landmark, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

// Simple Toast Component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all transform animate-slideUp ${
    type === 'success' ? 'bg-emerald-800 text-emerald-50' : 'bg-red-800 text-red-50'
  }`}>
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    <span className="font-medium text-sm">{message}</span>
  </div>
);

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Filter States
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedMosque, setSelectedMosque] = useState('All Mosques');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const result = await fetchPrayerTimes();
      setData(result);
      
      if (isManualRefresh) {
        showToast("Prayer times and notes synced successfully", 'success');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to load prayer times.';
      setError(msg);
      if (isManualRefresh) {
         showToast("Failed to refresh data", 'error');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset mosque selection when area changes
  useEffect(() => {
    setSelectedMosque('All Mosques');
  }, [selectedArea]);

  // Compute unique areas for the area dropdown
  const availableAreas = useMemo(() => {
    if (!data) return ['All Areas'];
    const areas = new Set(data.mosques.map(m => m.area));
    return ['All Areas', ...Array.from(areas).sort()];
  }, [data]);

  // Compute available mosques based on selected area
  const availableMosques = useMemo(() => {
    if (!data) return ['All Mosques'];
    
    let mosques = data.mosques;
    
    // Filter by area first if needed
    if (selectedArea !== 'All Areas') {
        mosques = mosques.filter(m => m.area === selectedArea);
    }
    
    // Extract unique names and sort
    const names = Array.from(new Set(mosques.map(m => m.name_en))).sort();
    return ['All Mosques', ...names];
  }, [data, selectedArea]);

  // Filter data for display
  const filteredData = useMemo(() => {
    const grouped: Record<string, Mosque[]> = {};
    if (!data) return grouped;
    
    data.mosques.forEach(m => {
      // Area Filter Logic
      const matchesArea = selectedArea === 'All Areas' || m.area === selectedArea;

      // Mosque Filter Logic
      const matchesMosque = selectedMosque === 'All Mosques' || m.name_en === selectedMosque;

      if (matchesArea && matchesMosque) {
        if (!grouped[m.area]) {
          grouped[m.area] = [];
        }
        grouped[m.area].push(m);
      }
    });

    return grouped;
  }, [data, selectedArea, selectedMosque]);

  if (loading && !data) return <LoadingSpinner />;

  if (error && !data) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-md text-center border border-red-200">
        <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
        <p>{error}</p>
        <button 
          onClick={() => loadData()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12 relative">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Logo / Title */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Moon className="w-6 h-6 text-emerald-100" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Namaz Ka Waqt</h1>
                {data?.metadata.last_updated && (
                  <p className="text-emerald-100 text-xs md:text-sm opacity-90">
                    Last updated: {data.metadata.last_updated}
                  </p>
                )}
              </div>
            </div>
            
            {/* Controls Container */}
            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
              
              {/* Refresh Button */}
              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800/50 hover:bg-emerald-900 border border-emerald-600 rounded-lg text-emerald-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {/* Area Filter Dropdown */}
              <div className="relative w-full md:w-64 h-[42px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-emerald-200" />
                </div>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="block w-full h-full pl-10 pr-10 py-2 border border-emerald-600 rounded-lg leading-5 bg-emerald-800/50 text-white focus:outline-none focus:bg-emerald-900 focus:border-white focus:ring-1 focus:ring-white sm:text-sm transition-colors appearance-none cursor-pointer"
                >
                  {availableAreas.map(area => (
                    <option key={area} value={area} className="text-slate-900 bg-white">
                      {area}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-emerald-200" />
                </div>
              </div>

              {/* Mosque Filter Dropdown */}
              <div className="relative w-full md:w-80 h-[42px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Landmark className="h-5 w-5 text-emerald-200" />
                </div>
                <select
                  value={selectedMosque}
                  onChange={(e) => setSelectedMosque(e.target.value)}
                  className="block w-full h-full pl-10 pr-10 py-2 border border-emerald-600 rounded-lg leading-5 bg-emerald-800/50 text-white focus:outline-none focus:bg-emerald-900 focus:border-white focus:ring-1 focus:ring-white sm:text-sm transition-colors appearance-none cursor-pointer"
                >
                  {availableMosques.map(mosque => (
                    <option key={mosque} value={mosque} className="text-slate-900 bg-white">
                      {mosque}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-emerald-200" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!data || Object.keys(filteredData).length === 0 ? (
           <div className="text-center py-12 text-slate-400">
             <p className="text-lg">
                No mosques found 
                {selectedArea !== 'All Areas' && ` in ${selectedArea}`}
                {selectedMosque !== 'All Mosques' && ` named "${selectedMosque}"`}
             </p>
           </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(filteredData).map(([area, mosques]) => (
              <section key={area} className="animate-fadeIn">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <MapPin className="text-emerald-600 w-5 h-5" />
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">{area}</h2>
                  <span className="text-slate-400 text-sm font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                    {mosques.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mosques.map((mosque, idx) => (
                    <MosqueCard key={`${area}-${idx}`} mosque={mosque} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer Notes */}
        {data && <FooterNotes notes={data.footer_notes} />}
      </main>
    </div>
  );
};

export default App;