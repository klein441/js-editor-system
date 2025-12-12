import React from 'react';

// 我随便创建的测试组件
const RandomTestComponent = () => {
  const handleClick = () => {
    alert('我随便写的按钮被点击了！');
    console.log('这是我随便加的日志');
  };

  return (
    <div style={{ 
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      padding: '30px',
      borderRadius: '15px',
      color: 'white',
      textAlign: 'center',
      margin: '20px'
    }}>
      <h1>🎉 我的随机测试组件</h1>
      <p>这是我随便写的一个组件，用来测试Git分支功能</p>
      <button 
        onClick={handleClick}
        style={{
          background: 'white',
          color: '#333',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        点击我试试！
      </button>
      <div style={{ marginTop: '20px' }}>
        <p>当前时间: {new Date().toLocaleString()}</p>
        <p>随机数: {Math.random().toFixed(4)}</p>
      </div>
    </div>
  );
};

export default RandomTestComponent;