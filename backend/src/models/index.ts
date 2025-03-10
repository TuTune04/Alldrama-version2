import { User } from './User';
import { Movie } from './Movie';
import { Episode } from './Episode';
import { Genre } from './Genre';
import { MoviesGenre } from './MoviesGenre';
import { MovieComment } from './MovieComment';
import { UserFavorite } from './UserFavorite';
import { UserWatchHistory } from './UserWatchHistory';

// Export tất cả các model
export {
  User,
  Movie,
  Episode,
  Genre,
  MoviesGenre,
  MovieComment,
  UserFavorite,
  UserWatchHistory
};

// Default export
const models = {
  User,
  Movie,
  Episode,
  Genre,
  MoviesGenre,
  MovieComment,
  UserFavorite,
  UserWatchHistory
};

export default models; 