import { UserFavorite } from '../../models/UserFavorite';
import { Movie } from '../../models/Movie';
import { Genre } from '../../models/Genre';
import { User } from '../../models/User';

/**
 * Interface cho favorite item response
 */
export interface FavoriteResponse {
  id: number;
  userId: number;
  movieId: number;
  favoritedAt: Date;
  movie?: Movie;
}

/**
 * Service xử lý business logic cho phim yêu thích của người dùng
 */
export class FavoriteService {
  /**
   * Lấy danh sách phim yêu thích của người dùng
   */
  public async getUserFavorites(userId: number): Promise<FavoriteResponse[]> {
    // Kiểm tra tồn tại của user
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    const favorites = await UserFavorite.findAll({
      where: { userId },
      include: [
        {
          model: Movie,
          include: [Genre]
        }
      ],
      order: [['favoritedAt', 'DESC']]
    });
    
    return favorites;
  }

  /**
   * Thêm phim vào danh sách yêu thích
   */
  public async addToFavorites(userId: number, movieId: number): Promise<FavoriteResponse> {
    // Kiểm tra tồn tại của user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Kiểm tra tồn tại của movie
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      throw new Error('Không tìm thấy phim');
    }

    // Kiểm tra nếu phim đã có trong danh sách yêu thích
    const existingFavorite = await UserFavorite.findOne({
      where: { userId, movieId }
    });

    if (existingFavorite) {
      throw new Error('Phim đã tồn tại trong danh sách yêu thích');
    }

    // Thêm vào danh sách yêu thích
    const favorite = await UserFavorite.create({
      userId,
      movieId,
      favoritedAt: new Date()
    });

    // Lấy thông tin đầy đủ của favorite
    const favoriteWithMovie = await UserFavorite.findByPk(favorite.id, {
      include: [
        {
          model: Movie,
          include: [Genre]
        }
      ]
    });

    return favoriteWithMovie!;
  }

  /**
   * Xóa phim khỏi danh sách yêu thích
   */
  public async removeFromFavorites(userId: number, movieId: number): Promise<boolean> {
    // Kiểm tra tồn tại của favorite
    const favorite = await UserFavorite.findOne({
      where: { userId, movieId }
    });

    if (!favorite) {
      throw new Error('Phim không tồn tại trong danh sách yêu thích');
    }

    // Xóa khỏi danh sách yêu thích
    await favorite.destroy();

    return true;
  }

  /**
   * Kiểm tra xem phim có trong danh sách yêu thích của người dùng hay không
   */
  public async isFavorite(userId: number, movieId: number): Promise<boolean> {
    const favorite = await UserFavorite.findOne({
      where: { userId, movieId }
    });

    return !!favorite;
  }
} 