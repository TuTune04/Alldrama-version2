/**
 * Tiện ích bảo mật để lọc và ngăn chặn các tấn công XSS
 */

/**
 * Lọc nội dung đầu vào để loại bỏ các mã script tiềm ẩn
 * @param input Chuỗi đầu vào cần lọc
 * @returns Chuỗi đã được lọc an toàn
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';

  return input
    // Loại bỏ thẻ script
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Loại bỏ các thuộc tính onX
    .replace(/on\w+="[^"]*"/g, '')
    // Loại bỏ javascript: URL schemes
    .replace(/javascript:/gi, '')
    // Loại bỏ các thuộc tính data
    .replace(/data-\w+="[^"]*"/g, '')
    // Loại bỏ các thẻ iframe
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Encode các ký tự đặc biệt HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Kiểm tra URL có an toàn không
 * @param url URL cần kiểm tra
 * @returns true nếu URL an toàn, false nếu không
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Kiểm tra protocol
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (e) {
    return false;
  }
};

/**
 * Lọc đối tượng JSON để loại bỏ các mã script tiềm ẩn
 * @param obj Đối tượng cần lọc
 * @returns Đối tượng đã được lọc an toàn
 */
export const sanitizeObject = <T extends object>(obj: T): T => {
  const result = { ...obj };

  Object.keys(result).forEach(key => {
    const value = result[key as keyof T];

    if (typeof value === 'string') {
      result[key as keyof T] = sanitizeString(value) as any;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key as keyof T] = sanitizeObject(value as object) as any;
    } else if (Array.isArray(value)) {
      result[key as keyof T] = value.map(item => 
        typeof item === 'string' 
          ? sanitizeString(item) 
          : typeof item === 'object' && item !== null 
            ? sanitizeObject(item as object) 
            : item
      ) as any;
    }
  });

  return result;
};

/**
 * Kiểm tra chuỗi có chứa nội dung XSS không
 * @param input Chuỗi cần kiểm tra
 * @returns true nếu phát hiện XSS, false nếu không
 */
export const detectXss = (input: string): boolean => {
  if (!input) return false;
  
  const xssPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+=/i,
    /data:/i,
    /<iframe\b/i,
    /document\.(cookie|write|location)/i,
    /eval\(/i,
    /new Function\(/i,
    /alert\(/i
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}; 