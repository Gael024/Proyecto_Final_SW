import { Module } from '@nestjs/common';
import { PeriodoGrpcController } from './grpc/periodo-grpc.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Periodo } from './entities/periodo.entity';
import { Materia } from './entities/materia.entity';
import { PlanEstudio } from './entities/plan-estudio.entity';
import { MateriaPeriodoPlan } from './entities/materia-periodo-plan.entity';
import { Profesor } from './entities/profesor.entity';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../proto/auth.proto'),
          url: process.env.AUTH_GRPC_URL || 'ms_auth:50051',
        },
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'ms_periodos'),
        entities: [Periodo, Materia, PlanEstudio, MateriaPeriodoPlan, Profesor],
        synchronize: true, // Solo para desarrollo
      }),
    }),
    TypeOrmModule.forFeature([Periodo, Materia, PlanEstudio, MateriaPeriodoPlan, Profesor]),
  ],
  controllers: [AppController, PeriodoGrpcController],
  providers: [AppService],
})
export class AppModule {}
