import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { CalificacionesController } from './calificaciones.controller';
import { CalificacionesService } from './calificaciones.service';
import { Actividad } from './entities/actividad.entity';
import { Calificacion } from './entities/calificacion.entity';
import { Ponderacion } from './entities/ponderacion.entity';

@Module({
   imports: [
    ClientsModule.register([
    {
      name: 'DOCENTES_ALUMNOS_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'docentes_alumnos',
        protoPath: '/app/proto/docentes_alumnos.proto',
        url: 'ms_docentes_alumnos:50053', 
      },
    },
  ]),
    TypeOrmModule.forFeature([
      Actividad,
      Calificacion,
      Ponderacion,
    ]),
  ],
  controllers: [CalificacionesController],
  providers: [CalificacionesService]
})
export class CalificacionesModule {}
