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
export function createApp(reqParams: ReqParams, handler: HandlerFunc) {
  const expressApp = express();

  if (!handler) {
    throw new Error("handler is required");
  }

  // handling custom route
  let customRoute = "";
  if(reqParams.route) customRoute = reqParams.route;

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
        return res.json({
          message: "unauthenticated request",
        });
      }

      // if user has manually responded then skip going further
      if (!res.headersSent) next();
    } catch (e) {
      res.statusCode = 400;
      res.json({
        message: e.message,
      });
    }
  });

  // request handler
  expressApp.post("/" + customRoute, async (req, res) => {
    try {
      const data = await graphQLClient.request(
        req.body.query,
        req.body.variables
      );

      res.send({ data });
    } catch (e) {
      res.statusCode = 400;
      res.json({
        message: e.message,
        error: e.message,
      });
    }
  });

  return expressApp;
}
