// AI API 诊断脚本
require('dotenv').config();

console.log('=== AI API 诊断 ===\n');

// 1. 检查环境变量
console.log('1️⃣ 环境变量检查:');
console.log('   SILICONFLOW_API_KEY:', process.env.SILICONFLOW_API_KEY ? '✅ 已配置' : '❌ 未配置');
if (process.env.SILICONFLOW_API_KEY) {
  console.log('   密钥长度:', process.env.SILICONFLOW_API_KEY.length);
  console.log('   密钥前缀:', process.env.SILICONFLOW_API_KEY.substring(0, 10) + '...');
}

// 2. 检查网络连接
console.log('\n2️⃣ 网络连接检查:');
const https = require('https');

https.get('https://api.siliconflow.cn', (res) => {
  console.log('   硅基流动 API:', res.statusCode === 404 ? '✅ 可访问' : `⚠️ 状态码 ${res.statusCode}`);
}).on('error', (e) => {
  console.log('   硅基流动 API: ❌ 无法访问 -', e.message);
});

// 3. 测试 API 调用
setTimeout(() => {
  console.log('\n3️⃣ API 调用测试:');
  
  const data = JSON.stringify({
    model: 'Qwen/Qwen2.5-7B-Instruct',
    messages: [
      { role: 'user', content: 'Hi' }
    ],
    max_tokens: 10
  });

  const options = {
    hostname: 'api.siliconflow.cn',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('   状态码:', res.statusCode);
      
      if (res.statusCode === 200) {
        console.log('   ✅ API 调用成功！');
        try {
          const json = JSON.parse(body);
          if (json.choices && json.choices[0]) {
            console.log('   AI 回复:', json.choices[0].message.content);
          }
        } catch (e) {
          console.log('   响应:', body);
        }
      } else if (res.statusCode === 401) {
        console.log('   ❌ API 密钥无效或已过期');
        console.log('   响应:', body);
        console.log('\n💡 解决方案:');
        console.log('   1. 访问 https://cloud.siliconflow.cn/account/ak');
        console.log('   2. 创建新的 API 密钥');
        console.log('   3. 更新 backend/.env 文件中的 SILICONFLOW_API_KEY');
      } else {
        console.log('   ❌ API 调用失败');
        console.log('   响应:', body);
      }
    });
  });

  req.on('error', (e) => {
    console.log('   ❌ 请求错误:', e.message);
  });

  req.write(data);
  req.end();
}, 1000);

console.log('\n等待测试完成...');
