# Migration `20201109163010-init`

This migration has been generated at 11/9/2020, 7:30:12 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql

```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201109162337-init..20201109163010-init
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
@@ -25,9 +25,9 @@
   FriendRequsetSent                          FriendsRequest[] @relation("RequestSender")
   FriendRequestRecieved                      FriendsRequest[] @relation("RequestReciever")
   followedBy                                 User[]           @relation("UserFollows", references: [id])
   following                                  User[]           @relation("UserFollows", references: [id])
-  Friends                                    Friends[] 
+  friends                                    Friends[] 
   isActive                                   Boolean          @default(false)
   lastSeen                                   String?
   reactions                                  Reaction[]
   temporaryBlockOtherUserOnDeleteChatBlocker temporaryBlockOtherUserOnDeleteChat[] @relation("ChatMessageSender")
```


