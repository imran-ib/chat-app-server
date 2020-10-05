# Migration `20200929204506-init`

This migration has been generated at 9/29/2020, 11:45:06 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."OneTimePassword" DROP CONSTRAINT "OneTimePassword_userId_fkey"

ALTER TABLE "public"."User" ADD COLUMN "AuthToken" integer   

DROP TABLE "public"."OneTimePassword"
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200929203933-init..20200929204506-init
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
@@ -13,20 +13,11 @@
   username                 String           @unique
   loginSecret              String?
   avatar                   String?          @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
   password                 String
-  hasAuthToken             OneTimePassword?
+  AuthToken              Int?
   PasswordResetTokenExpiry Float?
   PasswordResetToken       String?
   createdAt                DateTime         @default(now())
   updatedAt                DateTime         @updatedAt
 }
-model OneTimePassword {
-  id      Int    @default(autoincrement()) @id
-  secret  String
-  counter Int    @default(6)
-  OTP     String
-  user    User   @relation(fields: [userId], references: [id])
-  userId  Int
-
-}
```


