# Tài Liệu API Alldrama

## Giới thiệu

Thư mục này chứa tài liệu API cho dự án Alldrama. Tài liệu giúp frontend developers hiểu cách tương tác với các API endpoint của backend.

## Cách sử dụng

1. Tài liệu API chính: [api-documentation.md](./api-documentation.md)

   - File này chứa thông tin chi tiết về tất cả các API endpoint hiện có
   - Bao gồm mô tả endpoint, tham số, request và response schemas

2. Swagger UI
   - Truy cập `http://localhost:8000/api-docs` (development) hoặc `https://api.alldrama.tech/api-docs` (production)
   - Sử dụng giao diện Swagger UI để kiểm tra và thử nghiệm API

## Lưu ý cho Frontend Developers

### Authentication

- Hầu hết các API yêu cầu JWT token
- Lưu token nhận được từ login/register và gửi trong header Authorization
- Chuỗi header: `Authorization: Bearer <token>`

### Xử lý lỗi

- Luôn kiểm tra status code khi gọi API
- Đối với lỗi, response sẽ có định dạng:

```json
{
  "message": "Thông báo lỗi"
}
```

### Pagination

- Nhiều API hỗ trợ phân trang với tham số `page` và `limit`
- Response sẽ bao gồm `totalPages`, `currentPage` và tổng số item

## Cập nhật tài liệu

- Tài liệu này được tạo dựa trên mã nguồn hiện tại
- Khi API thay đổi, vui lòng cập nhật tài liệu này để đảm bảo tính nhất quán

## Hỗ trợ

Nếu bạn có bất kỳ câu hỏi nào về API, vui lòng liên hệ:

- Email: support@alldrama.tech
- GitHub: Tạo issue trong repository dự án
