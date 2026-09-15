import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { error } from './security.js';
export const validate=(schema:ZodType,part:'body'|'params'|'query'='body')=>(req:Request,res:Response,next:NextFunction)=>{const result=schema.safeParse(req[part]);if(!result.success)return res.status(400).json(error('VALIDATION_ERROR','Datos inválidos.',req.requestId,result.error.flatten()));(req as unknown as Record<string,unknown>)[part]=result.data;next();};
