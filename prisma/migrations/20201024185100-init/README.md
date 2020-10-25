# Migration `20201024185100-init`

This migration has been generated at 10/24/2020, 9:51:01 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."_UserFirends" (
"A" integer   NOT NULL ,
"B" integer   NOT NULL 
)

CREATE UNIQUE INDEX "_UserFirends_AB_unique" ON "public"."_UserFirends"("A", "B")

CREATE INDEX "_UserFirends_B_index" ON "public"."_UserFirends"("B")

ALTER TABLE "public"."_UserFirends" ADD FOREIGN KEY ("A")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."_UserFirends" ADD FOREIGN KEY ("B")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201021203230-init..20201024185100-init
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
@@ -25,10 +25,10 @@
   FriendRequsetSent        FriendsRequest[] @relation("RequestSender")
   FriendRequestRecieved    FriendsRequest[] @relation("RequestReciever")
   followedBy               User[]           @relation("UserFollows", references: [id])
   following                User[]           @relation("UserFollows", references: [id])
-  friends                  User[]           @relation("UserFirends")
-  friend                   User?            @relation("UserFirends", fields: [friendId], references: [id])
+  friends                  User[]           @relation("UserFirends",fields: [friendId], references: [id])
+  friend                   User[]           @relation("UserFirends")
   friendId                 Int?
   isActive                 Boolean          @default(false)
   lastSeen                 String?
   reactions                Reaction[]       
```


