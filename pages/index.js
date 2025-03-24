import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaInstagram } from 'react-icons/fa';
import { locationInfo as defaultLocationInfo } from '../data/collections';
import Head from 'next/head';

// 動態導入組件
const Map = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse" />
});

const ModelPopup = dynamic(() => import('../components/ModelPopup'), {
  ssr: false
});

// 修改回原来的 useScrollPosition hook
const useScrollPosition = () => {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    let rafId;
    let ticking = false;

    const updateScrollPosition = () => {
      const scrollPosition = window.scrollY;
      const percent = Math.min(scrollPosition / 100, 1);
      setScrollPercent(percent);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // 初始化滚动位置
      handleScroll();

      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, []);

  return scrollPercent;
};

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [locationInfo, setLocationInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 使用自定义 Hook 替换原来的滚动监听逻辑
  const scrollPercent = useScrollPosition();

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

  // 從localStorage加載數據
  useEffect(() => {
    setLocationInfo(defaultLocationInfo);
    setIsLoading(false);
  }, []);
  
  // 在數據加載時顯示加載狀態
  if (isLoading) {
    return <div className="text-center py-10">Loading collections...</div>;
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <title>VOYAGE ARTIFACTS | Interactive 3D Travel Collection Showcase</title>
        {/* 动态更新标题和描述 */}
        {selectedLocation && (
          <>
            <meta name="description" content={`Explore ${selectedLocation.name} from ${selectedLocation.location} in our 3D travel collection showcase. ${selectedLocation.travelNotes}`} />
            <meta property="og:title" content={`${selectedLocation.name} | VOYAGE ARTIFACTS`} />
            <meta property="og:description" content={`Discover ${selectedLocation.name} from ${selectedLocation.location} in our interactive 3D showcase.`} />
          </>
        )}
      </Head>
      <main className="relative bg-black min-h-screen">
        {/* 表頭區域 - 修改表头部分的代码 */}
        <div 
          className="fixed top-0 left-0 right-0 w-full z-50"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${scrollPercent * 0.8})`,
            backdropFilter: `blur(${scrollPercent * 8}px)`,
            transition: 'background-color 0.2s ease-out, backdrop-filter 0.2s ease-out'
          }}
        >
          <div 
            className="relative max-w-3xl mx-auto text-center px-4"
            style={{
              transform: `scale(${1 - scrollPercent * 0.2})`,
              padding: `${Math.max(48 - scrollPercent * 36, 12)}px 1rem`,
              transition: 'transform 0.2s ease-out, padding 0.2s ease-out'
            }}
          >
            {/* 主標題 */}
            <div className="flex justify-center items-baseline space-x-3">
              <h1 
                className="font-bold tracking-tight"
                style={{
                  fontSize: `${Math.max(2.25 - scrollPercent * 0.75, 1.5)}rem`,
                  color: scrollPercent > 0 
                    ? `rgb(17, 24, 39)` 
                    : 'rgb(255, 255, 255)',
                  transition: 'font-size 0.2s ease-out, color 0.2s ease-out'
                }}
              >
                VOYAGE
              </h1>
              <h1 
                className="font-bold tracking-tight"
                style={{
                  fontSize: `${Math.max(2.25 - scrollPercent * 0.75, 1.5)}rem`,
                  color: scrollPercent > 0 
                    ? `rgb(17, 24, 39)` 
                    : 'rgb(255, 255, 255)',
                  transition: 'font-size 0.2s ease-out, color 0.2s ease-out'
                }}
              >
                ARTIFACTS
              </h1>
            </div>
            
            {/* 副標題和分隔線 */}
            <div 
              style={{
                opacity: Math.max(1 - scrollPercent * 2, 0),
                height: scrollPercent >= 0.5 ? '0' : 'auto',
                overflow: 'hidden',
                transition: 'opacity 0.2s ease-out, height 0.2s ease-out'
              }}
            >
              <div className="mt-2 w-16 h-[1px] bg-gradient-to-r from-gray-400 to-gray-200 mx-auto"></div>
              <p className="mt-4 text-gray-100 tracking-wide text-sm">
                Curated Travel Collections By ADAM LIU
              </p>
            </div>
          </div>
        </div>

        {/* 占位符 */}
        <div style={{ height: `${Math.max(160 - scrollPercent * 96, 64)}px` }}></div>

        {/* 主要內容區域 */}
        <div className="mt-4">
          {/* 名言區域 - 更新文字並恢復愛心符號 */}
          <div className="max-w-4xl mx-auto my-16 px-8">
            <div className="relative bg-white p-10 rounded-lg shadow-sm">
              {/* 更新後的名言內容 */}
              <p className="text-gray-700 text-lg leading-relaxed italic text-center mb-6">
              Every journey leaves behind meaningful treasures. This collection showcases objects from my travels, each holding a story, a place, and a moment worth sharing.
              </p>
              
              {/* 恢復愛心符號的分隔線 */}
              <div className="flex items-center justify-center mt-8">
                <div className="h-px w-16 bg-gray-200"></div>
                <div className="mx-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-300">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </div>
                <div className="h-px w-16 bg-gray-200"></div>
              </div>
            </div>
          </div>
          
          {/* 地圖部分 - 增加與上方名言區域的間距 */}
          <div className="map-container max-w-4xl mx-auto mt-16 mb-8 h-[500px] rounded-lg overflow-hidden relative bg-white z-0 shadow-md">
            <Map 
              locations={locationInfo} 
              onSelectLocation={handleSelectLocation}
            />
          </div>

          {/* Footer Content */}
          <footer className="bg-white border-t border-gray-100 py-12 mt-16">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">VOYAGE ARTIFACTS</h2>
                <p className="text-sm text-gray-400 mt-2">Curated Travel Collections</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-4 flex items-center justify-center md:justify-start text-gray-800">
                    <span className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
                        <path d="M11.25 4.533A9.707 9.707 0 006 3c-2.472 0-4.736.92-6.455 2.44a.75.75 0 00-.3.769v13.5a.75.75 0 001.14.64A9.707 9.707 0 006 18a9.707 9.707 0 005.25 1.5c1.505 0 2.936-.307 4.242-.87a.75.75 0 00.458-.69V4.237a.75.75 0 00-.908-.734A9.721 9.721 0 0011.25 4.5z" />
                        <path d="M12.75 19.5c1.505 0 2.936-.307 4.242-.87a.75.75 0 00.458-.69V4.237a.75.75 0 00-.908-.734A9.721 9.721 0 0012.75 4.5 9.707 9.707 0 018.25 3c-.51 0-1.01.033-1.5.1A9.711 9.711 0 0112.75 4.5v15z" />
                      </svg>
                    </span>
                    About This Site
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    This is an experimental site created to document my travel collection while honing my web development and 3D modeling skills. It serves as both a personal archive and a creative exploration of interactive digital storytelling.
                  </p>
                </div>
                
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-4 flex items-center justify-center md:justify-start text-gray-800">
                    <span className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 01-.21-1.298L9.75 12l-1.64-1.64a6 6 0 01-1.676-3.257l-.172-1.03z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Follow Me
                  </h3>
                  <div className="flex justify-center md:justify-start">
                    <a 
                      href="https://www.instagram.com/adam.liou/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all"
                      aria-label="Instagram"
                    >
                      <FaInstagram size={18} />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-12 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-400">
                  &copy; {new Date().getFullYear()} VOYAGE ARTIFACTS | All Rights Reserved
                </p>
              </div>
            </div>
          </footer>
        </div>

        {/* 彈窗部分 */}
        {selectedLocation && (
          <ModelPopup
            selectedLocation={selectedLocation}
            isClosing={isClosing}
            onClose={handleClose}
          />
        )}
      </main>
    </>
  );
}
