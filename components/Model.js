import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Model = ({ modelPath = "/models/cart.glb", scale = 1.5 }) => {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();

  // 添加自動旋轉
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += (Math.PI * 2 / 60) * delta;
    }
  });

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      scale={scale}
      castShadow
      receiveShadow
    />
  );
};

export default Model; 