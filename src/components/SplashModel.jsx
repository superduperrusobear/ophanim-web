import React, { useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
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

export function SplashModel() {
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);
  
  // Load model with error handling
  useEffect(() => {
    const loadModel = async () => {
      try {
        const gltf = await useGLTF.load(`${WORKER_URL}/models/untitled.gltf`);
        setModel(gltf);
      } catch (err) {
        console.error('Model loading error:', err);
        setError(err.message);
      }
    };
    loadModel();
  }, []);

  const { actions, names } = useAnimations(model?.animations, model?.scene);
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
    if (!model?.scene) {
      console.error('No model scene available');
      return;
    }

    // Simply play all animations
    if (names && actions) {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.timeScale = 0.09;
          action.play();
        }
      });
    }

    // Set initial camera position
    camera.position.copy(baseCameraPos.current.position);
    camera.rotation.copy(baseCameraPos.current.rotation);
    camera.fov = 50.38;
    camera.updateProjectionMatrix();

    // Set up fog
    scene.fog = new THREE.FogExp2('#a7a7a7', 0.0113);

    // Load and apply textures
    const textureLoader = new THREE.TextureLoader();
    const textureMap = {
      'Image_0': `${WORKER_URL}/models/Image_0.webp`,
      'Image_1': `${WORKER_URL}/models/Image_1.webp`,
      'diffuse': `${WORKER_URL}/models/ae81caf0b4cc4839a7d363edb6fdfa01_RGB_diffuse.webp`,
      'roughness': `${WORKER_URL}/models/5370089b2700446599003adc038a92c5_R_05___Default_roughness.webp`,
      'model': `${WORKER_URL}/models/44959d755a60403fbebe8476dbaa5a1e_RGB_model.webp`,
      'albedo': `${WORKER_URL}/models/c6058a487230442ca07220c5b0502207_RGB_05___Default_albedo.webp`
    };

    // Apply textures to materials
    model.scene.traverse((node) => {
      if (node.isMesh && node.material) {
        Object.entries(textureMap).forEach(([key, url]) => {
          const texture = textureLoader.load(url, 
            undefined, 
            undefined, 
            (error) => console.error(`Error loading texture ${key}:`, error)
          );
          texture.flipY = false;
          
          if (node.name.toLowerCase().includes(key.toLowerCase())) {
            node.material.map = texture;
            node.material.needsUpdate = true;
          }
        });
      }
    });

    // Initial model settings
    if (modelRef.current) {
      modelRef.current.position.set(5.7, -15.2, -10);
      modelRef.current.scale.setScalar(1);
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
  }, [model, camera, scene, actions, names]);

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
        ref={sunLightRef}
        position={[50, 50, 50]}
        intensity={1.5}
        castShadow
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.3} />
      <primitive
        ref={modelRef}
        object={model.scene}
        dispose={null}
      />
    </>
  );
}

useGLTF.preload(`${WORKER_URL}/models/untitled.gltf`); 