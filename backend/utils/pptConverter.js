const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '..', 'uploads', 'ppt-images');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 将PPT转换为图片
 * @param {string} pptPath - PPT文件的完整路径
 * @param {string} outputName - 输出文件名前缀（不含扩展名）
 * @returns {Promise<Array>} 返回图片URL数组
 */
async function convertToImages(pptPath, outputName) {
  console.log('📄 开始转换PPT:', pptPath);
  
  // 检查文件是否存在
  if (!fs.existsSync(pptPath)) {
    throw new Error(`PPT文件不存在: ${pptPath}`);
  }

  // 创建输出目录
  const outputDir = path.join(OUTPUT_DIR, outputName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 第一步：使用LibreOffice将PPT转换为PDF
    console.log('🔄 步骤1: 将PPT转换为PDF...');
    const pdfPath = path.join(outputDir, 'temp.pdf');
    
    // 添加更多参数确保正确转换
    const libreCommand = process.platform === 'win32'
      ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --invisible --nologo --nofirststartwizard --convert-to pdf:writer_pdf_Export --outdir "${outputDir}" "${pptPath}"`
      : `libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${pptPath}"`;
    
    console.log('执行命令:', libreCommand);
    await execPromise(libreCommand, { timeout: 60000 });
    
    // 重命名生成的PDF
    const generatedPdf = path.join(outputDir, path.basename(pptPath, path.extname(pptPath)) + '.pdf');
    if (fs.existsSync(generatedPdf) && generatedPdf !== pdfPath) {
      fs.renameSync(generatedPdf, pdfPath);
    }
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error('PDF转换失败');
    }
    
    console.log('✅ PDF转换成功:', pdfPath);

    // 第二步：使用ImageMagick将PDF转换为图片
    console.log('🔄 步骤2: 将PDF转换为图片...');
    const imagePattern = path.join(outputDir, 'slide-%03d.png');
    
    // 尝试多种方法修复黑色图片问题
    const magickCommand = `magick convert -density 150 "${pdfPath}" -flatten -background white -alpha off -colorspace RGB -quality 95 "${imagePattern}"`;
    
    console.log('执行命令:', magickCommand);
    await execPromise(magickCommand, { timeout: 120000 });
    
    // 暂时不删除PDF，用于调试
    console.log('📄 PDF文件保存在:', pdfPath);
    // if (fs.existsSync(pdfPath)) {
    //   fs.unlinkSync(pdfPath);
    // }

    // 读取生成的图片
    const files = fs.readdirSync(outputDir)
      .filter(f => f.startsWith('slide-') && f.endsWith('.png'))
      .sort();

    if (files.length === 0) {
      throw new Error('没有生成任何图片');
    }

    console.log(`✅ 成功生成 ${files.length} 张图片`);

    // 构建图片URL数组
    const slides = files.map((file, index) => {
      const imageUrl = `/uploads/ppt-images/${outputName}/${file}`;
      return {
        page: index + 1,
        imageUrl: imageUrl,
        thumbnail: imageUrl, // 使用相同图片作为缩略图
        fileName: file
      };
    });

    return slides;

  } catch (error) {
    console.error('❌ PPT转换失败:', error);
    
    // 清理失败的文件
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    
    throw new Error(`PPT转换失败: ${error.message}`);
  }
}

/**
 * 检查PPT是否已经转换过
 * @param {string} outputName - 输出文件名前缀
 * @returns {boolean}
 */
function isConverted(outputName) {
  const outputDir = path.join(OUTPUT_DIR, outputName);
  if (!fs.existsSync(outputDir)) {
    return false;
  }
  
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('slide-') && f.endsWith('.png'));
  
  return files.length > 0;
}

/**
 * 获取已转换的图片
 * @param {string} outputName - 输出文件名前缀
 * @returns {Array}
 */
function getConvertedImages(outputName) {
  const outputDir = path.join(OUTPUT_DIR, outputName);
  
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('slide-') && f.endsWith('.png'))
    .sort();

  return files.map((file, index) => {
    const imageUrl = `/uploads/ppt-images/${outputName}/${file}`;
    return {
      page: index + 1,
      imageUrl: imageUrl,
      thumbnail: imageUrl,
      fileName: file
    };
  });
}

module.exports = {
  convertToImages,
  isConverted,
  getConvertedImages
};