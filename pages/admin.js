import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Dynamic imports for performance and SSR safety
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="h-full bg-zinc-200 animate-pulse flex items-center justify-center text-zinc-400 font-bold">Initializing Map...</div>
});

const ModelPreview = dynamic(() => import('../components/ModelPreview'), {
  ssr: false,
  loading: () => <div className="h-full bg-zinc-200 animate-pulse flex items-center justify-center text-zinc-400 font-bold">Initializing 3D Viewer...</div>
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
        // Localhost bypasses "security" for convenience as requested
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
      coordinates: [35.6762, 139.6503],
      travelNote: ''
    });
    setLocationSearch('');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-6 text-zinc-900 font-sans">
        <div className="max-w-md w-full bg-white border-8 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-5xl font-black tracking-tighter mb-6 italic uppercase leading-none border-b-8 border-black pb-4">RESTRICTED<br />ACCESS</h1>
          <p className="text-zinc-600 mb-10 font-bold text-lg leading-tight tracking-tight">Voyage Artifacts Management Console requires authorization.</p>

          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2">Security Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
              placeholder="••••••••"
              className="w-full bg-zinc-100 border-4 border-black px-6 py-5 text-2xl font-black focus:bg-white outline-none transition-all placeholder:text-zinc-300"
            />
            <button
              onClick={checkPassword}
              className="w-full bg-black text-white font-black py-6 text-xl hover:bg-zinc-800 transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
            >
              AUTHORIZE SESSION
            </button>
          </div>

          <div className="mt-8 bg-yellow-200 border-4 border-black p-4 text-xs font-black uppercase tracking-tighter text-black leading-none">
            Developer Mode: Hostname must be 'localhost' to bypass auth requirements.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen bg-white text-black flex items-center justify-center font-black text-2xl animate-pulse italic">SYNCING WITH REPOSITORY...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-20 overflow-x-hidden pt-24">
      {/* Header - Industrial High Contrast */}
      <header className="fixed top-0 left-0 right-0 h-24 border-b-8 border-black bg-white z-50 flex items-center justify-between px-12">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-3xl italic ring-8 ring-zinc-100">V</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">VOYAGE CMS</h1>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-1">Global Artifact Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            disabled={isSyncing}
            onClick={syncCollectionsToCloud}
            className={`text-sm bg-black text-white px-8 py-4 border-4 border-black hover:bg-zinc-800 transition-all font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] active:translate-x-1 active:translate-y-1 active:shadow-none ${isSyncing ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
          >
            {isSyncing ? 'PUSHING CHANGES...' : 'COMMIT & DEPLOY TO PRODUCTION'}
          </button>
        </div>
      </header>

      <main className="px-12 max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-16">

        {/* Left Column: Input Panel (6 Cols) */}
        <div className="xl:col-span-7 space-y-12">
          <section className="bg-white p-12 border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
            <h2 className="text-3xl font-black mb-12 flex items-center gap-6 italic">
              <span className="w-4 h-12 bg-yellow-400 border-4 border-black"></span>
              {editMode ? 'REDACTING RECORD' : 'CATALOG NEW ASSET'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-xs font-black text-black tracking-[0.2em] uppercase">01 Artifact Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="E.g. Ancient Vase"
                    className="w-full bg-zinc-50 border-4 border-zinc-200 px-6 py-5 focus:border-black focus:bg-white outline-none transition-all font-black text-xl text-black placeholder:text-zinc-200"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-black tracking-[0.2em] uppercase">02 Extraction Date</label>
                  <input
                    type="date"
                    value={newItem.date}
                    onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                    className="w-full bg-zinc-50 border-4 border-zinc-200 px-6 py-5 focus:border-black focus:bg-white outline-none transition-all font-black text-xl text-black"
                    required
                  />
                </div>
                <div className="space-y-4 relative">
                  <label className="text-xs font-black text-black tracking-[0.2em] uppercase">03 Target Coordinates</label>
                  <input
                    type="text"
                    value={locationSearch || newItem.location}
                    onChange={e => setLocationSearch(e.target.value)}
                    placeholder="Search Location..."
                    className="w-full bg-zinc-50 border-4 border-zinc-200 px-6 py-5 focus:border-black focus:bg-white outline-none transition-all font-black text-xl text-black placeholder:text-zinc-200"
                    required
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white border-8 border-black shadow-2xl overflow-hidden z-[60]">
                      {searchResults.map(res => (
                        <div
                          key={res.id}
                          onClick={() => handleSelectLocation(res)}
                          className="px-8 py-5 hover:bg-black hover:text-white cursor-pointer text-sm font-black border-b-4 border-zinc-100 last:border-none transition-colors"
                        >
                          {res.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-black tracking-[0.2em] uppercase">04 Scale Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItem.scale}
                    onChange={e => setNewItem({ ...newItem, scale: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-50 border-4 border-zinc-200 px-6 py-5 focus:border-black focus:bg-white outline-none transition-all font-black text-xl text-black"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-black tracking-[0.2em] uppercase">05 Asset Source (.glb)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select
                    value={newItem.modelPath}
                    onChange={e => setNewItem({ ...newItem, modelPath: e.target.value })}
                    className="flex-1 bg-zinc-50 border-4 border-zinc-200 px-6 py-5 focus:border-black focus:bg-white outline-none transition-all font-black text-lg text-black appearance-none cursor-pointer"
                  >
                    <option value="">Library Selection</option>
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
                    <div className="w-full h-full bg-zinc-50 border-4 border-black border-dashed px-6 py-5 font-black flex items-center justify-center gap-3 group-hover:bg-zinc-100 transition-all text-sm italic">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      PUSH TO GITHUB CLOUD
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-black tracking-[0.2em] uppercase">06 Public Description</label>
                <textarea
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-50 border-4 border-zinc-200 px-6 py-5 focus:border-black focus:bg-white outline-none transition-all font-black text-lg text-black resize-none placeholder:text-zinc-200"
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-black tracking-[0.2em] uppercase">07 Internal Field Notes</label>
                <textarea
                  value={newItem.travelNote}
                  onChange={e => setNewItem({ ...newItem, travelNote: e.target.value })}
                  rows={4}
                  className="w-full bg-zinc-50 border-4 border-zinc-200 px-6 py-5 focus:border-black focus:bg-white outline-none transition-all font-black text-lg text-black resize-none"
                />
              </div>

              <div className="flex gap-6 pt-10">
                <button type="submit" className="flex-1 bg-black text-white font-black py-7 text-2xl rounded-none hover:bg-zinc-800 transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-2 active:translate-y-2 uppercase italic tracking-tighter">
                  {editMode ? 'UPDATE RECORD' : 'SAVE TO MANIFEST'}
                </button>
                {editMode && (
                  <button type="button" onClick={() => { setEditMode(false); resetForm(); }} className="px-12 bg-white border-8 border-black font-black hover:bg-zinc-50 transition-all uppercase tracking-tighter">
                    ABORT
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Collection Grid */}
          <section className="space-y-8">
            <h3 className="text-sm font-black text-black tracking-[0.3em] uppercase underline decoration-8 decoration-zinc-200 underline-offset-8">INVENTORY STATUS ({collections.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collections.map(item => (
                <div key={item.id} className="group bg-white border-8 border-black p-8 flex flex-col justify-between hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="space-y-6">
                    <div className="w-full h-40 bg-zinc-100 border-4 border-black overflow-hidden flex items-center justify-center relative">
                      {item.modelPath && <div className="text-[10px] text-zinc-900 font-black uppercase italic tracking-tight text-center bg-white border-4 border-black px-4 py-2 rotate-[-5deg] shadow-lg">LINKED: {item.modelPath.split('/').pop()}</div>}
                    </div>
                    <div>
                      <h4 className="font-black text-2xl uppercase tracking-tighter italic leading-none">{item.name}</h4>
                      <p className="text-xs text-zinc-400 font-black tracking-widest uppercase mt-3">{item.location} / {item.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={() => { setEditMode(true); setEditId(item.id); setNewItem({ ...item }); }} className="flex-1 py-4 bg-zinc-100 border-4 border-black font-black text-sm hover:bg-black hover:text-white transition-all uppercase">
                      EDIT
                    </button>
                    <button onClick={() => { if (confirm('Permanently delete?')) setCollections(prev => prev.filter(i => i.id !== item.id)) }} className="flex-1 py-4 bg-white border-4 border-black font-black text-sm hover:bg-red-500 hover:text-white transition-all uppercase">
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Preview Panel (5 Cols) */}
        <div className="xl:col-span-5 space-y-12 xl:sticky xl:top-36 h-fit">
          <section className="bg-white border-8 border-black overflow-hidden flex flex-col shadow-[16px_16px_0px_0px_rgba(0,0,0,0.05)] h-[700px]">
            <div className="p-8 border-b-8 border-black flex items-center justify-between bg-zinc-100">
              <span className="font-black tracking-[0.2em] text-black uppercase italic">ENGINE RENDER 1.0</span>
              <div className="flex gap-3">
                <div className="w-4 h-4 border-4 border-black bg-white"></div>
                <div className="w-4 h-4 border-4 border-black bg-zinc-400"></div>
                <div className="w-4 h-4 border-4 border-black bg-black"></div>
              </div>
            </div>
            <div className="flex-1 relative bg-zinc-200">
              {/* 3D Preview (Mini) - Brutalist Style */}
              <div className="absolute top-8 left-8 w-72 h-72 bg-white border-8 border-black z-10 shadow-2xl overflow-hidden pointer-events-none">
                {newItem.modelPath ? (
                  <ModelPreview modelPath={newItem.modelPath} scale={newItem.scale} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-zinc-300 font-black italic px-8 text-center uppercase tracking-widest leading-loose">ASSET DATA MISSING<br />WAITING FOR SELECTION</div>
                )}
              </div>
              {/* Map Preview */}
              <div className="w-full h-full">
                <Map locations={[newItem]} center={newItem.coordinates} />
              </div>
            </div>
            <div className="p-8 bg-black text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                <p className="text-xs font-black tracking-widest uppercase italic">Console Log:</p>
              </div>
              <p className="text-sm font-bold text-zinc-400 font-mono tracking-tight leading-relaxed">
                {editMode ? `[MODE: REDACT] [UID: ${editId}] [COORD: ${newItem.coordinates.join(',')}]` : '[MODE: CATALOG] [READY FOR INPUT]'}
              </p>
            </div>
          </section>

          {/* Cloud Stat Tracker */}
          <section className="bg-yellow-400 text-black p-10 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-black/10">
              <h3 className="text-sm font-black tracking-[0.4em] uppercase">CLOUD HUB REPOSITORY</h3>
              <span className="bg-black text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest">ACTIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-black/50 font-black uppercase tracking-widest">Inventory Size</p>
                <p className="text-4xl font-black italic">{collections.length} UNITS</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-black/50 font-black uppercase tracking-widest">Sync Path</p>
                <p className="text-xs font-black truncate leading-tight mt-2 uppercase tracking-tight overflow-hidden">LIUYUTSO / V-ART-FACTS</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Industrial CSS */}
      <style jsx global>{`
        input::placeholder { color: #d4d4d8; font-weight: 900; }
        ::-webkit-scrollbar { width: 16px; height: 16px; }
        ::-webkit-scrollbar-track { background: #white; border-left: 8px solid black; }
        ::-webkit-scrollbar-thumb { background: black; border: 4px solid white; }
        body { background-color: #fafafa; }
        input, select, textarea { border-radius: 0 !important; }
        @font-face {
          font-family: 'Inter';
          src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap');
        }
      `}</style>
    </div>
  );
}