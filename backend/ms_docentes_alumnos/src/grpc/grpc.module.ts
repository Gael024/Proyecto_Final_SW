import { Module } from '@nestjs/common';
import { DocentesAlumnosGrpcController } from './docentes_alumnos.grpc.controller';

import { AlumnosModule } from '../alumnos/alumnos.module';
import { DocentesModule } from '../docentes/docentes.module';

@Module({
  imports: [
    AlumnosModule,
    DocentesModule,
  ],
  controllers: [DocentesAlumnosGrpcController],
})
export class GrpcModule {}