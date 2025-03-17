# Hướng Dẫn Xử Lý Sự Cố (Troubleshooting Guide)

Tài liệu này cung cấp hướng dẫn giải quyết các vấn đề thường gặp khi phát triển và triển khai dự án AllDrama.

## Lỗi Phát Triển Cục Bộ

### 1. Lỗi Khởi Động Development Server

#### Vấn đề: `Error: Cannot find module 'next'`

**Nguyên nhân**: Thiếu dependencies hoặc lỗi cài đặt.

**Giải pháp**:

```bash
# Xóa node_modules và cài đặt lại
rm -rf node_modules
npm install

# Hoặc cài đặt Next.js
npm install next
```

#### Vấn đề: `Error: listen EADDRINUSE: address already in use :::3000`

**Nguyên nhân**: Cổng 3000 đã được sử dụng bởi một ứng dụng khác.

**Giải pháp**:

```bash
# Tìm và dừng tiến trình đang sử dụng cổng 3000
# Trên Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Trên Mac/Linux
lsof -i :3000
kill -9 <PID>

# Hoặc chạy Next.js trên một cổng khác
npm run dev -- -p 3001
```

### 2. Lỗi TypeScript

#### Vấn đề: Lỗi Type trong Component Props

**Nguyên nhân**: Thiếu hoặc sai type definitions.

**Giải pháp**:

```typescript
// Thêm đầy đủ interface cho props
interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    poster?: string;
    // Thêm các thuộc tính khác
  };
  onSelect?: (id: string) => void;
}

// Sử dụng trong component
const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
  // ...
};
```

### 3. Lỗi Style và TailwindCSS

#### Vấn đề: Style không được áp dụng

**Nguyên nhân**: Config TailwindCSS không đúng hoặc các class không được include trong build.

**Giải pháp**:

- Kiểm tra file `tailwind.config.js` và đảm bảo content path đúng:

```js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  // ...
};
```

- Chạy lại development server với cờ `--purge`:

```bash
npm run dev
```

## Lỗi Data Fetching

### 1. Lỗi API Requests

#### Vấn đề: `TypeError: Failed to fetch`

**Nguyên nhân**: API endpoint không đúng hoặc không accessible.

**Giải pháp**:

- Kiểm tra URL API endpoint
- Kiểm tra biến môi trường `NEXT_PUBLIC_API_URL`
- Kiểm tra kết nối mạng
- Kiểm tra CORS nếu gọi API từ domain khác

#### Vấn đề: Dữ liệu không cập nhật khi thay đổi

**Nguyên nhân**: Cache hoặc missing dependency trong useEffect.

**Giải pháp**:

- Thêm đầy đủ dependencies vào useEffect:

```typescript
useEffect(() => {
  fetchData(id);
}, [id, fetchData]); // Thêm tất cả các biến sử dụng trong effect
```

- Sử dụng SWR với revalidation:

```typescript
const { data, error, mutate } = useSWR(`/api/movies/${id}`, fetcher, {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
});

// Revalidate manually khi cần
mutate();
```

## Lỗi Khi Build và Deploy

### 1. Lỗi Build

#### Vấn đề: `Error: Build failed because of webpack errors`

**Nguyên nhân**: Lỗi trong code hoặc cấu hình webpack.

**Giải pháp**:

- Kiểm tra console để xem chi tiết lỗi
- Fix lỗi type và import
- Kiểm tra cấu hình trong `next.config.js`

#### Vấn đề: `Error: Invalid <Image> src prop`

**Nguyên nhân**: Thiếu cấu hình domain cho Next.js Image.

**Giải pháp**:

```js
// next.config.js
module.exports = {
  images: {
    domains: ["api.alldrama.com", "cdn.alldrama.com"],
  },
  // ...
};
```

### 2. Lỗi Deploy

#### Vấn đề: Build thành công nhưng deployment thất bại

**Nguyên nhân**: Thiếu hoặc sai cấu hình CI/CD hoặc deployment platform.

**Giải pháp**:

- Kiểm tra logs trên CI/CD (GitHub Actions)
- Kiểm tra cấu hình deployment trên Vercel
- Kiểm tra biến môi trường trên deployment platform

## Lỗi Runtime và Performance

### 1. Lỗi Client-side

#### Vấn đề: Component renders nhiều lần

**Nguyên nhân**: Missing dependencies hoặc state update không cần thiết.

**Giải pháp**:

- Sử dụng React DevTools để kiểm tra renders
- Sử dụng `React.memo` để tránh re-render không cần thiết:

```typescript
const MovieCard = React.memo(({ movie }) => {
  // ...
});
```

- Sử dụng `useMemo` và `useCallback` để tối ưu:

```typescript
const handleClick = useCallback(() => {
  // ...
}, [dependency1, dependency2]);

const sortedMovies = useMemo(() => {
  return [...movies].sort((a, b) => a.title.localeCompare(b.title));
}, [movies]);
```

### 2. Lỗi Server-side

#### Vấn đề: Lỗi 500 Internal Server Error

**Nguyên nhân**: Lỗi trong server components hoặc API routes.

**Giải pháp**:

- Kiểm tra logs server
- Thêm try-catch blocks trong server components:

```typescript
async function MoviesPage() {
  try {
    const movies = await fetchMovies();
    return <MovieGrid movies={movies} />;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return <ErrorComponent message="Failed to load movies" />;
  }
}
```

## Debugging Tools và Kỹ Thuật

### 1. Browser DevTools

- **Console**: Kiểm tra lỗi JavaScript và logs
- **Network**: Theo dõi API requests và responses
- **Elements**: Kiểm tra DOM và styles
- **Performance**: Phân tích performance bottlenecks
- **React DevTools**: Kiểm tra component tree và state

### 2. Next.js Debugging

- Sử dụng `next dev --debug` để xem debug logs
- Kiểm tra `.next/server/pages` để xem output của build
- Sử dụng `console.log` trong cả client và server components

## Quy Trình Báo Cáo Lỗi

Khi gặp lỗi không thể tự giải quyết, hãy tuân theo quy trình sau:

1. **Mô tả chi tiết lỗi**:

   - Steps to reproduce
   - Expected result
   - Actual result
   - Screenshots/logs

2. **Cung cấp thông tin môi trường**:

   - Node.js version
   - Next.js version
   - Browser version
   - OS

3. **Tạo issue trên GitHub repository** với template có sẵn

## Nguồn Tham Khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
