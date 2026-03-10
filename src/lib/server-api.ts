import { cookies } from "next/headers";

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number>;
  requiresAuth?: boolean;
}

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: any;
  status?: number;
};

class RestApi {
    private baseUrl: string;

    constructor () {
       // Base URL for API requests. Must be set in .env.local
        const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://127.0.0.1:8000';
        this.baseUrl = `${API_URL}/api`;
    }

    private buildURL(endpoint: string, params?: Record<string, string | number>) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }
        return url.toString();
    }

    private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
        const { params, requiresAuth = true, ...fetchOptions } = options;
        
        const url = this.buildURL(endpoint, params);
        
        const headers: Record<string, string> = {
            ...(fetchOptions.headers as Record<string, string> || {}),
        };

        if (fetchOptions.body && !(fetchOptions.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        if (requiresAuth) {
            const cookieStore = await cookies();
            const accessToken = cookieStore.get("access_token")?.value; 
            if (!accessToken) {
                return {
                    success: false,
                    error: {message: 'Access token not found. Please login first'},
                    status: 401,
                }
            }
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        // Fix for Next.js passing FormData to node-fetch:
        // Set duplex: 'half' if there is a stream/FormData body
        const fetchConfig: RequestInit & { duplex?: string } = {
            ...fetchOptions,
            headers,
        };

        if (fetchOptions.body && typeof fetchOptions.body !== 'string') {
            fetchConfig.duplex = 'half';
        }

        try {
            const response = await fetch(url, fetchConfig);

            const status = response.status;
            const isJson = response.headers.get("content-type")?.includes("application/json");

            if(!response.ok){
                const errorData = isJson ? await response.json().catch(() => ({})) : null;
                return {
                    success: false , 
                    error: errorData || `HTTP ${response.status}: ${response.statusText}`,
                    status
                }
            }

            const result: { success: boolean; data?: T; status?: number } = { success: true, status };

            if (isJson) {
                const data = await response.json().catch(() => null);
                if (data !== null) {
                    result.data = data;
                }
            }

            return result;

        } catch (error: any) {
            return { success:false , error: error.message || 'Something went wrong. Please try again.'}
        }
    }

    async get<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'POST' });
    }

    async put<T>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'PUT' });
    }

    async patch<T>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'PATCH' });
    }

    async delete<T>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const serverApi = new RestApi();
