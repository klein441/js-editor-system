import React from 'react';

export const THEMES = {
  dark: { name: '默认(暗色)', background: '#1e1e1e', color: '#fff' },
  tech: { name: '科技风', background: 'linear-gradient(135deg, #0f172a 0%, #0ea5a4 50%)', color: '#e6fffa' },
  clean: { name: '简洁风', background: 'linear-gradient(180deg, #f7fafc 0%, #ffffff 100%)', color: '#111827' },
  twilight: { name: '暮光', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }
};

export default function BackgroundTemplates({ show, loadTemplate }) {
  if (!show) return null;

  const items = [
    { key: 'old', label: '复古风格 (Old.html)' },
    { key: 'simple', label: '简约风格 (simple.html)' },
    { key: 'sweet', label: '甜美风格 (sweet.html)' },
    { key: 'tech', label: '科技风格 (Tech.html)' }
  ];

  return (
    <div style={{ padding: 12, borderBottom: '1px solid #3e3e42', background: '#2d2d30' }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>背景模板</div>
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => loadTemplate && loadTemplate(item.key)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: 8,
            background: '#2b6cb0',
            color: '#fff',
            border: '1px solid #255d9a',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600
          }}
        >{item.label}</button>
      ))}
    </div>
  );
}
