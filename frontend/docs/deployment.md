# Chiến Lược Triển Khai

Tài liệu này mô tả quy trình triển khai của dự án AllDrama từ môi trường phát triển đến sản phẩm.

## Môi Trường

Dự án AllDrama sử dụng ba môi trường chính:

1. **Development**: Môi trường phát triển cục bộ
2. **Staging**: Môi trường thử nghiệm trước khi triển khai chính thức
3. **Production**: Môi trường sản phẩm chính thức

## Quy Trình CI/CD

### 1. Continuous Integration

Dự án sử dụng GitHub Actions làm nền tảng CI/CD với quy trình như sau:

```yaml
# .github/workflows/ci.yml
name: AllDrama CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run type-check
      - name: Test
        run: npm test
      - name: Build
        run: npm run build
```

### 2. Continuous Deployment

#### Triển khai Staging

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL }}
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prebuilt --prod"
```

#### Triển khai Production

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.PRODUCTION_API_URL }}
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prebuilt --prod"
```

## Cấu Hình Môi Trường

Dự án sử dụng các biến môi trường để cấu hình theo từng môi trường:

```
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ENV=development

# .env.staging
NEXT_PUBLIC_API_URL=https://staging-api.alldrama.com/api
NEXT_PUBLIC_ENV=staging

# .env.production
NEXT_PUBLIC_API_URL=https://api.alldrama.com/api
NEXT_PUBLIC_ENV=production
```

## Quy Trình Triển Khai

### 1. Feature Development

- Developer làm việc trên branch feature/bugfix
- Khi hoàn thành, tạo Pull Request vào branch `develop`
- CI tự động chạy test và lint

### 2. Staging Deployment

- Khi PR được merge vào `develop`, CI/CD pipeline tự động triển khai lên môi trường staging
- QA và team thực hiện kiểm thử trên môi trường staging

### 3. Production Deployment

- Khi đã kiểm thử kỹ trên staging, team lead tạo PR từ `develop` vào `main`
- Sau khi review, PR được merge vào `main`
- CI/CD pipeline tự động triển khai lên môi trường production

## Monitoring và Logging

### 1. Application Monitoring

- **Sentry**: Theo dõi lỗi và performance
- **Google Analytics**: Theo dõi hành vi người dùng
- **Vercel Analytics**: Theo dõi Web Vitals và performance

### 2. Server Monitoring

- **Grafana**: Dashboard theo dõi server performance
- **Prometheus**: Thu thập metrics
- **ELK Stack**: Log management và analysis

## Rollback Strategy

Trong trường hợp phát hiện lỗi nghiêm trọng sau khi triển khai:

1. **Immediate Rollback**: Quay lại phiên bản trước đó nếu phát hiện lỗi nghiêm trọng
2. **Fix Forward**: Ưu tiên sửa lỗi nhanh chóng và triển khai bản vá

## Bảo Mật Triển Khai

- **Secret Management**: Sử dụng GitHub Secrets và Vercel Environment Variables để quản lý thông tin nhạy cảm
- **Security Headers**: Cấu hình security headers trong Next.js
- **HTTPS**: Đảm bảo mọi môi trường đều sử dụng HTTPS
