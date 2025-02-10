import React, { useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const WORKER_URL = 'https://cdn.ophanim.xyz';

// Error display component
function ErrorMessage({ error }) {
  return (
    <Html center>
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '300px',
        textAlign: 'center'
      }}>
        <h3>Error Loading Model</h3>
        <p>{error}</p>
      </div>
    </Html>
  );
}

// Main 3D scene component
export function OphanimModel() {
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  
  // Load model with error handling
  useEffect(() => {
    const loadModel = async () => {
      try {
        const gltf = await useGLTF.load(`${WORKER_URL}/models/ophanim.glb`);
        setModel(gltf);
      } catch (err) {
        console.error('Model loading error:', err);
        setError(err.message);
      }
    };
    loadModel();
  }, []);

  const { actions, names } = useAnimations(model?.animations, model?.scene);
  const groupRef = useRef();
  const { scene, camera } = useThree();
  const lightRef = useRef();

  useEffect(() => {
    if (!model?.scene) {
      console.error('No model scene available');
      return;
    }

    // Set scene background
    scene.background = new THREE.Color('#000000');

    // Load and apply textures
    const textureLoader = new THREE.TextureLoader();
    const textureMap = {
      'EyeBase': `${WORKER_URL}/models/EyeBaseTexture.webp`,
      'EyeMetallic': `${WORKER_URL}/models/EyeMetallicTexture_png-EyeRoughnessTexture.webp`,
      'EyeNormal': `${WORKER_URL}/models/EyeNormalMap.webp`,
      'RingsBase': `${WORKER_URL}/models/RingsBaseTexture.webp`,
      'RingsMetallic': `${WORKER_URL}/models/RingsMetallicTexture-RingsRoughnessTexture.webp`,
      'RingsNormal': `${WORKER_URL}/models/RingsNormalMap.webp`
    };

    // Enhanced debug logging
    console.log('Model loaded:', model);
    console.log('Scene:', scene);
    console.log('Camera:', camera);
    
    // Log all meshes and their positions
    model.scene.traverse((node) => {
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
    const box = new THREE.Box3().setFromObject(model.scene);
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
    if (names && actions) {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.reset().play();
          action.timeScale = 0.09;
          action.setLoop(THREE.LoopRepeat, Infinity);
        }
      });
    }

    return () => {
      if (names && actions) {
        names.forEach((name) => {
          const action = actions[name];
          if (action) {
            action.stop();
          }
        });
      }
    };
  }, [model, scene, camera, actions, names]);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!model?.scene) {
    return null;
  }

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
        object={model.scene}
        dispose={null}
      />
    </>
  );
}

useGLTF.preload(`${WORKER_URL}/models/ophanim.glb`);