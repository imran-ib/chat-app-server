# Migration `20201014195825-init`

This migration has been generated at 10/14/2020, 10:58:25 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" DROP COLUMN "lastSeen",
ADD COLUMN "lastSeen" text   
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201014183453-init..20201014195825-init
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
@@ -29,9 +29,9 @@
   friends                  User[]           @relation("UserFirends")
   friend                   User?            @relation("UserFirends", fields: [friendId], references: [id])
   friendId                 Int?
   isActive                 Boolean          @default(false)
-  lastSeen                 DateTime         @default(now())
+  lastSeen                 String?
   createdAt                DateTime         @default(now())
   updatedAt                DateTime         @updatedAt
 }
```


