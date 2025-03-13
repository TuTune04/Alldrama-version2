/**
 * Mock cho thư viện ioredis để sử dụng trong tests
 * File này sẽ được Jest sử dụng tự động khi moduleNameMapper được cấu hình đúng
 */

class MockRedis {
  constructor() {
    this.storage = new Map();
    this.keyTTL = new Map();
  }

  // Phương thức kết nối
  connect() { return Promise.resolve(); }
  
  // Phương thức đóng kết nối
  disconnect() { return Promise.resolve('OK'); }
  quit() { return Promise.resolve('OK'); }
  
  // Phương thức lưu trữ
  set(key, value) { 
    this.storage.set(key, value); 
    return Promise.resolve('OK'); 
  }
  
  setex(key, ttl, value) {
    this.storage.set(key, value);
    this.keyTTL.set(key, ttl);
    return Promise.resolve('OK');
  }
  
  get(key) {
    return Promise.resolve(this.storage.get(key) || null);
  }
  
  del(key) {
    if (Array.isArray(key)) {
      let count = 0;
      for (const k of key) {
        if (this.storage.delete(k)) count++;
        this.keyTTL.delete(k);
      }
      return Promise.resolve(count);
    } else {
      const existed = this.storage.has(key);
      this.storage.delete(key);
      this.keyTTL.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    }
  }
  
  // Phương thức tăng giảm
  incr(key) {
    const current = parseInt(this.storage.get(key) || '0');
    const next = current + 1;
    this.storage.set(key, next.toString());
    return Promise.resolve(next);
  }
  
  // Phương thức kiểm tra
  exists(key) {
    return Promise.resolve(this.storage.has(key) ? 1 : 0);
  }

  // Phương thức hỗ trợ pipeline
  pipeline() {
    return {
      get: () => this,
      set: () => this,
      setex: () => this,
      del: () => this,
      exec: () => Promise.resolve([]),
    };
  }
  
  // Phương thức pubsub
  publish() {
    return Promise.resolve(0);
  }
  
  // Phương thức cho hash
  hset() {
    return Promise.resolve(1);
  }
  
  hget() {
    return Promise.resolve(null);
  }
  
  hgetall() {
    return Promise.resolve({});
  }
}

module.exports = MockRedis; 