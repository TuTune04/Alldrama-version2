"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Định nghĩa interface cho Movie
export interface Movie {
  id: number;
  title: string;
  rating: string;
  views: number;
  genre: string;
  summary: string;
  duration: number;
  totalEpisodes: number;
  releaseYear: number;
  posterUrl: string;
  trailerUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa interface cho state của Movie Context, bao gồm các hàm và state liên quan
interface MovieState {
  selectedMovie: number | null;
  setSelectedMovie: (movieId: number | null) => void;
  movies: Movie[];
  setMovies: (movies: Movie[]) => void;
  loading: boolean;
  fetchMovies: () => Promise<void>;
}

// Tạo Context, khởi tạo với undefined
const MovieContext = createContext<MovieState | undefined>(undefined);

// Tạo Provider để bao bọc ứng dụng (hoặc các phần cần quản lý state phim)
export const MovieProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Hàm fetchMovies gọi API lấy danh sách phim
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://alldramaz.com/api/movies");
      // Giả sử dữ liệu trả về nằm ở response.data
      setMovies(response.data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Nếu muốn tự động gọi API khi component mount, có thể sử dụng useEffect
  // useEffect(() => {
  //   fetchMovies();
  // }, []);

  return (
    <MovieContext.Provider
      value={{
        selectedMovie,
        setSelectedMovie,
        movies,
        setMovies,
        loading,
        fetchMovies,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

// Hook để truy cập Movie Context từ các component con
export const useMovie = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovie must be used within a MovieProvider");
  }
  return context;
};
