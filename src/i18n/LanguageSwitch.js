import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const LanguageSwitch = ({ style }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        transition: 'all 0.3s',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#e5e7eb';
        e.currentTarget.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f3f4f6';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
      title={language === 'zh' ? '切换到英文' : 'Switch to Chinese'}
    >
      <Globe size={16} />
      <span>{language === 'zh' ? '中文' : 'English'}</span>
    </button>
  );
};

export default LanguageSwitch;
