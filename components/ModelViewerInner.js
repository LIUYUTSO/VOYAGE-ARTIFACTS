import { Canvas } from '@react-three/fiber';
import { OrbitControls, PresentationControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

const Model = ({ modelPath, scale }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={scale} />;
};

const ModelViewerInner = ({ modelPath, scale = 1 }) => {
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
};

export default ModelViewerInner; 