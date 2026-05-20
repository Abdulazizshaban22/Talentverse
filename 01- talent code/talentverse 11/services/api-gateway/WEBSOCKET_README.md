
# WebSocket Gateway
- Import `WsModule` into `AppModule`.
- Client (Next.js) example:
```js
import { io } from "socket.io-client";
const socket = io("http://localhost:8000", { query: { userId } });
socket.emit('ping', { hello: 'world' });
socket.on('invite', data => console.log('invite', data));
```
