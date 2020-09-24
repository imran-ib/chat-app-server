import { verify } from "jsonwebtoken";

export const APP_SECRET = "APP_SECRET";

interface Token {
  userId: string;
}

export function getUserId(context: any) {
  const Authorization = context.req.get("Authorization");
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "");
    const verifiedToken = verify(token, APP_SECRET) as Token;
    return verifiedToken && verifiedToken.userId;
  }
}
