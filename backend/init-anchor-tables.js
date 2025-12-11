const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initAnchorTables() {
  try {
    console.log('🔧 开始初始化锚点相关数据表...');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, 'sql', 'anchor_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 分割SQL语句（按分号分割）
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    // 执行每个SQL语句
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log('执行SQL:', trimmedStatement.substring(0, 50) + '...');
        await pool.query(trimmedStatement);
      }
    }
    
    console.log('✅ 锚点相关数据表初始化完成');
    
    // 验证表是否创建成功
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('knowledge_anchors', 'anchor_resources')
    `);
    
    console.log('📋 已创建的表:', tables.map(t => t.TABLE_NAME));
    
  } catch (error) {
    console.error('❌ 初始化锚点数据表失败:', error);
    throw error;
  }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initAnchorTables()
    .then(() => {
      console.log('🎉 数据库初始化完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 数据库初始化失败:', error);
      process.exit(1);
    });
}

module.exports = { initAnchorTables };