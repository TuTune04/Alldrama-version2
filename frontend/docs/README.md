# Tài Liệu Dự Án AllDrama

Chào mừng bạn đến với tài liệu của dự án AllDrama - nền tảng xem phim trực tuyến tập trung vào phim Việt Nam và châu Á.

## Mục Lục

1. [Kiến Trúc Dự Án](./architecture.md)
2. [Quy Tắc Code](./coding-guidelines.md)
3. [Hướng Dẫn Components](./components/README.md)
4. [Hướng Dẫn Custom Hooks](./components/hooks.md)
5. [Chiến Lược Triển Khai](./deployment.md)
6. [Troubleshooting Guide](./troubleshooting.md)
7. [Tài Liệu API](./api.md)

## Tổng Quan Dự Án

AllDrama là một ứng dụng web hiện đại được xây dựng với React và Next.js, cho phép người dùng xem phim trực tuyến với nhiều tính năng như:

- Xem phim theo tập
- Tìm kiếm và lọc phim theo nhiều tiêu chí
- Đăng ký tài khoản và đăng nhập
- Lưu trữ lịch sử xem và tiến độ xem
- Bình luận và tương tác với phim
- Thêm phim vào danh sách yêu thích
- Hỗ trợ đa ngôn ngữ

## Cấu Trúc Dự Án

```
frontend/
├── src/                  # Mã nguồn chính
├── public/               # Tài nguyên tĩnh
├── docs/                 # Tài liệu dự án
└── __tests__/            # Tests (dự kiến)
```

## Công Nghệ Sử Dụng

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **State Management**: React Context API, Zustand
- **API Client**: Axios
- **Internationalization**: i18next
- **UI Components**: Tự phát triển với TailwindCSS

## Bắt Đầu

### Cài Đặt

```bash
# Clone dự án
git clone https://github.com/yourusername/alldrama.git

# Di chuyển vào thư mục dự án
cd alldrama

# Cài đặt dependencies
cd frontend && npm install
```

### Chạy Ứng Dụng

```bash
# Chạy môi trường development
cd frontend && npm run dev

# Build cho production
cd frontend && npm run build

# Chạy bản build
cd frontend && npm start
```

## Quy Trình Phát Triển

1. **Feature Planning**: Lên kế hoạch và tạo task trong issue tracker
2. **Development**: Tuân thủ coding standards và kiến trúc đã định nghĩa
3. **Code Review**: Pull request và đánh giá code
4. **Testing**: Unit tests và manual testing
5. **Deployment**: CI/CD pipeline để deploy lên môi trường staging và production

## Tương Lai

- Phát triển backend với Node.js và MongoDB
- Thêm tính năng tìm kiếm nâng cao
- Tính năng đề xuất phim dựa trên sở thích người dùng
- Hỗ trợ thanh toán cho nội dung premium
- Mobile app với React Native

## Đóng Góp

Chúng tôi khuyến khích đóng góp từ cộng đồng. Vui lòng đọc [Hướng dẫn đóng góp](./CONTRIBUTING.md) để biết thêm chi tiết.

## Liên Hệ

Nếu bạn có câu hỏi hoặc đề xuất, vui lòng tạo issue hoặc liên hệ qua email: example@alldrama.com
