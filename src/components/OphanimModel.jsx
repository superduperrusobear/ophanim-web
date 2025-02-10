import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Model URLs - Update with your Cloudflare R2 bucket URL
const R2_BASE_URL = process.env.REACT_APP_R2_URL || 'https://pub-[your-bucket-hash].r2.dev';

const MODEL_URLS = {
  model: `${R2_BASE_URL}/new/ophanim.glb`,
  textures: {
    'EyeBase': `${R2_BASE_URL}/new/EyeBaseTexture.webp`,
    'EyeMetallic': `${R2_BASE_URL}/new/EyeMetallicTexture_png-EyeRoughnessTexture.webp`,
    'EyeNormal': `${R2_BASE_URL}/new/EyeNormalMap.webp`,
    'RingsBase': `${R2_BASE_URL}/new/RingsBaseTexture.webp`,
    'RingsMetallic': `${R2_BASE_URL}/new/RingsMetallicTexture-RingsRoughnessTexture.webp`,
    'RingsNormal': `${R2_BASE_URL}/new/RingsNormalMap.webp`
  }
};

// Separate component for UI overlay
export function UIOverlay() {
  const glyphPositions = [
    { top: '15%', left: '8%' },  // Telegram - moved slightly for larger size
    { top: '15%', right: '8%' }, // X/Twitter
    { top: '50%', left: '3%' },   // Layer 1
    { top: '50%', right: '3%' },  // Screenshot
    { bottom: '15%', left: '8%' }, // Market Activity
    { bottom: '15%', right: '8%' } // Fehu Rune
  ];

  const buttonStyle = {
    position: 'absolute',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    width: '120px',  // Increased from 80px
    height: '120px', // Increased from 80px
    transition: 'all 0.3s ease',
    animation: 'breathe 4s ease-in-out infinite'
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))' // Increased glow effect
  };

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1000
  };

  // Add the breathing animation keyframes
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes breathe {
      0% {
        transform: scale(1);
        opacity: 0.8;
        filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
      }
      50% {
        transform: scale(1.15);
        opacity: 1;
        filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.5));
      }
      100% {
        transform: scale(1);
        opacity: 0.8;
        filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
      }
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <div style={containerStyle}>
      {[
        {
          src: "/imgs/Telegram-icon-with-black-color-on-transparent-background-PNG.png",
          alt: "Telegram",
          onClick: () => console.log('Telegram clicked')
        },
        {
          src: "/imgs/large-x-logo.png.twimg_.1920-e1699539508422.png",
          alt: "X/Twitter",
          onClick: () => console.log('X/Twitter clicked')
        },
        {
          src: "/imgs/Layer 1.png",
          alt: "Layer 1",
          onClick: () => console.log('Layer 1 clicked')
        },
        {
          src: "/imgs/Screenshot 2025-02-05 at 14-13-15 10535I_large.gif (GIF Image 250 × 159 pixels) copy 2.png",
          alt: "Screenshot",
          onClick: () => console.log('Screenshot clicked')
        },
        {
          src: "/imgs/market-activity.png",
          alt: "Market Activity",
          onClick: () => console.log('Market Activity clicked')
        },
        {
          src: "/imgs/Fehu-Elder-Futhark-Rune-1.png",
          alt: "Fehu Rune",
          onClick: () => console.log('Fehu Rune clicked')
        }
      ].map((glyph, index) => (
        <button
          key={glyph.alt}
          style={{
            ...buttonStyle,
            ...glyphPositions[index],
            pointerEvents: 'auto',
            animationDelay: `${index * 0.5}s` // Stagger the breathing animation
          }}
          onClick={glyph.onClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
            e.currentTarget.style.filter = 'brightness(1.2)';
            e.currentTarget.style.animationPlayState = 'paused';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'brightness(1)';
            e.currentTarget.style.animationPlayState = 'running';
          }}
        >
          <img
            src={glyph.src}
            alt={glyph.alt}
            style={imgStyle}
          />
        </button>
      ))}
    </div>
  );
}

// Main 3D scene component
export function OphanimModel() {
  const gltf = useGLTF(MODEL_URLS.model);
  const { actions, names } = useAnimations(gltf.animations, gltf.scene);
  const groupRef = useRef();
  const { scene, camera } = useThree();
  const lightRef = useRef();

  useEffect(() => {
    // Set scene background
    scene.background = new THREE.Color('#000000');

    // Load and apply textures
    const textureLoader = new THREE.TextureLoader();
    const textureMap = MODEL_URLS.textures;

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
        action.timeScale = 0.556;
        action.setLoop(THREE.LoopRepeat, Infinity);
      }
    });

    return () => {
      // Cleanup
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.stop();
        }
      });
    };
  }, [gltf.scene, scene, camera]);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={1} />
      <directionalLight
        ref={lightRef}
        position={[10, 10, 10]}
        intensity={2}
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={1} />
      
      {/* Model */}
      <group ref={groupRef}>
        <primitive object={gltf.scene} />
      </group>
    </>
  );
}

// Preload the model
useGLTF.preload('/new/ophanim.glb');

// Export only the OphanimModel
export default OphanimModel;