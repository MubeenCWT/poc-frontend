import { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { apiFetch } from '../lib/api.js';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { direction: 'outbound', text: '👋 Welcome to DAR! I can help you find a property, book a stay, or request maintenance. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let sid = localStorage.getItem('dar_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('dar_session_id', sid);
    }
    setSessionId(sid);

    apiFetch(`/api/chat/history/${sid}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setMessages(data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { direction: 'inbound', text: userMsg }]);

    try {
      const res = await apiFetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { direction: 'outbound', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { direction: 'outbound', text: 'Sorry, I am having trouble connecting.' }]);
    }
  };

  return (
    <>
      <button 
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px', 
          background: '#C9A876', color: '#0B1120', border: 'none',
          borderRadius: '50%', width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer', zIndex: 1000,
          fontSize: '24px'
        }}
      >
        {isOpen ? <FiX /> : <FiMessageSquare />}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '100px', right: '30px',
          width: '350px', height: '500px', background: '#fff',
          borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', zIndex: 1000,
          overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <div style={{
            background: '#0B1120', color: '#F5EDE0', padding: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>DAR Assistant</span>
          </div>

          <div style={{
            flex: 1, padding: '16px', overflowY: 'auto', display: 'flex',
            flexDirection: 'column', gap: '12px', background: '#F5EDE0'
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.direction === 'inbound' ? 'flex-end' : 'flex-start',
                background: m.direction === 'inbound' ? '#E8622C' : '#fff',
                color: m.direction === 'inbound' ? '#fff' : '#0B1120',
                padding: '10px 14px', borderRadius: '12px',
                maxWidth: '85%', fontSize: '14px', lineHeight: 1.5,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                whiteSpace: 'pre-wrap'
              }}>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{
            display: 'flex', padding: '12px', background: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.08)', gap: '8px'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '20px',
                border: '1px solid #ccc', outline: 'none', fontSize: '14px',
                fontFamily: 'var(--font-body)'
              }}
            />
            <button type="submit" style={{
              background: '#0B1120', color: '#fff', border: 'none',
              borderRadius: '50%', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
