# Hướng Dẫn Custom Hooks

Custom Hooks là công cụ mạnh mẽ trong React giúp tái sử dụng logic và tách biệt concerns. Tài liệu này mô tả cách tiếp cận và tổ chức hooks trong dự án AllDrama.

## Cấu Trúc Thư Mục Hooks

```
src/hooks/
├── api/                  # API-related hooks
│   ├── useMovie.ts       # Hook xử lý dữ liệu phim
│   ├── useEpisode.ts     # Hook xử lý dữ liệu tập phim
│   ├── useComment.ts     # Hook xử lý bình luận
│   └── ...
├── form/                 # Form-related hooks
│   ├── useForm.ts        # Hook quản lý form
│   ├── useValidation.ts  # Hook xác thực dữ liệu
│   └── ...
├── ui/                   # UI-related hooks
│   ├── useMediaQuery.ts  # Hook responsive
│   ├── useTheme.ts       # Hook quản lý theme
│   └── ...
├── auth/                 # Authentication hooks
│   ├── useAuth.ts        # Hook xác thực người dùng
│   └── ...
└── index.ts             # Export file
```

## Quy Tắc Thiết Kế Hook

### 1. Tên Hook

- Bắt đầu bằng `use` để tuân thủ quy ước của React
- Đặt tên rõ ràng về chức năng: `useMovies`, `useWatchHistory`...
- Tên mô tả resource hoặc hành động: `useMovies` (resource), `useOutsideClick` (hành động)

### 2. Return Values

- Return values nên là object với tên rõ ràng:

```typescript
// Tốt
const { movies, loading, error, fetchMovies } = useMovies();

// Tránh
const [movies, loading, error, fetchMovies] = useMovies();
```

- State và actions liên quan nên được nhóm lại:

```typescript
// Tốt
const {
  data: movies,
  loading,
  error,
  actions: { fetch, filter, sort },
} = useMovies();
```

### 3. Xử Lý Loading/Error Nhất Quán

Mỗi hook xử lý data nên có pattern xử lý loading/error nhất quán:

```typescript
const useMovies = () => {
  const [data, setData] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await moviesApi.getAll();
      setData(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Lỗi không xác định"));
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchMovies };
};
```

## Các Loại Hooks Phổ Biến

### 1. Data Fetching Hooks

```typescript
const useMovies = (params?: any) => {
  const [data, setData] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await moviesApi.getAll(params);
      setData(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { data, loading, error, refetch: fetchMovies };
};
```

### 2. Form Hooks

```typescript
const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    reset,
    setValues,
    setErrors,
  };
};
```

### 3. UI State Hooks

```typescript
const useToggle = (initialState = false) => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  return [state, { toggle, setTrue, setFalse }] as const;
};
```

### 4. Context-based Hooks

```typescript
// Trong LanguageContext.tsx
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // implementation
};

// Trong useLanguage.tsx
export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
```

## Composing Hooks

Hooks có thể được kết hợp để tạo ra hooks phức tạp hơn:

```typescript
// Hook cơ bản
const useMovies = () => {
  // implementation
};

// Hook sử dụng hook cơ bản
const useMovieFiltering = () => {
  const { data: movies, loading, error } = useMovies();
  const [filters, setFilters] = useState({});

  const filteredMovies = useMemo(() => {
    return applyFilters(movies, filters);
  }, [movies, filters]);

  return {
    movies: filteredMovies,
    loading,
    error,
    setFilters,
  };
};
```

## Best Practices

### 1. Cleanup trong useEffect

```typescript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(url, { signal: controller.signal });
      // process data
    } catch (error) {
      if (error.name !== "AbortError") {
        // handle real errors, not cancel
      }
    }
  };

  fetchData();

  return () => {
    controller.abort();
  };
}, [url]);
```

### 2. Dependencies Array

- Sử dụng ESLint hooks plugin để kiểm tra dependencies
- Cẩn thận với object và function dependencies (nên dùng useMemo/useCallback)

```typescript
// Tốt
const fetchMovies = useCallback(() => {
  // implementation
}, [movieId, pageNumber]);

useEffect(() => {
  fetchMovies();
}, [fetchMovies]);
```

### 3. Memoization khi cần thiết

```typescript
const sortedMovies = useMemo(() => {
  return [...movies].sort((a, b) => a.releaseYear - b.releaseYear);
}, [movies]);
```

### 4. Xử lý lỗi và logging

```typescript
const useMovieDetail = (id: string) => {
  // ...

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const response = await moviesApi.getById(id);
      setMovie(response.data);
    } catch (error) {
      console.error(`[useMovieDetail] Error fetching movie ID ${id}:`, error);
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin phim. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // ...
};
```

## Testing Hooks

Sử dụng `@testing-library/react-hooks` để test hooks:

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import useCounter from "./useCounter";

test("should increment counter", () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

## Documentation

Sử dụng JSDoc để document hooks:

```typescript
/**
 * Hook để quản lý dữ liệu phim và thao tác với API
 *
 * @param {object} params - Tham số truy vấn
 * @param {number} [params.page=1] - Số trang
 * @param {number} [params.limit=20] - Số phim mỗi trang
 * @param {string} [params.genre] - Filter theo thể loại
 * @returns {object} Object chứa dữ liệu và các hàm thao tác
 * @returns {Movie[]} data - Danh sách phim
 * @returns {boolean} loading - Trạng thái đang tải
 * @returns {Error|null} error - Lỗi nếu có
 * @returns {Function} refetch - Hàm để tải lại dữ liệu
 *
 * @example
 * const { data: movies, loading, error, refetch } = useMovies({ page: 1, limit: 10 });
 */
const useMovies = (params = {}) => {
  // implementation
};
```
