import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocentesAlumnosGrpcController } from './grpc/docentes_alumnos.grpc.controller';
import { AuthClient } from './auth/auth.client';

import { DocentesModule } from './docentes/docentes.module';
import { AlumnosModule } from './alumnos/alumnos.module';

//entitys
import { Alumno } from './alumnos/entities/alumno.entity';
import { Materia } from './alumnos/entities/materia.entity';
import { MateriaAlumno } from './alumnos/entities/materia-alumno.entity';
import { Docente} from './docentes/entities/docente.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([{
    name: 'AUTH_SERVICE',
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: '/app/proto/auth.proto', 
      //protoPath: '/app/proto/auth.proto',
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
        password: configService.get<string>('DB_PASSWORD', 'Anime2905'),
        database: configService.get<string>('DB_DATABASE', 'agm_ms3'),
        entities: [Alumno, Materia, MateriaAlumno, Docente],
        synchronize: false,
      }),
    }),

    TypeOrmModule.forFeature([Alumno, Materia, MateriaAlumno, Docente]),
    DocentesModule,
    AlumnosModule,
  ],
  controllers: [AppController,DocentesAlumnosGrpcController],
  providers: [AppService, AuthClient],
  exports: [AuthClient]
})
export class AppModule {}