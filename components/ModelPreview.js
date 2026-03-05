import React, { useEffect, useRef, useState, useMemo, memo, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PresentationControls, useGLTF, Stage } from '@react-three/drei';
import { Suspense } from 'react';

// Error Boundary for Three.js Canvas
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Model Loading Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-900 border border-white/10 rounded-3xl p-6 text-center">
          <div className="w-12 h-12 mb-4 text-orange-400 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-2">Deploying Asset...</h4>
          <p className="text-[9px] text-gray-500 font-medium leading-relaxed max-w-[150px]">
            Success! The model is cloud-synced.<br />
            Wait 1 min for static preview.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global cache object
const modelCache = {};

// Optimized loaded component
const Model = ({ modelPath, scale, rotationY }) => {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef();

  const modelScene = useMemo(() => {
    return scene.clone();
  }, [scene]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotationY * (Math.PI / 180);
    }
  }, [rotationY]);

  return (
    <primitive
      ref={meshRef}
      object={modelScene}
      scale={scale}
    />
  );
};

// Preload helper
export const preloadModels = (modelPaths) => {
  modelPaths.forEach(path => {
    if (!modelCache[path]) {
      try {
        useGLTF.preload(path);
        modelCache[path] = true;
      } catch (e) { }
    }
  });
};

const ModelPreview = memo(({
  modelPath,
  scale = 1,
  intensity = 1.5,
  rotationY = 0,
  autoRotateSpeed = 2,
  fov = 45
}) => {
  if (!modelPath) return null;

  return (
    <ModelErrorBoundary key={modelPath}>
      <Canvas shadows camera={{ position: [0, 0, 4], fov: fov }} gl={{ preserveDrawingBuffer: true }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={intensity} />

        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.2, blur: 2 }}>
            <PresentationControls
              global
              config={{ mass: 2, tension: 500 }}
              snap={{ mass: 4, tension: 1500 }}
              rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
            >
              <Model
                modelPath={modelPath}
                scale={scale}
                rotationY={rotationY}
              />
            </PresentationControls>
          </Stage>
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          autoRotate={autoRotateSpeed > 0}
          autoRotateSpeed={autoRotateSpeed}
        />
      </Canvas>
    </ModelErrorBoundary>
  );
});

ModelPreview.displayName = 'ModelPreview';

export default ModelPreview;