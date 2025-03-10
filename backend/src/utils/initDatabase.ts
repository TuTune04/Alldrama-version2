import sequelize from '../config/database';
import { User, UserRole } from '../models/User';
import { Movie } from '../models/Movie';
import { Episode } from '../models/Episode';
import { Genre } from '../models/Genre';
import { MoviesGenre } from '../models/MoviesGenre';
import { MovieComment } from '../models/MovieComment';
import { UserFavorite } from '../models/UserFavorite';
import { UserWatchHistory } from '../models/UserWatchHistory';
import bcrypt from 'bcrypt';

// Hàm tạo dữ liệu mẫu
const seedData = async () => {
  try {
    // Tạo người dùng mẫu
    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN
    });

    const normalUser = await User.create({
      full_name: 'Normal User',
      email: 'user@example.com',
      password: await bcrypt.hash('user123', 10),
      role: UserRole.USER
    });

    // Tạo thể loại mẫu
    const actionGenre = await Genre.create({ name: 'Hành động' });
    const romanceGenre = await Genre.create({ name: 'Tình cảm' });
    const comedyGenre = await Genre.create({ name: 'Hài hước' });

    // Tạo phim mẫu
    const movie1 = await Movie.create({
      title: 'Phim hành động 1',
      summary: 'Đây là một bộ phim hành động hấp dẫn',
      rating: 8.5,
      releaseYear: 2023,
      posterUrl: 'https://example.com/poster1.jpg',
      trailerUrl: 'https://example.com/trailer1.mp4'
    });

    const movie2 = await Movie.create({
      title: 'Phim tình cảm 1',
      summary: 'Đây là một bộ phim tình cảm lãng mạn',
      rating: 7.8,
      releaseYear: 2022,
      posterUrl: 'https://example.com/poster2.jpg',
      trailerUrl: 'https://example.com/trailer2.mp4'
    });

    // Liên kết phim với thể loại
    await movie1.$add('genres', [actionGenre, comedyGenre]);
    await movie2.$add('genres', [romanceGenre, comedyGenre]);

    // Tạo tập phim mẫu
    await Episode.create({
      movieId: movie1.id,
      episodeNumber: 1,
      playlistUrl: 'https://example.com/movie1/ep1.mp4'
    });

    await Episode.create({
      movieId: movie1.id,
      episodeNumber: 2,
      playlistUrl: 'https://example.com/movie1/ep2.mp4'
    });

    // Tạo bình luận mẫu
    await MovieComment.create({
      movieId: movie1.id,
      userId: normalUser.id,
      userName: normalUser.full_name,
      comment: 'Phim rất hay và hấp dẫn!'
    });

    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
};

const initDatabase = async () => {
  try {
    // Đăng ký các model
    sequelize.addModels([
      User,
      Movie,
      Episode,
      Genre,
      MoviesGenre,
      MovieComment,
      UserFavorite,
      UserWatchHistory
    ]);

    // Đồng bộ hóa cơ sở dữ liệu (tạo bảng nếu chưa tồn tại)
    // Sử dụng force: true để xóa và tạo lại bảng (chỉ dùng trong môi trường phát triển)
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');

    // Tạo dữ liệu mẫu
    await seedData();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export default initDatabase; 