import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei';
import { OphanimModel } from './components/OphanimModel';
import { UIOverlay } from './components/UIOverlay';
import { SplashPage } from './components/SplashPage';
import * as THREE from 'three';
import { ShaderBackground } from './components/ShaderBackground';
import { motion } from 'framer-motion';

function WebGLError() {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      maxWidth: '80%'
    }}>
      <h2>WebGL Not Available</h2>
      <p>Your browser or device doesn't support WebGL, which is required to view 3D content.</p>
      <p>Please try:</p>
      <ul style={{ textAlign: 'left', marginTop: '10px' }}>
        <li>Updating your graphics drivers</li>
        <li>Using a modern browser (Chrome, Firefox, or Edge)</li>
        <li>Enabling hardware acceleration in your browser settings</li>
      </ul>
    </div>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html as='div' center>
      <div style={{
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        userSelect: 'none'
      }}>
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function ModelViewer() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'black'
    }}>
      {/* Shader Background Base Layer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        opacity: 1,
        mixBlendMode: 'normal'
      }}>
        <Canvas
          camera={{
            position: [0, 0, 1],
            fov: 45
          }}
          gl={{
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <Suspense fallback={null}>
            <ShaderBackground />
          </Suspense>
        </Canvas>
      </div>

      {/* Left Side GIF Layer */}
      <motion.div
        animate={{ 
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '18%',
          transform: 'translateY(-50%)',
          width: '1200px',
          height: '1200px',
          backgroundImage: 'url("/Untitled-3-Recovered.gif")',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 2,
          mixBlendMode: 'normal',
          opacity: 1
        }}
      />

      {/* Animated Image Overlay */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '-5%',
          left: '-5%',
          width: '110%',
          height: '110%',
          backgroundImage: 'url("/newbg.png")',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          zIndex: 3
        }}
      />

      {/* UI Overlay */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <UIOverlay />
      </div>
    </div>
  );
}

// Audio Component
function BackgroundMusic() {
  const [audio] = useState(new Audio('/audio/untitled.mp3'));
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // Function to attempt playing audio
  const attemptAutoplay = async () => {
    try {
      console.log('Attempting autoplay...');
      await audio.play();
      console.log('Autoplay successful');
      setPlaying(true);
    } catch (e) {
      console.log('Autoplay failed, waiting for user interaction:', e);
      
      // Add one-time click handler for browsers that require user interaction
      const handleFirstClick = async () => {
        try {
          await audio.play();
          setPlaying(true);
          setError(null);
          setUserInteracted(true);
          document.removeEventListener('click', handleFirstClick);
        } catch (err) {
          console.error('Play on click failed:', err);
        }
      };
      
      document.addEventListener('click', handleFirstClick);
    }
  };

  useEffect(() => {
    // Set up audio
    audio.volume = 1.0;
    audio.loop = true;
    
    // Add event listeners for debugging
    audio.addEventListener('loadstart', () => console.log('Audio loading started'));
    audio.addEventListener('loadeddata', () => console.log('Audio data loaded'));
    audio.addEventListener('canplay', () => {
      console.log('Audio can play');
      if (!userInteracted) {
        attemptAutoplay();
      }
    });
    
    audio.addEventListener('playing', () => {
      console.log('Audio started playing');
      setPlaying(true);
      setError(null);
    });

    audio.addEventListener('pause', () => {
      console.log('Audio paused');
      setPlaying(false);
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });

    // Load the audio file
    audio.load();

    // Cleanup
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio, userInteracted]);

  // Return null since we don't want to render any UI
  return null;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleEnter = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash ? (
        <SplashPage onEnter={handleEnter} />
      ) : (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          overflow: 'hidden',
          background: 'black'
        }}>
          <ModelViewer />
        </div>
      )}
      <BackgroundMusic />
    </>
  );
}

export default App; 