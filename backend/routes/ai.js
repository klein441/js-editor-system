const express = require('express');
const router = express.Router();
const https = require('https');

// 硅基流动 AI API 配置（免费）
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'your-api-key-here';
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const SILICONFLOW_MODEL = 'Qwen/Qwen2.5-7B-Instruct'; // 免费模型

// 使用 https 模块发送请求的辅助函数
function httpsRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ ok: true, status: res.statusCode, json: () => Promise.resolve(JSON.parse(body)) });
          } catch (e) {
            reject(new Error('Failed to parse JSON response'));
          }
        } else {
          resolve({ ok: false, status: res.statusCode, text: () => Promise.resolve(body) });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// AI 聊天接口
router.post('/chat', async (req, res) => {
  try {
    const { messages, userRole, userName } = req.body;

    // 构建系统提示词
    const systemPrompt = userRole === 'teacher' 
      ? `你是一个专业的编程教学助手，正在帮助教师 ${userName}。你可以帮助教师：
1. 设计编程作业和课程内容
2. 解答教学相关问题
3. 提供教学建议和最佳实践
4. 帮助批改和评估学生作业
请用专业、友好的语气回答问题。`
      : `你是一个友好的编程学习助手，正在帮助学生 ${userName}。你可以帮助学生：
1. 解答编程学习中的问题
2. 解释代码概念和语法
3. 提供学习建议和资源
4. 帮助调试代码问题
请用简单易懂的语言回答问题，鼓励学生独立思考。`;

    // 调用硅基流动 API
    const response = await httpsRequest(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
      }
    }, {
      model: SILICONFLOW_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: false
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('硅基流动 API 错误:', response.status, errorText);
      throw new Error(`硅基流动 API error: ${response.status}`);
    }

    const data = await response.json();
    
    // 检查响应格式
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('API 响应格式错误:', data);
      throw new Error('Invalid API response format');
    }
    
    const reply = data.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error('AI聊天错误:', error);
    res.status(500).json({ 
      error: 'AI服务暂时不可用',
      details: error.message 
    });
  }
});

module.exports = router;
