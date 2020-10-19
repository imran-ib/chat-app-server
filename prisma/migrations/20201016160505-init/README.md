# Migration `20201016160505-init`

This migration has been generated at 10/16/2020, 7:05:06 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."FriendRequest" DROP CONSTRAINT "FriendRequest_ReceiverId_fkey"

ALTER TABLE "public"."FriendRequest" DROP CONSTRAINT "FriendRequest_SenderId_fkey"

DROP TABLE "public"."FriendRequest"
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201016160117-init..20201016160505-init
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
   id                       Int              @id @default(autoincrement())
@@ -28,25 +28,14 @@
   following                User[]           @relation("UserFollows", references: [id])
   friends                  User[]           @relation("UserFirends")
   friend                   User?            @relation("UserFirends", fields: [friendId], references: [id])
   friendId                 Int?
-  friendRequestSent           FriendRequest[] @relation("RequestSender")
-  friendRequestRecieved         FriendRequest[]@relation("RequestReciever")
   isActive                 Boolean          @default(false)
   lastSeen                 String?
   createdAt                DateTime         @default(now())
   updatedAt                DateTime         @updatedAt
 }
-model FriendRequest {
-  id                 Int      @id @default(autoincrement())
-  sender               User     @relation("RequestSender", fields: [SenderId], references: [id])
-  SenderId           Int
-  reciever                 User     @relation("RequestReciever", fields: [ReceiverId], references: [id])
-  ReceiverId         Int
-  createdAt                DateTime         @default(now())
-  updatedAt                DateTime         @updatedAt
-}
 model Messages {
   id                 Int      @id @default(autoincrement())
   content            String?
   image              String?
@@ -63,11 +52,11 @@
 }
 model FriendsRequest {
   id                Int      @id @default(autoincrement())
-  from              User     @relation("RequestSender", fields: [RequsetSenderId], references: [id])
+  sender              User     @relation("RequestSender", fields: [RequsetSenderId], references: [id])
   RequsetSenderId   Int
-  to                User     @relation("RequestReciever", fields: [RequestReceiverId], references: [id])
+  reciever                User     @relation("RequestReciever", fields: [RequestReceiverId], references: [id])
   RequestReceiverId Int
   createdAt         DateTime @default(now())
   updatedAt         DateTime @updatedAt
 }
```


