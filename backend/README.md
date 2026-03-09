# Messaging and Calls Backend

A comprehensive real-time messaging and calling system built with Hono, Cloudflare Workers, Durable Objects, and LiveKit Cloud.

## Features

- **Direct Messaging**: One-on-one text, image, video, audio, and file messaging
- **Group Chats**: Multi-user chat rooms with member management and role-based permissions
- **Voice/Video Calls**: One-on-one calls using LiveKit Cloud
- **Group Calls**: Multi-participant voice/video calls
- **Real-time WebSocket**: Live message delivery and typing indicators
- **Call History**: Track all calls with duration and participant information

## Architecture

### Tech Stack

- **Hono**: Fast web framework for Cloudflare Workers
- **Cloudflare Workers**: Serverless execution environment
- **Durable Objects**: Real-time WebSocket state management
- **PostgreSQL (Neon)**: Persistent data storage
- **Drizzle ORM**: Type-safe database queries
- **LiveKit Cloud**: Real-time audio/video infrastructure

### Database Schema

#### Tables

1. **users** - User accounts
2. **messages** - All messages (direct and group)
3. **group_chats** - Group chat information
4. **group_members** - Group membership and roles
5. **calls** - Call history and metadata
6. **call_participants** - Call participant tracking

### Durable Objects

1. **ChatRoom** - Manages WebSocket connections for real-time messaging
2. **CallRoom** - Manages call session state and signaling

## API Endpoints

### Messages

- `GET /messages/direct/:userId` - Get direct messages with a user
- `GET /messages/group/:groupId` - Get group messages
- `POST /messages/direct` - Send direct message
- `POST /messages/group` - Send group message
- `DELETE /messages/:messageId` - Delete message
- `GET /messages/conversations` - Get all conversations

### Group Chats

- `POST /groups` - Create group chat
- `GET /groups/:groupId` - Get group details
- `PUT /groups/:groupId` - Update group
- `DELETE /groups/:groupId` - Delete group
- `POST /groups/:groupId/members` - Add members
- `DELETE /groups/:groupId/members/:userId` - Remove member
- `PUT /groups/:groupId/members/:userId/role` - Update member role
- `POST /groups/:groupId/leave` - Leave group
- `GET /groups/:groupId/members` - Get members

### Calls

- `POST /calls/initiate` - Initiate call
- `POST /calls/:callId/join` - Join call
- `POST /calls/:callId/end` - End call
- `GET /calls/history` - Get call history
- `GET /calls/active` - Get active call
- `GET /calls/:callId/token` - Get LiveKit token for call

### WebSocket

- `GET /ws/chat/:chatId?userId=X&userName=Y` - Connect to chat room
- `GET /ws/call/:callId?userId=X&userName=Y` - Connect to call room

### LiveKit

- `POST /livekit/webhook` - Handle LiveKit webhooks

## Setup

### Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **Neon Database** (PostgreSQL)
3. **LiveKit Cloud Account**

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Create secrets using Wrangler:
```bash
wrangler secret put DATABASE_URL
wrangler secret put LIVEKIT_API_KEY
wrangler secret put LIVEKIT_API_SECRET
```

Update `wrangler.toml` with your LiveKit WebSocket URL:
```toml
[vars]
LIVEKIT_WS_URL = "wss://your-livekit-instance.livekit.cloud"
```

3. Run database migrations:
```bash
npx drizzle-kit push
```

4. Deploy to Cloudflare Workers:
```bash
npm run deploy
```

### Local Development

Run the development server:
```bash
npm run dev
```

## Usage Examples

### Send a Direct Message

```javascript
POST /messages/direct
{
  "senderId": 1,
  "recipientId": 2,
  "content": "Hello!",
  "type": "text"
}
```

### Create a Group Chat

```javascript
POST /groups
{
  "createdBy": 1,
  "name": "Team Chat",
  "description": "Our team discussion",
  "memberIds": [2, 3, 4]
}
```

### Initiate a Video Call

```javascript
POST /calls/initiate
{
  "initiatorId": 1,
  "type": "video",
  "callType": "direct",
  "recipientId": 2
}
```

### Connect to Chat WebSocket

```javascript
const ws = new WebSocket('wss://your-worker.workers.dev/ws/chat/room-123?userId=1&userName=John');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Send a message
ws.send(JSON.stringify({
  type: 'chat_message',
  payload: {
    senderId: 1,
    content: 'Hello everyone!',
    messageType: 'text'
  }
}));
```

### Get LiveKit Token and Join Call

```javascript
// 1. Get token
const response = await fetch('/calls/123/token?userId=1&userName=John');
const { token, wsUrl, roomName } = await response.json();

// 2. Use LiveKit client SDK to join
import { Room } from 'livekit-client';

const room = new Room();
await room.connect(wsUrl, token);
```

## WebSocket Message Types

### Chat Messages

```typescript
{
  type: 'chat_message',
  payload: {
    id: number,
    senderId: number,
    content: string,
    messageType: 'text' | 'image' | 'video' | 'audio' | 'file',
    timestamp: string,
    metadata?: object
  }
}
```

### Typing Indicator

```typescript
{
  type: 'typing',
  payload: {
    userId: number,
    isTyping: boolean
  }
}
```

### User Status

```typescript
{
  type: 'user_status',
  payload: {
    userId: number,
    status: 'online' | 'offline'
  }
}
```

### Call Events

```typescript
{
  type: 'call_event',
  payload: {
    callId: number,
    event: 'participant_joined' | 'participant_left' | 'call_ended',
    userId?: number
  }
}
```

## LiveKit Integration

### Room Creation

When a call is initiated, a LiveKit room is automatically created with:
- Unique room name
- Empty timeout (5 minutes default)
- Max participants (2 for direct calls, 50 for group calls)

### Token Generation

Access tokens are generated with the following permissions:
- `roomJoin`: Join the room
- `canPublish`: Publish audio/video tracks
- `canSubscribe`: Subscribe to other participants' tracks
- `canPublishData`: Send data messages

### Webhooks

Configure LiveKit to send webhooks to `/livekit/webhook` for:
- `room_started`: Room becomes active
- `room_finished`: Room ends
- `participant_joined`: User joins call
- `participant_left`: User leaves call

## Database Migrations

Generate migrations:
```bash
npx drizzle-kit generate
```

Push to database:
```bash
npx drizzle-kit push
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Business logic
│   │   ├── messages.ts
│   │   ├── groupChats.ts
│   │   ├── calls.ts
│   │   └── livekit.ts
│   ├── routes/            # API routes
│   │   ├── messages.ts
│   │   ├── groupChats.ts
│   │   ├── calls.ts
│   │   ├── livekit.ts
│   │   └── ws.ts
│   ├── durable-objects/   # Real-time state management
│   │   ├── ChatRoom.ts
│   │   └── CallRoom.ts
│   ├── db/                # Database
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── utils/             # Utilities
│   │   └── livekit.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   └── index.ts           # Main application
├── wrangler.toml          # Cloudflare configuration
└── package.json
```

## Security Considerations

1. **Authentication**: Add authentication middleware to protect endpoints
2. **Authorization**: Verify users have permission to access chats/calls
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: Validate all user inputs
5. **CORS**: Configure CORS appropriately for your frontend
6. **Secrets**: Never commit secrets to version control

## License

MIT
