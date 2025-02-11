import React from 'react';
import { motion } from 'framer-motion';

export function SplashPage({ onEnter }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'black',
      color: '#ffffff',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Animated Background Image Layer */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [1, 0.98, 1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '-5%',
          left: '-5%',
          width: '110%',
          height: '110%',
          zIndex: 1,
          backgroundImage: 'url("/Untitled-1.png")',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 1,
          filter: 'brightness(0.95) saturate(0.85) contrast(0.95)'
        }} 
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          marginTop: '30vh'
        }}
      >
        {/* Title */}
        <motion.h1
          animate={{ 
            scale: [1, 1.03, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
          style={{
            fontSize: '5rem',
            marginBottom: '3rem',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            fontFamily: "'Cinzel', serif",
            color: '#ffffff',
            borderBottom: '2px solid rgba(255, 255, 255, 1)',
            paddingBottom: '0.5rem',
            WebkitFontSmoothing: 'antialiased',
            textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)'
          }}
        >
          OPHANIM
        </motion.h1>

        {/* Enter Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ 
            scale: 1.05,
            background: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          style={{
            padding: '1.2rem 3.5rem',
            fontSize: '1.3rem',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '2px solid rgba(255, 255, 255, 1)',
            borderRadius: '0',
            color: '#ffffff',
            cursor: 'pointer',
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
            WebkitFontSmoothing: 'antialiased',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)'
          }}
        >
          UNVEIL
        </motion.button>
      </motion.div>
    </div>
  );
} 