# Migration `20201108185501-init`

This migration has been generated at 11/8/2020, 9:55:04 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
"id" SERIAL,
"email" text   NOT NULL ,
"username" text   NOT NULL ,
"googleId" text   ,
"loginSecret" text   ,
"avatar" text   DEFAULT E'https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg',
"password" text   ,
"OneTimePassword" integer   ,
"PasswordResetTokenExpiry" Decimal(65,30)   ,
"PasswordResetToken" text   ,
"friendId" integer   ,
"isActive" boolean   NOT NULL DEFAULT false,
"lastSeen" text   ,
"BlockedMessagesIds" integer []  ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."temporaryBlockOtherUserOnDeleteChat" (
"id" SERIAL,
"blockerId" integer   NOT NULL ,
"blockeeId" integer   NOT NULL ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."Messages" (
"id" SERIAL,
"content" text   ,
"image" text   ,
"SenderId" integer   NOT NULL ,
"ReceiverId" integer   NOT NULL ,
"isSenderFriend" boolean   NOT NULL DEFAULT false,
"isSenderFollowing" boolean   NOT NULL DEFAULT false,
"isSenderFollowedBy" boolean   NOT NULL DEFAULT false,
"forwarded" boolean   NOT NULL DEFAULT false,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."Reaction" (
"id" SERIAL,
"userId" integer   NOT NULL ,
"messageId" integer   NOT NULL ,
"content" text   NOT NULL ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."FriendsRequest" (
"id" SERIAL,
"RequsetSenderId" integer   NOT NULL ,
"RequestReceiverId" integer   NOT NULL ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."_UserFollows" (
"A" integer   NOT NULL ,
"B" integer   NOT NULL 
)

CREATE UNIQUE INDEX "User.email_unique" ON "public"."User"("email")

CREATE UNIQUE INDEX "User.username_unique" ON "public"."User"("username")

CREATE UNIQUE INDEX "User.googleId_unique" ON "public"."User"("googleId")

CREATE UNIQUE INDEX "_UserFollows_AB_unique" ON "public"."_UserFollows"("A", "B")

CREATE INDEX "_UserFollows_B_index" ON "public"."_UserFollows"("B")

ALTER TABLE "public"."User" ADD FOREIGN KEY ("friendId")REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

ALTER TABLE "public"."temporaryBlockOtherUserOnDeleteChat" ADD FOREIGN KEY ("blockerId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."temporaryBlockOtherUserOnDeleteChat" ADD FOREIGN KEY ("blockeeId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Messages" ADD FOREIGN KEY ("SenderId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Messages" ADD FOREIGN KEY ("ReceiverId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Reaction" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Reaction" ADD FOREIGN KEY ("messageId")REFERENCES "public"."Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."FriendsRequest" ADD FOREIGN KEY ("RequsetSenderId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."FriendsRequest" ADD FOREIGN KEY ("RequestReceiverId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."_UserFollows" ADD FOREIGN KEY ("A")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."_UserFollows" ADD FOREIGN KEY ("B")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20201108185501-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,93 @@
+generator client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "postgresql"
+  url = "***"
+}
+
+model User {
+  id                                         Int              @id @default(autoincrement())
+  email                                      String           @unique
+  username                                   String           @unique
+  //for google auth
+  googleId                                   String?          @unique
+  //for one time password request token
+  loginSecret                                String?
+  avatar                                     String?          @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
+  password                                   String?
+  OneTimePassword                            Int?
+  PasswordResetTokenExpiry                   Float?
+  PasswordResetToken                         String?
+  MessagesSent                               Messages[]       @relation("Sender")
+  MessagesRecieved                           Messages[]       @relation("Reciever")
+  FriendRequsetSent                          FriendsRequest[] @relation("RequestSender")
+  FriendRequestRecieved                      FriendsRequest[] @relation("RequestReciever")
+  followedBy                                 User[]           @relation("UserFollows", references: [id])
+  following                                  User[]           @relation("UserFollows", references: [id])
+  friends                                    User[]           @relation("UserFirends")
+  friend                                     User?            @relation("UserFirends",fields: [friendId], references: [id])
+  friendId                                   Int?
+  isActive                                   Boolean          @default(false)
+  lastSeen                                   String?
+  reactions                                  Reaction[]
+  temporaryBlockOtherUserOnDeleteChatBlocker temporaryBlockOtherUserOnDeleteChat[] @relation("ChatMessageSender")
+  temporaryBlockOtherUserOnDeleteChatBlockee temporaryBlockOtherUserOnDeleteChat[] @relation("ChatMessageReceiver")
+  BlockedMessagesIds                         Int[]
+  createdAt                                  DateTime         @default(now())
+  updatedAt                                  DateTime         @updatedAt
+}
+
+model temporaryBlockOtherUserOnDeleteChat {
+  id                      Int      @id @default(autoincrement())
+  blocker                 User     @relation("ChatMessageSender", fields: [blockerId], references: [id])
+  blockerId               Int
+  blockee                 User     @relation("ChatMessageReceiver", fields: [blockeeId], references: [id])
+  blockeeId               Int
+  createdAt               DateTime         @default(now())
+  updatedAt               DateTime         @updatedAt
+
+
+}
+
+model Messages {
+  id                 Int      @id @default(autoincrement())
+  content            String?
+  image              String?
+  from               User     @relation("Sender", fields: [SenderId], references: [id])
+  SenderId           Int
+  to                 User     @relation("Reciever", fields: [ReceiverId], references: [id])
+  ReceiverId         Int
+  isSenderFriend     Boolean  @default(false)
+  isSenderFollowing  Boolean  @default(false)
+  isSenderFollowedBy Boolean  @default(false)
+  forwarded          Boolean  @default(false)
+  reactions          Reaction[]
+  createdAt          DateTime @default(now())
+  updatedAt          DateTime @updatedAt
+
+}
+
+model Reaction {
+  id                 Int      @id @default(autoincrement())
+  user               User     @relation(fields: [userId], references: [id])
+  userId             Int
+  message            Messages @relation(fields:[messageId] , references:[id])
+  messageId          Int
+  content            String
+  createdAt          DateTime @default(now())
+  updatedAt          DateTime @updatedAt
+
+}
+
+model FriendsRequest {
+  id                Int      @id @default(autoincrement())
+  sender             User     @relation("RequestSender", fields: [RequsetSenderId], references: [id])
+  RequsetSenderId   Int
+  reciever            User     @relation("RequestReciever", fields: [RequestReceiverId], references: [id])
+  RequestReceiverId Int
+  createdAt         DateTime @default(now())
+  updatedAt         DateTime @updatedAt
+}
+
```


