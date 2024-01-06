import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { prismaClient } from "./lib/db";

import cors from "cors";
const init = async () => {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  app.use(cors());
  app.use(express.json());

  // create GraphQL server
  const gqlServer = new ApolloServer({
    typeDefs: `
        type Query {
          hello: String,
          say(name:String):String
        }
        type Mutation{
          createUser(firstName:String!, lastName:String!,email:String!,password:String!):Boolean
        }
      `, // Schema
    resolvers: {
      Query: {
        hello: () => `Hey There! I am a GraphQL Server.`,
        say: (_: any, { name }: { name: string }) =>
          `Welcome To The ${name || "World"} Server`,
      },
      Mutation: {
        createUser: async (
          _: any,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prismaClient.user.create({
            data: {
              email,
              firstName,
              lastName,
              password,
              salt: "ranjansharma",
            },
          });
          return true;
        },
      },
    }, // Resolvers Function of query and mutation
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
    res.json({ message: `Server is Running On Port Number ${PORT}` });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

init();
