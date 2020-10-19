# Migration `20201016160117-init`

This migration has been generated at 10/16/2020, 7:01:17 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."FriendRequest" (
"id" SERIAL,
"SenderId" integer   NOT NULL ,
"ReceiverId" integer   NOT NULL ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

ALTER TABLE "public"."FriendRequest" ADD FOREIGN KEY ("SenderId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."FriendRequest" ADD FOREIGN KEY ("ReceiverId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201014195825-init..20201016160117-init
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
@@ -28,14 +28,25 @@
   following                User[]           @relation("UserFollows", references: [id])
   friends                  User[]           @relation("UserFirends")
   friend                   User?            @relation("UserFirends", fields: [friendId], references: [id])
   friendId                 Int?
+  friendRequestSent           FriendRequest[] @relation("RequestSender")
+  friendRequestRecieved         FriendRequest[]@relation("RequestReciever")
   isActive                 Boolean          @default(false)
   lastSeen                 String?
   createdAt                DateTime         @default(now())
   updatedAt                DateTime         @updatedAt
 }
+model FriendRequest {
+  id                 Int      @id @default(autoincrement())
+  sender               User     @relation("RequestSender", fields: [SenderId], references: [id])
+  SenderId           Int
+  reciever                 User     @relation("RequestReciever", fields: [ReceiverId], references: [id])
+  ReceiverId         Int
+  createdAt                DateTime         @default(now())
+  updatedAt                DateTime         @updatedAt
+}
 model Messages {
   id                 Int      @id @default(autoincrement())
   content            String?
   image              String?
```


