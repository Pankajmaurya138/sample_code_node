import axios, { Axios, AxiosInstance, AxiosRequestConfig } from 'axios';
import TokenService from '../services/token.service';

class ApiClient {
    http: AxiosInstance;
    tokenStorage: TokenService;

    constructor(baseUrl: string, tokenStorage: TokenService) {
        this.http = axios.create({
            // baseURL: baseUrl
        });

        this.tokenStorage = tokenStorage;
        this.setupTokenInterceptors();
    }

    setupTokenInterceptors() {
        this.http.interceptors.request.use(async (request: any) => {
            let token = await this.tokenStorage.getAccessToken();
            if (token) {
                request.headers['Authorization'] = `Bearer ${token}`;
            }

            return request;
        });

        this.http.interceptors.response.use(undefined, async (error) => {
            const response = error.response;

            if (response) {
                if (
                    response.status === 401 &&
                    error.config &&
                    !error.config.__isRetryRequest
                ) {
                    try {
                        await this.tokenStorage.generateToken();
                    } catch (authError) {
                        // refreshing has failed, but report the original error, i.e. 401
                        return Promise.reject(error);
                    }

                    // retry the original request
                    error.config.__isRetryRequest = true;
                    return this.http(error.config);
                }
            }

            return Promise.reject(error);
        });
    }
}
