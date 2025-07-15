## Tổng quan flow đăng nhập và gọi api cần xác thực token:

### 1. **Đăng nhập:**

- ✅ `Client → API Gateway`: gửi thông tin đăng nhập.
- ✅ `API Gateway → User Service`: forward thông tin để xử lý xác thực.
- ✅ `User Service`: kiểm tra tài khoản & sinh **JWT token public** (dành cho client).
- ✅ Gateway nhận lại token từ User Service, trả cho client.

### 2. **Lấy profile:**

- ✅ `Client → Gateway`: gửi JWT client (từ lần login).
- ✅ `Gateway`: verify token bằng **public key** (của User Service).
- ✅ Nếu hợp lệ: Gateway sinh **internal token (JWT nội bộ)**.
- ✅ `Gateway → User Service`: gọi API nội bộ kèm JWT nội bộ.
- ✅ `User Service`: verify JWT nội bộ bằng public key của Gateway.
- ✅ Trả thông tin user → Gateway → Client.

### Tổng quan flow giao tiếp giữa UserService và SocialService

1. Cập nhật trạng thái On-Offline
- ✅ `Client → UserService` : gửi cập nhật trạng thái (api, socket …)
- ✅ `UserService → Redis` ( `publishEvent('presence-online', { userId })`): gửi thông tin user và action
- ✅ `SocialService` → `SubEvent Redis` : nhận thông tin về user

### Tổng quan giao tiếp giữa SocialService và SenderService

- ✅ `SocialService → RabbitMQ` : gửi message broken đến RabbitMQ
- ✅ `SenderService ← RabbitMQ`: nhận message broken từ RabbitMQ

```jsx
[Client]
   │
   ▼
[API Gateway] ——— verify client token
   │                    │
   ▼                    ▼
[User Service]   <-- verify internal token
   │
   └── Redis PubSub —> [Social Service] ──> RabbitMQ ──> [Sender Service]

```