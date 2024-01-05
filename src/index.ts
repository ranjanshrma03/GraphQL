import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import cors from "cors";

const init = async () => {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  // create GraphQL server
  const gqlServer = new ApolloServer({
    typeDefs: `
        type Query {
          hello: String!,
          say(name:String):String
        }
      `, // Schema
    resolvers: {
      Query: {
        hello: () => `Hey There! I am a GraphQL Server.`,
        say: (_: any, { name }: { name: string }) =>
          `Welcome To The ${name || "World"} Server`,
      },
    }, // Resolvers Function of query and mutation
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start the gql Server
  await gqlServer.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(gqlServer)
  );

  app.get("/", (req, res) => {
    res.json({ message: `Server is running on port ${PORT}` });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

init();
