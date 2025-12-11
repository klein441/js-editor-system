const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Database config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? '***' : 'NOT SET'
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '520',
  database: process.env.DB_NAME || 'js_editor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function fixRedoFields() {
  console.log('========================================');
  console.log('Fix Redo Feature Database Fields');
  console.log('========================================\n');

  try {
    console.log('Checking homework_submit table...');
    
    // Check if redo_count column exists
    const [redoCountCheck] = await pool.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'js_editor' 
      AND TABLE_NAME = 'homework_submit' 
      AND COLUMN_NAME = 'redo_count'
    `);

    if (redoCountCheck[0].count === 0) {
      console.log('Adding redo_count column...');
      await pool.query(`
        ALTER TABLE homework_submit 
        ADD COLUMN redo_count INT DEFAULT 0 COMMENT 'Redo count'
      `);
      console.log('✓ redo_count column added');
    } else {
      console.log('✓ redo_count column already exists');
    }

    // Check if can_redo column exists
    const [canRedoCheck] = await pool.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'js_editor' 
      AND TABLE_NAME = 'homework_submit' 
      AND COLUMN_NAME = 'can_redo'
    `);

    if (canRedoCheck[0].count === 0) {
      console.log('Adding can_redo column...');
      await pool.query(`
        ALTER TABLE homework_submit 
        ADD COLUMN can_redo TINYINT(1) DEFAULT 0 COMMENT 'Can redo'
      `);
      console.log('✓ can_redo column added');
    } else {
      console.log('✓ can_redo column already exists');
    }

    // Create redo_requests table if not exists
    console.log('\nChecking redo_requests table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS redo_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL COMMENT 'Submission ID',
        student_id INT NOT NULL COMMENT 'Student ID',
        homework_id INT NOT NULL COMMENT 'Homework ID',
        reason TEXT NOT NULL COMMENT 'Redo reason',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Request status',
        teacher_reply TEXT COMMENT 'Teacher reply',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
        reviewed_at TIMESTAMP NULL COMMENT 'Reviewed time',
        INDEX idx_submission (submission_id),
        INDEX idx_student (student_id),
        INDEX idx_homework (homework_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Redo requests'
    `);
    console.log('✓ redo_requests table ready');

    // Show table structure
    console.log('\n========================================');
    console.log('Table Structure:');
    console.log('========================================\n');

    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'js_editor' 
      AND TABLE_NAME = 'homework_submit'
      AND COLUMN_NAME IN ('redo_count', 'can_redo')
    `);

    console.log('homework_submit new columns:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (default: ${col.COLUMN_DEFAULT})`);
    });

    const [redoRequestsCount] = await pool.query(`
      SELECT COUNT(*) as count FROM redo_requests
    `);
    console.log(`\nredo_requests table: ${redoRequestsCount[0].count} records`);

    console.log('\n========================================');
    console.log('✓ Setup completed successfully!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. MySQL service is running');
    console.error('2. Database connection settings in .env file');
    console.error('3. Database js_editor exists');
    console.error('\nError details:', error);
  } finally {
    process.exit();
  }
}

fixRedoFields();
