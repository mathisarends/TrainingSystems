import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../environment/environment';
import { BrowserCheckService } from './browser-check.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private baseUrl: string = process.env['NODE_ENV'] === 'production' ? environment.produUrl : environment.apiUrl;

  constructor(
    private http: HttpClient,
    private browserCheckService: BrowserCheckService,
  ) {}

  /**
   * Makes an HTTP GET request.
   *
   * @template T The expected response type.
   * @param url - The endpoint URL (relative to the base URL).
   * @param params - The HTTP parameters to include in the request.
   * @param headers - The HTTP headers to include in the request.
   * @returns An Observable of type T with the HTTP response.
   */
  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.handleRequest<T>('GET', url, null, params, headers);
  }

  /**
   * Makes an HTTP POST request.
   *
   * @template T The expected response type.
   * @param url - The endpoint URL (relative to the base URL).
   * @param body - The request body.
   * @param params - The HTTP parameters to include in the request.
   * @param headers - The HTTP headers to include in the request.
   * @returns An Observable of type T with the HTTP response.
   */
  post<T>(url: string, body?: any, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.handleRequest<T>('POST', url, body, params, headers);
  }

  /**
   * Makes an HTTP PUT request.
   *
   * @template T The expected response type.
   * @param url - The endpoint URL (relative to the base URL).
   * @param body - The request body.
   * @param params - The HTTP parameters to include in the request.
   * @param headers - The HTTP headers to include in the request.
   * @returns An Observable of type T with the HTTP response.
   */
  put<T>(url: string, body: any, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.handleRequest<T>('PUT', url, body, params, headers);
  }

  /**
   * Makes an HTTP DELETE request.
   *
   * @template T The expected response type.
   * @param url - The endpoint URL (relative to the base URL).
   * @param params - The HTTP parameters to include in the request.
   * @param headers - The HTTP headers to include in the request.
   * @returns An Observable of type T with the HTTP response.
   */
  delete<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.handleRequest<T>('DELETE', url, null, params, headers);
  }

  /**
   * Makes an HTTP PATCH request.
   *
   * @template T The expected response type.
   * @param url - The endpoint URL (relative to the base URL).
   * @param body - The request body.
   * @param params - The HTTP parameters to include in the request.
   * @param headers - The HTTP headers to include in the request.
   * @returns An Observable of type T with the HTTP response.
   */
  patch<T>(url: string, body: any, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.handleRequest<T>('PATCH', url, body, params, headers);
  }

  /**
   * Handles HTTP requests, abstracts the common functionality for all methods.
   *
   * @template T The expected response type.
   * @param method - The HTTP method to use (GET, POST, PUT, DELETE, PATCH).
   * @param url - The endpoint URL (relative to the base URL).
   * @param body - The request body for POST, PUT, PATCH methods.
   * @param params - The HTTP parameters to include in the request.
   * @param headers - The HTTP headers to include in the request.
   * @returns An Observable of type T with the HTTP response.
   */
  private handleRequest<T>(
    method: string,
    url: string,
    body?: any,
    params?: HttpParams,
    headers?: HttpHeaders,
  ): Observable<T> {
    if (!this.browserCheckService.isBrowser()) {
      return of(null as unknown as T);
    }

    const { fullUrl, options } = this.buildRequestOptions(url, params, headers, body);

    switch (method) {
      case 'GET':
        return this.http.get<T>(fullUrl, options);
      case 'POST':
        return this.http.post<T>(fullUrl, options.body, options);
      case 'PUT':
        return this.http.put<T>(fullUrl, options.body, options);
      case 'DELETE':
        return this.http.delete<T>(fullUrl, options);
      case 'PATCH':
        return this.http.patch<T>(fullUrl, options.body, options);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  /**
   * Builds the full URL and the options object for the HTTP request.
   *
   * @param url - The endpoint URL (relative to the base URL).
   * @param params - The HTTP parameters to include in the request.
   * @param headers - The HTTP headers to include in the request.
   * @param body - Optional request body (for methods like POST, PUT, PATCH).
   * @returns An object containing the full URL and the request options.
   */
  private buildRequestOptions(url: string, params?: HttpParams, headers?: HttpHeaders, body?: any) {
    const fullUrl = `${this.baseUrl}${url}`;
    const options = {
      body,
      params: params || new HttpParams(),
      headers: headers || new HttpHeaders(),
      withCredentials: true,
    };
    return { fullUrl, options };
  }
}
