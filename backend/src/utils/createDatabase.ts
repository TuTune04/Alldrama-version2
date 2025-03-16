import { Logger } from '../utils/logger';
import { Client } from 'pg';
import dotenv from 'dotenv';

const logger = Logger.getLogger('createDatabase');

dotenv.config();

const createDatabase = async () => {
  const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

  // Kết nối đến PostgreSQL server (không phải database cụ thể)
  const client = new Client({
    host: DB_HOST,
    port: parseInt(DB_PORT || '5432'),
    user: DB_USER,
    password: DB_PASS,
    database: 'postgres' // Database mặc định
  });

  try {
    await client.connect();
    
    // Kiểm tra xem database đã tồn tại chưa
    const checkDbResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    // Nếu database chưa tồn tại, tạo mới
    if (checkDbResult.rowCount === 0) {
      logger.debug(`Creating database: ${DB_NAME}`);
      await client.query(`CREATE DATABASE ${DB_NAME}`);
      logger.debug(`Database ${DB_NAME} created successfully`);
    } else {
      logger.debug(`Database ${DB_NAME} already exists`);
    }
  } catch (error) {
    logger.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  createDatabase()
    .then(() => {
      logger.debug('Database creation script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database creation script failed:', error);
      process.exit(1);
    });
}

export default createDatabase; 