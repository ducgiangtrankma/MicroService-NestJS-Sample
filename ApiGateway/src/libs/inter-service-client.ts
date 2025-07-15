import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { AuthService } from 'src/api/auth/auth.service';
import { PayloadContext } from 'src/common/inter-service.interface';

@Injectable()
export class InterServiceClient {
  private clientCache = new Map<string, AxiosInstance>();

  constructor(private readonly authService: AuthService) {}

  /**
   * Tạo hoặc lấy axios client từ cache
   */
  private getOrCreateClient(
    baseURL: string,
    requestSource: string = 'gateway',
  ): AxiosInstance {
    const cacheKey = `${baseURL}-${requestSource}`;

    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey)!;
    }

    const axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
    });

    // Base interceptor không có payload
    axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // Lấy payload từ config nếu có
          const payload = (config as any).payloadContext;

          const internalToken = await this.authService.genInternalToken({
            requestFrom: requestSource,
            ...payload,
          });

          config.headers.set('Authorization', `Bearer ${internalToken}`);
          config.headers.set('x-request-source', requestSource);

          return config;
        } catch (error) {
          console.error('Failed to generate internal token:', error);
          throw error;
        }
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(
          'Inter-service request failed:',
          error?.response?.data || error?.message,
        );
        return Promise.reject(error);
      },
    );

    this.clientCache.set(cacheKey, axiosInstance);
    return axiosInstance;
  }

  /**
   * GET request với payload injection
   */
  async get<T = any>(
    url: string,
    baseURL: string,
    payload?: PayloadContext,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const client = this.getOrCreateClient(baseURL);
    const requestConfig = {
      ...config,
      payloadContext: payload,
    };
    return client.get<T>(url, requestConfig);
  }

  /**
   * POST request với payload injection
   */
  async post<T = any>(
    url: string,
    baseURL: string,
    data?: any,
    payload?: PayloadContext,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const client = this.getOrCreateClient(baseURL);
    const requestConfig = {
      ...config,
      payloadContext: payload,
    };
    return client.post<T>(url, data, requestConfig);
  }

  /**
   * POST FormData request với payload injection
   */
  async postFormData<T = any>(
    url: string,
    baseURL: string,
    formData: FormData,
    payload?: PayloadContext,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const client = this.getOrCreateClient(baseURL);
    const requestConfig = {
      ...config,
      payloadContext: payload,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    };
    return client.post<T>(url, formData, requestConfig);
  }

  /**
   * PUT request với payload injection
   */
  async put<T = any>(
    url: string,
    baseURL: string,
    data?: any,
    payload?: PayloadContext,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const client = this.getOrCreateClient(baseURL);
    const requestConfig = {
      ...config,
      payloadContext: payload,
    };
    return client.put<T>(url, data, requestConfig);
  }

  /**
   * DELETE request với payload injection
   */
  async delete<T = any>(
    url: string,
    baseURL: string,
    payload?: PayloadContext,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const client = this.getOrCreateClient(baseURL);
    const requestConfig = {
      ...config,
      payloadContext: payload,
    };
    return client.delete<T>(url, requestConfig);
  }

  /**
   * Tạo axios client cho việc gọi API giữa các service (Legacy method)
   * @deprecated Sử dụng các method get, post, put, delete thay thế
   */
  createAxiosClient(
    baseURL: string,
    requestSource: string = 'gateway',
  ): AxiosInstance {
    return this.getOrCreateClient(baseURL, requestSource);
  }

  /**
   * Factory method để tạo client cho các service cụ thể
   */
  createPaymentClient(): AxiosInstance {
    return this.getOrCreateClient('http://payment-service:3002');
  }

  createUserClient(): AxiosInstance {
    return this.getOrCreateClient('http://user-service:3001');
  }

  /**
   * Tạo client với cấu hình tùy chỉnh
   */
  createCustomClient(
    baseURL: string,
    options?: {
      requestSource?: string;
      timeout?: number;
      defaultHeaders?: Record<string, string>;
    },
  ): AxiosInstance {
    const axiosInstance = this.getOrCreateClient(
      baseURL,
      options?.requestSource,
    );

    // Cấu hình timeout tùy chỉnh
    if (options?.timeout) {
      axiosInstance.defaults.timeout = options.timeout;
    }

    // Thêm default headers tùy chỉnh
    if (options?.defaultHeaders) {
      Object.entries(options.defaultHeaders).forEach(([key, value]) => {
        axiosInstance.defaults.headers.common[key] = value;
      });
    }

    return axiosInstance;
  }

  /**
   * Clear cache (useful for testing hoặc cleanup)
   */
  clearCache(): void {
    this.clientCache.clear();
  }
}
