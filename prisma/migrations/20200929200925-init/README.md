# Migration `20200929200925-init`

This migration has been generated at 9/29/2020, 11:09:26 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."OneTimePassword" DROP COLUMN "counter",
ADD COLUMN "counter" integer   NOT NULL DEFAULT 6
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200929195034-init..20200929200925-init
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
   id                       Int             @default(autoincrement()) @id
@@ -23,9 +23,9 @@
 model OneTimePassword {
   id      Int    @default(autoincrement()) @id
   secret  String
-  counter String @default("6")
+  counter Int    @default(6)
   OTP     String
   user    User   @relation(fields: [userId], references: [id])
   userId  Int
```


