# Migration `20201112104022-init`

This migration has been generated at 11/12/2020, 1:40:25 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."UsersMedia" ALTER COLUMN "image" SET DATA TYPE text ,
ALTER COLUMN "image" SET NOT NULL
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201112103037-init..20201112104022-init
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
@@ -49,9 +49,9 @@
 }
 model UsersMedia {
   id                      Int      @id @default(autoincrement())
-  image                   String[]
+  image                   String
   user                    User @relation(name:"user", fields:[userId], references:[id])
   userId                  Int
   Message                 Messages @relation(references: [id],  fields: [MessageId])
   MessageId               Int
```


