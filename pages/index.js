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

const ModelPreview = dynamic(() => import('../components/ModelPreview'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center text-gray-200 text-[8px] font-black uppercase tracking-widest">Warping Asset...</div>
});

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [locationInfo, setLocationInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

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

  // Handle scroll for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

      <main className="relative bg-[#fafafe] min-h-screen font-sans selection:bg-black selection:text-white overflow-x-hidden">

        {/* Unified Navigation */}
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

        {/* Premium Hero Section with Parallax */}
        <section className="max-w-[1400px] mx-auto px-8 py-20 lg:py-40 flex flex-col items-center text-center relative pointer-events-none">
          <div
            className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-fade-in shadow-xl shadow-black/5 pointer-events-auto"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            Now Live: Interactive Collection v2.1
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tightest leading-[1] sm:leading-[0.8] text-black mb-12 max-w-6xl italic uppercase relative">
            <span
              className="block relative z-20"
              style={{ transform: typeof window !== 'undefined' && window.innerWidth > 768 ? `translateX(${scrollY * -0.15}px)` : 'none' }}
            >
              Explore the stories
            </span>
            <span
              className="block text-gray-400 mt-4 opacity-70"
              style={{ transform: typeof window !== 'undefined' && window.innerWidth > 768 ? `translateX(${scrollY * 0.25}px)` : 'none' }}
            >
              left behind by time.
            </span>
          </h2>

          <div
            className="max-w-3xl bg-white border border-gray-100 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-black/[0.03] mt-12 relative overflow-hidden group pointer-events-auto"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          >
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-semibold italic relative z-10 transition-colors group-hover:text-black duration-500">
              "Every journey leaves behind meaningful treasures. This digital vault showcases objects from my travels, each holding a fragment of the destination, the culture, and the moment."
            </p>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          </div>
        </section>

        {/* Global Map Display - Full Bleed Design */}
        <section className="w-full mb-40 overflow-hidden relative">
          <div className="h-[600px] md:h-[850px] bg-black relative group">
            <div className="absolute top-12 left-12 z-20 bg-black/95 backdrop-blur-2xl text-white px-7 py-5 rounded-3xl shadow-2xl border border-white/10 max-w-[220px] group-hover:-translate-y-2 transition-transform duration-700 pointer-events-none">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-gray-400">Tactical Archive</p>
              <p className="text-sm font-bold leading-tight italic">Drag and zoom to explore curiosities across the globe.</p>
            </div>

            <div className="w-full h-full grayscale-[0.3] contrast-[1.05] hover:grayscale-0 transition-all duration-1000">
              <Map
                locations={locationInfo}
                onSelectLocation={handleSelectLocation}
              />
            </div>

            {/* Artistic Overlays */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#fafafe] to-transparent pointer-events-none z-10"></div>
          </div>
        </section>

        {/* Gallery Section - Horizontal Exhibition for Mobile */}
        <section className="max-w-[1400px] mx-auto px-6 sm:px-8 pb-32 sm:pb-40">
          <div className="flex items-end justify-between mb-10 sm:mb-20 px-2 sm:px-4">
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none italic">Manifest</h3>
              <p className="text-[8px] sm:text-xs text-gray-400 font-bold tracking-[0.3em] uppercase">Archive Records</p>
            </div>
            <div className="h-px flex-1 mx-6 sm:mx-12 bg-gray-100 mb-2 hidden md:block"></div>
            <div className="text-right">
              <p className="text-2xl sm:text-4xl font-black italic text-gray-200">{locationInfo.length}</p>
              <p className="text-[7px] sm:text-[10px] font-black uppercase text-gray-300 tracking-widest">Total</p>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-8 sm:pb-0 scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 -mx-6 px-6 sm:mx-0 sm:px-0">
            {locationInfo.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectLocation(item)}
                className="group flex-shrink-0 w-[240px] sm:w-auto bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-2xl hover:shadow-black/[0.04] transition-all duration-700 cursor-pointer flex flex-col justify-between snap-center"
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="h-48 sm:h-72 bg-gray-50/50 rounded-[1.2rem] sm:rounded-[2rem] overflow-hidden relative group/canvas">
                    {/* Artifact Index */}
                    <div className="absolute top-3 left-3 sm:top-5 left-5 bg-white shadow-xl px-2 py-1 rounded-lg text-[7px] sm:text-[9px] font-black uppercase tracking-widest z-10 border border-gray-50 text-black group-hover:bg-black group-hover:text-white transition-colors duration-500">
                      R-0{index + 1}
                    </div>

                    {/* Live 3D Preview inside Card */}
                    <div className="w-full h-full relative z-0 opacity-90 group-hover:opacity-100 transition-opacity duration-700">
                      {item.modelPath ? (
                        <ModelPreview
                          modelPath={item.modelPath}
                          scale={(item.scale || 1) * 0.85}
                          intensity={item.intensity || 1.5}
                          rotationY={item.rotationY || 0}
                          autoRotateSpeed={item.autoRotateSpeed || 2}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-200 font-bold uppercase tracking-widest italic">Syncing...</div>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-700 z-10 pointer-events-none">
                      <div className="w-full bg-black text-white py-3 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl shadow-black/20">
                        View <FaArrowRight size={8} />
                      </div>
                    </div>
                  </div>

                  <div className="px-1 sm:px-2">
                    {/* Fixed height title container for vertical alignment */}
                    <div className="h-16 sm:h-24 md:h-28 flex flex-col justify-end mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-2xl md:text-3xl font-black uppercase tracking-tightest leading-[1.1] text-black line-clamp-2 sm:line-clamp-3 transition-colors group-hover:text-gray-600">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
                      <p className="text-[7px] sm:text-[9px] font-black text-white bg-black px-2 py-1 rounded-md sm:rounded-lg uppercase tracking-widest leading-none shadow-lg shadow-black/5 whitespace-nowrap">
                        {item.location}
                      </p>
                      <p className="text-[7px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none pl-2 border-l border-gray-100 whitespace-nowrap">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* Global Footer */}
      <footer className="bg-black text-white pt-32 pb-16 rounded-t-[6rem] relative z-10">
        <div className="max-w-[1400px] mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-24">
            <div className="space-y-10">
              <div>
                <h2 className="text-5xl font-black tracking-tightest uppercase italic leading-none">VOYAGE <br /><span className="text-gray-700">ARTIFACTS</span></h2>
                <p className="text-gray-600 text-xs font-bold tracking-[0.4em] mt-4 uppercase">Experimental Journey Digital Record</p>
              </div>
              <p className="text-gray-400 leading-relaxed font-semibold text-xl max-w-lg italic opacity-80">
                This archive documents curated artifacts from global expeditions, blending interactive 3D visualization with deep personal storytelling.
              </p>
            </div>

            <div className="flex flex-col md:items-end justify-between">
              <div className="space-y-8 md:text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 underline decoration-2 underline-offset-8 mb-6">Transmission Channel</p>
                <div className="flex md:justify-end">
                  <a
                    href="https://www.instagram.com/adam.liou/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-20 h-20 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-700 shadow-2xl group"
                    aria-label="Instagram"
                  >
                    <FaInstagram size={28} className="group-hover:rotate-12 transition-transform duration-500" />
                  </a>
                </div>
              </div>
              <div className="mt-20 md:mt-0 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] border border-zinc-900 px-8 py-4 rounded-full bg-zinc-900/50">
                Design System: Premium Industrial v2.2
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-[0.3em]">
              &copy; {new Date().getFullYear()} VOYAGE ARTIFACTS / ALL SYSTEMS NOMINAL
            </p>
            <div className="flex gap-10 text-[10px] font-black text-gray-800 uppercase tracking-[0.4em]">
              <span className="hover:text-white transition-colors cursor-default">Archive Entry</span>
              <span className="hover:text-white transition-colors cursor-default">Adam Liou</span>
              <span className="hover:text-white transition-colors cursor-default">Revision 03</span>
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
    </main >

      <style jsx global>{`
        @font-face {
          font-family: 'Inter';
          src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        }
        body { background-color: #fafafe; cursor: crosshair; }
        ::selection { background: #000; color: #fff; }
        ::-webkit-scrollbar { width: 0; }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .tracking-tightest { letter-spacing: -0.06em; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
