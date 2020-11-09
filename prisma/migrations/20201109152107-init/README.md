# Migration `20201109152107-init`

This migration has been generated at 11/9/2020, 6:21:09 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql

```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201108185501-init..20201109152107-init
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
@@ -26,9 +26,9 @@
   FriendRequestRecieved                      FriendsRequest[] @relation("RequestReciever")
   followedBy                                 User[]           @relation("UserFollows", references: [id])
   following                                  User[]           @relation("UserFollows", references: [id])
   friends                                    User[]           @relation("UserFirends")
-  friend                                     User?            @relation("UserFirends",fields: [friendId], references: [id])
+  friend                                     User?            @relation("UserFirends",fields: [friendId])
   friendId                                   Int?
   isActive                                   Boolean          @default(false)
   lastSeen                                   String?
   reactions                                  Reaction[]
@@ -38,8 +38,10 @@
   createdAt                                  DateTime         @default(now())
   updatedAt                                  DateTime         @updatedAt
 }
+
+
 model temporaryBlockOtherUserOnDeleteChat {
   id                      Int      @id @default(autoincrement())
   blocker                 User     @relation("ChatMessageSender", fields: [blockerId], references: [id])
   blockerId               Int
```


