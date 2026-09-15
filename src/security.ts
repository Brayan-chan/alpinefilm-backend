import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from './config.js';

export type AuthUser = { sub: string; username: string; role: 'admin'|'viewer' };
declare global { namespace Express { interface Request { user?: AuthUser; requestId: string } } }
const scrypt = (value: string, salt: Buffer) => new Promise<Buffer>((resolve, reject) => crypto.scrypt(value, salt, 64, (e, key) => e ? reject(e) : resolve(key)));
export async function hashPassword(value: string) { const salt=crypto.randomBytes(16); const key=await scrypt(value,salt); return `scrypt:${salt.toString('hex')}:${key.toString('hex')}`; }
export async function verifyPassword(value: string, stored: string) { const [,s,k]=stored.split(':'); if(!s||!k) return false; const actual=await scrypt(value,Buffer.from(s,'hex')); const expected=Buffer.from(k,'hex'); return actual.length===expected.length && crypto.timingSafeEqual(actual,expected); }
export const accessToken = (user: AuthUser) => jwt.sign(user, config.JWT_ACCESS_SECRET, { expiresIn: config.ACCESS_TOKEN_TTL as SignOptions['expiresIn'] });
export const playbackToken = (userId:string,movieId:string) => jwt.sign({sub:userId,movieId,scope:'playback'},config.JWT_PLAYBACK_SECRET,{expiresIn:config.PLAYBACK_TOKEN_TTL as SignOptions['expiresIn']});
export function requireAuth(req:Request,res:Response,next:NextFunction){ const token=req.headers.authorization?.replace(/^Bearer /,''); if(!token)return res.status(401).json(error('UNAUTHORIZED','Se requiere autenticación.',req.requestId)); try{req.user=jwt.verify(token,config.JWT_ACCESS_SECRET) as AuthUser; next();}catch{return res.status(401).json(error('TOKEN_INVALID','Token inválido o vencido.',req.requestId));}}
export function requireAdmin(req:Request,res:Response,next:NextFunction){if(req.user?.role!=='admin')return res.status(403).json(error('FORBIDDEN','Se requiere rol administrador.',req.requestId));next();}
export const error=(code:string,message:string,requestId:string,details:unknown=null)=>({error:{code,message,details,requestId}});
