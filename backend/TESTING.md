# Testing Guide - Messaging and Calls API

This guide provides step-by-step instructions and example requests to test all features of the messaging and calls system.

## Prerequisites

1. **Start the development server:**
```bash
npm run dev
```

2. **Set up database:**
```bash
npx drizzle-kit push
```

3. **Configure environment variables** in `wrangler.toml` or via secrets

## Testing Tools

You can use any of these tools:
- **cURL** (command line)
- **Postman** (GUI)
- **Thunder Client** (VS Code extension)
- **HTTPie** (command line)
- **Insomnia** (GUI)

## Base URL

Local development: `http://localhost:8787`

---

## 1. Testing Users

### Create Test Users

```bash
# Create User 1
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "alice123"
  }'

# Create User 2
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "email": "bob@example.com",
    "password": "bob123"
  }'

# Create User 3
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie",
    "email": "charlie@example.com",
    "password": "charlie123"
  }'

# Create User 4
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diana",
    "email": "diana@example.com",
    "password": "diana123"
  }'
```

### Get All Users

```bash
curl http://localhost:8787/users
```

**Expected Response:**
```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com", "createdAt": "..." },
  { "id": 2, "name": "Bob", "email": "bob@example.com", "createdAt": "..." },
  { "id": 3, "name": "Charlie", "email": "charlie@example.com", "createdAt": "..." },
  { "id": 4, "name": "Diana", "email": "diana@example.com", "createdAt": "..." }
]
```

---

## 2. Testing Direct Messages

### Send Direct Message (Alice to Bob)

```bash
curl -X POST http://localhost:8787/messages/direct \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 1,
    "recipientId": 2,
    "content": "Hi Bob! How are you?",
    "type": "text"
  }'
```

### Send Another Message (Bob to Alice)

```bash
curl -X POST http://localhost:8787/messages/direct \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 2,
    "recipientId": 1,
    "content": "Hey Alice! I am doing great, thanks!",
    "type": "text"
  }'
```

### Send Image Message

```bash
curl -X POST http://localhost:8787/messages/direct \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 1,
    "recipientId": 2,
    "content": "Check out this photo!",
    "type": "image",
    "metadata": {
      "url": "https://example.com/photo.jpg",
      "width": 1920,
      "height": 1080
    }
  }'
```

### Get Direct Messages Between Alice and Bob

```bash
# Get messages from Alice's perspective
curl "http://localhost:8787/messages/direct/2?currentUserId=1"

# Get messages from Bob's perspective
curl "http://localhost:8787/messages/direct/1?currentUserId=2"
```

### Get All Conversations for Alice

```bash
curl "http://localhost:8787/messages/conversations?userId=1"
```

### Delete a Message

```bash
# Delete message with ID 1
curl -X DELETE http://localhost:8787/messages/1
```

---

## 3. Testing Group Chats

### Create a Group Chat

```bash
curl -X POST http://localhost:8787/groups \
  -H "Content-Type: application/json" \
  -d '{
    "createdBy": 1,
    "name": "Team Project",
    "description": "Discussion about our project",
    "memberIds": [2, 3, 4]
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Team Project",
  "description": "Discussion about our project",
  "createdBy": 1,
  "avatarUrl": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Get Group Details

```bash
curl http://localhost:8787/groups/1
```

### Get Group Members

```bash
curl http://localhost:8787/groups/1/members
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "role": "admin",
    "joinedAt": "...",
    "leftAt": null,
    "userName": "Alice",
    "userEmail": "alice@example.com"
  },
  {
    "id": 2,
    "userId": 2,
    "role": "member",
    "joinedAt": "...",
    "leftAt": null,
    "userName": "Bob",
    "userEmail": "bob@example.com"
  }
  // ... more members
]
```

### Update Group Information

```bash
curl -X PUT http://localhost:8787/groups/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Project - Updated",
    "description": "Updated description",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

### Add More Members to Group

```bash
# Add user 5 (if exists)
curl -X POST http://localhost:8787/groups/1/members \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [5]
  }'
```

### Update Member Role (Make Bob an Admin)

```bash
curl -X PUT http://localhost:8787/groups/1/members/2/role \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### Remove Member from Group

```bash
# Remove user 4 from group
curl -X DELETE http://localhost:8787/groups/1/members/4
```

### User Leaves Group

```bash
curl -X POST http://localhost:8787/groups/1/leave \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3
  }'
```

---

## 4. Testing Group Messages

### Send Message to Group

```bash
curl -X POST http://localhost:8787/messages/group \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 1,
    "groupChatId": 1,
    "content": "Hello everyone in the team!",
    "type": "text"
  }'
```

### Send Another Group Message

```bash
curl -X POST http://localhost:8787/messages/group \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 2,
    "groupChatId": 1,
    "content": "Hi Alice! Great to be here!",
    "type": "text"
  }'
```

### Send File to Group

```bash
curl -X POST http://localhost:8787/messages/group \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 1,
    "groupChatId": 1,
    "content": "Project document attached",
    "type": "file",
    "metadata": {
      "url": "https://example.com/document.pdf",
      "filename": "project-plan.pdf",
      "size": 1024000
    }
  }'
```

### Get Group Messages

```bash
curl http://localhost:8787/messages/group/1
```

---

## 5. Testing Direct Calls

### Initiate a Direct Video Call (Alice calls Bob)

```bash
curl -X POST http://localhost:8787/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "initiatorId": 1,
    "type": "video",
    "callType": "direct",
    "recipientId": 2
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "type": "video",
  "callType": "direct",
  "initiatorId": 1,
  "recipientId": 2,
  "groupChatId": null,
  "livekitRoomName": "call-1738138234567-abc123",
  "status": "initiated",
  "startedAt": null,
  "endedAt": null,
  "duration": null,
  "createdAt": "..."
}
```

### Bob Joins the Call

```bash
curl -X POST http://localhost:8787/calls/1/join \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2
  }'
```

### Get LiveKit Token for Alice

```bash
curl "http://localhost:8787/calls/1/token?userId=1&userName=Alice"
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "wsUrl": "wss://your-livekit-instance.livekit.cloud",
  "roomName": "call-1738138234567-abc123"
}
```

### Get LiveKit Token for Bob

```bash
curl "http://localhost:8787/calls/1/token?userId=2&userName=Bob"
```

### Get Active Call for User

```bash
# Check Alice's active call
curl "http://localhost:8787/calls/active?userId=1"

# Check Bob's active call
curl "http://localhost:8787/calls/active?userId=2"
```

### End the Call

```bash
curl -X POST http://localhost:8787/calls/1/end
```

### Initiate Audio Call

```bash
curl -X POST http://localhost:8787/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "initiatorId": 3,
    "type": "audio",
    "callType": "direct",
    "recipientId": 4
  }'
```

---

## 6. Testing Group Calls

### Initiate Group Video Call

```bash
curl -X POST http://localhost:8787/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "initiatorId": 1,
    "type": "video",
    "callType": "group",
    "groupChatId": 1
  }'
```

### Multiple Users Join the Group Call

```bash
# Bob joins
curl -X POST http://localhost:8787/calls/2/join \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2
  }'

# Charlie joins
curl -X POST http://localhost:8787/calls/2/join \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3
  }'

# Diana joins
curl -X POST http://localhost:8787/calls/2/join \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 4
  }'
```

### Get Tokens for All Participants

```bash
# Alice's token
curl "http://localhost:8787/calls/2/token?userId=1&userName=Alice"

# Bob's token
curl "http://localhost:8787/calls/2/token?userId=2&userName=Bob"

# Charlie's token
curl "http://localhost:8787/calls/2/token?userId=3&userName=Charlie"

# Diana's token
curl "http://localhost:8787/calls/2/token?userId=4&userName=Diana"
```

### End Group Call

```bash
curl -X POST http://localhost:8787/calls/2/end
```

---

## 7. Testing Call History

### Get Call History for a User

```bash
# Get Alice's call history
curl "http://localhost:8787/calls/history?userId=1"

# Get Bob's call history
curl "http://localhost:8787/calls/history?userId=2"
```

**Expected Response:**
```json
[
  {
    "id": 2,
    "type": "video",
    "callType": "group",
    "initiatorId": 1,
    "groupChatId": 1,
    "recipientId": null,
    "livekitRoomName": "call-1738138345678-xyz789",
    "status": "ended",
    "startedAt": "...",
    "endedAt": "...",
    "duration": 300,
    "createdAt": "..."
  },
  {
    "id": 1,
    "type": "video",
    "callType": "direct",
    "initiatorId": 1,
    "recipientId": 2,
    "groupChatId": null,
    "livekitRoomName": "call-1738138234567-abc123",
    "status": "ended",
    "startedAt": "...",
    "endedAt": "...",
    "duration": 180,
    "createdAt": "..."
  }
]
```

---

## 8. Testing WebSocket Connections

### Connect to Chat Room WebSocket

```javascript
// JavaScript example
const chatWs = new WebSocket(
  'ws://localhost:8787/ws/chat/room-1?userId=1&userName=Alice'
);

chatWs.onopen = () => {
  console.log('Connected to chat room');
  
  // Send a message
  chatWs.send(JSON.stringify({
    type: 'chat_message',
    payload: {
      senderId: 1,
      content: 'Hello via WebSocket!',
      messageType: 'text',
      timestamp: new Date().toISOString()
    }
  }));
  
  // Send typing indicator
  chatWs.send(JSON.stringify({
    type: 'typing',
    payload: {
      userId: 1,
      isTyping: true
    }
  }));
};

chatWs.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

chatWs.onerror = (error) => {
  console.error('WebSocket error:', error);
};

chatWs.onclose = () => {
  console.log('Disconnected from chat room');
};
```

### Connect to Call Room WebSocket

```javascript
const callWs = new WebSocket(
  'ws://localhost:8787/ws/call/1?userId=1&userName=Alice&callId=1'
);

callWs.onopen = () => {
  console.log('Connected to call room');
};

callWs.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Call event:', message);
  
  // Handle different events
  if (message.type === 'call_event') {
    switch (message.payload.event) {
      case 'participant_joined':
        console.log('Participant joined:', message.payload.userId);
        break;
      case 'participant_left':
        console.log('Participant left:', message.payload.userId);
        break;
      case 'call_ended':
        console.log('Call ended');
        break;
    }
  }
};
```

---

## 9. Complete Test Scenarios

### Scenario 1: Direct Messaging Flow

```bash
# 1. Create users
curl -X POST http://localhost:8787/users -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@test.com", "password": "alice123"}'
  
curl -X POST http://localhost:8787/users -H "Content-Type: application/json" \
  -d '{"name": "Bob", "email": "bob@test.com", "password": "bob123"}'

# 2. Send messages
curl -X POST http://localhost:8787/messages/direct -H "Content-Type: application/json" \
  -d '{"senderId": 1, "recipientId": 2, "content": "Hi!", "type": "text"}'

# 3. Get conversation
curl "http://localhost:8787/messages/direct/2?currentUserId=1"

# 4. Get all conversations
curl "http://localhost:8787/messages/conversations?userId=1"
```

### Scenario 2: Group Chat Flow

```bash
# 1. Create group
curl -X POST http://localhost:8787/groups -H "Content-Type: application/json" \
  -d '{"createdBy": 1, "name": "Team", "memberIds": [2, 3]}'

# 2. Send group message
curl -X POST http://localhost:8787/messages/group -H "Content-Type: application/json" \
  -d '{"senderId": 1, "groupChatId": 1, "content": "Hello team!", "type": "text"}'

# 3. Get group messages
curl "http://localhost:8787/messages/group/1"

# 4. Get members
curl "http://localhost:8787/groups/1/members"
```

### Scenario 3: Video Call Flow

```bash
# 1. Initiate call
curl -X POST http://localhost:8787/calls/initiate -H "Content-Type: application/json" \
  -d '{"initiatorId": 1, "type": "video", "callType": "direct", "recipientId": 2}'

# 2. Join call
curl -X POST http://localhost:8787/calls/1/join -H "Content-Type: application/json" \
  -d '{"userId": 2}'

# 3. Get tokens
curl "http://localhost:8787/calls/1/token?userId=1&userName=Alice"
curl "http://localhost:8787/calls/1/token?userId=2&userName=Bob"

# 4. End call
curl -X POST http://localhost:8787/calls/1/end

# 5. Check history
curl "http://localhost:8787/calls/history?userId=1"
```

### Scenario 4: Group Call Flow

```bash
# 1. Create group first
curl -X POST http://localhost:8787/groups -H "Content-Type: application/json" \
  -d '{"createdBy": 1, "name": "Team", "memberIds": [2, 3, 4]}'

# 2. Initiate group call
curl -X POST http://localhost:8787/calls/initiate -H "Content-Type: application/json" \
  -d '{"initiatorId": 1, "type": "video", "callType": "group", "groupChatId": 1}'

# 3. All members join
curl -X POST http://localhost:8787/calls/1/join -H "Content-Type: application/json" \
  -d '{"userId": 2}'
curl -X POST http://localhost:8787/calls/1/join -H "Content-Type: application/json" \
  -d '{"userId": 3}'
curl -X POST http://localhost:8787/calls/1/join -H "Content-Type: application/json" \
  -d '{"userId": 4}'

# 4. Get tokens for all
curl "http://localhost:8787/calls/1/token?userId=1&userName=Alice"
curl "http://localhost:8787/calls/1/token?userId=2&userName=Bob"
curl "http://localhost:8787/calls/1/token?userId=3&userName=Charlie"
curl "http://localhost:8787/calls/1/token?userId=4&userName=Diana"

# 5. End call
curl -X POST http://localhost:8787/calls/1/end
```

---

## 10. Error Cases to Test

### Invalid User ID

```bash
curl -X POST http://localhost:8787/messages/direct \
  -H "Content-Type: application/json" \
  -d '{"senderId": 999, "recipientId": 2, "content": "Test", "type": "text"}'
```

### Missing Required Fields

```bash
curl -X POST http://localhost:8787/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Group"}'
```

### Invalid Call Type

```bash
curl -X POST http://localhost:8787/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{"initiatorId": 1, "type": "video", "callType": "direct"}'
```

---

## Next Steps

1. **Install dependencies** for testing (optional):
```bash
npm install --save-dev @types/node
```

2. **Run the test script** (see test-api.sh below)

3. **Monitor logs** while testing:
```bash
npm run dev
```

4. **Check database** after tests:
```bash
# Use your database client to verify data
```

This guide covers all the main features. Adjust user IDs and other values based on your actual data!
