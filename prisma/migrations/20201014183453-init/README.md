# Migration `20201014183453-init`

This migration has been generated at 10/14/2020, 9:34:54 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "isActive" boolean   NOT NULL DEFAULT false,
ADD COLUMN "lastSeen" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP

CREATE TABLE "public"."FriendsRequest" (
"id" SERIAL,
"RequsetSenderId" integer   NOT NULL ,
"RequestReceiverId" integer   NOT NULL ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

ALTER TABLE "public"."FriendsRequest" ADD FOREIGN KEY ("RequsetSenderId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."FriendsRequest" ADD FOREIGN KEY ("RequestReceiverId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201006205745-init..20201014183453-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,31 +3,37 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
-  id                       Int        @id @default(autoincrement())
-  email                    String     @unique
-  username                 String     @unique
-  googleId                 String?    @unique
+  id                       Int              @id @default(autoincrement())
+  email                    String           @unique
+  username                 String           @unique
+  //for google auth
+  googleId                 String?          @unique
+  //for one time password request token
   loginSecret              String?
-  avatar                   String?    @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
+  avatar                   String?          @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
   password                 String?
   OneTimePassword          Int?
   PasswordResetTokenExpiry Float?
   PasswordResetToken       String?
-  MessagesSent             Messages[] @relation("Sender")
-  MessagesRecieved         Messages[] @relation("Reciever")
-  followedBy               User[]     @relation("UserFollows", references: [id])
-  following                User[]     @relation("UserFollows", references: [id])
-  friends                  User[]     @relation("UserFirends")
-  friend                   User?      @relation("UserFirends", fields: [friendId], references: [id])
+  MessagesSent             Messages[]       @relation("Sender")
+  MessagesRecieved         Messages[]       @relation("Reciever")
+  FriendRequsetSent        FriendsRequest[] @relation("RequestSender")
+  FriendRequestRecieved    FriendsRequest[] @relation("RequestReciever")
+  followedBy               User[]           @relation("UserFollows", references: [id])
+  following                User[]           @relation("UserFollows", references: [id])
+  friends                  User[]           @relation("UserFirends")
+  friend                   User?            @relation("UserFirends", fields: [friendId], references: [id])
   friendId                 Int?
-  createdAt                DateTime   @default(now())
-  updatedAt                DateTime   @updatedAt
+  isActive                 Boolean          @default(false)
+  lastSeen                 DateTime         @default(now())
+  createdAt                DateTime         @default(now())
+  updatedAt                DateTime         @updatedAt
 }
 model Messages {
   id                 Int      @id @default(autoincrement())
@@ -43,4 +49,14 @@
   createdAt          DateTime @default(now())
   updatedAt          DateTime @updatedAt
 }
+
+model FriendsRequest {
+  id                Int      @id @default(autoincrement())
+  from              User     @relation("RequestSender", fields: [RequsetSenderId], references: [id])
+  RequsetSenderId   Int
+  to                User     @relation("RequestReciever", fields: [RequestReceiverId], references: [id])
+  RequestReceiverId Int
+  createdAt         DateTime @default(now())
+  updatedAt         DateTime @updatedAt
+}
```


