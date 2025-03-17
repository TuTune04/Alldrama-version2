# Hướng Dẫn Components

Tài liệu này mô tả cách tiếp cận và tổ chức components trong dự án AllDrama.

## Cấu Trúc Components

Dự án này sử dụng mô hình phân cấp components theo chức năng:

```
src/components/
├── ui/               # Components dùng chung toàn ứng dụng
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   └── ...
├── layout/               # Các thành phần layout
│   ├── Header/
│   ├── Footer/
│   ├── Sidebar/
│   └── ...
├── features/             # Components theo tính năng
│   ├── movie/
│   │   ├── MovieCard/
│   │   ├── MovieList/
│   │   └── ...
│   ├── episode/
│   │   ├── EpisodeCard/
│   │   ├── EpisodeList/
│   │   └── ...
│   ├── auth/
│   └── ...
└── pages/                # Page-level components
    ├── Home/
    ├── MovieDetail/
    ├── WatchEpisode/
    └── ...
```

## Atomic Design

Dự án này áp dụng nguyên tắc Atomic Design để tổ chức components:

1. **Atoms**: Components nhỏ nhất, không thể chia nhỏ hơn (Button, Input, Icon)
2. **Molecules**: Nhóm các atoms lại với nhau (SearchBar, FormField)
3. **Organisms**: Nhóm các molecules thành một phần UI phức tạp hơn (Header, MovieCard, CommentSection)
4. **Templates**: Bố cục trang không có nội dung cụ thể (PageLayout, TwoColumnLayout)
5. **Pages**: Các trang hoàn chỉnh kết hợp nhiều organisms (HomePage, MovieDetailPage)

## Cấu Trúc Thư Mục Component

Mỗi component nên được tổ chức như sau:

```
Button/
├── Button.tsx           # Component chính
├── Button.test.tsx      # Unit tests
├── Button.module.css    # Styles (nếu không dùng Tailwind)
└── index.ts             # Export file
```

File `index.ts` giúp import gọn gàng hơn:

```typescript
export { default } from "./Button";
export * from "./Button";
```

## Component Patterns

### 1. Composition over Inheritance

Ưu tiên sử dụng composition thay vì inheritance:

```typescript
// Tốt
const Card = ({ children, header }) => (
  <div className="card">
    {header && <div className="card-header">{header}</div>}
    <div className="card-body">{children}</div>
  </div>
);

// Sử dụng
<Card header={<h2>Tiêu đề</h2>}>
  <p>Nội dung</p>
</Card>;
```

### 2. Render Props khi cần thiết

```typescript
interface DataProviderProps<T> {
  fetchData: () => Promise<T>;
  render: (data: T, loading: boolean, error: Error | null) => React.ReactNode;
}

function DataProvider<T>({ fetchData, render }: DataProviderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Logic fetching data...

  return <>{render(data, loading, error)}</>;
}
```

### 3. Container/Presentational Pattern

Tách biệt logic và UI:

```typescript
// Container component (xử lý logic và data)
const MovieListContainer = () => {
  const { movies, loading, error, fetchMovies } = useMovies();

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return <MovieListView movies={movies} loading={loading} error={error} />;
};

// Presentational component (chỉ render UI)
interface MovieListViewProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

const MovieListView = ({ movies, loading, error }: MovieListViewProps) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="grid grid-cols-4 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
```

## Props

### Thiết kế Props

1. **Đặt tên rõ ràng**: `onClick` thay vì `handleClick`
2. **Sử dụng default values** khi có thể
3. **Destructure props** để code rõ ràng hơn
4. **Tránh boolean traps**: Sử dụng prop có ý nghĩa rõ ràng hơn là negated props

```typescript
// Tránh
<Button disabled={!isEnabled} />

// Tốt hơn
<Button enabled={isEnabled} />
```

### PropTypes với TypeScript

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button = ({
  variant,
  size = "medium",
  onClick,
  isLoading = false,
  disabled = false,
  children,
}: ButtonProps) => {
  // ...
};
```

## Styling

### TailwindCSS

TailwindCSS là cách tiếp cận styling chính:

```tsx
const Button = ({
  variant = "primary",
  size = "medium",
  children,
}: ButtonProps) => {
  const baseClasses = "rounded font-medium focus:outline-none";

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizeClasses = {
    small: "py-1 px-3 text-sm",
    medium: "py-2 px-4 text-md",
    large: "py-3 px-6 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </button>
  );
};
```

### CSS Modules (Khi cần)

Cho styling phức tạp hơn, có thể kết hợp CSS Modules:

```tsx
import styles from "./Button.module.css";

const Button = ({ variant, size, children }: ButtonProps) => {
  return (
    <button className={`${styles.button} ${styles[variant]} ${styles[size]}`}>
      {children}
    </button>
  );
};
```

## Error Handling

Các components nên xử lý lỗi một cách thanh lịch:

```tsx
const MovieList = () => {
  const { movies, loading, error, retry } = useMovies();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorState message="Không thể tải danh sách phim" retryAction={retry} />
    );
  }

  if (movies.length === 0) {
    return <EmptyState message="Không có phim nào" />;
  }

  return (
    <div className="grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
```

## Accessibility

Tất cả components phải theo các tiêu chuẩn accessibility:

1. Sử dụng semantic HTML khi có thể
2. Thêm ARIA attributes khi cần thiết
3. Đảm bảo keyboard navigation
4. Các thành phần có contrast đủ cao
5. Đảm bảo các form có labels phù hợp

## Testing

Mỗi component nên có test:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders with correct styles for primary variant", () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toHaveClass("bg-blue-600");
  });
});
```

## Performance Considerations

1. **Memoization**: Sử dụng React.memo cho components render nhiều
2. **Lazy Loading**: Sử dụng React.lazy cho components lớn
3. **Code Splitting**: Tách chunks để giảm kích thước bundle
4. **Virtualization**: Sử dụng virtualized lists cho danh sách dài

## Documentation trong Components

Sử dụng JSDoc để mô tả component:

```tsx
/**
 * Button component cho các hành động chính trong ứng dụng.
 * Hỗ trợ nhiều variants và sizes.
 *
 * @example
 * <Button variant="primary" size="medium" onClick={handleClick}>
 *   Đăng nhập
 * </Button>
 *
 * @param {object} props - Props cho component
 * @param {'primary' | 'secondary' | 'danger'} [props.variant='primary'] - Style variant
 * @param {'small' | 'medium' | 'large'} [props.size='medium'] - Kích thước button
 * @param {() => void} [props.onClick] - Callback khi click
 * @param {boolean} [props.isLoading=false] - Hiển thị loading spinner
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {React.ReactNode} props.children - Nội dung của button
 */
const Button = ({ ... }: ButtonProps) => {
  // ...
};
```
