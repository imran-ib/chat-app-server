# Migration `20200929203933-init`

This migration has been generated at 9/29/2020, 11:39:33 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql

```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200929200925-init..20200929203933-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,23 +3,23 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
-  id                       Int             @default(autoincrement()) @id
-  email                    String          @unique
-  username                 String          @unique
+  id                       Int              @default(autoincrement()) @id
+  email                    String           @unique
+  username                 String           @unique
   loginSecret              String?
-  avatar                   String?         @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
+  avatar                   String?          @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
   password                 String
-  hasAuthToken             OneTimePassword
+  hasAuthToken             OneTimePassword?
   PasswordResetTokenExpiry Float?
   PasswordResetToken       String?
-  createdAt                DateTime        @default(now())
-  updatedAt                DateTime        @updatedAt
+  createdAt                DateTime         @default(now())
+  updatedAt                DateTime         @updatedAt
 }
 model OneTimePassword {
   id      Int    @default(autoincrement()) @id
```


