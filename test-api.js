// 测试课件预览API
async function testAPI() {
  try {
    console.log('🧪 测试课件预览API...');
    
    // 测试课件ID 4 (已经有转换后的图片)
    const response = await fetch('http://localhost:5000/api/courseware/4/preview');
    console.log('📊 响应状态:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 返回数据:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.error('❌ 错误响应:', error);
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

// 如果在Node.js环境中运行
if (typeof fetch === 'undefined') {
  console.log('请在浏览器控制台中运行此测试');
} else {
  testAPI();
}