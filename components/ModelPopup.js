import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ModelPreview = dynamic(() => import('./ModelPreview'), { ssr: false });

export default function ModelPopup({ selectedLocation, isClosing, onClose }) {
  const popupRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!selectedLocation) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 sm:p-12 transition-opacity duration-700 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop with premium blur */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-1000 ${isClosing ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
        onClick={onClose}
      />

      {/* Premium Content Card */}
      <div
        ref={popupRef}
        className={`relative w-full max-w-6xl h-[85vh] md:h-[80vh] bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isClosing ? 'scale-90 translate-y-20 opacity-0 rotate-[-2deg]' : 'scale-100 translate-y-0 opacity-100'}`}
      >
        {/* Left Side: Immersive 3D Viewer */}
        <div className="w-full md:w-3/5 h-[40vh] md:h-full bg-gray-50/50 relative group">
          <div className="absolute top-10 left-10 z-10 flex flex-col gap-2">
            <div className="bg-black text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl">3D ARTIFACT ENGINE</div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/50 text-gray-400 shadow-xl shadow-black/5">Scale: {selectedLocation.scale}x</div>
          </div>

          <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <ModelPreview modelPath={selectedLocation.modelPath} scale={selectedLocation.scale || 1} />
          </div>

          {/* Visual Guide Element */}
          <div className="absolute bottom-10 left-10 text-[9px] font-black uppercase tracking-widest text-gray-300 pointer-events-none opacity-40">Drag to rotate artifact 360°</div>
        </div>

        {/* Right Side: Narrative & Details */}
        <div className="w-full md:w-2/5 h-full bg-white flex flex-col border-l border-gray-50">
          <div className="p-10 md:p-14 overflow-y-auto flex-1 scrollbar-hide">
            <div className="mb-14">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Discovery Record No.{selectedLocation.id || 'N/A'}</p>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tightest leading-[0.9] italic mb-6">{selectedLocation.name}</h3>
              <div className="flex flex-wrap gap-3">
                <span className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedLocation.location}</span>
                <span className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedLocation.date}</span>
              </div>
            </div>

            <div className="space-y-10">
              <div className="relative">
                <div className="absolute -left-6 top-0 w-1 h-full bg-gray-50 rounded-full"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-3">Public Manifest</h4>
                <p className="text-gray-500 leading-relaxed font-medium text-lg">
                  {selectedLocation.description}
                </p>
              </div>

              <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-4">Field Memoir</h4>
                <p className="text-gray-400 text-sm leading-relaxed font-medium italic">
                  {selectedLocation.travelNote || 'No restricted memoirs cataloged for this artifact.'}
                </p>
              </div>
            </div>
          </div>

          {/* Close Action Bar */}
          <div className="p-10 md:p-14 border-t border-gray-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Global Status</span>
              <span className="text-xs font-bold text-green-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span> Synchronized
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
            >
              Exit Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}