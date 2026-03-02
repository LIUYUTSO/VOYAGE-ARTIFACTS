import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Dynamic imports for performance and SSR safety
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-50 animate-pulse flex items-center justify-center text-gray-400 rounded-xl">Initializing Map...</div>
});

const ModelPreview = dynamic(() => import('../components/ModelPreview'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-50 animate-pulse flex items-center justify-center text-gray-400 rounded-xl">Initializing 3D Viewer...</div>
});

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [collections, setCollections] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    modelPath: '',
    scale: 1,
    intensity: 1.5,
    rotationY: 0,
    autoRotateSpeed: 2,
    coordinates: [35.6762, 139.6503],
    travelNote: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  // Load initial data and handle Localhost Auth
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Localhost bypasses "security" for convenience
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          setAuthorized(true);
        }

        const { locationInfo } = await import('../data/collections');
        setCollections(locationInfo);

        const res = await fetch('/api/getModels');
        const data = await res.json();
        setAvailableModels(data.models || []);

        setIsLoading(false);
      } catch (err) {
        console.error('Initial load failed:', err);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const checkPassword = () => {
    if (password === '45636112') {
      setAuthorized(true);
    } else {
      alert('Access Denied: Incorrect Security Key.');
    }
  };

  // Location search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (locationSearch && locationSearch.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/geocode?query=${encodeURIComponent(locationSearch)}`);
          if (!res.ok) throw new Error('Search failed');
          const data = await res.json();
          setSearchResults(data.results || []);
        } catch (err) {
          console.error('Search failed:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  const handleSelectLocation = (result) => {
    setNewItem({
      ...newItem,
      location: result.name.split(',')[0],
      coordinates: result.coordinates
    });
    setLocationSearch('');
    setSearchResults([]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm(`Confirm upload ${file.name} to GitHub cloud?`)) return;

    setIsSyncing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Content = event.target.result.split(',')[1];
        const res = await fetch('/api/github-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: `public/models/${file.name}`,
            content: base64Content,
            isBinary: true,
            message: `Upload new 3D model: ${file.name}`
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Model uploaded directly to GitHub! Vercel will rebuild soon.');
          setNewItem(prev => ({ ...prev, modelPath: `/models/${file.name}` }));
          setAvailableModels(prev => [...new Set([...prev, `/models/${file.name}`])]);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncCollectionsToCloud = async () => {
    if (!confirm('Synchronize all changes to production? This will trigger a site rebuild.')) return;
    setIsSyncing(true);
    try {
      const content = `export const locationInfo = ${JSON.stringify(collections, null, 2)};`;
      const res = await fetch('/api/github-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'data/collections.js',
          content: content,
          message: 'Update artifact manifest via CMS'
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Manifest synchronized! Site rebuild started (takes ~1 min).');
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (err) {
      alert('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      setCollections(prev => prev.map(item => item.id === editId ? { ...newItem, id: editId } : item));
      setEditMode(false);
      setEditId(null);
    } else {
      setCollections(prev => [...prev, { ...newItem, id: Date.now() }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      location: '',
      date: '',
      modelPath: '',
      scale: 1,
      intensity: 1.5,
      rotationY: 0,
      autoRotateSpeed: 2,
      coordinates: [35.6762, 139.6503],
      travelNote: ''
    });
    setLocationSearch('');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-white text-black rounded-3xl p-10 shadow-2xl overflow-hidden relative">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">Admin Login</h1>
          <p className="text-gray-400 mb-8 text-center text-sm font-medium">VOYAGE ARTIFACTS MANAGEMENT</p>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
                placeholder="Security Key"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-6 py-4 text-center font-semibold focus:border-black focus:bg-white transition-all outline-none text-black placeholder:text-gray-300"
              />
            </div>
            <button
              onClick={checkPassword}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10"
            >
              Authorize Access
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">Local Hostname Bypass Enabled for Developers</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-medium animate-pulse">Syncing with repository...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 pt-24">
      {/* Header - Voyage Clean Style */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-black z-50 flex items-center justify-between px-8 sm:px-12 backdrop-blur-md bg-opacity-95">
        <div className="flex flex-col">
          <h1 className="text-white font-bold tracking-tight text-xl leading-none">VOYAGE CMS</h1>
          <p className="text-gray-400 text-[10px] tracking-widest mt-1 uppercase">Curated Travel Collections</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            disabled={isSyncing}
            onClick={syncCollectionsToCloud}
            className={`text-xs font-bold bg-white text-black px-6 py-3 rounded-full hover:bg-gray-100 transition-all shadow-xl shadow-black/20 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSyncing ? 'Syncing...' : 'Commit & Deploy Changes'}
          </button>
        </div>
      </header>

      <main className="px-6 sm:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Left Column: Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-black rounded-full"></span>
                  {editMode ? 'Edit Artifact Information' : 'Catalog New Artifact'}
                </h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-4 italic">Artifact ID: {editMode ? editId : 'NEW_ENTRY'}</p>
              </div>

              {/* Integrated Form 3D Preview */}
              <div className="w-full md:w-48 h-48 bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm relative group">
                <div className="absolute inset-0 z-10 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                  <span className="text-[8px] font-black text-white px-3 py-1 bg-black rounded-full uppercase tracking-widest">Live Engine</span>
                </div>
                {newItem.modelPath ? (
                  <ModelPreview
                    modelPath={newItem.modelPath}
                    scale={newItem.scale}
                    intensity={newItem.intensity}
                    rotationY={newItem.rotationY}
                    autoRotateSpeed={newItem.autoRotateSpeed}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-200 font-bold uppercase tracking-[0.2em] text-center px-4 italic">Awaiting Asset</div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Artifact Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Vintage Postcard"
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Extraction Date</label>
                  <input
                    type="date"
                    value={newItem.date}
                    onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all font-semibold text-gray-900"
                    required
                  />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Geographic Locale</label>
                  <input
                    type="text"
                    value={locationSearch || newItem.location}
                    onChange={e => setLocationSearch(e.target.value)}
                    placeholder="Search city, country..."
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-200"
                    required
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-[60]">
                      {searchResults.map(res => (
                        <div
                          key={res.id}
                          onClick={() => handleSelectLocation(res)}
                          className="px-6 py-4 hover:bg-gray-50 cursor-pointer text-sm font-semibold border-b border-gray-50 last:border-none transition-colors"
                        >
                          {res.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Object Scale Factor</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItem.scale}
                    onChange={e => setNewItem({ ...newItem, scale: parseFloat(e.target.value) })}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all font-semibold text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">3D Asset Source (.glb)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={newItem.modelPath}
                    onChange={e => setNewItem({ ...newItem, modelPath: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all font-semibold text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">Select from library...</option>
                    {availableModels.map(m => (
                      <option key={m} value={m}>{m.replace('/models/', '')}</option>
                    ))}
                  </select>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".glb,.gltf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-5 py-3.5 font-bold flex items-center justify-center gap-2 group-hover:bg-gray-100 transition-all text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      Direct Cloud Upload
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Brief Description</label>
                <textarea
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all font-semibold text-gray-900 resize-none placeholder:text-gray-200"
                  required
                />
              </div>

              {/* 3D Display Engine Control Panel */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                  Display Engine Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brightness</label>
                      <span className="text-[10px] font-black text-black">{newItem.intensity}x</span>
                    </div>
                    <input
                      type="range" min="0.5" max="4" step="0.1"
                      value={newItem.intensity}
                      onChange={e => setNewItem({ ...newItem, intensity: parseFloat(e.target.value) })}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initial Angle</label>
                      <span className="text-[10px] font-black text-black">{newItem.rotationY}°</span>
                    </div>
                    <input
                      type="range" min="0" max="360" step="1"
                      value={newItem.rotationY}
                      onChange={e => setNewItem({ ...newItem, rotationY: parseInt(e.target.value) })}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spin Speed</label>
                      <span className="text-[10px] font-black text-black">{newItem.autoRotateSpeed}</span>
                    </div>
                    <input
                      type="range" min="0" max="10" step="0.5"
                      value={newItem.autoRotateSpeed}
                      onChange={e => setNewItem({ ...newItem, autoRotateSpeed: parseFloat(e.target.value) })}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Travel Memoirs</label>
                <textarea
                  value={newItem.travelNote}
                  onChange={e => setNewItem({ ...newItem, travelNote: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all font-semibold text-gray-900 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/5 active:scale-[0.99]">
                  {editMode ? 'Update Database Entry' : 'Add to Collection'}
                </button>
                {editMode && (
                  <button type="button" onClick={() => { setEditMode(false); resetForm(); }} className="px-8 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Collection Inventory */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Collection Inventory ({collections.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collections.map(item => (
                <div key={item.id} className="group bg-white border border-gray-100 p-6 rounded-3xl flex flex-col justify-between hover:shadow-xl hover:shadow-black/[0.02] transition-all">
                  <div className="space-y-4">
                    <div className="w-full h-40 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center relative group/inner">
                      {item.modelPath ? (
                        <div className="w-full h-full opacity-60 group-hover/inner:opacity-100 transition-opacity">
                          <ModelPreview
                            modelPath={item.modelPath}
                            scale={item.scale || 1}
                            intensity={item.intensity || 1.5}
                            rotationY={item.rotationY || 0}
                            autoRotateSpeed={item.autoRotateSpeed || 2}
                          />
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-200 font-bold">NO MODEL</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 group-hover:text-black transition-colors">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 font-black tracking-widest uppercase mt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">{item.location}</span>
                        <span className="opacity-50">/</span>
                        <span>{item.date}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => { setEditMode(true); setEditId(item.id); setNewItem({ ...item }); }} className="flex-1 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-600 hover:bg-black hover:text-white transition-all">
                      EDIT
                    </button>
                    <button onClick={() => { if (confirm('Delete artifact?')) setCollections(prev => prev.filter(i => i.id !== item.id)) }} className="flex-1 py-2.5 bg-transparent border border-gray-100 rounded-xl font-bold text-xs text-gray-400 hover:border-red-100 hover:text-red-500 transition-all">
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Dynamic Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 h-fit">
          <section className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl shadow-black/5 h-[650px]">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.2em] text-gray-300 uppercase">Interactive Engine Preview</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-100"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-100"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-100"></div>
              </div>
            </div>
            <div className="flex-1 relative bg-gray-50">
              {/* 3D Preview Overlay */}
              <div className="absolute top-6 left-6 w-64 h-64 bg-white/80 backdrop-blur-md rounded-3xl z-10 shadow-xl border border-white/50 overflow-hidden">
                {newItem.modelPath ? (
                  <ModelPreview
                    modelPath={newItem.modelPath}
                    scale={newItem.scale}
                    intensity={newItem.intensity}
                    rotationY={newItem.rotationY}
                    autoRotateSpeed={newItem.autoRotateSpeed}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-gray-200 font-bold uppercase tracking-widest px-8 text-center italic">Awaiting Asset</div>
                )}
              </div>
              {/* Map Preview */}
              <div className="w-full h-full rounded-b-[2.5rem] overflow-hidden grayscale-[0.5] contrast-[0.8] opacity-80">
                <Map locations={[newItem]} center={newItem.coordinates} />
              </div>
            </div>
            <div className="p-8 bg-black">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">System Status: Active</p>
              </div>
              <p className="text-sm font-medium text-white/90 leading-relaxed font-mono italic">
                {editMode ? `REDACTING RECORD [id:${editId}]` : 'CORE ENGINE READY FOR ARTIFACT CATALOGING...'}
              </p>
            </div>
          </section>

          {/* Cloud Info Hub */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Active Repository</p>
                <p className="text-xl font-bold tracking-tight text-gray-900 group-hover:underline">VOYAGE-ARTIFACTS / <span className="text-gray-400 font-medium">main</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Manifest Size</p>
                <p className="text-3xl font-black text-black leading-none">{collections.length}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-700"></div>
          </section>
        </div>
      </main>

      {/* Global CSS Overrides */}
      <style jsx global>{`
        input::placeholder { color: #e2e8f0; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        body { background-color: #f8fafc; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}