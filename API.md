# Api

## createApp

  Library exports a default function which can be used to create an express app that can act as a proxy. It accepts two arguments

- requestParams
- HandlerFunc

```js
import createApp from '@antstackio/express-graphql-proxy'

const requestParams = {
	resourceUri: '<graphql_endpoint>',
	headers: {
	  // headers to be send along while querying the gql endpoint
	}
};

// function that authorizes the user's query
// returns true or false, which dictates whether the user has
// permission to execute the query and return based on that.
function handlerFunc(gqlObject, context) {
	// Context object also has Request and Response Object embedded 
	// in it which can be used to override default response
}

const app = createApp(requestParams, handlerFunc);
```

### requestParams

This should contain required data for making query to the graphql endpoint.

- **resourceUri** : url of the graphql endpoint
- **headers** : headers that should accompany the request to graphql endpoint. Usually things like authorization tokens, api keys etc.

example

```jsx
const requestParams = {
	resourceUri: "https://www.gqlResourceApi.com/graphql",
	headers: {
		api_key: "<api_key>"
	}
}
```

### HandlerFunc

This is the primary function defined by the user which decide the resource requesting user has enough permissions and respond accordingly. It gets an abstarct object  build from graphql query, and the request and response object itself as arguments. It should respond with a boolean indicating if user has permission

**Params**

- gqlObject: abstract object created from parsing the graphql query. The object makes the arguments, fields being retrieved in the query etc readily available to the user.

    ```jsx
    // graphql query
    const query = `
    query {
        hello(name: "khubo") {
            result
        }
    }`;

    // after parsing

    // gqlObject in HandlerFunc
    {
    	"type":"query",
    	"queryObjects":[
    		{
    			"operationName":"hello",
    			"variables":{"name":"khubo"},
    			"selectedFields":{"result":1}
    		}
    	]
    }
    ```

- Context : It has the request and response object - same the as one exposed by an express app to its handler methods.

Handler function should return a boolean indicating if the requesting user has required permissions or not. If its true, then the request is proxied to the graphql service and response is send back to the user. False return a 401 authentication error.

### Custom Response

  User can sent custom response by utilising the response object exposed by context. 

```js
function handlerFunc(gqlObject, context) {
	const { res } = context;
	return res.status(403).send("who the heck are you?");
}
```