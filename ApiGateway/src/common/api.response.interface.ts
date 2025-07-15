export interface ApplicationApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
}
