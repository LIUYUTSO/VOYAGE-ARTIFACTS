import { useEffect, useState, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PresentationControls, useGLTF } from '@react-three/drei';

// 引入预加载函数
import { preloadModels } from './ModelPreview';

// 这里添加Model组件的定义，它在文件中可能缺失了
const Model = ({ modelPath, scale, onLoaded }) => {
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    if (scene && onLoaded) {
      // 删除这两行初始角度设置
      // scene.rotation.x = Math.PI / 8; // 向下倾斜一点
      // scene.rotation.y = Math.PI / 4; // 旋转45度

      onLoaded();
    }
  }, [scene, onLoaded]);

  return <primitive object={scene} scale={scale} />;
};

// 模型顯示組件
const ModelViewer = ({ modelPath, scale = 1 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // 添加这两行来创建引用
  const ambientLight = useRef();
  const directionalLight = useRef();

  // 处理模型加载完成事件
  const handleModelLoaded = () => {
    setLoadProgress(100); // 设置进度为100%
    setTimeout(() => {
      setIsLoading(false);
    }, 300); // 添加短暂延迟，确保渲染平滑
  };

  // 模拟加载进度
  useEffect(() => {
    if (isLoading && loadProgress < 90) {
      const timer = setTimeout(() => {
        // 进度增长算法：刚开始快，后面变慢
        const increment = Math.max(1, 10 - Math.floor(loadProgress / 10));
        setLoadProgress(prev => Math.min(prev + increment, 90));
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, loadProgress]);

  useEffect(() => {
    // 增亮逻辑应该在 ambientLight 和 directionalLight 存在时执行
    if (ambientLight.current && directionalLight.current) {
      // 检查是否是 Cody 的作品，如果是则增加亮度
      const isCodyArtwork = modelPath.includes('cody.glb');

      // 调整环境光 - 所有模型都比当前 cody 模型再亮一倍
      ambientLight.current.intensity = isCodyArtwork ? 3.0 : 2.5; // 原来是 1.5 和 0.8

      // 调整主光源 - 所有模型都比当前 cody 模型再亮一倍
      directionalLight.current.intensity = isCodyArtwork ? 2.4 : 2.0; // 原来是 1.2 和 0.8
    }
  }, [modelPath, scale, ambientLight, directionalLight]);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, -15], fov: 30 }}
        style={{ background: '#ffffff' }}
      >
        <ambientLight ref={ambientLight} intensity={2.5} />
        <directionalLight
          ref={directionalLight}
          position={[10, 10, 5]}
          intensity={2.0}
          castShadow
        />

        {/* 为所有模型添加额外的点光源 */}
        <pointLight position={[-5, 5, 5]} intensity={1.4} />
        <pointLight position={[5, -5, 5]} intensity={1.4} />

        <Suspense fallback={null}>
          <Model modelPath={modelPath} scale={scale} onLoaded={handleModelLoaded} />
        </Suspense>
        <OrbitControls
          autoRotate={true}          // 自动旋转
          autoRotateSpeed={3}        // 旋转速度
        />
      </Canvas>

      {/* 黑白进度条加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-gray-800 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
          <p className="text-gray-800 font-medium text-sm">Loading 3D model... {loadProgress}%</p>
        </div>
      )}
    </div>
  );
};

// 加载高精度模型的组件
const ModelLoader = ({ modelPath, scale, onLoaded, visible }) => {
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    onLoaded();
  }, [scene, onLoaded]);

  if (!visible) return null;
  return <primitive object={scene} scale={scale} />;
};

// 信息顯示區域
const InfoSection = ({ selectedLocation }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedLocation.name}</h2>
    <p className="text-gray-600 mb-4">{selectedLocation.description}</p>

    <div className="mb-4">
      <p className="text-sm text-gray-500 mb-1"><span className="font-semibold">Location:</span> {selectedLocation.location}</p>
      <p className="text-sm text-gray-500 mb-1"><span className="font-semibold">Date:</span> {selectedLocation.date}</p>
    </div>

    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Travel Notes</h3>
      <p className="text-gray-700 italic">{selectedLocation.travelNote}</p>
    </div>
  </div>
);

// 彈窗主組件
const ModelPopup = ({ selectedLocation, isClosing, onClose }) => {
  const [animationState, setAnimationState] = useState('initial');

  // 在弹窗打开前预加载模型
  useEffect(() => {
    if (selectedLocation && selectedLocation.modelPath) {
      // 预加载当前选中的模型
      preloadModels([selectedLocation.modelPath]);
    }
  }, [selectedLocation]);

  // 處理動畫狀態
  useEffect(() => {
    if (isClosing) {
      setAnimationState('closing');
      // 添加延遲以確保動畫完成後再關閉
      const timer = setTimeout(() => {
        setAnimationState('initial');
      }, 300); // 300ms 與 CSS transition 時間相匹配
      return () => clearTimeout(timer);
    } else {
      setAnimationState('initial');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationState('ready');
        });
      });
    }
  }, [isClosing]);

  // 修改背景點擊處理函數
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 計算backdrop樣式
  const getBackdropStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      transition: 'all 0.3s ease-in-out',
    };

    switch (animationState) {
      case 'initial':
        return {
          ...baseStyle,
          opacity: 0,
          pointerEvents: 'none',
        };
      case 'closing':
        return {
          ...baseStyle,
          opacity: 0,
          pointerEvents: 'none',
        };
      case 'ready':
        return {
          ...baseStyle,
          opacity: 1,
          pointerEvents: 'auto',
        };
      default:
        return baseStyle;
    }
  };

  // 計算內容樣式
  const getContentStyle = () => {
    const baseStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      width: '90%',
      maxWidth: '1000px',
      maxHeight: '85vh',
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.3s ease-in-out',
    };

    switch (animationState) {
      case 'initial':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'scale(1.05)',
        };
      case 'closing':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'scale(0.95)',
        };
      case 'ready':
        return {
          ...baseStyle,
          opacity: 1,
          transform: 'scale(1)',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={getBackdropStyle()}
      aria-modal="true"
      role="dialog"
      className="backdrop"
    >
      <div
        style={getContentStyle()}
        onClick={(e) => e.stopPropagation()} // 防止點擊內容區域時觸發關閉
        className="content"
      >
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-gray-800 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* 彈窗內容 */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* 3D 模型或圖片區 */}
          <div className="w-full lg:w-1/2 h-[300px] lg:h-[500px] bg-gray-50 flex items-center justify-center">
            {selectedLocation.modelPath ? (
              <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                style={{ background: '#ffffff', width: '100%', height: '100%' }}
              >
                <ambientLight intensity={2.5} />
                <directionalLight
                  position={[5, 5, 5]}
                  intensity={2.0}
                />
                <Model
                  modelPath={selectedLocation.modelPath}
                  scale={selectedLocation.name === "Table Salt" ? 1.5 : selectedLocation.scale || 1}
                />
                <OrbitControls
                  enableZoom={true}
                  autoRotate={true}
                  autoRotateSpeed={3}
                />
              </Canvas>
            ) : selectedLocation.imagePath ? (
              <div className="w-full h-full p-8 flex items-center justify-center bg-white">
                <img
                  src={selectedLocation.imagePath}
                  alt={selectedLocation.name}
                  className="max-w-full max-h-full object-contain drop-shadow-xl"
                />
              </div>
            ) : null}
          </div>

          {/* 信息區 */}
          <div className="w-full lg:w-1/2 overflow-y-auto max-h-[300px] lg:max-h-[500px]">
            <InfoSection selectedLocation={selectedLocation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPopup; 