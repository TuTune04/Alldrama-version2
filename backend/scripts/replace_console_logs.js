#!/usr/bin/env node

/**
 * Script thay thế console.log, console.error, console.warn bằng Logger
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Các extension cần xử lý
const extensions = ['.ts', '.js'];

// Thư mục cần kiểm tra
const srcDir = path.join(__dirname, '..', 'src');

// Các pattern để thay thế
const patterns = [
  {
    regex: /console\.log\s*\(\s*(.*)\s*\)/g,
    replacement: (match, p1) => `logger.debug(${p1})`
  },
  {
    regex: /console\.error\s*\(\s*(.*)\s*\)/g,
    replacement: (match, p1) => `logger.error(${p1})`
  },
  {
    regex: /console\.warn\s*\(\s*(.*)\s*\)/g,
    replacement: (match, p1) => `logger.warn(${p1})`
  },
  {
    regex: /console\.info\s*\(\s*(.*)\s*\)/g,
    replacement: (match, p1) => `logger.info(${p1})`
  }
];

// Các file không nên xử lý
const ignoredFiles = ['logger.ts'];
const ignoredFolders = ['__tests__', '__mocks__'];

// Đếm số file đã xử lý
let totalProcessed = 0;
let totalReplaced = 0;

/**
 * Kiểm tra nếu file cần được bỏ qua
 */
function shouldIgnoreFile(filePath) {
  const fileName = path.basename(filePath);
  if (ignoredFiles.includes(fileName)) return true;
  
  for (const folder of ignoredFolders) {
    if (filePath.includes(`/${folder}/`)) return true;
  }
  
  return false;
}

/**
 * Thay thế console.log trong một file
 */
function replaceInFile(filePath) {
  if (shouldIgnoreFile(filePath)) return 0;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasLogger = content.includes('import { Logger }');
    let hasLoggerInstance = content.includes('const logger = Logger.getLogger');
    
    // Thực hiện thay thế
    let replacementsCount = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        replacementsCount += matches.length;
        content = content.replace(pattern.regex, pattern.replacement);
      }
    }
    
    // Không có gì để thay thế
    if (replacementsCount === 0) return 0;
    
    // Xác định đường dẫn tương đối tới logger dựa trên vị trí file
    let importPath = '../utils/logger';
    const relativeToSrc = path.relative(srcDir, path.dirname(filePath));
    
    if (!relativeToSrc || relativeToSrc === '') {
      // File nằm trực tiếp trong thư mục src, sử dụng đường dẫn tương đối
      importPath = './utils/logger';
    } else {
      // Tính đường dẫn tương đối dựa trên số cấp thư mục
      const levels = relativeToSrc.split(path.sep).length;
      importPath = '../'.repeat(levels) + 'utils/logger';
    }
    
    // Nếu có thay thế nhưng chưa import Logger, thêm import
    if (!hasLogger) {
      content = `import { Logger } from '${importPath}';\n${content}`;
    }
    
    // Nếu có thay thế nhưng chưa tạo instance logger, thêm
    if (!hasLoggerInstance) {
      // Tìm vị trí sau các import
      const lastImportIndex = content.lastIndexOf('import');
      if (lastImportIndex >= 0) {
        const endOfImportIndex = content.indexOf('\n', lastImportIndex);
        if (endOfImportIndex >= 0) {
          const className = path.basename(filePath, path.extname(filePath));
          content = content.substring(0, endOfImportIndex + 1) + 
                    `\nconst logger = Logger.getLogger('${className}');\n` + 
                    content.substring(endOfImportIndex + 1);
        }
      }
    }
    
    // Lưu file nếu có thay đổi
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return replacementsCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`Lỗi khi xử lý file ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Duyệt qua thư mục và xử lý các file
 */
function processDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (stat.isFile() && extensions.includes(path.extname(file))) {
        const replacements = replaceInFile(filePath);
        if (replacements > 0) {
          console.log(`${filePath}: Thay thế ${replacements} console.log/error/warn`);
          totalProcessed++;
          totalReplaced += replacements;
        }
      }
    }
  } catch (error) {
    console.error(`Lỗi khi xử lý thư mục ${dir}:`, error.message);
  }
}

// Thực hiện thay thế
console.log('=== Bắt đầu thay thế console.log bằng Logger ===');
processDirectory(srcDir);

console.log(`\nHoàn thành thay thế ${totalReplaced} console.log/error/warn trong ${totalProcessed} file.`);
console.log('=== Kết thúc thay thế ==='); 