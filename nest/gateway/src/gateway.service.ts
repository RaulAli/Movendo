import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
    constructor(private httpService: HttpService) { }

    async proxyGet(url: string) {
        const response = await firstValueFrom(this.httpService.get(url));
        return response.data;
    }

    async proxyPost(url: string, body: any) {
        const response = await firstValueFrom(this.httpService.post(url, body));
        return response.data;
    }

    async proxyPut(url: string, body: any) {
        const response = await firstValueFrom(this.httpService.put(url, body));
        return response.data;
    }

    async proxyDelete(url: string) {
        const response = await firstValueFrom(this.httpService.delete(url));
        return response.data;
    }

}
//Redureccion
