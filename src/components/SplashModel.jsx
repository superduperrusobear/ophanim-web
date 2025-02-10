import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Model URLs - Update with your Cloudflare R2 bucket URL
const R2_BASE_URL = process.env.REACT_APP_R2_URL || 'https://pub-[your-bucket-hash].r2.dev';

const MODEL_URLS = {
  model: `${R2_BASE_URL}/splash/untitled.gltf`,
  textures: {
    'EyeBase': `${R2_BASE_URL}/new/EyeBaseTexture.webp`,
    'EyeMetallic': `${R2_BASE_URL}/new/EyeMetallicTexture_png-EyeRoughnessTexture.webp`,
    'EyeNormal': `${R2_BASE_URL}/new/EyeNormalMap.webp`,
    'RingsBase': `${R2_BASE_URL}/new/RingsBaseTexture.webp`,
    'RingsMetallic': `${R2_BASE_URL}/new/RingsMetallicTexture-RingsRoughnessTexture.webp`,
    'RingsNormal': `${R2_BASE_URL}/new/RingsNormalMap.webp`
  }
};

export function SplashModel() {
  const gltf = useGLTF(MODEL_URLS.model);
  const { actions, names } = useAnimations(gltf.animations, gltf.scene);
  const modelRef = useRef();
  const sunLightRef = useRef();
  const { scene, camera } = useThree();
  
  // Store the base camera position
  const baseCameraPos = useRef({
    position: new THREE.Vector3(37.9, 5.7, 36.6),
    rotation: new THREE.Euler(-0.15349349548853836, 0.7975922872878244, 0.11027344560816173)
  });

  // Add subtle camera animation
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Subtle position breathing
    camera.position.x = baseCameraPos.current.position.x + Math.sin(time * 0.3) * 0.1;
    camera.position.y = baseCameraPos.current.position.y + Math.sin(time * 0.4) * 0.1;
    camera.position.z = baseCameraPos.current.position.z + Math.cos(time * 0.3) * 0.1;
    
    // Very subtle rotation sway
    camera.rotation.x = baseCameraPos.current.rotation.x + Math.sin(time * 0.3) * 0.003;
    camera.rotation.y = baseCameraPos.current.rotation.y + Math.cos(time * 0.4) * 0.003;
    camera.rotation.z = baseCameraPos.current.rotation.z + Math.sin(time * 0.2) * 0.002;
  });

  useEffect(() => {
    // Simply play all animations
    names.forEach((name) => {
      const action = actions[name];
      if (action) {
        action.timeScale = 0.09;
        action.play();
      }
    });

    // Set initial camera position
    camera.position.copy(baseCameraPos.current.position);
    camera.rotation.copy(baseCameraPos.current.rotation);
    camera.fov = 50.38;
    camera.updateProjectionMatrix();

    // Set up fog
    scene.fog = new THREE.FogExp2('#a7a7a7', 0.0113);

    // Load and apply textures
    const textureLoader = new THREE.TextureLoader();

    // Apply textures to materials
    gltf.scene.traverse((node) => {
      if (node.isMesh) {
        if (node.material) {
          // For rings
          if (node.name.toLowerCase().includes('ring')) {
            const baseTexture = textureLoader.load(MODEL_URLS.textures.RingsBase);
            const metallicTexture = textureLoader.load(MODEL_URLS.textures.RingsMetallic);
            const normalTexture = textureLoader.load(MODEL_URLS.textures.RingsNormal);
            
            baseTexture.flipY = false;
            metallicTexture.flipY = false;
            normalTexture.flipY = false;

            node.material.map = baseTexture;
            node.material.metalnessMap = metallicTexture;
            node.material.normalMap = normalTexture;
            node.material.metalness = 0;
            node.material.roughness = 1;
            node.material.needsUpdate = true;
          }
          // For eye
          else if (node.name.toLowerCase().includes('eye')) {
            const baseTexture = textureLoader.load(MODEL_URLS.textures.EyeBase);
            const metallicTexture = textureLoader.load(MODEL_URLS.textures.EyeMetallic);
            const normalTexture = textureLoader.load(MODEL_URLS.textures.EyeNormal);
            
            baseTexture.flipY = false;
            metallicTexture.flipY = false;
            normalTexture.flipY = false;

            node.material.map = baseTexture;
            node.material.metalnessMap = metallicTexture;
            node.material.normalMap = normalTexture;
            node.material.needsUpdate = true;
          }

          // Set material properties
          node.material.envMapIntensity = 1;
          node.material.needsUpdate = true;
        }
      }
    });

    if (!modelRef.current) return;

    // Set initial model position
    modelRef.current.position.set(5.7, -15.2, -10);

    return () => {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.stop();
        }
      });
    };
  }, [camera, gltf.scene, scene, actions, names]);

  return (
    <>
      {/* Sun directional light */}
      <directionalLight
        ref={sunLightRef}
        position={[50, 50, 50]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.3} />
      <primitive
        ref={modelRef}
        object={gltf.scene}
        dispose={null}
      />
    </>
  );
}

useGLTF.preload('/splash/untitled.gltf'); 