# express-graphql-proxy

A graphql proxy server implemented on top of express for adding custom RBAC to existing graphql endpoints.

```js
import { createApp } from '@antstackio/express-graphql-proxy'

const requestParams = {
	resourceUri: "https://graphql-pokemon2.vercel.app",
  headers
};

const app = createApp(
	requestParams,
	handlerFunc
);

const handlers = {
	query: {
		pokemons
	}
};

function pokemons(variables, selectionFields, {req, res}) {
	if(parseInt(variables.id) > 150) {
		return res.status(400).send("cant query pokemons > 150 in this league"); 
	}
	return true;
}

function HandlerFunc(gqlObject, context) {

  const result = gqlObject.queryObjects.every((item) =>
    // map the gqlObject to a suitable handler
    handlers[gqlObject.type][item.operationName](
      item.variables,
      item.selectedFields,
      context
    )
  );
  return result;
}
```

## Installation

This is a `node.js` module available through npm registry. Installation can be done using npm or yarn.

```bash
$ npm install @antstackio/express-graphql-proxy

$ yarn add @antstackio/express-graphql-proxy
```

## Philosophy

There are services that provide graphql endpoints over http leaving the developer to come up with their own mechanism for authorisation and controllings permission for the  access of resources. This library help in bootstrapping a middleware proxy server that makes it easy to implement RBAC without loosing the fun in using graphql from the client.

## Documentation
- [Api documentation](./API.md)

## Examples

check out the example folder for quick start.