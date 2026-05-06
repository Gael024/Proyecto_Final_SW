import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        type: 'postgres',
        host: ConfigService.get<string>('DB_HOST'),
        port: ConfigService.get<number>('DB_PORT'),
        username: ConfigService.get<string>('DB_USERNAME'),
        password: ConfigService.get<string>('DB_PASSWORD'),
        database: ConfigService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    NotificacionesModule,
  ],


  //controllers: [AppController],
  //providers: [AppService],
})
export class AppModule {}
