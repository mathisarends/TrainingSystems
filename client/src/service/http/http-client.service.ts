import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpMethods } from '../../app/types/httpMethods';
import { environment } from '../../config/environment';
import { isPlatformBrowser } from '@angular/common';

/**
 * @description
 * HttpClientService abstracts HTTP requests and provides methods to perform GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS requests.
 * It also manages the base URL so that only the endpoint path needs to be specified in the request.
 */
@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  private baseUrl: string = environment.production
    ? environment.produUrl
    : environment.apiUrl;
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Makes an HTTP request using the specified method.
   *
   * @template T The expected response type.
   * @param method - The HTTP method to use for the request.
   * @param url - The endpoint URL (relative to the base URL).
   * @param body - The request body (for POST, PUT, PATCH methods).
   * @param params - The HTTP parameters to include in the request.
   * @param headers - The HTTP headers to include in the request.
   * @returns An Observable of type T with the HTTP response.
   * @throws Will throw an error if an invalid HTTP method is provided.
   */
  request<T>(
    method: HttpMethods,
    url: string,
    body?: any,
    params?: HttpParams,
    headers?: HttpHeaders
  ): Observable<T> {
    if (isPlatformBrowser(this.platformId)) {
      const fullUrl = `${this.baseUrl}/${url}`;

      const options = {
        body,
        params,
        headers,
        withCredentials: true,
      };

      switch (method) {
        case HttpMethods.GET:
          return this.http.get<T>(fullUrl, { ...options });
        case HttpMethods.POST:
          return this.http.post<T>(fullUrl, body, options);
        case HttpMethods.PUT:
          return this.http.put<T>(fullUrl, body, options);
        case HttpMethods.DELETE:
          return this.http.delete<T>(fullUrl, { ...options });
        case HttpMethods.PATCH:
          return this.http.patch<T>(fullUrl, body, options);
        case HttpMethods.HEAD:
          return this.http.head<T>(fullUrl, { ...options });
        case HttpMethods.OPTIONS:
          return this.http.options<T>(fullUrl, { ...options });
        default:
          throw new Error('Invalid HTTP method');
      }
    } else {
      // Skipping HTTP request on the server
      return of(null as unknown as T);
    }
  }
}
