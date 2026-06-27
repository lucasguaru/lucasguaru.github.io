export function LightingManager() {
  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight position={[7, 9, 6]} intensity={2.2} color="#dff8ff" />
      <pointLight position={[-8, 5, 3]} intensity={18} color="#1be7a7" distance={18} />
      <pointLight position={[6, 3, -8]} intensity={12} color="#ffb257" distance={16} />
      <spotLight position={[0, 12, 9]} angle={0.34} penumbra={0.65} intensity={55} color="#72e8ff" />
    </>
  );
}
