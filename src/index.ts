import express from "express";
import { graphqlParser } from "@antstackio/graphql-body-parser";
import { json } from "body-parser";
import cors from "cors";
import { GraphQLClient } from "graphql-request";
import parseGql from "./parseGql";
import { ReqParams, HandlerFunc } from "./types";

/**
 * creates an express app which acts as a proxy
 **/
function createApp(reqParams: ReqParams, handler: HandlerFunc) {
  const expressApp = express();

  // register middlewares
  expressApp.use(json());
  expressApp.use(cors());
  expressApp.use(graphqlParser());

  const graphQLClient = new GraphQLClient(reqParams.resourceUri, {
    mode: "cors",
    headers: reqParams.headers,
  });

  // handler middleware
  expressApp.use(async function (req, res, next) {
    try {
      const gql = parseGql(req.gqlObject?.operation, req.gqlObject?.variables);

      const proceed = await handler(gql, { req, res });

      if (!proceed) {
        res.statusCode = 401;
        res.json({
          message: "unauthenticated request",
        });
      }
      next();
    } catch (e) {
      console.log("error is", e);
      res.statusCode = 400;
      res.json({
        message: "something went wrong",
      });
    }
  });

  // request handler
  expressApp.post("/", async (req, res) => {
    try {
      const data = await graphQLClient.request(
        req.body.query,
        req.body.variables
      );

      res.send({ data });
    } catch (e) {
      console.log("error is", e);
    }
  });

  return expressApp;
}

export default createApp;
