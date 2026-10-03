import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
export const client = new ApolloClient({
  link: new HttpLink({ uri: process.env.DRAWITH_GRAPHQL_URI || '/api/graphql' }),
  cache: new InMemoryCache(),
});