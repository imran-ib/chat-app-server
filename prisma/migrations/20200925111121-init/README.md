# Migration `20200925111121-init`

This migration has been generated at 9/25/2020, 2:11:21 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
"id" SERIAL,
"email" text   NOT NULL ,
"username" text   NOT NULL ,
"loginSecret" text   ,
"avatar" text   DEFAULT E'https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg',
"password" text   NOT NULL ,
"hasAuthToken" text   ,
"PasswordResetTokenExpiry" Decimal(65,30)   ,
"PasswordResetToken" text   ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" timestamp(3)   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE UNIQUE INDEX "User.email_unique" ON "public"."User"("email")

CREATE UNIQUE INDEX "User.username_unique" ON "public"."User"("username")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200923210128-init..20200925111121-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,26 +3,21 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
-  id        Int      @default(autoincrement()) @id
-  email     String   @unique
-  name      String
-  posts     Post[]
-  createdAt DateTime @default(now())
-  updatedAt DateTime @updatedAt
+  id                       Int      @default(autoincrement()) @id
+  email                    String   @unique
+  username                 String   @unique
+  loginSecret              String?
+  avatar                   String?  @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
+  password                 String
+  hasAuthToken             String?
+  PasswordResetTokenExpiry Float?
+  PasswordResetToken       String?
+  createdAt                DateTime @default(now())
+  updatedAt                DateTime @updatedAt
 }
-model Post {
-  id        Int      @default(autoincrement()) @id
-  published Boolean  @default(false)
-  title     String
-  content   String?
-  author    User?    @relation(fields: [authorId], references: [id])
-  authorId  Int?
-  createdAt DateTime @default(now())
-  updatedAt DateTime @updatedAt
-}
```


