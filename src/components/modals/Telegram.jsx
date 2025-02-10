import React from 'react';
import { motion } from 'framer-motion';

export function Telegram() {
  const containerStyle = {
    minWidth: '600px',
    maxWidth: '800px',
    color: 'white',
    fontFamily: "'Cinzel', serif",
    padding: '2rem'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={containerStyle}
    >
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <motion.img
          src="/imgs/Telegram-icon-with-black-color-on-transparent-background-PNG.png"
          alt="Telegram"
          style={{
            width: '80px',
            height: '80px',
            marginBottom: '1.5rem',
            filter: 'brightness(0) invert(1)'
          }}
          animate={{
            filter: [
              'brightness(0) invert(1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
              'brightness(0) invert(1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
              'brightness(0) invert(1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <h2 style={{ marginBottom: '1rem' }}>Join Our Telegram Community</h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.2rem',
          opacity: 0.8,
          marginBottom: '2rem'
        }}>
          Stay updated with the latest news, announcements, and community discussions.
        </p>
        <motion.a
          href="https://t.me/ophanimsol"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(45deg, #2AABEE, #229ED9)',
            color: 'white',
            padding: '1rem 2.5rem',
            borderRadius: '30px',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(42, 171, 238, 0.3)'
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 4px 20px rgba(42, 171, 238, 0.4)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Join Telegram Channel
        </motion.a>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Community Benefits</h3>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.1rem'
        }}>
          {[
            'Real-time updates and announcements',
            'Direct interaction with the team',
            'Exclusive community events and discussions',
            'First access to new features and updates',
            'Trading insights and market analysis'
          ].map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                padding: '0.8rem',
                borderBottom: index !== 4 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <span style={{ color: '#2AABEE' }}>•</span>
              {benefit}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
} 