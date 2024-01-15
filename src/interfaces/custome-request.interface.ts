import { Request } from "express";
export interface CustomRequest extends Request {
    loginUserRole: string;
    loginUserId: string;
    loginUserWalletAddress: string
    permissions: any;
}
