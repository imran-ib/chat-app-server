# Migration `20200923210128-init`

This migration has been generated at 9/24/2020, 12:01:28 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Post" ADD COLUMN "createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" timestamp(3)   NOT NULL 

ALTER TABLE "public"."User" ADD COLUMN "createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" timestamp(3)   NOT NULL ,
ALTER COLUMN "name" SET NOT NULL
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200923093755-init..20200923210128-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,22 +3,26 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
-  email String  @unique
-  id    Int     @default(autoincrement()) @id
-  name  String?
-  posts Post[]
+  id        Int      @default(autoincrement()) @id
+  email     String   @unique
+  name      String
+  posts     Post[]
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
 }
 model Post {
+  id        Int      @default(autoincrement()) @id
+  published Boolean  @default(false)
+  title     String
+  content   String?
+  author    User?    @relation(fields: [authorId], references: [id])
   authorId  Int?
-  content   String?
-  id        Int     @default(autoincrement()) @id
-  published Boolean @default(false)
-  title     String
-  author    User?   @relation(fields: [authorId], references: [id])
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
 }
```


