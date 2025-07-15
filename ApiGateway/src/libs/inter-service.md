# 🚀 Inter-Service Client Usage Guide

Hướng dẫn sử dụng `InterServiceClient` để gọi API giữa các service với JWT token tự động.

## 📦 Setup

### 1. Import trong Controller/Service:
```typescript
import { Injectable } from '@nestjs/common';
import { InterServiceClient } from 'src/libs/inter-service-client';

@Injectable()
export class YourService {
  constructor(private readonly interServiceClient: InterServiceClient) {}
}
```

### 2. Tạo Axios Client:
```typescript
// Tạo client cho service cụ thể
const paymentClient = this.interServiceClient.createPaymentClient();
const userClient = this.interServiceClient.createUserClient();

// Hoặc tạo client tùy chỉnh
const customClient = this.interServiceClient.createAxiosClient('http://inventory-service:3004');
```

## 🌐 HTTP Methods Examples

### 📥 **GET Request**

```typescript
async getUserById(userId: string) {
  const userClient = this.interServiceClient.createUserClient();
  
  try {
    // GET /api/users/123
    const response = await userClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  }
}

// GET với query parameters
async getUsersWithQuery() {
  const userClient = this.interServiceClient.createUserClient();
  
  const response = await userClient.get('/api/users', {
    params: {
      page: 1,
      limit: 10,
      status: 'active'
    }
  });
  
  return response.data;
}
```

### 📤 **POST Request**

```typescript
async createUser(userData: any) {
  const userClient = this.interServiceClient.createUserClient();
  
  try {
    // POST /api/users
    const response = await userClient.post('/api/users', {
      name: userData.name,
      email: userData.email,
      role: userData.role
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

// POST với custom headers
async createUserWithHeaders(userData: any) {
  const userClient = this.interServiceClient.createUserClient();
  
  const response = await userClient.post('/api/users', userData, {
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'custom-value'
    }
  });
  
  return response.data;
}
```

### 📝 **PUT Request**

```typescript
async updateUser(userId: string, userData: any) {
  const userClient = this.interServiceClient.createUserClient();
  
  try {
    // PUT /api/users/123
    const response = await userClient.put(`/api/users/${userId}`, {
      name: userData.name,
      email: userData.email,
      status: userData.status
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

// PATCH request (partial update)
async partialUpdateUser(userId: string, partialData: any) {
  const userClient = this.interServiceClient.createUserClient();
  
  const response = await userClient.patch(`/api/users/${userId}`, partialData);
  return response.data;
}
```

### 🗑️ **DELETE Request**

```typescript
async deleteUser(userId: string) {
  const userClient = this.interServiceClient.createUserClient();
  
  try {
    // DELETE /api/users/123
    const response = await userClient.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}

// DELETE với query parameters
async deleteUsersWithQuery() {
  const userClient = this.interServiceClient.createUserClient();
  
  const response = await userClient.delete('/api/users/bulk', {
    data: { // DELETE với body
      userIds: ['123', '456', '789']
    }
  });
  
  return response.data;
}
```

### 📎 **POST FormData (File Upload)**

```typescript
async uploadUserAvatar(userId: string, file: Express.Multer.File) {
  const userClient = this.interServiceClient.createUserClient();
  
  try {
    // Tạo FormData
    const formData = new FormData();
    formData.append('avatar', file.buffer, file.originalname);
    formData.append('userId', userId);
    formData.append('type', 'avatar');
    
    // POST với FormData
    const response = await userClient.post('/api/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    throw error;
  }
}

// Multiple files upload
async uploadMultipleFiles(files: Express.Multer.File[], metadata: any) {
  const userClient = this.interServiceClient.createUserClient();
  
  const formData = new FormData();
  
  // Thêm multiple files
  files.forEach((file, index) => {
    formData.append(`files`, file.buffer, file.originalname);
  });
  
  // Thêm metadata
  formData.append('metadata', JSON.stringify(metadata));
  
  const response = await userClient.post('/api/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 seconds cho file lớn
  });
  
  return response.data;
}
```

## 🏢 **Service-Specific Examples**

### 💰 Payment Service

```typescript
async processPayment(paymentData: any) {
  const paymentClient = this.interServiceClient.createPaymentClient();
  
  // Tạo payment
  const payment = await paymentClient.post('/api/payments', {
    amount: paymentData.amount,
    currency: 'USD',
    orderId: paymentData.orderId,
    customerId: paymentData.customerId
  });
  
  // Confirm payment
  const confirmation = await paymentClient.put(`/api/payments/${payment.data.id}/confirm`, {
    paymentMethodId: paymentData.paymentMethodId
  });
  
  return confirmation.data;
}

async getPaymentHistory(customerId: string) {
  const paymentClient = this.interServiceClient.createPaymentClient();
  
  const response = await paymentClient.get('/api/payments/history', {
    params: {
      customerId,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  });
  
  return response.data;
}
```

### 👤 User Service

```typescript
async manageUserLifecycle(userData: any) {
  const userClient = this.interServiceClient.createUserClient();
  
  // Tạo user mới
  const newUser = await userClient.post('/api/users', userData);
  
  // Cập nhật profile
  const updatedUser = await userClient.put(`/api/users/${newUser.data.id}`, {
    profile: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      preferences: userData.preferences
    }
  });
  
  // Lấy thông tin user
  const userDetails = await userClient.get(`/api/users/${newUser.data.id}`);
  
  return userDetails.data;
}
```

## ⚙️ **Advanced Usage**

### 🎛️ Custom Configuration

```typescript
async callServiceWithCustomConfig() {
  // Client với timeout và headers tùy chỉnh
  const customClient = this.interServiceClient.createCustomClient(
    'http://analytics-service:3005',
    {
      requestSource: 'analytics-gateway',
      timeout: 120000, // 2 minutes
      defaultHeaders: {
        'X-Analytics-Version': 'v2',
        'X-Data-Format': 'json'
      }
    }
  );
  
  const response = await customClient.post('/api/analytics/process', {
    dataSet: 'large-dataset',
    operations: ['aggregate', 'filter', 'sort']
  });
  
  return response.data;
}
```

### 🔄 Retry Logic

```typescript
async callServiceWithRetry(maxRetries = 3) {
  const userClient = this.interServiceClient.createUserClient();
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await userClient.get('/api/users/health');
      return response.data;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed, retrying...`);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}
```

### 🌊 Streaming Data

```typescript
async streamData() {
  const dataClient = this.interServiceClient.createAxiosClient('http://data-service:3006');
  
  const response = await dataClient.get('/api/data/stream', {
    responseType: 'stream'
  });
  
  return response.data; // Stream object
}
```

## 🚫 **Error Handling**

### ⚠️ Comprehensive Error Handling

```typescript
async robustServiceCall(userId: string) {
  const userClient = this.interServiceClient.createUserClient();
  
  try {
    const response = await userClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 404:
          throw new Error(`User ${userId} not found`);
        case 403:
          throw new Error('Insufficient permissions');
        case 500:
          throw new Error('User service internal error');
        default:
          throw new Error(`User service error: ${data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Unable to connect to user service');
    } else {
      // Other error
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}
```

## 🎯 **Best Practices**

### ✅ **Recommended Patterns**

```typescript
@Injectable()
export class UserManagementService {
  private userClient: AxiosInstance;
  private paymentClient: AxiosInstance;
  
  constructor(private readonly interServiceClient: InterServiceClient) {
    // Khởi tạo clients một lần trong constructor
    this.userClient = this.interServiceClient.createUserClient();
    this.paymentClient = this.interServiceClient.createPaymentClient();
  }
  
  async getUserWithPayments(userId: string) {
    try {
      // Gọi parallel requests
      const [user, payments] = await Promise.all([
        this.userClient.get(`/api/users/${userId}`),
        this.paymentClient.get(`/api/payments/user/${userId}`)
      ]);
      
      return {
        user: user.data,
        payments: payments.data
      };
    } catch (error) {
      console.error('Failed to get user data:', error);
      throw error;
    }
  }
}
```

## 🔐 **Headers Tự Động**

Mọi request đều tự động có:
- `Authorization: Bearer <internal-jwt-token>`
- `x-request-source: gateway` (hoặc custom source)

Token được tạo fresh cho mỗi request bằng `AuthService.genInternalToken()`.

---

**Happy coding! 🎉**
