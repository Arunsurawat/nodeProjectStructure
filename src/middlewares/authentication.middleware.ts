import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { createCustomError } from "@/utils/customeError";
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const jwt_token_age = 30 * 60; // for 30 minutes
import { CustomRequest } from '@interfaces/custome-request.interface';

export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    let token = null;
    if (req.headers.authorization) {
        token = req.headers.authorization.replace('Bearer ', '').trim()
    }

    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, SECRET_TOKEN, (err: any, decoded: any) => {
            if (err) {
                return next(createCustomError("Unauthorized access", 401));
            } else {
                const diff = new Date().getTime() - decoded.token_time;
                req.loginUserRole = decoded.userRole;
                req.loginUserId = decoded._id;
                req.loginUserWalletAddress = decoded.walletAddress;
                req.permissions = decoded.permissions;
                const tokenAge = Math.round((diff / 1000));
                if (tokenAge >= jwt_token_age) {
                    return next(createCustomError("Unauthorized access", 401));
                } else {
                    next();
                }
            }
        });
    } else {
        return next(createCustomError("Forbidden access", 403));
    }
}