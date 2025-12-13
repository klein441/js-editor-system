// 测试 AI API 的脚本
const https = require('https');
require('dotenv').config();

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

console.log('🔑 API Key:', SILICONFLOW_API_KEY ? `${SILICONFLOW_API_KEY.substring(0, 10)}...` : '未配置');
console.log('🌐 API URL:', SILICONFLOW_API_URL);
console.log('\n正在测试 AI API...\n');

const data = JSON.stringify({
  model: 'Qwen/Qwen2.5-7B-Instruct',
  messages: [
    { role: 'system', content: '你是一个友好的助手' },
    { role: 'user', content: '你好，请用一句话介绍自己' }
  ],
  temperature: 0.7,
  max_tokens: 100,
  stream: false
});

const urlObj = new URL(SILICONFLOW_API_URL);
const options = {
  hostname: urlObj.hostname,
  port: 443,
  path: urlObj.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log(`✅ 状态码: ${res.statusCode}`);
  console.log(`📋 响应头:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📦 响应内容:');
    try {
      const jsonData = JSON.parse(body);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.choices && jsonData.choices[0]) {
        console.log('\n💬 AI 回复:', jsonData.choices[0].message.content);
        console.log('\n✅ 测试成功！AI API 工作正常。');
      } else {
        console.log('\n❌ 响应格式不正确');
      }
    } catch (e) {
      console.log('原始响应:', body);
      console.log('\n❌ 解析 JSON 失败:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ 请求失败:', e.message);
});

req.write(data);
req.end();
