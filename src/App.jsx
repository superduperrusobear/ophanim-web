import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei';
import { OphanimModel } from './components/OphanimModel';
import { UIOverlay } from './components/UIOverlay';
import { SplashPage } from './components/SplashPage';
import * as THREE from 'three';
import { ShaderBackground } from './components/ShaderBackground';

const WORKER_URL = 'https://cdn.ophanim.xyz';

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
  const { progress, errors } = useProgress();
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
        {errors.length > 0 ? (
          <div>
            <h3>Error Loading</h3>
            <p>{errors[0]}</p>
          </div>
        ) : (
          `Loading... ${progress.toFixed(0)}%`
        )}
      </div>
    </Html>
  );
}

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error('Error caught by boundary:', event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
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
        textAlign: 'center'
      }}>
        <h2>Something went wrong</h2>
        <p>{error?.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            marginTop: '10px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return children;
}

function ModelViewer() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleError = (error) => {
    console.error('Canvas error:', error);
    setError(error);
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent'
    }}>
      <ErrorBoundary>
        <Canvas
          camera={{ 
            position: [-366.27, 58.40, -539.69],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
            depth: true,
            stencil: false,
            logarithmicDepthBuffer: true
          }}
          shadows
          dpr={Math.min(window.devicePixelRatio, 2)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
          onCreated={({ gl, scene, camera }) => {
            try {
              gl.setClearColor(0x000000, 1);
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
              scene.background = null;
              setIsLoading(false);
            } catch (err) {
              console.error('Canvas creation error:', err);
              setError(err);
            }
          }}
          onError={handleError}
        >
          <ShaderBackground />
          <Suspense fallback={<Loader />}>
            <OphanimModel />
          </Suspense>
        </Canvas>

        <UIOverlay />

        {isLoading && !error && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 2,
            background: 'transparent'
          }}>
            <div style={{
              color: 'white',
              background: 'rgba(0,0,0,0.8)',
              padding: '20px',
              borderRadius: '8px'
            }}>
              Initializing WebGL...
            </div>
          </div>
        )}

        {error && (
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
            zIndex: 1000
          }}>
            <h2>Error</h2>
            <p>{error.message || 'An error occurred while loading the 3D scene'}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                marginTop: '10px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

// Audio Component
function BackgroundMusic() {
  const [audio] = useState(new Audio(`${WORKER_URL}/audio/untitled.mp3`));
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
    audio.crossOrigin = "anonymous";
    
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
      setError(e);
    });

    // Load the audio file
    audio.load();

    // Cleanup
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio, userInteracted]);

  if (error) {
    console.warn('Audio error, continuing without sound');
    return null;
  }

  return null;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleEnter = () => {
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App; 