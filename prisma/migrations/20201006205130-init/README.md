# Migration `20201006205130-init`

This migration has been generated at 10/6/2020, 11:51:31 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ALTER COLUMN "password" DROP NOT NULL
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201002140918-init..20201006205130-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,18 +3,18 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
   id                       Int        @id @default(autoincrement())
   email                    String     @unique
   username                 String     @unique
   loginSecret              String?
   avatar                   String?    @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
-  password                 String
+  password                 String?
   OneTimePassword          Int?
   PasswordResetTokenExpiry Float?
   PasswordResetToken       String?
   MessagesSent             Messages[] @relation("Sender")
```


