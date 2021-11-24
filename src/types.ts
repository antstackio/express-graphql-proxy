import { Request, Response } from "express";

export interface ReqParams {
  resourceUri: string;
  headers: {
    [key: string]: string;
  };
  route: string;
}

type Context = {
  req: Request;
  res: Response;
  [key: string]: any;
};

export type HandlerFunc = (gqlObject: any, context: Context) => Promise<any>;
