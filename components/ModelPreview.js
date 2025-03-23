import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PresentationControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

// 全局缓存对象
const modelCache = {};

// 优化后的模型加载组件
const Model = ({ modelPath, scale }) => {
  // 使用useMemo缓存模型加载结果
  const { scene } = useGLTF(modelPath);
  
  // 使用useMemo避免不必要的克隆操作
  const modelScene = useMemo(() => {
    // 深度克隆场景对象，防止多个实例共享同一个场景
    return scene.clone();
  }, [scene]);
  
  return <primitive object={modelScene} scale={scale} />;
};

// 预加载常用模型
export const preloadModels = (modelPaths) => {
  modelPaths.forEach(path => {
    if (!modelCache[path]) {
      useGLTF.preload(path);
      modelCache[path] = true;
    }
  });
};

// 使用React.memo优化组件，避免不必要的重新渲染
const ModelPreview = memo(({ modelPath, scale = 1 }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Suspense fallback={null}>
        <PresentationControls
          global
          rotation={[0, -Math.PI / 4, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <Model modelPath={modelPath} scale={scale} />
        </PresentationControls>
      </Suspense>
      <OrbitControls enablePan={false} />
    </Canvas>
  );
});

export default ModelPreview; 