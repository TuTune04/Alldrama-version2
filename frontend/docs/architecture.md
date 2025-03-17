# Kiến Trúc Dự Án AllDrama

## Tổng Quan

AllDrama là nền tảng xem phim trực tuyến tập trung vào phim Việt Nam và châu Á, được xây dựng với kiến trúc frontend hiện đại và có khả năng mở rộng. Dự án được thiết kế để hỗ trợ đa ngôn ngữ, cá nhân hóa trải nghiệm người dùng, và tối ưu trải nghiệm xem phim.

## Tech Stack

### Frontend

- **Framework**: Next.js 15.x (App Router)
- **Ngôn ngữ**: TypeScript
- **UI**: TailwindCSS
- **State Management**: Zustand
- **Đa ngôn ngữ**: i18next/react-i18next
- **Fetch data**: Axios
- **Notification**: react-hot-toast

### Backend (Dự kiến)

- **Framework**: Node.js với Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API**: REST

## Cấu Trúc Thư Mục

````
AllDrama/
├── frontend/               # Thư mục frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   │   ├── (auth)/     # Nhóm route liên quan đến xác thực
│   │   │   ├── movies/     # Route danh sách phim
│   │   │   ├── watch/      # Route xem phim
│   │   │   ├── page.tsx    # Homepage
│   │   │   ├── layout.tsx  # Root layout
│   │   ├── components/     # Tổ chức các components
│   │   │   ├── ui/         # Components UI chung
│   │   │   ├── layout/     # Header, Footer, Sidebar
│   │   │   ├── features/   # Components theo tính năng
│   │   │   ├── pages/      # Components đặc thù cho từng trang
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React Context
│   │   ├── lib/            # Shared libraries (API clients, types)
│   │   ├── utils/          # Utility functions
│   │   ├── store/          # Zustand stores
│   │   ├── constants/      # Config constants
│   │   ├── styles/         # Global styles
│   │   ├── locales/        # Translations
│   ├── public/             # Static assets
│   ├── docs/               # Documentation
│   ├── __tests__/          # Unit tests

## Luồng Dữ Liệu

1. **Luồng Xem Phim**:

   - Trang chủ hiển thị danh sách phim từ API
   - Người dùng chọn phim -> điều hướng đến trang chi tiết phim
   - Trang chi tiết phim tải thông tin phim, danh sách tập phim, bình luận
   - Người dùng chọn tập phim -> điều hướng đến trang xem phim
   - Trang xem phim lưu tiến độ xem và cập nhật lịch sử

2. **Luồng Xác Thực**:
   - Người dùng đăng nhập/đăng ký thông qua Auth API
   - Token được lưu trong localStorage/cookie
   - AuthContext quản lý trạng thái đăng nhập trên toàn ứng dụng
   - API calls tự động đính kèm token thông qua axios interceptors

## Pattern và Nguyên Tắc Thiết Kế

1. **Separation of Concerns**: Tách biệt UI, logic và state management
2. **Component Composition**: Tạo các components nhỏ, tái sử dụng được
3. **Custom Hooks**: Trích xuất logic phức tạp vào custom hooks
4. **Context API**: Quản lý global state với React Context
5. **Atomic Design**: Áp dụng nguyên tắc thiết kế atomic cho components

## Routing

- Sử dụng Next.js App Router với cấu trúc thư mục định nghĩa routes
- URL Slug: Sử dụng slug thay vì ID thuần túy cho SEO tốt hơn
- Route Guards: Bảo vệ routes yêu cầu xác thực thông qua Middleware

## Khả Năng Mở Rộng

Kiến trúc được thiết kế để dễ dàng mở rộng với:

- **Microservices**: Sẵn sàng tích hợp với nhiều backend microservices
- **Internationalization**: Hỗ trợ đa ngôn ngữ từ đầu
- **Theming**: Hỗ trợ nhiều theme (light/dark mode)
- **Features mới**: Cấu trúc module hóa cho phép thêm tính năng dễ dàng

## Hiệu Suất và Tối Ưu

- **Code Splitting**: Tự động với Next.js
- **Lazy Loading**: Cho components và routes
- **Image Optimization**: Với Next/Image
- **Caching**: Cho API calls và dữ liệu

## Quy Trình Phát Triển

1. **Phát triển**: Sử dụng mock data và APIs
2. **Testing**: Unit tests và integration tests (với Jest và React Testing Library)
3. **Staging**: Kiểm thử với API thật trên môi trường staging
4. **Production**: Triển khai với tối ưu performance

## Quản Lý State

Dự án sử dụng kết hợp hai phương pháp quản lý state với phạm vi rõ ràng:

### 1. Zustand

- **Phạm vi sử dụng**: Global state bền vững, cần lưu trữ giữa các phiên làm việc
- **Ví dụ**: User authentication, user preferences, watch history

```typescript
// Ví dụ Zustand store
import create from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (credentials) => {
        // Implement login logic
        set({ user: userData, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" }
  )
);
````

### 2. React Context API

- **Phạm vi sử dụng**: UI state tạm thời, theme context, i18n context
- **Ví dụ**: Modal state, sidebar open/close, current theme

```typescript
// Ví dụ Context API
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Cấu Trúc App Router

Để tận dụng tốt Next.js App Router, chúng ta sẽ điều chỉnh cấu trúc như sau:

```
frontend/
├── src/
│   ├── app/                  # App Router root
│   │   ├── (auth)/           # Group routes liên quan đến xác thực
│   │   │   ├── login/        # /login route
│   │   │   ├── register/     # /register route
│   │   │   └── layout.tsx    # Layout cho route nhóm auth
│   │   ├── movies/           # /movies route
│   │   │   ├── [id]/         # /movies/[id] động
│   │   │   │   ├── page.tsx  # Trang chi tiết phim
│   │   │   │   └── episodes/ # /movies/[id]/episodes
│   │   │   └── page.tsx      # Trang danh sách phim
│   │   ├── watch/            # /watch route
│   │   │   ├── [id]/         # /watch/[id]
│   │   │   └── page.tsx
│   │   ├── page.tsx          # Homepage
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global CSS
│   ├── components/           # Shared components
│   │   ├── common/           # Atomic/base components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
```

## Data Fetching và SSR

Next.js App Router cung cấp nhiều cách tiếp cận data fetching, chúng ta sẽ sử dụng:

### 1. Server Components (Mặc định)

```typescript
// app/movies/page.tsx
async function MoviesPage() {
  // Data fetching trong server component
  const movies = await fetchMovies();

  return (
    <div>
      <h1>Phim mới</h1>
      <MovieGrid movies={movies} />
    </div>
  );
}
```

### 2. Client Components khi cần interactivity

```typescript
// components/features/movie/MovieSearch.tsx
"use client";

import { useState } from "react";
import { useMovies } from "@/hooks/api/useMovies";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const { movies, searchMovies, loading } = useMovies();

  // Client-side search functionality
  // ...
}
```

### 3. Data Fetching Strategy

- **Static Data**: Sử dụng `generateStaticParams` cho SEO và performance
- **Dynamic Data**: Sử dụng server components với fetch có cache options
- **Real-time Data**: Client components với SWR hoặc React Query

## Testing Strategy

Dự án áp dụng chiến lược testing đa lớp:

### 1. Unit Testing

- Testing các isolated components, hooks, utils
- Jest và React Testing Library
- Coverage mục tiêu: 70% cho utils và hooks

### 2. Integration Testing

- Testing các tương tác giữa components
- Testing các flows chính: đăng nhập, tìm kiếm phim, xem phim

### 3. E2E Testing (dự kiến)

- Cypress cho E2E testing
- Test các user flows quan trọng

### Ví dụ Test

```typescript
// __tests__/components/common/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/common/Button";

describe("Button Component", () => {
  it("renders correctly", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click Me</Button>);

    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click Me</Button>);

    fireEvent.click(screen.getByText("Click Me"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

## Chiến Lược Xử Lý Lỗi

### 1. Global Error Boundary

- Bắt lỗi ở mức app và hiển thị fallback UI
- Tích hợp với error logging service

### 2. API Error Handling

- Chuẩn hóa cấu trúc lỗi API
- Retry mechanism cho network failures
- Thông báo lỗi người dùng thân thiện
