# 🚨 Inter-Service Error Handling System

Hệ thống xử lý lỗi tổng quát để preserve mã lỗi từ service con và phục vụ hệ thống logging.

## 🎯 **Tính năng chính:**

✅ **Preserve HTTP Status Code** từ service con  
✅ **Structured Error Logging** với format chuẩn  
✅ **Request ID tracking** cho trace  
✅ **Performance metrics** (response time)  
✅ **Automatic error context** với service info  
✅ **Type-safe error handling**  

## 🔧 **Cấu trúc Components:**

### 1. **InterServiceException** (`src/exceptions/inter-service.exception.ts`)
Custom exception để preserve error data:

```typescript
export class InterServiceException extends HttpException {
  public readonly serviceError: InterServiceErrorData;
  
  constructor(
    service: string,
    endpoint: string, 
    method: string,
    originalError: any,
    requestId?: string,
  )
}
```

### 2. **Error Handler Utilities** (`src/utils/inter-service-error.handler.ts`)
Wrapper functions cho error handling:

```typescript
export async function executeInterServiceCall<T>(
  axiosCall: () => Promise<T>,
  options: InterServiceCallOptions,
): Promise<T>

export function InterServiceCall(serviceName: string, context?: string)
```

## 📚 **Cách sử dụng:**

### **Method 1: executeInterServiceCall() - Recommended**

```typescript
import { executeInterServiceCall } from 'src/utils/inter-service-error.handler';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  
  async createUser(userData: any) {
    return executeInterServiceCall(
      async () => {
        const response = await this.userServiceClient.post('/users', userData);
        this.logger.log('✅ User created successfully:', response.data);
        return response.data;
      },
      {
        serviceName: 'UserService',
        logger: this.logger,
        context: 'UserController',
      },
    );
  }
}
```

### **Method 2: @InterServiceCall Decorator**

```typescript
import { InterServiceCall } from 'src/utils/inter-service-error.handler';

export class UserService {
  private readonly logger = new Logger(UserService.name);

  @InterServiceCall('UserService', 'UserService')
  async getUserById(userId: string) {
    const response = await this.userServiceClient.get(`/users/${userId}`);
    return response.data;
  }

  @InterServiceCall('PaymentService')  
  async processPayment(paymentData: any) {
    const response = await this.paymentServiceClient.post('/payments', paymentData);
    return response.data;
  }
}
```

## 🌊 **Error Flow:**

```
1. Client Request
   ↓
2. API Gateway Controller
   ↓
3. executeInterServiceCall()
   ↓
4. Axios Call to Service
   ↓
5a. SUCCESS → Log success + return data
5b. ERROR → Create InterServiceException + Log error + throw
   ↓
6. NestJS Exception Filter
   ↓
7. Client receives proper HTTP status + error details
```

## 📝 **Error Response Format:**

### **Success Response:**
```json
{
  "statusCode": 201,
  "data": {
    "id": "123", 
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### **Error Response:**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "service": "UserService",
  "endpoint": "/users/123",
  "method": "GET",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "uuid-123-456",
  "details": {
    "error": "USER_NOT_FOUND",
    "userId": "123"
  }
}
```

## 📊 **Log Format:**

### **Success Log:**
```json
{
  "level": "log",
  "message": "📤 Inter-service call started: UserService",
  "context": "UserController",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

{
  "level": "log", 
  "message": "✅ Inter-service call completed: UserService (156ms)",
  "context": "UserController",
  "timestamp": "2024-01-15T10:30:00.156Z"
}
```

### **Error Log:**
```json
{
  "level": "error",
  "context": "UserController",
  "service": "UserService",
  "endpoint": "/users/123",
  "method": "GET",
  "statusCode": 404,
  "message": "User not found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "uuid-123-456",
  "originalError": {
    "error": "USER_NOT_FOUND",
    "userId": "123"
  }
}
```

## 🎛️ **Advanced Usage:**

### **Custom Request ID:**
```typescript
import { generateRequestId } from 'src/utils/inter-service-error.handler';

const customRequestId = generateRequestId();

return executeInterServiceCall(
  () => this.serviceClient.post('/endpoint', data),
  {
    serviceName: 'CustomService',
    logger: this.logger,
    requestId: customRequestId,
    context: 'CustomController',
  },
);
```

### **Multiple Service Calls:**
```typescript
async getUserWithPayments(userId: string) {
  const [user, payments] = await Promise.all([
    executeInterServiceCall(
      () => this.userClient.get(`/users/${userId}`),
      { serviceName: 'UserService', logger: this.logger },
    ),
    executeInterServiceCall(
      () => this.paymentClient.get(`/payments/user/${userId}`),
      { serviceName: 'PaymentService', logger: this.logger },
    ),
  ]);

  return { user, payments };
}
```

### **Conditional Error Handling:**
```typescript
async robustServiceCall(userId: string) {
  try {
    return await executeInterServiceCall(
      () => this.userClient.get(`/users/${userId}`),
      { serviceName: 'UserService', logger: this.logger },
    );
  } catch (error) {
    if (error instanceof InterServiceException) {
      const { statusCode, service, endpoint } = error.serviceError;
      
      if (statusCode === 404) {
        this.logger.warn(`User ${userId} not found in ${service}`);
        return null; // Return null instead of throwing
      }
      
      if (statusCode >= 500) {
        this.logger.error(`${service} is experiencing issues at ${endpoint}`);
        // Maybe retry or use fallback
      }
    }
    
    throw error; // Re-throw if not handled
  }
}
```

## 🔧 **Integration với Controllers:**

### **Base Controller Pattern:**
```typescript
import { executeInterServiceCall } from 'src/utils/inter-service-error.handler';

export abstract class BaseController {
  protected readonly logger = new Logger(this.constructor.name);
  
  protected async callService<T>(
    serviceName: string,
    axiosCall: () => Promise<T>,
  ): Promise<T> {
    return executeInterServiceCall(axiosCall, {
      serviceName,
      logger: this.logger,
      context: this.constructor.name,
    });
  }
}

@Controller('users')
export class UserController extends BaseController {
  async getUser(userId: string) {
    return this.callService('UserService', () =>
      this.userClient.get(`/users/${userId}`)
    );
  }
}
```

## 🚫 **Best Practices:**

### ✅ **DO:**
- Luôn sử dụng `executeInterServiceCall()` cho inter-service calls
- Provide meaningful service names và context
- Log success responses với logger.log()
- Use structured error messages
- Include request IDs cho tracing

### ❌ **DON'T:**
- Không try/catch thủ công khi dùng `executeInterServiceCall()`
- Không console.log trực tiếp - dùng logger
- Không modify error status code trong catch blocks
- Không ignore performance metrics

## 🔍 **Monitoring & Debugging:**

### **Request Tracing:**
Mỗi request có unique `requestId` để trace qua multiple services:

```
[2024-01-15 10:30:00] [UserController] 📤 Inter-service call started: UserService (requestId: abc-123)
[2024-01-15 10:30:00] [PaymentController] 📤 Inter-service call started: PaymentService (requestId: abc-123)  
[2024-01-15 10:30:01] [UserController] ✅ Inter-service call completed: UserService (156ms)
[2024-01-15 10:30:02] [PaymentController] ❌ Inter-service error: PaymentService (timeout)
```

### **Performance Monitoring:**
Response times được tự động log:

```typescript
// Automatically logged:
"✅ Inter-service call completed: UserService (156ms)"
"✅ Inter-service call completed: PaymentService (1204ms)" // Slow!
```

---

## 🎯 **Summary:**

Hệ thống này đảm bảo:
- **Consistent error handling** across toàn bộ dự án
- **Preserve HTTP status codes** từ service con
- **Structured logging** cho monitoring
- **Request tracing** cho debugging
- **Performance metrics** tự động

**Happy error handling! 🎉** 