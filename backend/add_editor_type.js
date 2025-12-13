const pool = require('./db');

async function addEditorType() {
  try {
    console.log('🔧 开始修改anchor_resources表结构...');
    
    // 修改resource_type字段，添加'editor'类型
    await pool.query(`
      ALTER TABLE anchor_resources 
      MODIFY COLUMN resource_type ENUM('video', 'code', 'syntax', 'editor') NOT NULL
    `);
    
    console.log('✅ 成功添加editor资源类型！');
    
    // 验证修改
    const [result] = await pool.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'js_editor' 
        AND TABLE_NAME = 'anchor_resources' 
        AND COLUMN_NAME = 'resource_type'
    `);
    
    console.log('📊 当前resource_type字段类型:', result[0].COLUMN_TYPE);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 修改失败:', error.message);
    process.exit(1);
  }
}

addEditorType();
