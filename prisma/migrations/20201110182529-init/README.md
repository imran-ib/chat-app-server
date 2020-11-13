# Migration `20201110182529-init`

This migration has been generated at 11/10/2020, 9:25:31 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "lastTyped" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "lastSeen",
ADD COLUMN "lastSeen" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201109164341-init..20201110182529-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
   id                                         Int              @id @default(autoincrement())
@@ -26,14 +26,15 @@
   FriendRequestRecieved                      FriendsRequest[] @relation("RequestReciever")
   followedBy                                 User[]           @relation("UserFollows", references: [id])
   following                                  User[]           @relation("UserFollows", references: [id])
   friends                                    Friends[] 
-  isActive                                   Boolean          @default(false)
-  lastSeen                                   String?
   reactions                                  Reaction[]
   temporaryBlockOtherUserOnDeleteChatBlocker temporaryBlockOtherUserOnDeleteChat[] @relation("ChatMessageSender")
   temporaryBlockOtherUserOnDeleteChatBlockee temporaryBlockOtherUserOnDeleteChat[] @relation("ChatMessageReceiver")
   BlockedMessagesIds                         Int[]
+  isActive                                   Boolean          @default(false)
+  lastSeen                                   DateTime         @default(now())
+  lastTyped                                  DateTime         @default(now())
   createdAt                                  DateTime         @default(now())
   updatedAt                                  DateTime         @updatedAt
 }
```


