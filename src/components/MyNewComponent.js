import React, { useState } from 'react';

const MyNewComponent = () => {
  const [message, setMessage] = useState('Hello from my new component!');

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h2>我的新组件</h2>
      <p>{message}</p>
      <button onClick={() => setMessage('按钮被点击了!')}>
        点击我
      </button>
    </div>
  );
};

export default MyNewComponent;