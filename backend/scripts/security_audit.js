#!/usr/bin/env node

/**
 * Script kiểm tra lỗ hổng bảo mật cơ bản trong codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mẫu nguy hiểm cần tìm
const dangerousPatterns = [
  {
    pattern: /eval\s*\(/g,
    description: 'Sử dụng eval() có thể gây ra lỗ hổng bảo mật'
  },
  {
    pattern: /document\.write\s*\(/g,
    description: 'document.write() có thể gây ra XSS'
  },
  {
    pattern: /innerHTML\s*=/g,
    description: 'innerHTML có thể gây ra XSS nếu không được kiểm soát'
  },
  {
    pattern: /exec\s*\(/g,
    description: 'Thực thi lệnh shell có thể nguy hiểm'
  },
  {
    pattern: /console\.log\s*\(/g, 
    description: 'console.log trong production có thể làm lộ thông tin'
  },
  {
    pattern: /Object\.assign\s*\(\s*{}\s*,\s*req\.body\s*\)/g,
    description: 'Kế thừa trực tiếp từ req.body có thể dẫn đến tấn công mass-assignment'
  },
  {
    pattern: /\.deserialize\s*\(/g,
    description: 'Deserialization không an toàn có thể gây ra lỗ hổng'
  },
  {
    pattern: /new\s+Function\s*\(/g,
    description: 'Tạo function từ string có thể gây ra lỗ hổng tương tự eval()'
  },
  {
    pattern: /jwt\.sign\s*\(\s*.*\s*,\s*('|").*('|")\s*,/g,
    description: 'Hardcoded JWT secret'
  },
  {
    pattern: /nosniff:\s*false/g,
    description: 'X-Content-Type-Options nosniff bị tắt'
  },
  {
    pattern: /password.*=.*('|").*('|")/g,
    description: 'Mật khẩu hardcoded'
  }
];

// Thư mục cần kiểm tra
const srcDir = path.join(__dirname, '..', 'src');

// Các extension cần kiểm tra
const extensions = ['.ts', '.js', '.tsx', '.jsx'];

// Lưu các vấn đề tìm thấy
const issues = [];

/**
 * Kiểm tra một file
 * @param {string} filePath Đường dẫn đến file
 */
function checkFile(filePath) {
  const ext = path.extname(filePath);
  if (!extensions.includes(ext)) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    dangerousPatterns.forEach(({ pattern, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        const lines = content.split('\n');
        let lineNumbers = [];

        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i])) {
            lineNumbers.push(i + 1);
          }
        }

        issues.push({
          file: relativePath,
          lineNumbers,
          pattern: pattern.toString().replace(/[\/]g/g, '').replace(/\\\\/g, '\\'),
          description,
          count: matches.length
        });
      }
    });
  } catch (error) {
    console.error(`Lỗi khi đọc file ${filePath}:`, error.message);
  }
}

/**
 * Duyệt qua thư mục và các thư mục con
 * @param {string} dir Thư mục cần duyệt
 */
function traverseDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        traverseDirectory(filePath);
      } else if (stat.isFile()) {
        checkFile(filePath);
      }
    });
  } catch (error) {
    console.error(`Lỗi khi duyệt thư mục ${dir}:`, error.message);
  }
}

/**
 * Kiểm tra lỗ hổng trong dependencies
 */
function checkDependencies() {
  console.log('\n=== Kiểm tra lỗ hổng trong dependencies ===');
  try {
    const output = execSync('npm audit --json', { encoding: 'utf8' });
    const auditResult = JSON.parse(output);
    
    if (auditResult.metadata.vulnerabilities.total > 0) {
      console.log(`Tìm thấy ${auditResult.metadata.vulnerabilities.total} lỗ hổng bảo mật trong dependencies:`);
      console.log(`  - Nghiêm trọng: ${auditResult.metadata.vulnerabilities.critical}`);
      console.log(`  - Cao: ${auditResult.metadata.vulnerabilities.high}`);
      console.log(`  - Trung bình: ${auditResult.metadata.vulnerabilities.moderate}`);
      console.log(`  - Thấp: ${auditResult.metadata.vulnerabilities.low}`);
      console.log('\nChạy lệnh `npm audit fix` để sửa các lỗ hổng có thể tự động sửa.');
      console.log('Chạy lệnh `npm audit` để xem chi tiết.');
    } else {
      console.log('✓ Không tìm thấy lỗ hổng bảo mật trong dependencies.');
    }
  } catch (error) {
    if (error.stderr) {
      console.error('Lỗi khi kiểm tra dependencies:', error.stderr.toString());
    } else {
      // Xử lý kết quả từ npm audit có lỗ hổng
      try {
        const auditResult = JSON.parse(error.stdout);
        console.log(`Tìm thấy ${auditResult.metadata.vulnerabilities.total} lỗ hổng bảo mật trong dependencies:`);
        console.log(`  - Nghiêm trọng: ${auditResult.metadata.vulnerabilities.critical}`);
        console.log(`  - Cao: ${auditResult.metadata.vulnerabilities.high}`);
        console.log(`  - Trung bình: ${auditResult.metadata.vulnerabilities.moderate}`);
        console.log(`  - Thấp: ${auditResult.metadata.vulnerabilities.low}`);
        console.log('\nChạy lệnh `npm audit fix` để sửa các lỗ hổng có thể tự động sửa.');
        console.log('Chạy lệnh `npm audit` để xem chi tiết.');
      } catch (e) {
        console.error('Lỗi khi kiểm tra dependencies:', error.message);
      }
    }
  }
}

// Thực hiện kiểm tra
console.log('=== Bắt đầu kiểm tra bảo mật ===');
traverseDirectory(srcDir);

// Hiển thị kết quả
if (issues.length > 0) {
  console.log(`\nTìm thấy ${issues.length} vấn đề bảo mật tiềm ẩn:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. File: ${issue.file}`);
    console.log(`   Dòng: ${issue.lineNumbers.join(', ')}`);
    console.log(`   Mẫu: ${issue.pattern}`);
    console.log(`   Mô tả: ${issue.description}`);
    console.log(`   Số lần xuất hiện: ${issue.count}\n`);
  });
  
  console.log('LƯU Ý: Không phải tất cả vấn đề được phát hiện đều là lỗ hổng thực sự.');
  console.log('Vui lòng xem xét từng trường hợp để xác định liệu đó có phải là vấn đề hay không.');
} else {
  console.log('\n✓ Không tìm thấy vấn đề bảo mật tiềm ẩn trong mã nguồn.');
}

// Kiểm tra dependencies
checkDependencies();

console.log('\n=== Kiểm tra bảo mật hoàn tất ==='); 