import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from './entities/email-log.entity';
import { NotificacionesGrpcController} from './notificaciones-grpc.controller';

@Module({
  providers: [NotificacionesService],
  controllers: [NotificacionesController, NotificacionesGrpcController],
  imports: [TypeOrmModule.forFeature([EmailLog])],
})
export class NotificacionesModule {}
