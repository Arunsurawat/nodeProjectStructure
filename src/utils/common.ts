import { IResponse } from "@interfaces/common-response.interface";

export const apiResp = (apiRespInfo: IResponse) => {
    const { res, status, statusCode, message, data } = apiRespInfo;
    return res.status(statusCode).send({ status, statusCode, message, data });
}