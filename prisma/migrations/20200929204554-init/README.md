# Migration `20200929204554-init`

This migration has been generated at 9/29/2020, 11:45:55 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" DROP COLUMN "AuthToken",
ADD COLUMN "OneTimePassword" integer   
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200929204506-init..20200929204554-init
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
   id                       Int              @default(autoincrement()) @id
@@ -13,9 +13,9 @@
   username                 String           @unique
   loginSecret              String?
   avatar                   String?          @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
   password                 String
-  AuthToken              Int?
+  OneTimePassword              Int?
   PasswordResetTokenExpiry Float?
   PasswordResetToken       String?
   createdAt                DateTime         @default(now())
   updatedAt                DateTime         @updatedAt
```


