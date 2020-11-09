# Migration `20201109162337-init`

This migration has been generated at 11/9/2020, 7:23:38 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" DROP CONSTRAINT "User_friendId_fkey"

ALTER TABLE "public"."User" DROP COLUMN "friendId"

CREATE TABLE "public"."Friends" (
"id" SERIAL,
"friendId" integer   NOT NULL ,
PRIMARY KEY ("id")
)

ALTER TABLE "public"."Friends" ADD FOREIGN KEY ("friendId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201109152107-init..20201109162337-init
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
@@ -25,11 +25,9 @@
   FriendRequsetSent                          FriendsRequest[] @relation("RequestSender")
   FriendRequestRecieved                      FriendsRequest[] @relation("RequestReciever")
   followedBy                                 User[]           @relation("UserFollows", references: [id])
   following                                  User[]           @relation("UserFollows", references: [id])
-  friends                                    User[]           @relation("UserFirends")
-  friend                                     User?            @relation("UserFirends",fields: [friendId])
-  friendId                                   Int?
+  Friends                                    Friends[] 
   isActive                                   Boolean          @default(false)
   lastSeen                                   String?
   reactions                                  Reaction[]
   temporaryBlockOtherUserOnDeleteChatBlocker temporaryBlockOtherUserOnDeleteChat[] @relation("ChatMessageSender")
@@ -38,10 +36,16 @@
   createdAt                                  DateTime         @default(now())
   updatedAt                                  DateTime         @updatedAt
 }
+model Friends {
+  id                      Int      @id @default(autoincrement())
+  friend                    User     @relation(fields: [friendId], references: [id])
+  friendId                 Int
+}
+
 model temporaryBlockOtherUserOnDeleteChat {
   id                      Int      @id @default(autoincrement())
   blocker                 User     @relation("ChatMessageSender", fields: [blockerId], references: [id])
   blockerId               Int
```


