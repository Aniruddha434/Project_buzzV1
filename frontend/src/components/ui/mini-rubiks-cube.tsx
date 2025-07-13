import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import React, { useRef, useMemo } from "react";
import * as THREE from 'three';

interface MiniRubiksCubeProps {
  size?: number;
  className?: string;
}

const MiniCubeModel = ({ size = 1 }: { size: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.5;
      groupRef.current.rotation.y += delta * 0.7;
      groupRef.current.rotation.z += delta * 0.3;
    }
  });

  const cubeSize = 0.35;
  const gap = 0.025;
  const radius = 0.025;

  const positions = [-1, 0, 1];
  const cubes = useMemo(() => {
    const result = [];
    for (let x of positions) {
      for (let y of positions) {
        for (let z of positions) {
          result.push({ x, y, z, key: `${x}-${y}-${z}` });
        }
      }
    }
    return result;
  }, []);

  const material = useMemo(() => (
    <meshPhysicalMaterial
      color="#ffffff"
      metalness={0.2}
      roughness={0.1}
      clearcoat={0.4}
      reflectivity={0.8}
      emissive="#ffffff"
      emissiveIntensity={0.15}
    />
  ), []);

  return (
    <group ref={groupRef} scale={size}>
      {cubes.map((cube) => (
        <group
          key={cube.key}
          position={[
            cube.x * (cubeSize + gap),
            cube.y * (cubeSize + gap),
            cube.z * (cubeSize + gap),
          ]}
        >
          <RoundedBox
            args={[cubeSize, cubeSize, cubeSize]}
            radius={radius}
            smoothness={2}
          >
            {material}
          </RoundedBox>
        </group>
      ))}
    </group>
  );
};

export const MiniRubiksCube: React.FC<MiniRubiksCubeProps> = ({ 
  size = 1, 
  className = "" 
}) => {
  return (
    <div className={`${className}`} style={{ width: `${size * 40}px`, height: `${size * 40}px` }}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "default",
        }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[2, 2, 2]} intensity={1.5} />
        <directionalLight position={[-2, -2, -2]} intensity={0.6} />
        <pointLight position={[0, 0, 5]} intensity={0.8} />
        <MiniCubeModel size={size} />
      </Canvas>
    </div>
  );
};
