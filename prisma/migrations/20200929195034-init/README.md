# Migration `20200929195034-init`

This migration has been generated at 9/29/2020, 10:50:35 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" DROP COLUMN "hasAuthToken"

CREATE TABLE "public"."OneTimePassword" (
"id" SERIAL,
"secret" text   NOT NULL ,
"counter" text   NOT NULL DEFAULT E'6',
"OTP" text   NOT NULL ,
"userId" integer   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE UNIQUE INDEX "OneTimePassword_userId_unique" ON "public"."OneTimePassword"("userId")

ALTER TABLE "public"."OneTimePassword" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200925111121-init..20200929195034-init
--- datamodel.dml
+++ datamodel.dml
@@ -3,21 +3,30 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
-  id                       Int      @default(autoincrement()) @id
-  email                    String   @unique
-  username                 String   @unique
+  id                       Int             @default(autoincrement()) @id
+  email                    String          @unique
+  username                 String          @unique
   loginSecret              String?
-  avatar                   String?  @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
+  avatar                   String?         @default("https://res.cloudinary.com/iib-webdevs/image/upload/v1601031013/DontDeleteMe/pngtree-businessman-user-avatar-free-vector-png-image_1538405.jpg")
   password                 String
-  hasAuthToken             String?
+  hasAuthToken             OneTimePassword
   PasswordResetTokenExpiry Float?
   PasswordResetToken       String?
-  createdAt                DateTime @default(now())
-  updatedAt                DateTime @updatedAt
+  createdAt                DateTime        @default(now())
+  updatedAt                DateTime        @updatedAt
 }
+model OneTimePassword {
+  id      Int    @default(autoincrement()) @id
+  secret  String
+  counter String @default("6")
+  OTP     String
+  user    User   @relation(fields: [userId], references: [id])
+  userId  Int
+
+}
```


