# Migration `20201006205632-init`

This migration has been generated at 10/6/2020, 11:56:33 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ADD COLUMN "googleId" text   
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201006205130-init..20201006205632-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,15 +3,16 @@
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
+  googleId                 String?
   loginSecret              String?
   avatar                   String?    @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
   password                 String?
   OneTimePassword          Int?
```

