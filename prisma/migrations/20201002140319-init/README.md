# Migration `20201002140319-init`

This migration has been generated at 10/2/2020, 5:03:19 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "friendId" integer   

CREATE TABLE "public"."Messages" (
"id" SERIAL,
"content" text   ,
"image" text   ,
"SenderId" integer   NOT NULL ,
"RecieverId" integer   NOT NULL ,
"isSenderFriend" boolean   NOT NULL DEFAULT false,
"isSenderFollowing" boolean   NOT NULL DEFAULT false,
"isSenderFollowedBy" boolean   NOT NULL DEFAULT false,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."_UserFollows" (
"A" integer   NOT NULL ,
"B" integer   NOT NULL 
)

CREATE UNIQUE INDEX "_UserFollows_AB_unique" ON "public"."_UserFollows"("A", "B")

CREATE INDEX "_UserFollows_B_index" ON "public"."_UserFollows"("B")

ALTER TABLE "public"."Messages" ADD FOREIGN KEY ("SenderId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Messages" ADD FOREIGN KEY ("RecieverId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."_UserFollows" ADD FOREIGN KEY ("A")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."_UserFollows" ADD FOREIGN KEY ("B")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."User" ADD FOREIGN KEY ("friendId")REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200929204554-init..20201002140319-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,21 +3,43 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
-  id                       Int              @default(autoincrement()) @id
-  email                    String           @unique
-  username                 String           @unique
+  id                       Int        @id @default(autoincrement())
+  email                    String     @unique
+  username                 String     @unique
   loginSecret              String?
-  avatar                   String?          @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
+  avatar                   String?    @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
   password                 String
-  OneTimePassword              Int?
+  OneTimePassword          Int?
   PasswordResetTokenExpiry Float?
   PasswordResetToken       String?
-  createdAt                DateTime         @default(now())
-  updatedAt                DateTime         @updatedAt
+  MessagesSent             Messages[] @relation("Sender")
+  MessagesRecieved         Messages[] @relation("Reciever")
+  followedBy               User[]     @relation("UserFollows", references: [id])
+  following                User[]     @relation("UserFollows", references: [id])
+  friends                  User[]     @relation("UserFirends")
+  friend                   User?      @relation("UserFirends", fields: [friendId], references: [id])
+  friendId                 Int?
+  createdAt                DateTime   @default(now())
+  updatedAt                DateTime   @updatedAt
 }
+model Messages {
+  id                 Int      @id @default(autoincrement())
+  content            String?
+  image              String?
+  from               User     @relation("Sender", fields: [SenderId], references: [id])
+  SenderId           Int
+  to                 User     @relation("Reciever", fields: [RecieverId], references: [id])
+  RecieverId         Int
+  isSenderFriend     Boolean  @default(false)
+  isSenderFollowing  Boolean  @default(false)
+  isSenderFollowedBy Boolean  @default(false)
+  createdAt          DateTime @default(now())
+  updatedAt          DateTime @updatedAt
+
+}
```


