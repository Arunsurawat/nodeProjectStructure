import { apiResp } from '@utils/common';
import { Response, Request } from "express";

export const routeNotFound = (req: Request, res: Response) => {
    return apiResp({ res, status: false, statusCode: 404, message: `Route doesn't exists` });
}