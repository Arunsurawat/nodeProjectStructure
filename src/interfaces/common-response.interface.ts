import {  Response } from "express";

export interface IResponse {
  res: Response;
  status:boolean;
  statusCode: number;
  message:string
  data?: any;
}