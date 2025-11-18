import { Injectable, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class GatewayService {
    constructor(private httpService: HttpService) { }

    private getHeaders(req: Request) {
        const headers: any = {};
        const authHeader = req.headers.authorization;
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }
        return { headers };
    }

    async proxyGet(url: string, req: Request) {
        const { headers } = this.getHeaders(req);
        const response = await firstValueFrom(this.httpService.get(url, { headers }));
        return response.data;
    }

    async proxyPost(url: string, body: any, req: Request) {
        const { headers } = this.getHeaders(req);
        const response = await firstValueFrom(this.httpService.post(url, body, { headers }));
        return response.data;
    }

    async proxyPut(url: string, body: any, req: Request) {
        const { headers } = this.getHeaders(req);
        const response = await firstValueFrom(this.httpService.put(url, body, { headers }));
        return response.data;
    }

    async proxyDelete(url: string, req: Request) {
        const { headers } = this.getHeaders(req);
        const response = await firstValueFrom(this.httpService.delete(url, { headers }));
        return response.data;
    }
}
//Redureccion
