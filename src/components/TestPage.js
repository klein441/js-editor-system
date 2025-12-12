import React from 'react';

const TestPage = () => {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      fontSize: '24px',
      color: '#333'
    }}>
      <h1>测试页面</h1>
      <p>如果你能看到这个页面，说明React应用正在正常运行。</p>
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        border: '1px solid #007bff'
      }}>
        <p>✅ React组件渲染正常</p>
        <p>✅ 样式加载正常</p>
        <p>当前时间: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TestPage;