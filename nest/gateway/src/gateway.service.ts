import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { createHash } from 'crypto';

@Injectable()
export class GatewayService {
    constructor(private httpService: HttpService) { }

    private getHeadersFromReq(req?: Request) {
        const headers: Record<string, string> = {};
        if (!req) return headers;
        const authHeader = req.headers.authorization;
        if (authHeader) headers['Authorization'] = String(authHeader);
        // Forward other useful headers if you want, e.g. 'x-request-id'
        return headers;
    }

    private cleanHeaders(h?: Record<string, string | undefined>) {
        const out: Record<string, string> = {};
        if (!h) return out;
        for (const [k, v] of Object.entries(h)) {
            if (v !== undefined && v !== null) out[k] = String(v);
        }
        return out;
    }

    async proxyGet(url: string, req?: Request) {
        const headers = this.getHeadersFromReq(req);
        const response = await firstValueFrom(this.httpService.get(url, { headers, timeout: 5000 }));
        return response.data;
    }

    async proxyPost(url: string, body: any, req?: Request) {
        const headers = this.getHeadersFromReq(req);
        const response = await firstValueFrom(this.httpService.post(url, body, { headers, timeout: 5000 }));
        return response.data;
    }

    async proxyPostCommunicate(url: string, body: any, headers?: Record<string, string | undefined>): Promise<any> {
        const clean = this.cleanHeaders(headers);
        const response = await firstValueFrom(this.httpService.post(url, body, { headers: clean, timeout: 5000 }));
        return response.data;
    }

    async proxyPut(url: string, body: any, req?: Request) {
        const headers = this.getHeadersFromReq(req);
        const response = await firstValueFrom(this.httpService.put(url, body, { headers, timeout: 5000 }));
        return response.data;
    }
    async proxyDelete(url: string, req?: Request) {
        const headers = this.getHeadersFromReq(req);
        const response = await firstValueFrom(this.httpService.delete(url, { headers, timeout: 5000 }));
        return response.data;
    }

    async ping(url: string, req?: Request) {
        const headers = this.getHeadersFromReq(req); // toma Authorization u otros
        const response = await firstValueFrom(this.httpService.get(url, { headers, timeout: 5000 }));
        return response.data; // devuelve solo los datos
    }

}
