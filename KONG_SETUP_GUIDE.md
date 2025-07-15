# 🚀 Kong Gateway Setup Guide for MicroService Architecture

Hướng dẫn chi tiết cách setup Kong Gateway cho hệ thống microservice NestJS.

## 📋 Tổng Quan

Kong Gateway sẽ thay thế ApiGateway hiện tại và cung cấp:
- **Centralized API Management**: Quản lý tập trung tất cả APIs
- **Authentication & Authorization**: JWT, OAuth2, API Keys
- **Rate Limiting & Traffic Control**: Kiểm soát lưu lượng
- **Monitoring & Analytics**: Theo dõi và phân tích
- **Security**: SSL termination, CORS, security headers
- **Load Balancing**: Phân tải giữa các instances

## 🏗️ Kiến Trúc Hệ Thống

```
Client Apps → Kong Gateway (Port 8000) → Microservices
                    ↓
            Admin Dashboard (Port 8002)
                    ↓
            Monitoring Stack (Prometheus + Grafana)
```

## 🔧 Bước 1: Chuẩn Bị Environment

### 1.1 Copy Environment Variables
```bash
cp environment.sample .env
```

### 1.2 Cập nhật cấu hình trong `.env`
```bash
# Cập nhật AWS credentials cho SenderService
AWS_ACCESS_KEY_ID=your-actual-aws-key
AWS_SECRET_ACCESS_KEY=your-actual-aws-secret
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-s3-bucket

# Cập nhật JWT secrets
ACCESS_TOKEN_KEY=your-256-bit-secret-key
REFRESH_TOKEN_KEY=your-256-bit-refresh-secret
INTERNAL_TOKEN_PUBLIC_KEY=your-internal-public-key
```

### 1.3 Thêm domain vào /etc/hosts
```bash
echo "127.0.0.1 api.microservice.local" | sudo tee -a /etc/hosts
```

## 🚀 Bước 2: Khởi Động Hệ Thống

### 2.1 Build và Start Services
```bash
# Build các Docker images
docker-compose -f docker-compose.microservices.yml build

# Start toàn bộ hệ thống
docker-compose -f docker-compose.microservices.yml up -d

# Kiểm tra status
docker-compose -f docker-compose.microservices.yml ps
```

### 2.2 Chờ Services Khởi Động
```bash
# Kiểm tra Kong health
curl -f http://localhost:8001/status

# Kiểm tra services
curl -f http://localhost:3001/health  # UserService
curl -f http://localhost:3002/health  # SenderService  
curl -f http://localhost:3003/health  # SocialService
```

## ⚙️ Bước 3: Cấu Hình Kong Gateway

### 3.1 Chạy Configuration Script
```bash
# Cấp quyền thực thi
chmod +x kong-config.sh

# Chạy script cấu hình
./kong-config.sh
```

Script sẽ tự động:
- ✅ Tạo Services cho các microservices
- ✅ Tạo Routes với path-based routing
- ✅ Cài đặt JWT authentication
- ✅ Thiết lập Rate limiting
- ✅ Cấu hình CORS
- ✅ Thêm Monitoring plugins

### 3.2 Kiểm Tra Cấu Hình

```bash
# Xem danh sách services
curl http://localhost:8001/services

# Xem danh sách routes  
curl http://localhost:8001/routes

# Xem danh sách plugins
curl http://localhost:8001/plugins
```

## 🧪 Bước 4: Test API Endpoints

### 4.1 Public Endpoints (không cần auth)
```bash
# Health check qua Kong
curl http://api.microservice.local:8000/api/v1/users/health

# Auth endpoints
curl -X POST http://api.microservice.local:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### 4.2 Protected Endpoints (cần JWT token)
```bash
# Lấy JWT token từ login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test protected endpoint
curl http://api.microservice.local:8000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"

# Test notification endpoint
curl -X POST http://api.microservice.local:8000/api/v1/notifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification", "recipient": "user@example.com"}'
```

## 📊 Bước 5: Truy Cập Management Dashboards

### 5.1 Kong Admin Dashboard
- **URL**: http://localhost:8002
- **Mô tả**: Kong native admin interface

### 5.2 Konga Admin UI
- **URL**: http://localhost:1337
- **Setup**: 
  1. Tạo admin account
  2. Connect to Kong: `http://kong-gateway:8001`

### 5.3 Monitoring Stack
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
  - Username: `admin`
  - Password: `admin123`

### 5.4 Infrastructure UIs
- **RabbitMQ Management**: http://localhost:15672
  - Username: `admin` / Password: `password123`

## 🔒 Bước 6: Security & Production Setup

### 6.1 SSL/TLS Configuration
```bash
# Generate self-signed certificate for development
openssl req -new -x509 -keyout kong.key -out kong.crt -days 365 -nodes

# Add SSL support to Kong
curl -X POST http://localhost:8001/certificates \
  -F "cert=@kong.crt" \
  -F "key=@kong.key" \
  -F "snis=api.microservice.local"
```

### 6.2 Advanced Security Plugins
```bash
# Add IP Restriction
curl -X POST http://localhost:8001/plugins \
  --data "name=ip-restriction" \
  --data "config.allow=127.0.0.1,192.168.1.0/24"

# Add Bot Detection
curl -X POST http://localhost:8001/plugins \
  --data "name=bot-detection"

# Add Request Validator
curl -X POST http://localhost:8001/plugins \
  --data "name=request-validator" \
  --data "config.body_schema=..." 
```

## 📈 Bước 7: Monitoring & Scaling

### 7.1 Setup Grafana Dashboards
1. Import Kong Dashboard từ Grafana.com
2. Configure Prometheus data source
3. Create custom dashboards cho microservices

### 7.2 Log Aggregation
```bash
# Add File Log plugin
curl -X POST http://localhost:8001/plugins \
  --data "name=file-log" \
  --data "config.path=/tmp/access.log"

# Add Syslog plugin  
curl -X POST http://localhost:8001/plugins \
  --data "name=syslog" \
  --data "config.host=logstash" \
  --data "config.port=514"
```

### 7.3 Performance Tuning
```bash
# Add Response Caching
curl -X POST http://localhost:8001/plugins \
  --data "name=proxy-cache" \
  --data "config.response_code=200,301,404" \
  --data "config.request_method=GET,HEAD" \
  --data "config.cache_ttl=300"

# Add Request Termination for maintenance
curl -X POST http://localhost:8001/plugins \
  --data "name=request-termination" \
  --data "config.status_code=503" \
  --data "config.message=Service under maintenance"
```

## 🐛 Troubleshooting

### Common Issues

#### Kong không start được
```bash
# Check logs
docker-compose -f docker-compose.microservices.yml logs kong-gateway

# Reset database
docker-compose -f docker-compose.microservices.yml down -v
docker-compose -f docker-compose.microservices.yml up -d
```

#### Services không kết nối được
```bash
# Check network connectivity
docker exec kong-gateway ping user-service
docker exec kong-gateway ping sender-service
docker exec kong-gateway ping social-service

# Check service health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

#### JWT Token issues
```bash
# Verify JWT consumer exists
curl http://localhost:8001/consumers/microservice-client

# Check JWT credentials
curl http://localhost:8001/consumers/microservice-client/jwt

# Test JWT validation
curl -X GET http://localhost:8001/plugins \
  --data "name=jwt"
```

## 📚 API Documentation

### Endpoints qua Kong Gateway

| Service | Original | Kong Gateway | Description |
|---------|----------|--------------|-------------|
| UserService | `localhost:3001/api/v1/users` | `api.microservice.local:8000/api/v1/users` | User management |
| UserService | `localhost:3001/api/v1/auth` | `api.microservice.local:8000/api/v1/auth` | Authentication |
| SenderService | `localhost:3002/api/v1/notifications` | `api.microservice.local:8000/api/v1/notifications` | Notifications |
| SenderService | `localhost:3002/api/v1/files` | `api.microservice.local:8000/api/v1/files` | File upload |
| SocialService | `localhost:3003/api/v1/presence` | `api.microservice.local:8000/api/v1/presence` | User presence |
| SocialService | `localhost:3003/api/v1/social` | `api.microservice.local:8000/api/v1/social` | Social features |

### Kong Admin API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /services` | List all services |
| `GET /routes` | List all routes |
| `GET /plugins` | List all plugins |
| `GET /consumers` | List all consumers |
| `GET /status` | Kong status |
| `GET /metrics` | Prometheus metrics |

## 🎯 Lợi Ích So Với ApiGateway Hiện Tại

| Feature | ApiGateway (NestJS) | Kong Gateway |
|---------|-------------------|--------------|
| **Performance** | Dependent on Node.js | High-performance Nginx-based |
| **Scalability** | Manual scaling | Auto-scaling, clustering |
| **Security** | Custom implementation | Battle-tested security plugins |
| **Monitoring** | Basic metrics | Rich analytics & monitoring |
| **Rate Limiting** | Custom code | Built-in rate limiting |
| **Authentication** | JWT only | JWT, OAuth2, LDAP, etc. |
| **Caching** | Manual implementation | Built-in proxy caching |
| **Load Balancing** | Basic round-robin | Advanced algorithms |
| **SSL Termination** | Application level | Gateway level |
| **Plugin Ecosystem** | Limited | 200+ plugins available |

## 🔄 Migration Strategy

1. **Phase 1**: Deploy Kong alongside existing ApiGateway
2. **Phase 2**: Route specific endpoints through Kong
3. **Phase 3**: Migrate all traffic to Kong
4. **Phase 4**: Decommission old ApiGateway
5. **Phase 5**: Optimize Kong configuration

## 🚀 Next Steps

1. **Production Deployment**: 
   - Setup Kong Enterprise/Konnect
   - Configure proper SSL certificates
   - Setup external databases

2. **Advanced Features**:
   - API versioning strategies
   - Advanced rate limiting
   - Custom plugins development

3. **DevOps Integration**:
   - CI/CD pipelines for Kong configuration
   - Infrastructure as Code (Terraform)
   - Kubernetes deployment

---

📞 **Support**: Nếu gặp vấn đề, hãy check logs và documentation hoặc liên hệ team. 