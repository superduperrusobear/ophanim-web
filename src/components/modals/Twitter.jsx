import React from 'react';
import { motion } from 'framer-motion';

export function Twitter() {
  const containerStyle = {
    minWidth: '600px',
    maxWidth: '800px',
    color: 'white',
    fontFamily: "'Cinzel', serif"
  };

  const tweetStyle = {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '1rem'
  };

  const tweets = [
    {
      id: 1,
      content: "🚀 Exciting developments in the OPHN ecosystem! Stay tuned for major announcements coming this week. #OPHN #Crypto",
      date: "2h ago",
      likes: 245,
      retweets: 89
    },
    {
      id: 2,
      content: "The community has spoken! New features being implemented based on your feedback. This is what decentralization looks like. 🌟",
      date: "5h ago",
      likes: 182,
      retweets: 67
    },
    {
      id: 3,
      content: "📊 Weekly update: Network growth continues to exceed expectations. Over 500k transactions processed this week!",
      date: "1d ago",
      likes: 394,
      retweets: 156
    }
  ];

  const statsStyle = {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    opacity: 0.7
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={containerStyle}
    >
      <motion.a
        href="https://x.com/OphanimSol"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: '#1DA1F2',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: 'fit-content',
          marginBottom: '2rem',
          marginLeft: 'auto'
        }}
        whileHover={{ scale: 1.05 }}
      >
        Follow @OphanimSol
      </motion.a>

      <div>
        {tweets.map((tweet) => (
          <motion.div
            key={tweet.id}
            style={tweetStyle}
            whileHover={{ 
              scale: 1.02,
              background: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <p style={{ 
              margin: 0,
              marginBottom: '0.5rem',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.1rem',
              lineHeight: '1.5'
            }}>
              {tweet.content}
            </p>
            <div style={statsStyle}>
              <span>{tweet.date}</span>
              <span>•</span>
              <span>{tweet.likes} Likes</span>
              <span>•</span>
              <span>{tweet.retweets} Retweets</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{
        marginTop: '2rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <motion.a
          href="https://twitter.com/intent/tweet?text=Just%20discovered%20%40OphanimSol%20-%20The%20future%20of%20decentralized%20finance!%20%F0%9F%9A%80"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'rgba(29, 161, 242, 0.2)',
            color: 'white',
            padding: '0.8rem 1.5rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontFamily: "'Cormorant Garamond', serif",
            border: '1px solid rgba(29, 161, 242, 0.3)'
          }}
          whileHover={{ 
            scale: 1.05,
            background: 'rgba(29, 161, 242, 0.3)'
          }}
        >
          Share about OPHN
        </motion.a>
      </div>
    </motion.div>
  );
} 