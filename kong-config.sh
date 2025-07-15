#!/bin/bash

# Kong Gateway Configuration Script
# Run this after Kong is running

KONG_ADMIN_URL="http://localhost:8001"

echo "🚀 Setting up Kong Gateway for MicroService Architecture..."

# Wait for Kong to be ready
echo "⏳ Waiting for Kong to be ready..."
until curl -f ${KONG_ADMIN_URL} > /dev/null 2>&1; do
    echo "Waiting for Kong Admin API..."
    sleep 5
done
echo "✅ Kong is ready!"

# 1. Create UserService
echo "📝 Creating UserService..."
curl -i -X POST ${KONG_ADMIN_URL}/services/ \
  --data "name=user-service" \
  --data "url=http://host.docker.internal:3001"

# Create UserService routes
curl -i -X POST ${KONG_ADMIN_URL}/services/user-service/routes \
  --data "hosts[]=api.microservice.local" \
  --data "paths[]=/api/v1/users" \
  --data "name=user-routes"

curl -i -X POST ${KONG_ADMIN_URL}/services/user-service/routes \
  --data "hosts[]=api.microservice.local" \
  --data "paths[]=/api/v1/auth" \
  --data "name=auth-routes"

# 2. Create SenderService  
echo "📝 Creating SenderService..."
curl -i -X POST ${KONG_ADMIN_URL}/services/ \
  --data "name=sender-service" \
  --data "url=http://host.docker.internal:3002"

# Create SenderService routes
curl -i -X POST ${KONG_ADMIN_URL}/services/sender-service/routes \
  --data "hosts[]=api.microservice.local" \
  --data "paths[]=/api/v1/notifications" \
  --data "name=notification-routes"

curl -i -X POST ${KONG_ADMIN_URL}/services/sender-service/routes \
  --data "hosts[]=api.microservice.local" \
  --data "paths[]=/api/v1/files" \
  --data "name=file-routes"

# 3. Create SocialService
echo "📝 Creating SocialService..."
curl -i -X POST ${KONG_ADMIN_URL}/services/ \
  --data "name=social-service" \
  --data "url=http://host.docker.internal:3003"

# Create SocialService routes
curl -i -X POST ${KONG_ADMIN_URL}/services/social-service/routes \
  --data "hosts[]=api.microservice.local" \
  --data "paths[]=/api/v1/presence" \
  --data "name=presence-routes"

curl -i -X POST ${KONG_ADMIN_URL}/services/social-service/routes \
  --data "hosts[]=api.microservice.local" \
  --data "paths[]=/api/v1/social" \
  --data "name=social-routes"

# 4. Add CORS Plugin globally
echo "🔧 Adding CORS plugin..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins/ \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.methods=GET,POST,PUT,DELETE,PATCH,OPTIONS" \
  --data "config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Auth-Token,Authorization" \
  --data "config.exposed_headers=X-Auth-Token" \
  --data "config.credentials=true" \
  --data "config.max_age=3600"

# 5. Add Rate Limiting Plugin
echo "🔧 Adding Rate Limiting plugin..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins/ \
  --data "name=rate-limiting" \
  --data "config.minute=100" \
  --data "config.hour=1000" \
  --data "config.policy=local"

# 6. Add Request Size Limiting Plugin
echo "🔧 Adding Request Size Limiting plugin..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins/ \
  --data "name=request-size-limiting" \
  --data "config.allowed_payload_size=10"

# 7. Add JWT Plugin for protected routes
echo "🔧 Adding JWT plugin for authentication..."
curl -i -X POST ${KONG_ADMIN_URL}/services/user-service/plugins/ \
  --data "name=jwt" \
  --data "config.secret_is_base64=false"

curl -i -X POST ${KONG_ADMIN_URL}/services/sender-service/plugins/ \
  --data "name=jwt" \
  --data "config.secret_is_base64=false"

curl -i -X POST ${KONG_ADMIN_URL}/services/social-service/plugins/ \
  --data "name=jwt" \
  --data "config.secret_is_base64=false"

# 8. Add Response Transformer Plugin
echo "🔧 Adding Response Transformer plugin..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins/ \
  --data "name=response-transformer" \
  --data "config.add.headers=X-Powered-By:Kong-Gateway" \
  --data "config.add.headers=X-Microservice-Architecture:NestJS"

# 9. Add Prometheus Plugin for monitoring
echo "🔧 Adding Prometheus plugin for monitoring..."
curl -i -X POST ${KONG_ADMIN_URL}/plugins/ \
  --data "name=prometheus"

# 10. Create Consumer for JWT
echo "👤 Creating consumer for JWT..."
curl -i -X POST ${KONG_ADMIN_URL}/consumers/ \
  --data "username=microservice-client"

# Create JWT credential for consumer
curl -i -X POST ${KONG_ADMIN_URL}/consumers/microservice-client/jwt \
  --data "key=microservice-key" \
  --data "secret=your-256-bit-secret-here-make-it-long-enough"

echo "✅ Kong Gateway configuration completed!"
echo ""
echo "📊 Access Points:"
echo "   - Kong Proxy: http://localhost:8000"
echo "   - Kong Admin: http://localhost:8001"
echo "   - Kong Admin GUI: http://localhost:8002"
echo "   - Konga UI: http://localhost:1337"
echo ""
echo "🔗 API Endpoints:"
echo "   - Users: http://api.microservice.local:8000/api/v1/users"
echo "   - Auth: http://api.microservice.local:8000/api/v1/auth"
echo "   - Notifications: http://api.microservice.local:8000/api/v1/notifications"
echo "   - Files: http://api.microservice.local:8000/api/v1/files"
echo "   - Presence: http://api.microservice.local:8000/api/v1/presence"
echo "   - Social: http://api.microservice.local:8000/api/v1/social"
echo ""
echo "⚠️  Don't forget to add 'api.microservice.local' to your /etc/hosts file:"
echo "   127.0.0.1 api.microservice.local" 