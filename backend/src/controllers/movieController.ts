import { Request, Response } from 'express';
import { Movie } from '../models/Movie';
import { Genre } from '../models/Genre';

// Lấy danh sách phim
export const getMovies = (req: Request, res: Response) => {
  Movie.findAll({
    include: [Genre],
    order: [['createdAt', 'DESC']]
  })
    .then(movies => {
      res.status(200).json(movies);
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách phim' });
    });
};

// Lấy chi tiết phim theo ID
export const getMovieById = (req: Request, res: Response) => {
  const { id } = req.params;
  
  Movie.findByPk(id, {
    include: [Genre]
  })
    .then(movie => {
      if (!movie) {
        return res.status(404).json({ message: 'Không tìm thấy phim' });
      }
      
      res.status(200).json(movie);
    })
    .catch(error => {
      console.error('Error fetching movie:', error);
      res.status(500).json({ message: 'Lỗi khi lấy thông tin phim' });
    });
};

// Tạo phim mới
export const createMovie = (req: Request, res: Response) => {
  const movieData = req.body;
  let createdMovie: any;
  
  Movie.create(movieData)
    .then(newMovie => {
      createdMovie = newMovie;
      // Nếu có genres, thêm vào bảng liên kết
      if (movieData.genreIds && movieData.genreIds.length > 0) {
        return Genre.findAll({
          where: {
            id: movieData.genreIds
          }
        })
          .then(genres => {
            return createdMovie.$set('genres', genres);
          });
      }
      
      return Promise.resolve();
    })
    .then(() => {
      return Movie.findByPk(createdMovie.id, {
        include: [Genre]
      });
    })
    .then(movie => {
      res.status(201).json(movie);
    })
    .catch(error => {
      console.error('Error creating movie:', error);
      res.status(500).json({ message: 'Lỗi khi tạo phim mới' });
    });
};

// Cập nhật phim
export const updateMovie = (req: Request, res: Response) => {
  const { id } = req.params;
  const movieData = req.body;
  let movieToUpdate: any;
  
  Movie.findByPk(id)
    .then(movie => {
      if (!movie) {
        res.status(404).json({ message: 'Không tìm thấy phim' });
        return Promise.reject('Movie not found');
      }
      
      movieToUpdate = movie;
      // Cập nhật thông tin phim
      return movie.update(movieData);
    })
    .then(() => {
      // Nếu có genres, cập nhật bảng liên kết
      if (movieData.genreIds && movieData.genreIds.length > 0) {
        return Genre.findAll({
          where: {
            id: movieData.genreIds
          }
        })
          .then(genres => {
            return movieToUpdate.$set('genres', genres);
          });
      }
      
      return Promise.resolve();
    })
    .then(() => {
      return Movie.findByPk(id, {
        include: [Genre]
      });
    })
    .then(updatedMovie => {
      res.status(200).json(updatedMovie);
    })
    .catch(error => {
      if (error !== 'Movie not found') {
        console.error('Error updating movie:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật phim' });
      }
    });
};

// Xóa phim
export const deleteMovie = (req: Request, res: Response) => {
  const { id } = req.params;
  
  Movie.findByPk(id)
    .then(movie => {
      if (!movie) {
        res.status(404).json({ message: 'Không tìm thấy phim' });
        return Promise.reject('Movie not found');
      }
      
      return movie.destroy();
    })
    .then(() => {
      res.status(200).json({ message: 'Xóa phim thành công' });
    })
    .catch(error => {
      if (error !== 'Movie not found') {
        console.error('Error deleting movie:', error);
        res.status(500).json({ message: 'Lỗi khi xóa phim' });
      }
    });
}; 