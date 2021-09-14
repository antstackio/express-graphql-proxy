/*
 *	 Let's imagine that there is a service that lets you build services that has graphql api for interaction.
 *  But sadly the service doesn't offer you any way to implement anykind of RBAC (Role Based Access Control) on top of
 *	 it. You don't want every user (using your app?) having unrestricted access to the entire service, do you?
 * . Apparently then you have to put some kind of middleware that checks if the app user
 *  has proper permissions and if so then proxy the request to the service.
 *
 *   express-graphql-proxy library lets you do that by parsing the user queries and mutations into a javascript object
 *  which can be used to validate the request.
 */

// import the default function which can be used to create an express app
import { createApp } from "../dist/index.js";

// define handlers for each query/mutation type
const handlers = {
  query: {
    getTodo,
    getTodos,
  },
  mutation: {
    addTodo,
  },
};

// handler "getTodo" query type
// say user is making some query like     -->        becomes
// ----------------------------------                ----------
// query geTodo {                                    {
//		getTodo(id: 111, userId: 435) {                  args: { id: 111, userId: 435 },
// 				id																					 selectedFields: {
// 				task    																				id: 1,
//				status																					task: 1,
//		}                                                   status: 1
// }                                                   }
//                                                   }
function getTodo(args, selectedFields, context) {
  //arguments will have the arguments passed to the query

  // only a user should be able to retreieve their todo
  if (!args.userId == context.user._id) {
    return false;
  }

  return true;
}

// handler "getTodo" query type
function getTodos(args, selectedFields, { req, res, user }) {
  //arguments will have the arguments passed to the query

  // only a user should be able to retreieve their todo
  // context also has req and res objects that are avaialable in express handlers.
  // they can be used to override the default behavior of the library
  if (!args.userId == user._id) {
    // sending a custom response
    return res.status(401).send("Unauthorized");
  }

  return true;
}

function addTodo(args, selectedFields, context) {
  if (args.userId == context.user._id) {
    return false;
  }
  return true;
}

function handlerFunc(gqlObject, context) {
  // imaginary user details that being send as header..
  // usually these are token, or auth cookies that needs to be parsed and validated
  const userId = context.req.headers.user;
  const admin = !!context.req.headers.admin;

  // each req can have multiple queries or mutations inside hence
  // gqlObject will have queryObjects instead of single one.
  // Will have to iterate over each of them and decide if user has required permissions
  const result = gqlObject.queryObjects.every((item) =>
    // map the gqlObject to a suitable handler
    handlers[gqlObject.type][item.operationName](
      item.variables,
      item.selectedFields,
      // inject the parsed user deeets so its available in the handlers
      { ...context, user: { _id: userId, admin } }
    )
  );

  // if true then req is proxied, else responded with 401 Unauthorized
  return result;
}

// create an express app
const app = createApp(
  {
    resourceUri: "https://my-app.imaginary-service.com/graphql",
    headers: {
      api_key: process.env.API_KEY,
    },
  },
  handlerFunc
);

// listen on port 3000
app.listen(3000, () => {
  console.log("app listening on port 3000");
});
