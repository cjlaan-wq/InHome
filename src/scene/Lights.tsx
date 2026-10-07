export function Lights() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#d6dde4', 1.1]} />
      <directionalLight position={[6, 10, 6]} intensity={1.4} />
    </>
  );
}
