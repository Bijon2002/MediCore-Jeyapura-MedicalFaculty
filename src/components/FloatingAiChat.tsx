import React, { useState } from 'react';
import './FloatingAiChat.css';

export const FloatingAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="medcore-floating-ai-wrapper">
      {/* FLOATING BOT BUTTON */}
      <button
        type="button"
        className={`floating-ai-bot-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open MedCore AI Assistant"
        title="MedCore AI Clinical Assistant"
      >
        <div className="bot-pulse-ring" aria-hidden="true" />
        <div className="bot-icon-circle">
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <rect x="4" y="8" width="16" height="12" rx="4" />
              <circle cx="9" cy="13" r="1.5" fill="currentColor" />
              <circle cx="15" cy="13" r="1.5" fill="currentColor" />
              <path d="M9 17h6" />
              <line x1="2" y1="14" x2="4" y2="14" strokeWidth="2.5" />
              <line x1="20" y1="14" x2="22" y2="14" strokeWidth="2.5" />
            </svg>
          )}
        </div>
        <span className="bot-label-tooltip">AI Copilot</span>
      </button>

      {/* FLOATING CHAT WINDOW */}
      {isOpen && (
        <div className="floating-ai-chat-card" role="dialog" aria-label="MedCore AI Assistant Dialog">
          {/* HEADER */}
          <div className="chat-card-header">
            <div className="chat-header-info">
              <div className="chat-ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <rect x="4" y="8" width="16" height="12" rx="4" />
                  <circle cx="9" cy="13" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="13" r="1.5" fill="currentColor" />
                  <path d="M9 17h6" />
                </svg>
              </div>
              <div>
                <h3 className="chat-header-title">MedCore AI Copilot</h3>
                <span className="chat-header-status" style={{ color: '#00969b' }}>
                  <span className="status-dot-green" style={{ backgroundColor: '#00969b' }} />
                  Under Construction
                </span>
              </div>
            </div>

            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* UNDER CONSTRUCTION CONTENT */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 24px',
            textAlign: 'center',
            flex: 1,
            gap: '16px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)'
          }}>
            {/* SVG AI icon instead of emoji */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(0, 150, 155, 0.12), rgba(0, 150, 155, 0.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 150, 155, 0.25)',
              boxShadow: '0 8px 20px -4px rgba(0, 150, 155, 0.2)'
            }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#00969b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                <rect x="4" y="8" width="16" height="12" rx="4" />
                <circle cx="9" cy="13" r="1.2" fill="#00969b" stroke="none" />
                <circle cx="15" cy="13" r="1.2" fill="#00969b" stroke="none" />
                <path d="M9 17h6" strokeWidth="2" />
                <line x1="2" y1="14" x2="4" y2="14" strokeWidth="2" />
                <line x1="20" y1="14" x2="22" y2="14" strokeWidth="2" />
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{
                display: 'inline-block',
                alignSelf: 'center',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(0, 150, 155, 0.1)',
                color: '#00969b',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Coming Soon
              </span>
              <h3 style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '18px', fontWeight: 800 }}>
                AI Clinical Agent
              </h3>
            </div>

            <p style={{
              color: '#64748b',
              fontSize: '13.5px',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '280px'
            }}>
              We are actively developing our board-certified clinical assistant. Soon you will be able to query diagnosis pathways, ECG pearls, and pharmacology correlations in real-time.
            </p>

            {/* SVG wrench/settings icon instead of emoji */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#ffffff',
              border: '1px dashed rgba(0, 150, 155, 0.4)',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#00969b'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00969b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span>Architecture &amp; Fine-Tuning in Progress</span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                marginTop: '8px',
                padding: '8px 20px',
                background: '#00969b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 150, 155, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
