import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { SplashModel } from './SplashModel';
import { ShaderBackground } from './ShaderBackground';

export function SplashPage({ onEnter }) {
  return (
    <div className="splash-container" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#ffffff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      {/* Combined 3D Scene */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <Canvas
          gl={{
            antialias: true,
            alpha: false,
            stencil: false
          }}
          dpr={[1, 2]}
          camera={{
            position: [37.9, 5.7, 36.6],
            fov: 50.38
          }}
        >
          <ShaderBackground />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <SplashModel />
        </Canvas>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="splash-content"
        style={{
          textAlign: 'center',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          marginTop: '30vh'
        }}
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ 
            scale: [1, 1.05, 1],
            textShadow: [
              '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
              '0 0 40px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.3)',
              '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)'
            ]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            fontSize: '5rem',
            marginBottom: '3rem',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            fontFamily: "'Cinzel', serif",
            color: '#ffd700',
            borderBottom: '2px solid rgba(255, 215, 0, 0.5)',
            paddingBottom: '0.5rem'
          }}
        >
          OPHANIM
        </motion.h1>

        <motion.button
          whileHover={{ 
            scale: 1.05,
            background: 'rgba(255, 215, 0, 0.15)',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8)'
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '1.2rem 3.5rem',
            fontSize: '1.3rem',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '50px',
            color: '#ffd700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.2em',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            textShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.1)',
              '0 0 25px rgba(255, 215, 0, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.2)',
              '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.1)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onClick={onEnter}
        >
          Transcend
        </motion.button>

        <motion.a
          href="https://etherscan.io/address/YOUR_CONTRACT_ADDRESS"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ 
            scale: 1.05, 
            opacity: 1,
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
          }}
          style={{
            color: '#fff5e6',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.05em',
            opacity: 0.8,
            display: 'block',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
          }}
        >
          View Contract
        </motion.a>
      </motion.div>
    </div>
  );
} 