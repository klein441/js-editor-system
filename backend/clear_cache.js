const fs = require('fs');
const path = require('path');

// 清理转换缓存
const cacheDir = path.join(__dirname, 'uploads', 'converted');

console.log('🧹 开始清理缓存...');
console.log('缓存目录:', cacheDir);

if (fs.existsSync(cacheDir)) {
  const folders = fs.readdirSync(cacheDir);
  
  folders.forEach(folder => {
    const folderPath = path.join(cacheDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      console.log('删除:', folder);
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
  });
  
  console.log('✅ 缓存清理完成！');
  console.log(`共删除 ${folders.length} 个缓存文件夹`);
} else {
  console.log('⚠️  缓存目录不存在');
}

console.log('');
console.log('现在可以重新测试PPT预览了！');
