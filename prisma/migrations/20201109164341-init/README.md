# Migration `20201109164341-init`

This migration has been generated at 11/9/2020, 7:43:42 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Friends" ADD COLUMN "userId" integer   NOT NULL 

ALTER TABLE "public"."Friends" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201109163010-init..20201109164341-init
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
@@ -38,10 +38,12 @@
 }
 model Friends {
   id                      Int      @id @default(autoincrement())
-  friend                    User     @relation(fields: [friendId], references: [id])
-  friendId                 Int
+  friend                  User     @relation(name:"friend",fields: [friendId], references: [id])
+  user                    User     @relation(fields: [userId], references: [id])
+  friendId                Int
+  userId                  Int
 }
```


