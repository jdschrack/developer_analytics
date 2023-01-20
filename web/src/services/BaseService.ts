import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export default class BaseService {
  protected readonly instance: AxiosInstance;
  constructor() {
    this.instance = axios.create();

  }

  private initializeResponseInterceptor = () => {
    this.instance.interceptors.request.use(this.handleRequest);
    this.instance.interceptors.response.use(this.handleResponse, this.handleError);
  };

  private handleError = (error: AxiosError) => {
    if (error.response) {
      this.logError('FAXTEST_API Error (response): ', error.response);
      return Promise.reject(error.response);
    }
    if (error.request) {
      this.logError('FAXTEST_API Error (request):', error.request);
      return Promise.reject(error.request);
    }
    this.logError('FAXTEST_API Error (generic):', error);
    return Promise.reject(error);
  };

  private handleRequest = async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    let newConfig: AxiosRequestConfig = config;

    return newConfig;
  };

  private handleResponse = (response: AxiosResponse) => {
    if (process.env.TRACE) {
      // eslint-disable-next-line no-console
      console.trace('SG-API-Request: ', response);
    }
    return response;
  };

  private logError = (text: string, error: object): void => {
    if (process.env.TRACE) {
      // eslint-disable-next-line no-console
      console.warn(text, error);
    }
    throw error;
  };

  public async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url);
  }

  public async get<T>(url: string): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url);
  }

  public async post<T>(url: string, data: object): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data);
  }

  public async patch<T>(url: string, data: object): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data);
  }
}