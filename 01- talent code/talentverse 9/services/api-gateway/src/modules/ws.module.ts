
import { Module } from '@nestjs/common';
import { AppGateway } from '../ws.gateway';
@Module({ providers: [AppGateway] })
export class WsModule {}
