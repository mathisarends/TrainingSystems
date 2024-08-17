import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpMethods } from '../../app/types/httpMethods';
import { environment } from '../../config/environment';
import { BrowserCheckService } from '../../app/browser-check.service';

/**
 * @description
 * HttpClientService abstracts HTTP requests and provides methods to perform GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS requests.
 * It also manages the base URL so that only the endpoint path needs to be specified in the request.
 */
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
    if (this.browserCheckService.isBrowser()) {
      const { fullUrl, options } = this.buildRequestOptions(url, params, headers);
      return this.http.get<T>(fullUrl, options);
    } else {
      return of(null as unknown as T);
    }
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
  post<T>(url: string, body?: Record<string, string>, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    if (this.browserCheckService.isBrowser()) {
      const { fullUrl, options } = this.buildRequestOptions(url, params, headers, body);
      return this.http.post<T>(fullUrl, options.body, options);
    } else {
      return of(null as unknown as T);
    }
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
  put<T>(url: string, body: Record<string, string>, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    if (this.browserCheckService.isBrowser()) {
      const { fullUrl, options } = this.buildRequestOptions(url, params, headers, body);
      return this.http.put<T>(fullUrl, options.body, options);
    } else {
      return of(null as unknown as T);
    }
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
    if (this.browserCheckService.isBrowser()) {
      const { fullUrl, options } = this.buildRequestOptions(url, params, headers);
      return this.http.delete<T>(fullUrl, options);
    } else {
      return of(null as unknown as T);
    }
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
  patch<T>(url: string, body: Record<string, string>, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    if (this.browserCheckService.isBrowser()) {
      const { fullUrl, options } = this.buildRequestOptions(url, params, headers, body);
      return this.http.patch<T>(fullUrl, options.body, options);
    } else {
      return of(null as unknown as T);
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
      params,
      headers,
      withCredentials: true,
    };
    return { fullUrl, options };
  }
}
