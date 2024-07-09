import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpMethods } from '../app/types/httpMethods';
@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  constructor(private http: HttpClient) {}

  request<T>(
    method: HttpMethods,
    url: string,
    body?: any,
    params?: HttpParams,
    headers?: HttpHeaders
  ): Observable<T> {
    switch (method) {
      case HttpMethods.GET:
        return this.http.get<T>(url, { params, headers });
      case HttpMethods.POST:
        return this.http.post<T>(url, body, { headers });
      case HttpMethods.PUT:
        return this.http.put<T>(url, body, { headers });
      case HttpMethods.DELETE:
        return this.http.delete<T>(url, { params, headers });
      case HttpMethods.PATCH:
        return this.http.patch<T>(url, body, { headers });
      case HttpMethods.HEAD:
        return this.http.head<T>(url, { params, headers });
      case HttpMethods.OPTIONS:
        return this.http.options<T>(url, { params, headers });
      default:
        throw new Error('Invalid HTTP method');
    }
  }
}
