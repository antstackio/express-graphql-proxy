// import the library.. aaaaaaaaah
import { defaultCipherList } from "constants";
import createApp from "../src/index";

// handle fetching pokemons
function pokemons() {
  return true;
}

// all the handlers
const handlers = {
  mutation: {},
  query: {
    pokemons,
  },
};

function handlerFunc(gqlObject, context) {
  //user deets received in header
  const userId = context.req.headers.user;
  const admin = !!context.req.headers.admin;

  const result = gqlObject.queryObjects.every((item) =>
    // map the gqlObject to a suitable handler
    handlers[gqlObject.type][item.operationName](
      item.variables,
      item.selectedFields,
      { ...context, user: { _id: userId, admin } }
    )
  );

  return result;
}

const app = createApp(
  { resourceUri: "https://graphql-pokemon2.vercel.app", headers: {} },
  handlerFunc
);

app.listen(3000, () => {
  console.log("app listening on port 3000");
});
