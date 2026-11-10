import React, { useState, useRef, useEffect } from 'react';
import './FloatingAiChat.css';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const FloatingAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Hello! I am MedCore AI, your clinical learning copilot. How can I assist with your studies, clinical algorithms, or medical board prep today?',
      timestamp: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Placeholder simulation response — will be connected to real backend later
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Thank you for asking about "${trimmed}". MedCore AI model is currently initializing in preview mode. Full clinical diagnostic synthesis and USMLE integration will be fully activated soon!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 900);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputMessage(promptText);
  };

  return (
    <div className="medcore-floating-ai-wrapper">
      {/* FLOATING BOT BUTTON (LEFT SIDE) */}
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

      {/* FLOATING CHAT WINDOW (POPS UP FROM LEFT SIDE) */}
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
                <span className="chat-header-status">
                  <span className="status-dot-green" />
                  Clinical Assistant Active
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

          {/* CHAT MESSAGES BODY */}
          <div className="chat-card-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                {msg.sender === 'ai' && (
                  <div className="chat-bubble-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                )}
                <div className="chat-bubble-content">
                  <p className="chat-bubble-text">{msg.text}</p>
                  <span className="chat-bubble-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row ai">
                <div className="chat-bubble-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="chat-bubble-content typing-indicator">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="chat-quick-prompts">
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickPrompt('Explain high-yield ECG findings for ischemia')}
            >
              ECG Pearls
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickPrompt('What are key USMLE Step 1 acid-base rules?')}
            >
              Acid-Base
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickPrompt('Summarize Sepsis-3 diagnostic criteria')}
            >
              Sepsis-3
            </button>
          </div>

          {/* INPUT FORM */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input-field"
              placeholder="Ask a clinical question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputMessage.trim()}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

