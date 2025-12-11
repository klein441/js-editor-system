import React, { useState, useEffect } from 'react';

const TestAnchorDemo = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setTestResult('开始测试...\n');
    
    try {
      // 测试课件预览API
      console.log('🧪 测试课件预览API...');
      setTestResult(prev => prev + '🧪 测试课件预览API...\n');
      
      const response = await fetch('http://localhost:5000/api/courseware/4/preview');
      console.log('📊 响应状态:', response.status);
      setTestResult(prev => prev + `📊 响应状态: ${response.status}\n`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 返回数据:', data);
        setTestResult(prev => prev + `📊 返回数据:\n${JSON.stringify(data, null, 2)}\n`);
        
        // 测试第一张图片是否可以访问
        if (data.slides && data.slides.length > 0) {
          const firstSlide = data.slides[0];
          const imageUrl = typeof firstSlide === 'object' ? 
            `http://localhost:5000${firstSlide.imageUrl}` : 
            firstSlide;
          
          setTestResult(prev => prev + `🖼️ 测试第一张图片: ${imageUrl}\n`);
          
          // 创建图片元素测试加载
          const img = new Image();
          img.onload = () => {
            setTestResult(prev => prev + '✅ 图片加载成功!\n');
          };
          img.onerror = () => {
            setTestResult(prev => prev + '❌ 图片加载失败!\n');
          };
          img.src = imageUrl;
        }
        
      } else {
        const error = await response.text();
        console.error('❌ 错误响应:', error);
        setTestResult(prev => prev + `❌ 错误响应: ${error}\n`);
      }
      
    } catch (error) {
      console.error('❌ 请求失败:', error);
      setTestResult(prev => prev + `❌ 请求失败: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>锚点演示功能测试</h2>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '测试中...' : '测试API'}
      </button>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '5px',
        border: '1px solid #dee2e6',
        fontFamily: 'monospace',
        fontSize: '14px',
        whiteSpace: 'pre-wrap',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {testResult || '点击"测试API"按钮开始测试...'}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>测试说明</h3>
        <ul>
          <li>测试课件ID 4的预览API</li>
          <li>检查返回的数据格式</li>
          <li>验证图片URL是否可访问</li>
          <li>确认静态文件服务是否正常</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAnchorDemo;