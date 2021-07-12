declare namespace Express {
  export interface Request {
    gqlObject?: {
      operation?: any;
      variables?: any;
    };
  }
}
