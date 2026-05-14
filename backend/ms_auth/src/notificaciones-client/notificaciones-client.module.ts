import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NotificacionesClientService } from './notificaciones-client.service';


@Module({
    imports: [
        ConfigModule,
        ClientsModule.registerAsync([
            {
                name: 'NOTIFICACIONES_PACKAGE',
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'notificaciones',
                        protoPath:
                          configService.get<string>('PROTO_NOTIFICACIONES_PATH') ||
                          join(process.cwd(), '../../proto/notificaciones.proto'),
                        url:
                         configService.get<string>('NOTIFICACIONES_GRPC_URL') ||
                         'localhost:50056',
                    },
                }),
            },
        ]),
    ],
    providers: [NotificacionesClientService],
    exports: [NotificacionesClientService],
})
export class NotificacionesClientModule {}

