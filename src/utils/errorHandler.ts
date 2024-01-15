import { CustomAPIError } from '@/utils/customeError'
import { NextFunction, Request, Response } from "express";
import { logger } from '@utils/logger';
import { apiResp } from '@utils/common';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CustomAPIError) {
        logger.error(err.message);
        return apiResp({ res, status: false, statusCode: err.statusCode, message: err.message });
    }
    else {
        logger.error(err.message);
        return apiResp({ res, status: false, statusCode: 500, message: err.message });
    }
}
