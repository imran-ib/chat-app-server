# Migration `20201002140918-init`

This migration has been generated at 10/2/2020, 5:09:20 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Messages" DROP CONSTRAINT "Messages_RecieverId_fkey"

ALTER TABLE "public"."Messages" DROP COLUMN "RecieverId",
ADD COLUMN "ReceiverId" integer   NOT NULL 

ALTER TABLE "public"."Messages" ADD FOREIGN KEY ("ReceiverId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201002140319-init..20201002140918-init
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
   id                       Int        @id @default(autoincrement())
@@ -33,10 +33,10 @@
   content            String?
   image              String?
   from               User     @relation("Sender", fields: [SenderId], references: [id])
   SenderId           Int
-  to                 User     @relation("Reciever", fields: [RecieverId], references: [id])
-  RecieverId         Int
+  to                 User     @relation("Reciever", fields: [ReceiverId], references: [id])
+  ReceiverId         Int
   isSenderFriend     Boolean  @default(false)
   isSenderFollowing  Boolean  @default(false)
   isSenderFollowedBy Boolean  @default(false)
   createdAt          DateTime @default(now())
```


