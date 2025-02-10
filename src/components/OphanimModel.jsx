import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WORKER_URL = 'https://ophnm-cors.ophanimsol.workers.dev';

// Main 3D scene component
export function OphanimModel() {
  const gltf = useGLTF(`${WORKER_URL}/models/ophanim.glb`);
  const { actions, names } = useAnimations(gltf.animations, gltf.scene);
  const groupRef = useRef();
  const { scene, camera } = useThree();
  const lightRef = useRef();

  useEffect(() => {
    // Set scene background
    scene.background = new THREE.Color('#000000');

    // Load and apply textures
    const textureLoader = new THREE.TextureLoader();
    const textureMap = {
      'EyeBase': '/new/EyeBaseTexture.webp',
      'EyeMetallic': '/new/EyeMetallicTexture_png-EyeRoughnessTexture.webp',
      'EyeNormal': '/new/EyeNormalMap.webp',
      'RingsBase': '/new/RingsBaseTexture.webp',
      'RingsMetallic': '/new/RingsMetallicTexture-RingsRoughnessTexture.webp',
      'RingsNormal': '/new/RingsNormalMap.webp'
    };

    // Enhanced debug logging
    console.log('Model loaded:', gltf);
    console.log('Scene:', scene);
    console.log('Camera:', camera);
    
    // Log all meshes and their positions
    gltf.scene.traverse((node) => {
      if (node.isMesh) {
        console.log('Mesh:', node.name, 'Position:', node.position);
        // Apply textures based on mesh name
        if (node.material) {
          // For rings
          if (node.name.toLowerCase().includes('ring')) {
            const baseTexture = textureLoader.load(textureMap.RingsBase);
            const metallicTexture = textureLoader.load(textureMap.RingsMetallic);
            const normalTexture = textureLoader.load(textureMap.RingsNormal);
            
            baseTexture.flipY = false;
            metallicTexture.flipY = false;
            normalTexture.flipY = false;

            node.material.map = baseTexture;
            node.material.metalnessMap = metallicTexture;
            node.material.normalMap = normalTexture;
            node.material.metalness = 0;
            node.material.roughness = 1;
          }
          // For eyes
          else if (node.name.toLowerCase().includes('eye')) {
            const baseTexture = textureLoader.load(textureMap.EyeBase);
            const metallicTexture = textureLoader.load(textureMap.EyeMetallic);
            const normalTexture = textureLoader.load(textureMap.EyeNormal);
            
            baseTexture.flipY = false;
            metallicTexture.flipY = false;
            normalTexture.flipY = false;

            node.material.map = baseTexture;
            node.material.metalnessMap = metallicTexture;
            node.material.normalMap = normalTexture;
          }

          // Common material properties
          node.material.side = THREE.DoubleSide;
          node.material.needsUpdate = true;
          node.castShadow = true;
          node.receiveShadow = true;
          node.material.envMapIntensity = 1;
        }
      }
    });

    // Calculate bounding box to center model
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    console.log('Model bounds:', { center, size });

    // Initial model settings
    if (groupRef.current) {
      groupRef.current.position.set(5.7, -15.2, -10);
      groupRef.current.scale.setScalar(1);
    }

    // Set initial camera position
    camera.position.set(-366.27, 58.40, -539.69);
    camera.lookAt(0, 0, 0);
    camera.fov = 45;
    camera.updateProjectionMatrix();

    // Play animations
    names.forEach((name) => {
      const action = actions[name];
      if (action) {
        action.reset().play();
        action.timeScale = 0.09;
        action.setLoop(THREE.LoopRepeat, Infinity);
      }
    });

    return () => {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.stop();
        }
      });
    };
  }, [gltf.scene, scene, camera, actions, names]);

  return (
    <>
      {/* Sun directional light */}
      <directionalLight
        ref={lightRef}
        position={[50, 50, 50]}
        intensity={1.5}
        castShadow
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.3} />
      <primitive
        ref={groupRef}
        object={gltf.scene}
        dispose={null}
      />
    </>
  );
}

useGLTF.preload(`${WORKER_URL}/models/ophanim.glb`);