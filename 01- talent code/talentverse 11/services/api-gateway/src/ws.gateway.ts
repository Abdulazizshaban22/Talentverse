
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    client.emit('pong', { ts: Date.now(), payload });
  }

  @SubscribeMessage('invite')
  handleInvite(@MessageBody() payload: any) {
    // payload: { toUserId, opportunityId, message }
    this.server.to(payload.toUserId).emit('invite', payload);
  }

  handleConnection(client: Socket){
    const userId = (client.handshake.query.userId as string) || client.id;
    client.join(userId);
  }
}
