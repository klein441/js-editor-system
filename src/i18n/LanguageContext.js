import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations, interpolate } from './translations';

// 创建语言上下文
const LanguageContext = createContext();

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  // 从 localStorage 读取保存的语言，默认为中文
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'zh';
  });

  // 当语言改变时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // 切换语言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // 翻译函数
  const t = (key, params) => {
    const text = translations[language][key] || key;
    return interpolate(text, params);
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isZh: language === 'zh',
    isEn: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义 Hook，方便使用
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
