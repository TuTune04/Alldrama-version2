# Quy Tắc Code Cho Dự Án AllDrama

Tài liệu này định nghĩa các quy tắc và chuẩn mực code của dự án AllDrama để đảm bảo code được nhất quán, dễ đọc và dễ bảo trì.

## Quy Tắc Chung

1. **Sử dụng TypeScript**: Tất cả code phải được viết bằng TypeScript với đầy đủ type definitions
2. **Định dạng code**: Sử dụng ESLint và Prettier cho định dạng code
3. **Tên biến/hàm**: Sử dụng camelCase cho biến và hàm
4. **Tên component**: Sử dụng PascalCase cho React components
5. **Tên file**:
   - Components: `PascalCase.tsx`
   - Hooks: `useCamelCase.ts`
   - Utility: `camelCase.ts`
6. **Nhất quán phong cách**: Dùng functional components và React hooks

## Cú Pháp TypeScript

1. **Định nghĩa types rõ ràng**:

   ```typescript
   // Tốt
   const user: User = { id: "1", name: "Nguyen Van A" };

   // Tránh
   const user = { id: "1", name: "Nguyen Van A" }; // implicit any
   ```

2. **Sử dụng interface cho objects và type cho unions/intersections**:

   ```typescript
   // Ưu tiên interface cho models
   interface User {
     id: string;
     name: string;
     email?: string;
   }

   // Ưu tiên type cho unions
   type ButtonSize = "small" | "medium" | "large";
   ```

3. **Tránh any khi có thể**:

   ```typescript
   // Tránh
   const processData = (data: any) => {
     /* ... */
   };

   // Tốt
   const processData = <T>(data: T) => {
     /* ... */
   };
   ```

## React Components

1. **Functional Components và Hooks**:

   ```typescript
   // Ưu tiên cách này
   const MovieCard = ({ movie }: { movie: Movie }) => {
     return <div>{movie.title}</div>;
   };

   // Tránh Class Components
   ```

2. **Props và PropTypes**:

   ```typescript
   interface ButtonProps {
     variant?: "primary" | "secondary";
     size?: "small" | "medium" | "large";
     onClick?: () => void;
     children: React.ReactNode;
   }

   const Button = ({
     variant = "primary",
     size = "medium",
     onClick,
     children,
   }: ButtonProps) => {
     // ...
   };
   ```

3. **Destructuring**:

   ```typescript
   // Tốt
   const MovieCard = ({ title, posterUrl }: Movie) => {
     // ...
   };

   // Tránh
   const MovieCard = (props: Movie) => {
     const title = props.title;
     // ...
   };
   ```

4. **Tách biệt UI và Logic**:
   - Sử dụng custom hooks để tách biệt business logic khỏi UI
   - Ưu tiên pure components khi có thể

## Routing và Navigation

1. **Sử dụng constants**:

   ```typescript
   // Tốt
   import { ROUTES } from "@/constants/routes";
   navigate(ROUTES.MOVIE_DETAIL(movieId));

   // Tránh
   navigate(`/movies/${movieId}`);
   ```

2. **Navigation helpers**:

   ```typescript
   // Tốt
   import { getMovieUrl } from "@/utils/navigation";
   navigate(getMovieUrl(movie));

   // Tránh
   navigate(`/movies/${movie.id}-${slugify(movie.title)}`);
   ```

## State Management

1. **Local State**: Sử dụng `useState` cho state đơn giản trong component
2. **Form State**: Sử dụng custom hooks cho quản lý form
3. **Global State**: Sử dụng Zustand
4. **Async State**: Quản lý trạng thái loading/error rõ ràng

## API Calls và Data Fetching

1. **Tách biệt API logic**:

   ```typescript
   // Trong hooks hoặc services
   const useMovies = () => {
     const [movies, setMovies] = useState<Movie[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     const fetchMovies = async () => {
       try {
         setLoading(true);
         const data = await moviesApi.getAll();
         setMovies(data);
       } catch (err) {
         setError("Không thể tải danh sách phim");
       } finally {
         setLoading(false);
       }
     };

     return { movies, loading, error, fetchMovies };
   };
   ```

2. **Error handling nhất quán**:
   ```typescript
   try {
     const data = await api.method();
     // xử lý dữ liệu
   } catch (error) {
     console.error("Chi tiết lỗi:", error);
     // hiển thị toast hoặc thông báo
     toast.error("Thông báo lỗi thân thiện");
   }
   ```

## CSS và Styling

1. **TailwindCSS**: Ưu tiên sử dụng Tailwind classes
2. **CSS Modules** hoặc **Styled Components**: Cho styling phức tạp
3. **Responsive**: Thiết kế responsive sử dụng breakpoints của Tailwind

## Internationalization

1. **Sử dụng i18n hooks**:

   ```typescript
   const { t } = useTranslation();
   return <h1>{t("welcome.title")}</h1>;
   ```

2. **Tổ chức key theo tính năng**:
   ```typescript
   // Ví dụ: auth.login.title, movies.detail.cast
   ```

## Commenting và Documentation

1. **JSDoc cho functions và components**:

   ```typescript
   /**
    * Component hiển thị thông tin chi tiết phim
    * @param {Movie} movie - Thông tin phim
    * @param {boolean} showFullDescription - Hiển thị mô tả đầy đủ
    * @returns {JSX.Element}
    */
   const MovieDetail = ({ movie, showFullDescription }: MovieDetailProps) => {
     // ...
   };
   ```

2. **Comment cho logic phức tạp**:
   ```typescript
   // Tính toán thời gian xem còn lại dựa trên tiến độ
   const remainingTime = calculateRemainingTime(duration, progress);
   ```

## Import Order

1. **Tuân thủ thứ tự import**:

   ```typescript
   // 1. React/Next imports
   import { useState, useEffect } from "react";
   import Link from "next/link";

   // 2. Third-party libraries
   import axios from "axios";
   import { FiPlay } from "react-icons/fi";

   // 3. Project imports
   import { Movie } from "@/lib/types";
   import { getMovieUrl } from "@/utils/navigation";

   // 4. Component imports
   import MovieCard from "@/components/MovieCard";

   // 5. Styles
   import styles from "./styles.module.css";
   ```

## Performance Optimization

1. **Memoization**:

   ```typescript
   // Sử dụng useMemo cho tính toán phức tạp
   const sortedEpisodes = useMemo(() => {
     return [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
   }, [episodes]);

   // React.memo cho components
   export default React.memo(MovieCard);
   ```

2. **useCallback cho event handlers**:
   ```typescript
   const handleToggleFavorite = useCallback(() => {
     // ...
   }, [movieId, isFavorite]);
   ```

## Handling Side Effects

1. **useEffect** với cleanup function:
   ```typescript
   useEffect(() => {
     const controller = new AbortController();

     const fetchData = async () => {
       try {
         const data = await fetchWithSignal(controller.signal);
         // ...
       } catch (error) {
         if (!axios.isCancel(error)) {
           // xử lý lỗi
         }
       }
     };

     fetchData();

     return () => {
       controller.abort();
     };
   }, [id]);
   ```

## Testing

1. **Unit tests** cho utilities và hooks
2. **Component tests** cho UI components
3. **Integration tests** cho các luồng người dùng
4. **Mocking** cho API calls và external dependencies

## Git Workflow

1. **Tên branch**: `feature/ten-tinh-nang`, `bugfix/mo-ta-loi`, `refactor/phan-can-refactor`
2. **Commit message**: Rõ ràng và mô tả chi tiết với prefix: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
3. **PR Size**: Giữ Pull Requests nhỏ và tập trung vào một thay đổi
