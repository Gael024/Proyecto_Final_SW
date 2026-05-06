import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { AlumnosGrpcController } from './grpc/docentes_alumnos.grpc.controller';

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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}