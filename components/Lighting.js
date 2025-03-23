const Lighting = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      
      {/* 添加回之前的聚光燈設定 */}
      <spotLight
        position={[5, 5, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={1}
        castShadow
        shadow-bias={-0.0001}
        target-position={[0, 0, 0]}
      />
      
      <directionalLight 
        position={[-2, 2, 2]} 
        intensity={0.3} 
      />
    </>
  );
};

export default Lighting; 