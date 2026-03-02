import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaInstagram, FaArrowRight } from 'react-icons/fa';
import { locationInfo as defaultLocationInfo } from '../data/collections';
import Head from 'next/head';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Dynamic imports for performance and SSR safety
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-50 rounded-[2rem] animate-pulse flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest text-xs">Initializing Map Engine...</div>
});

const ModelPopup = dynamic(() => import('../components/ModelPopup'), {
  ssr: false
});

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [locationInfo, setLocationInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setSelectedLocation(null);
    }, 800);
  }, []);

  const handleSelectLocation = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  // Load initial data
  useEffect(() => {
    setLocationInfo(defaultLocationInfo);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-xs uppercase tracking-[0.2em]">Synchronizing Voyage...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <title>VOYAGE ARTIFACTS | A 3D Global Curiosities Exploration</title>
        <meta name="description" content="Explore a curated collection of travel artifacts in immersive 3D. Each object tells a story of a place, a moment, and a journey." />
      </Head>

      <main className="relative bg-[#fafafe] min-h-screen font-sans selection:bg-black selection:text-white">

        {/* Unified Navigation - Match Admin Style */}
        <header className="fixed top-0 left-0 right-0 h-20 bg-black z-[100] flex items-center justify-between px-8 sm:px-12 shadow-2xl shadow-black/20">
          <div className="flex flex-col">
            <h1 className="text-white font-black tracking-tighter text-xl leading-none italic">VOYAGE ARTIFACTS</h1>
            <p className="text-gray-500 text-[9px] tracking-[0.3em] mt-1 uppercase font-bold">Curated By Adam Liu</p>
          </div>
          <a
            href="/admin"
            className="text-[10px] font-black bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all uppercase tracking-widest shadow-xl shadow-black/10"
          >
            Management Suite
          </a>
        </header>

        <div className="h-20"></div>

        {/* Premium Hero Section */}
        <section className="max-w-[1400px] mx-auto px-8 py-20 lg:py-32 flex flex-col items-center text-center">
          <div className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-in shadow-xl shadow-black/5">
            Now Live: Interactive Collection v2.0
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tightest leading-[0.9] text-black mb-10 max-w-5xl italic uppercase">
            Explore the stories <br />
            <span className="text-gray-200">left behind by time.</span>
          </h2>
          <div className="max-w-3xl bg-white border border-gray-100 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-black/[0.03] mt-4 relative overflow-hidden group">
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-medium italic relative z-10">
              "Every journey leaves behind meaningful treasures. This digital vault showcases objects from my travels, each holding a fragment of the destination, the culture, and the moment."
            </p>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          </div>
        </section>

        {/* Global Map Display */}
        <section className="max-w-[1500px] mx-auto px-8 mb-32">
          <div className="h-[500px] md:h-[650px] bg-white rounded-[4rem] overflow-hidden shadow-2xl shadow-black/[0.05] border border-white/50 relative p-4 group">
            <div className="absolute top-10 left-10 z-10 bg-black/90 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/10 max-w-[200px] group-hover:-translate-y-2 transition-transform duration-500">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-gray-400">Tactical Map</p>
              <p className="text-xs font-bold leading-tight">Interact with artifacts across the globe.</p>
            </div>
            <div className="w-full h-full rounded-[3rem] overflow-hidden grayscale-[0.3] contrast-[0.9] hover:grayscale-0 transition-all duration-1000">
              <Map
                locations={locationInfo}
                onSelectLocation={handleSelectLocation}
              />
            </div>
          </div>
        </section>

        {/* Gallery Grid - Match Admin Inventory Style */}
        <section className="max-w-[1400px] mx-auto px-8 pb-40">
          <div className="flex items-end justify-between mb-16 px-4">
            <div className="space-y-2">
              <h3 className="text-4xl font-black uppercase tracking-tighter leading-none italic">Artifact Highlights</h3>
              <p className="text-xs text-gray-400 font-bold tracking-[0.2em] uppercase">Latest Discoveries Cataloged</p>
            </div>
            <div className="h-0.5 flex-1 mx-12 bg-gray-100 mb-2 hidden md:block"></div>
            <div className="text-right">
              <p className="text-3xl font-black italic text-gray-200">{locationInfo.length}</p>
              <p className="text-[10px] font-black uppercase text-gray-300">Total Entries</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {locationInfo.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectLocation(item)}
                className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-black/[0.04] transition-all duration-500 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden relative flex items-center justify-center">
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest z-10 border border-white/50">
                      0{index + 1}
                    </div>
                    {item.modelPath ? (
                      <div className="text-[9px] text-gray-300 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                        Render Available
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                      <button className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        View in 3D <FaArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter leading-none group-hover:underline decoration-4 underline-offset-8 transition-all">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-4">
                      <p className="text-[10px] font-black text-gray-300 bg-gray-50 px-3 py-1.5 rounded-lg uppercase tracking-widest leading-none">{item.location}</p>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none border-l border-gray-200 pl-3">Cataloged {item.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Footer - Unified Branding */}
        <footer className="bg-black text-white pt-24 pb-12 rounded-t-[5rem]">
          <div className="max-w-[1400px] mx-auto px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tightest uppercase italic leading-none">VOYAGE <br /><span className="text-gray-600">ARTIFACTS</span></h2>
                  <p className="text-gray-500 text-xs font-bold tracking-[0.35em] mt-3 uppercase">Experimental Journey Digital Record</p>
                </div>
                <p className="text-gray-400 leading-relaxed font-medium text-lg max-w-md italic">
                  This archive documents artifacts from global expeditions, blending 3D visualization with personal storytelling. Created to hone digital narrative skills.
                </p>
              </div>

              <div className="flex flex-col md:items-end justify-between">
                <div className="space-y-6 md:text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 underline decoration-2 underline-offset-8 mb-4">Transmission Channel</p>
                  <div className="flex md:justify-end">
                    <a
                      href="https://www.instagram.com/adam.liou/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-500 shadow-2xl"
                      aria-label="Instagram"
                    >
                      <FaInstagram size={24} />
                    </a>
                  </div>
                </div>
                <div className="mt-20 md:mt-0 text-[9px] font-black text-gray-700 uppercase tracking-widest border border-zinc-900 px-6 py-3 rounded-full">
                  Design Language System: Clean Industrial v2.1
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} VOYAGE ARTIFACTS / ALL SYSTEMS NOMINAL
              </p>
              <div className="flex gap-6 text-[10px] font-black text-gray-800 uppercase tracking-widest">
                <span>Creative Archive</span>
                <span>Personal Project</span>
                <span>v2.0 Revision</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Dynamic Popup Engine */}
        {selectedLocation && (
          <ModelPopup
            selectedLocation={selectedLocation}
            isClosing={isClosing}
            onClose={handleClose}
          />
        )}

        <SpeedInsights />
      </main>

      <style jsx global>{`
        @font-face {
          font-family: 'Inter';
          src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        }
        body { background-color: #fafafe; cursor: crosshair; }
        ::selection { background: #000; color: #fff; }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .tracking-tightest { letter-spacing: -0.05em; }
      `}</style>
    </>
  );
}
