import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketActivity } from './modals/MarketActivity';
import { Telegram } from './modals/Telegram';
import { Twitter } from './modals/Twitter';
import { Layer1 } from './modals/Layer1';
import { FehuRune } from './modals/FehuRune';
import { Leaderboard } from './modals/Leaderboard';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 2000,
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={{
          background: 'rgba(20, 20, 20, 0.95)',
          padding: '2rem',
          borderRadius: '15px',
          maxWidth: '80vw',
          maxHeight: '80vh',
          overflow: 'auto',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ 
            margin: 0,
            fontFamily: "'Cinzel', serif",
            fontSize: '1.5rem'
          }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              opacity: 0.7,
              transition: 'opacity 0.3s'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = 1}
            onMouseOut={e => e.currentTarget.style.opacity = 0.7}
          >
            ×
          </button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export function UIOverlay() {
  const [activeModal, setActiveModal] = useState(null);

  const glyphPositions = [
    { top: '15%', left: '8%' },  // Telegram
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
    width: '120px',
    height: '120px',
    transition: 'all 0.3s ease',
    animation: 'breathe 4s ease-in-out infinite'
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))'
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

  const handleButtonClick = (modalType) => {
    setActiveModal(modalType);
  };

  return (
    <>
      <div style={containerStyle}>
        {[
          {
            src: "/imgs/Telegram-icon-with-black-color-on-transparent-background-PNG.png",
            alt: "Telegram",
            modalType: "telegram"
          },
          {
            src: "/imgs/large-x-logo.png.twimg_.1920-e1699539508422.png",
            alt: "X/Twitter",
            modalType: "twitter"
          },
          {
            src: "/imgs/Layer 1.png",
            alt: "Layer 1",
            modalType: "layer1"
          },
          {
            src: "/imgs/Screenshot 2025-02-05 at 14-13-15 10535I_large.gif (GIF Image 250 × 159 pixels) copy 2.png",
            alt: "Leaderboard",
            modalType: "leaderboard"
          },
          {
            src: "/imgs/market-activity.png",
            alt: "Market Activity",
            modalType: "market"
          },
          {
            src: "/imgs/Fehu-Elder-Futhark-Rune-1.png",
            alt: "Fehu Rune",
            modalType: "fehu"
          }
        ].map((glyph, index) => (
          <button
            key={glyph.alt}
            style={{
              ...buttonStyle,
              ...glyphPositions[index],
              pointerEvents: 'auto',
              animationDelay: `${index * 0.5}s`
            }}
            onClick={() => handleButtonClick(glyph.modalType)}
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

      <AnimatePresence>
        {/* Market Activity Modal */}
        <Modal
          isOpen={activeModal === 'market'}
          onClose={() => setActiveModal(null)}
          title="Market Activity"
        >
          <MarketActivity />
        </Modal>

        {/* Telegram Modal */}
        <Modal
          isOpen={activeModal === 'telegram'}
          onClose={() => setActiveModal(null)}
          title="Telegram Community"
        >
          <Telegram />
        </Modal>

        {/* Twitter Modal */}
        <Modal
          isOpen={activeModal === 'twitter'}
          onClose={() => setActiveModal(null)}
          title="Twitter Updates"
        >
          <Twitter />
        </Modal>

        {/* Layer 1 Modal */}
        <Modal
          isOpen={activeModal === 'layer1'}
          onClose={() => setActiveModal(null)}
          title="Sigil of Knowledge"
        >
          <Layer1 />
        </Modal>

        {/* Leaderboard Modal */}
        <Modal
          isOpen={activeModal === 'leaderboard'}
          onClose={() => setActiveModal(null)}
          title="Top Traders Leaderboard"
        >
          <Leaderboard />
        </Modal>

        {/* Fehu Rune Modal */}
        <Modal
          isOpen={activeModal === 'fehu'}
          onClose={() => setActiveModal(null)}
          title="Connect Wallet"
        >
          <FehuRune />
        </Modal>
      </AnimatePresence>
    </>
  );
} 