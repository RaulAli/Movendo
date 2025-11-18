import { Module } from '@nestjs/common';
import { HttpModule as AxiosModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        AxiosModule,
    ],
    controllers: [GatewayController],
    providers: [GatewayService],
})
export class AppModule { }

//Lanzador Inicial