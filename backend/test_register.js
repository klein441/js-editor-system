// 测试注册功能
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

// 测试数据
const testUsers = [
  {
    username: '2024100',
    password: '123456',
    name: '测试学生',
    email: 'test@student.com',
    phone: '13800138000',
    role: 'student'
  },
  {
    username: 'teacher_test',
    password: 'teacher123',
    name: '测试教师',
    email: 'test@teacher.com',
    phone: '13900139000',
    role: 'teacher'
  }
];

async function testRegister() {
  console.log('========================================');
  console.log('开始测试注册功能');
  console.log('========================================\n');

  for (const user of testUsers) {
    console.log(`测试注册: ${user.name} (${user.username})`);
    
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ 注册成功:', data);
      } else {
        console.log('❌ 注册失败:', data.error);
      }
    } catch (error) {
      console.log('❌ 网络错误:', error.message);
    }

    console.log('');
  }

  // 测试登录
  console.log('========================================');
  console.log('测试登录功能');
  console.log('========================================\n');

  for (const user of testUsers) {
    console.log(`测试登录: ${user.username}`);
    
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
          role: user.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ 登录成功:', data);
      } else {
        console.log('❌ 登录失败:', data.error);
      }
    } catch (error) {
      console.log('❌ 网络错误:', error.message);
    }

    console.log('');
  }
}

// 运行测试
testRegister().then(() => {
  console.log('测试完成！');
  process.exit(0);
}).catch(err => {
  console.error('测试出错:', err);
  process.exit(1);
});
