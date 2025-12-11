const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '..', 'uploads', 'doc-pdfs');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 将Word文档转换为PDF
 * @param {string} docPath - Word文档的完整路径
 * @param {string} outputName - 输出文件名前缀（不含扩展名）
 * @returns {Promise<string>} 返回PDF的URL
 */
async function convertToPDF(docPath, outputName) {
  console.log('📄 开始转换Word文档:', docPath);
  
  // 检查文件是否存在
  if (!fs.existsSync(docPath)) {
    throw new Error(`Word文档不存在: ${docPath}`);
  }

  // 创建输出目录
  const outputDir = path.join(OUTPUT_DIR, outputName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 使用LibreOffice将Word转换为PDF
    console.log('🔄 使用LibreOffice转换为PDF...');
    const pdfPath = path.join(outputDir, 'document.pdf');
    
    const libreCommand = process.platform === 'win32'
      ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --invisible --nologo --nofirststartwizard --convert-to pdf --outdir "${outputDir}" "${docPath}"`
      : `libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${docPath}"`;
    
    console.log('执行命令:', libreCommand);
    await execPromise(libreCommand, { timeout: 60000 });
    
    // 重命名生成的PDF
    const generatedPdf = path.join(outputDir, path.basename(docPath, path.extname(docPath)) + '.pdf');
    if (fs.existsSync(generatedPdf) && generatedPdf !== pdfPath) {
      fs.renameSync(generatedPdf, pdfPath);
    }
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error('PDF转换失败');
    }
    
    console.log('✅ PDF转换成功:', pdfPath);

    // 返回PDF的URL
    const pdfUrl = `/uploads/doc-pdfs/${outputName}/document.pdf`;
    return pdfUrl;

  } catch (error) {
    console.error('❌ Word转PDF失败:', error);
    
    // 清理失败的文件
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    
    throw new Error(`Word转PDF失败: ${error.message}`);
  }
}

/**
 * 检查Word是否已经转换过
 * @param {string} outputName - 输出文件名前缀
 * @returns {boolean}
 */
function isConverted(outputName) {
  const pdfPath = path.join(OUTPUT_DIR, outputName, 'document.pdf');
  return fs.existsSync(pdfPath);
}

/**
 * 获取已转换的PDF URL
 * @param {string} outputName - 输出文件名前缀
 * @returns {string}
 */
function getConvertedPDF(outputName) {
  return `/uploads/doc-pdfs/${outputName}/document.pdf`;
}

module.exports = {
  convertToPDF,
  isConverted,
  getConvertedPDF
};
