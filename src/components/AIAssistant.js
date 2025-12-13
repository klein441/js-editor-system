import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Loader } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const AIAssistant = ({ userRole, userName }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userRole,
          userName
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, userMessage, {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('AI请求失败:', error);
      setMessages([...messages, userMessage, {
        role: 'assistant',
        content: t('language') === 'zh' 
          ? '抱歉，AI助手暂时无法响应。请检查后端服务是否正常运行。' 
          : 'Sorry, AI assistant is temporarily unavailable. Please check if the backend service is running.',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* 悬浮按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={t('language') === 'zh' ? 'AI助手' : 'AI Assistant'}
          title={t('language') === 'zh' ? 'AI助手' : 'AI Assistant'}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            zIndex: 9999
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
          }}>
          <Sparkles size={28} color="white" />
        </button>
      )}

      {/* AI聊天窗口 */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '400px',
          height: '600px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {/* 头部 */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={24} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>
                  {t('language') === 'zh' ? 'AI 学习助手' : 'AI Learning Assistant'}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  {t('language') === 'zh' ? '硅基流动 Qwen 驱动' : 'Powered by SiliconFlow'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={t('language') === 'zh' ? '关闭' : 'Close'}
              title={t('language') === 'zh' ? '关闭' : 'Close'}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
              <X size={20} color="white" />
            </button>
          </div>

          {/* 消息列表 */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            background: '#f9fafb'
          }}>
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af'
              }}>
                <Sparkles size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  {t('language') === 'zh' ? '你好！我是 AI 学习助手' : 'Hello! I am your AI Learning Assistant'}
                </div>
                <div style={{ fontSize: '12px' }}>
                  {t('language') === 'zh' 
                    ? '有任何学习问题都可以问我' 
                    : 'Feel free to ask me any learning questions'}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : msg.isError ? '#fff1f0' : 'white',
                    color: msg.role === 'user' ? 'white' : msg.isError ? '#cf1322' : '#1a1a2e',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    boxShadow: msg.role === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#667eea'
                }}>
                  <Loader size={16} className="spin" />
                  <span style={{ fontSize: '14px' }}>
                    {t('language') === 'zh' ? '思考中...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            background: 'white'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('language') === 'zh' ? '输入你的问题...' : 'Type your question...'}
                disabled={isLoading}
                rows={2}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.5
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                aria-label={t('language') === 'zh' ? '发送消息' : 'Send message'}
                title={t('language') === 'zh' ? '发送消息' : 'Send message'}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: (!input.trim() || isLoading) ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  flexShrink: 0
                }}>
                <Send size={20} color="white" />
              </button>
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              {t('language') === 'zh' 
                ? '按 Enter 发送，Shift+Enter 换行' 
                : 'Press Enter to send, Shift+Enter for new line'}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
