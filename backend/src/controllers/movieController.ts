import { Request, Response } from 'express';
import { Movie } from '../models/Movie';
import { Genre } from '../models/Genre';
import { Op } from 'sequelize';
import { cacheMovieData, getCachedMovieData, cacheSearchResults, getCachedSearchResults } from '../services/redisService';

// Lấy danh sách phim
export const getMovies = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'DESC'
    } = req.query;

    // Tạo cache key dựa trên tham số truy vấn
    const cacheKey = `movies:${page}:${limit}:${sort}:${order}`;
    
    // Kiểm tra cache
    const cachedData = await getCachedSearchResults(cacheKey);
    if (cachedData) {
      console.log(`Đã lấy dữ liệu phim từ cache với key: ${cacheKey}`);
      return res.status(200).json(cachedData);
    }
    
    // Tính offset cho phân trang
    const offset = (Number(page) - 1) * Number(limit);
    
    // Đảm bảo sort là một trường hợp lệ
    const validSortFields = ['title', 'rating', 'views', 'releaseYear', 'createdAt'];
    const sortField = validSortFields.includes(String(sort)) ? sort : 'createdAt';
    
    // Đảm bảo order là ASC hoặc DESC
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    // Thực hiện truy vấn với phân trang
    const { count, rows: movies } = await Movie.findAndCountAll({
      include: [Genre],
      order: [[String(sortField), sortOrder]],
      limit: Number(limit),
      offset: offset
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(count / Number(limit));
    
    // Kết quả trả về
    const result = {
      movies,
      pagination: {
        total: count,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit)
      }
    };
    
    // Lưu vào cache
    await cacheSearchResults(cacheKey, result, 300); // cache 5 phút
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phim' });
  }
};

// Lấy chi tiết phim theo ID
export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra cache
    const cachedMovie = await getCachedMovieData(Number(id));
    if (cachedMovie) {
      console.log(`Đã lấy thông tin phim ID ${id} từ cache`);
      return res.status(200).json(cachedMovie);
    }
    
    // Không có trong cache, truy vấn database
    const movie = await Movie.findByPk(id, {
      include: [Genre]
    });
    
    if (!movie) {
      return res.status(404).json({ message: 'Không tìm thấy phim' });
    }
    
    // Lưu vào cache
    await cacheMovieData(Number(id), movie, 3600); // cache 1 giờ
    
    res.status(200).json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin phim' });
  }
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

// Tìm kiếm phim
export const searchMovies = async (req: Request, res: Response) => {
  try {
    const { 
      q, // từ khóa tìm kiếm
      genre, // id thể loại
      year, // năm phát hành 
      page = 1, // trang hiện tại
      limit = 10, // số lượng kết quả mỗi trang
      sort = 'createdAt', // trường để sắp xếp
      order = 'DESC' // thứ tự sắp xếp (ASC hoặc DESC)
    } = req.query;

    // Tạo cache key dựa trên tham số tìm kiếm
    const cacheKey = `search:${q || ''}:${genre || ''}:${year || ''}:${page}:${limit}:${sort}:${order}`;
    
    // Kiểm tra cache
    const cachedResults = await getCachedSearchResults(cacheKey);
    if (cachedResults) {
      console.log(`Đã lấy kết quả tìm kiếm từ cache với key: ${cacheKey}`);
      return res.status(200).json(cachedResults);
    }

    // Khởi tạo điều kiện tìm kiếm
    const whereConditions: any = {};
    
    // Tìm kiếm theo từ khóa (trong tiêu đề và tóm tắt)
    if (q) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { summary: { [Op.iLike]: `%${q}%` } }
      ];
    }
    
    // Tìm kiếm theo năm phát hành
    if (year) {
      whereConditions.releaseYear = year;
    }
    
    // Tạo điều kiện cho thể loại (nếu có)
    let genreCondition = {};
    if (genre) {
      genreCondition = {
        model: Genre,
        where: { id: genre }
      };
    } else {
      genreCondition = {
        model: Genre
      };
    }
    
    // Tính offset cho phân trang
    const offset = (Number(page) - 1) * Number(limit);
    
    // Đảm bảo sort là một trường hợp lệ
    const validSortFields = ['title', 'rating', 'views', 'releaseYear', 'createdAt'];
    const sortField = validSortFields.includes(String(sort)) ? sort : 'createdAt';
    
    // Đảm bảo order là ASC hoặc DESC
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    
    // Thực hiện truy vấn với phân trang
    const { count, rows: movies } = await Movie.findAndCountAll({
      where: whereConditions,
      include: [genreCondition],
      order: [[String(sortField), sortOrder]],
      limit: Number(limit),
      offset,
      distinct: true // Cần thiết khi sử dụng include để có count chính xác
    });
    
    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(count / Number(limit));
    
    // Kết quả trả về
    const result = {
      movies,
      pagination: {
        total: count,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit)
      }
    };
    
    // Lưu vào cache
    await cacheSearchResults(cacheKey, result, 300); // cache 5 phút
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error searching movies:', error);
    return res.status(500).json({ message: 'Lỗi khi tìm kiếm phim' });
  }
}; 