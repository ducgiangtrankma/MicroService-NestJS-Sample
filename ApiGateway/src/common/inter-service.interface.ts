export interface PayloadContext {
  userId?: string;
  username?: string;
  roles?: string;
  deviceId?: string;
  [key: string]: string | undefined;
}

export interface InterServiceRequestConfig {
  baseURL: string;
  requestSource?: string;
  payload?: PayloadContext;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}
