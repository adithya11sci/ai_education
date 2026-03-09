# Database Schema Organization

The database schema has been refactored into separate files for better organization and maintainability.

## File Structure

```
src/db/schema/
├── index.ts          # Main export file
├── enums.ts          # All PostgreSQL enums
├── users.ts          # User table
├── groupChats.ts     # Group chat and member tables
├── messages.ts       # Message table
└── calls.ts          # Call and participant tables
```

## Schema Files

### 1. enums.ts

Contains all PostgreSQL enum definitions:
- `messageTypeEnum` - Message types (text, image, video, audio, file)
- `memberRoleEnum` - Group member roles (admin, member)
- `callTypeEnum` - Call types (audio, video)
- `callCategoryEnum` - Call categories (direct, group)
- `callStatusEnum` - Call statuses (initiated, ongoing, ended, missed, rejected)
- `participantStatusEnum` - Participant statuses (joined, left, rejected)

### 2. users.ts

User account table:
- `id` - Primary key
- `name` - User name
- `email` - Unique email address
- `createdAt` - Account creation timestamp

### 3. groupChats.ts

Group chat related tables:

**groupChats**
- `id` - Primary key
- `name` - Group name
- `description` - Group description
- `createdBy` - Foreign key to users
- `avatarUrl` - Group avatar URL
- `createdAt`, `updatedAt` - Timestamps

**groupMembers**
- `id` - Primary key
- `groupChatId` - Foreign key to group_chats
- `userId` - Foreign key to users
- `role` - Member role (admin/member)
- `joinedAt`, `leftAt` - Membership timestamps

### 4. messages.ts

Message storage table:
- `id` - Primary key
- `senderId` - Foreign key to users
- `groupChatId` - Foreign key to group_chats (nullable for direct messages)
- `recipientId` - Foreign key to users (nullable for group messages)
- `content` - Message content
- `type` - Message type enum
- `metadata` - JSON field for additional data
- `createdAt`, `updatedAt`, `deletedAt` - Timestamps

**Indexes:**
- Sender, recipient, group chat, and creation time

### 5. calls.ts

Call related tables:

**calls**
- `id` - Primary key
- `type` - Call type (audio/video)
- `callType` - Call category (direct/group)
- `initiatorId` - Foreign key to users
- `groupChatId` - Foreign key to group_chats (nullable)
- `recipientId` - Foreign key to users (nullable)
- `livekitRoomName` - Unique LiveKit room identifier
- `status` - Call status enum
- `startedAt`, `endedAt` - Call timestamps
- `duration` - Call duration in seconds
- `createdAt` - Creation timestamp

**callParticipants**
- `id` - Primary key
- `callId` - Foreign key to calls
- `userId` - Foreign key to users
- `joinedAt`, `leftAt` - Participation timestamps
- `status` - Participant status enum

**Indexes:**
- Initiator, recipient, group chat, status, and LiveKit room name

## Import Usage

All schema exports are available from the main schema file:

```typescript
// Import from main schema file
import { users, messages, groupChats, calls } from "../db/schema";

// Or import specific items
import { messageTypeEnum, callStatusEnum } from "../db/schema";
```

The main `schema.ts` file re-exports everything from `schema/index.ts`, which in turn exports from all individual schema files.

## Benefits

✅ **Better Organization** - Related tables grouped together  
✅ **Easier Maintenance** - Changes isolated to specific domains  
✅ **Improved Readability** - Smaller, focused files  
✅ **Clear Dependencies** - Explicit imports between schema files  
✅ **Backward Compatible** - Existing imports continue to work  

## Adding New Tables

To add new tables:

1. Create a new file in `src/db/schema/` (e.g., `notifications.ts`)
2. Define your table(s) and import dependencies
3. Export from `src/db/schema/index.ts`
4. Tables will be automatically available via `import { ... } from "../db/schema"`

Example:

```typescript
// src/db/schema/notifications.ts
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

```typescript
// src/db/schema/index.ts
export * from "./notifications";
```
