import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient) { }

    private formatErrors(error: any) {
        return throwError(() => error.error);
    }

    get(path: string, params: HttpParams = new HttpParams(), port: number = 3000): Observable<any> {

        return this.http.get(`${environment.api_url}:${port}${path}`, { params })
            .pipe(catchError(this.formatErrors));
    }



    put(path: string, body: object = {}, port = 3000): Observable<any> {
        return this.http.put(`${environment.api_url}:${port}${path}`, body)
            .pipe(catchError(this.formatErrors));
    }

    post(path: string, body: any = {}, port: number = 3003): Observable<any> {
        return this.http.post(`${environment.api_url}:${port}${path}`, body)
            .pipe(catchError(this.formatErrors));
    }

    delete(path: any, port: number = 3000): Observable<any> {
        return this.http.delete(`${environment.api_url}:${port}${path}`)
            .pipe(catchError(this.formatErrors));
    }

    get_admin(path: string, params: HttpParams = new HttpParams(), port: number = 3002): Observable<any> {

        return this.http.get(`${environment.api_url}:${port}${path}`, { params })
            .pipe(catchError(this.formatErrors));
    }

    put_admin(path: string, body: any = {}, port: number = 3002): Observable<any> {
        return this.http
            .put(`${environment.api_url}:${port}${path}`, body)
            .pipe(catchError(this.formatErrors));
    }

    status_admin(path: string, body: any, port: number = 3002): Observable<any> {
        return this.http
            .put(`${environment.api_url}:${port}${path}`, body)
            .pipe(catchError(this.formatErrors));
    }

    delete_admin(path: string, port: number = 3002): Observable<any> {
        return this.http
            .delete(`${environment.api_url}:${port}${path}`)
            .pipe(catchError(this.formatErrors));
    }
}
