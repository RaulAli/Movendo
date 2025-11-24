import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { HttpModule as AxiosModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { JwtMiddleware } from './middleware/jwt.middleware';

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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(JwtMiddleware)
            .exclude(
                { path: 'merchant/login', method: RequestMethod.POST },
                { path: 'merchant/register', method: RequestMethod.POST },
                { path: 'merchant/refresh', method: RequestMethod.POST }
            )
            .forRoutes(GatewayController);
    }
}

//Lanzador Inicial