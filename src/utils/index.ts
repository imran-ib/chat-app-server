import { verify } from 'jsonwebtoken'
import { Request } from 'express'

export const APP_SECRET = process.env.APP_SECRET

interface Token {
  userId: string
}

export function getUserId(context: any) {
  const Authorization = context.req.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')

    const verifiedToken = verify(token, APP_SECRET) as Token
    return verifiedToken && verifiedToken.userId
  }
}

export const getTokenFromReq = (req: Request) => {
  try {
    const Authorization = req.headers['authorization']
    if (Authorization) {
      let token = Authorization.replace('Bearer ', '')
      return token
    }
  } catch (error) {
    return ''
  }
}

export const getCookieFromReq = (req: Request, cookieKey: string): string => {
  try {
    const cookie = req.cookies[cookieKey]
    const signedCookie = req.signedCookies[cookieKey]

    if (cookie) return cookie
    if (signedCookie) return signedCookie
    return ''
  } catch (error) {
    return ''
  }
}

