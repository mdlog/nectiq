import React from 'react';

export function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a, #7c3aed, #3730a3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          Nectiq
        </h1>
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Cryptocurrency Price Prediction Platform
        </p>
        
        <div style={{
          margin: '2rem 0'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #60a5fa',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '2rem',
          opacity: 0.8
        }}>
          ✅ Server Aktif - Port 5000<br/>
          ✅ Backend Services Berjalan<br/>
          ✅ Database Terkoneksi<br/>
          ⚡ Memuat Interface...
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Price Predictions</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Real-time crypto forecasts</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>TrendRide</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Multiplier reward system</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Battle Mode</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Competitive predictions</p>
          </div>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '1rem 2rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#1d4ed8';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Launch Application
        </button>
        
        <p style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          opacity: 0.6
        }}>
          Status: Loading React components...
        </p>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default TestApp;