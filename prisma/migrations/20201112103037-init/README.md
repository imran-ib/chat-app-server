# Migration `20201112103037-init`

This migration has been generated at 11/12/2020, 1:30:38 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."UsersMedia" (
"id" SERIAL,
"image" text []  ,
"userId" integer   NOT NULL ,
"MessageId" integer   NOT NULL ,
"OtherUserId" integer   NOT NULL ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

ALTER TABLE "public"."UsersMedia" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."UsersMedia" ADD FOREIGN KEY ("MessageId")REFERENCES "public"."Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."UsersMedia" ADD FOREIGN KEY ("OtherUserId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201110182529-init..20201112103037-init
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
@@ -33,8 +33,10 @@
   BlockedMessagesIds                         Int[]
   isActive                                   Boolean          @default(false)
   lastSeen                                   DateTime         @default(now())
   lastTyped                                  DateTime         @default(now())
+  MediaSender                                UsersMedia[] @relation("user")
+  MediaReceiver                              UsersMedia[] @relation("MessageSender")
   createdAt                                  DateTime         @default(now())
   updatedAt                                  DateTime         @updatedAt
 }
@@ -45,10 +47,23 @@
   friendId                Int
   userId                  Int
 }
+model UsersMedia {
+  id                      Int      @id @default(autoincrement())
+  image                   String[]
+  user                    User @relation(name:"user", fields:[userId], references:[id])
+  userId                  Int
+  Message                 Messages @relation(references: [id],  fields: [MessageId])
+  MessageId               Int
+  otherUser               User @relation(name:"MessageSender" ,fields: [OtherUserId])
+  OtherUserId             Int
+  createdAt               DateTime         @default(now())
+  updatedAt               DateTime         @updatedAt
+}
+
 model temporaryBlockOtherUserOnDeleteChat {
   id                      Int      @id @default(autoincrement())
   blocker                 User     @relation("ChatMessageSender", fields: [blockerId], references: [id])
   blockerId               Int
```


