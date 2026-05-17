import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CalificacionesModule } from './calificaciones/calificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TYPEORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory:
        (configService: ConfigService) => ({
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
        }),
    }),

    // MODULOS
    CalificacionesModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
