# Frontend — FinTrax

Thư mục `fontend/` chứa ứng dụng front-end viết bằng Next.js + React + TypeScript. File này hướng dẫn cách cài đặt, chạy, debug, build và deploy phần frontend.

> Lưu ý: trong repository hiện tại thư mục frontend được đặt tên là `fontend/` (không phải `frontend`). Nếu bạn muốn đổi tên thư mục, nhớ cập nhật các đường dẫn trong README gốc và scripts tương ứng.

## Nội dung chính

- Yêu cầu
- Biến môi trường
- Cài đặt & chạy local
- Build & chạy production
- Lint / Format / Test
- Cách deploy (ví dụ Vercel)
- Gợi ý phát triển

## Yêu cầu

- Node.js (LTS, e.g. 18+)
- npm, yarn hoặc pnpm

## Biến môi trường

Frontend sử dụng các biến môi trường bắt đầu bằng `NEXT_PUBLIC_` để có thể truy cập từ client.

Ví dụ file `fontend/.env` (không commit):

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_ANALYTICS_ID=
```

- `NEXT_PUBLIC_API_BASE_URL` — URL tới API backend (ví dụ `http://localhost:4000`).
- Thêm các biến khác khi cần (ví dụ keys cho analytics). Không lưu secrets ở client.

## Cài đặt & chạy local

1. Cài dependencies:

```bash
cd fontend
npm install
```

2. Chạy dev server:

```bash
npm run dev
```

Mặc định Next.js dev server chạy tại `http://localhost:3000`.

3. Các script thường có trong `package.json` (ví dụ):

- `dev` — chạy development server
- `build` — build ứng dụng để production
- `start` — chạy production server (sau khi build)
- `lint` — chạy ESLint
- `test` — chạy test runner (Jest / React Testing Library)
- `format` — chạy Prettier

Kiểm tra `fontend/package.json` để biết scripts chính xác.

## Build & chạy production

1. Build:

```bash
cd fontend
npm run build
```

2. Run production server (nếu sử dụng Next.js server):

```bash
npm start
```

Nếu bạn xuất tĩnh (`next export`), đảm bảo cấu hình phù hợp và dùng server tĩnh (Netlify, Vercel hoặc static host).

## Lint / Format / Test

Ví dụ các lệnh thông dụng:

```bash
cd fontend
npm run lint
npm run format
npm run test
```

Thêm test unit cho các component quan trọng. Nếu chưa có cấu hình test, cân nhắc thêm Jest + React Testing Library.

## Deploy

- Vercel: Next.js deploy rất đơn giản trên Vercel. Chỉ cần kết nối repository và chọn thư mục `fontend/` (nếu monorepo, cấu hình project root là `fontend`).
- Docker: nếu bạn muốn đóng gói frontend trong Docker, build ứng dụng bằng `npm run build` rồi sử dụng Dockerfile phù hợp.

Ví dụ cấu hình Vercel (chỉ dẫn nhanh):

1. Tạo project mới trên Vercel.
2. Chọn repository và set "Root Directory" thành `fontend`.
3. Thiết lập biến môi trường trên Vercel: `NEXT_PUBLIC_API_BASE_URL`, ...

## Gợi ý phát triển

- Kiểm soát state: sử dụng Context / Zustand / Redux tuỳ theo phức tạp app.
- Chia nhỏ component, viết test cho logic lớn.
- Sử dụng React Query / SWR cho data fetching và caching.
- Đặt các formatter và linter trong pre-commit hook (husky + lint-staged).

## Thay đổi tên thư mục

Nếu bạn đổi `fontend/` -> `frontend/`, nhớ cập nhật:

- `README.md` gốc (nếu có đường dẫn đến fontend)
- CI/CD config (nếu đặt root path)
- Dockerfile / compose nếu dùng đường dẫn cứng

---

Muốn tôi thêm: ví dụ `package.json` thật, hướng dẫn cấu hình ESLint/Prettier, mẫu `next.config.js`, hoặc README cụ thể cho components/charts? Chỉ định phần bạn muốn tôi mở rộng.
