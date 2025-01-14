import { ApolloServer, AuthenticationError } from "apollo-server-express";
import { Application } from "express";
import { graphqlHTTP } from "express-graphql";
import { applyMiddleware } from "graphql-middleware";
import jwt, { VerifyOptions } from "jsonwebtoken";
import { Sequelize } from "sequelize";
import { ModelsType } from "../db/models";
import { Device, DeviceInfoInstance } from "../db/models/UserInfo/Device";
import { AccessTokenInstance } from "../db/models/UserInfo/Session";

import schema from "./schema/schema";
import { Context } from "./types/context";
import { AccessTokenExpiredError, InvalidHeaderError } from "./types/errorTypes";
import { isDevelopment } from "../app";

// @ts-ignore
const logInput = async (resolve, root, args, context, info) => {
    return await resolve(root, args, context, info);
};

const schemaWithMiddleware = applyMiddleware(schema, logInput);

const getTokenPayloadIfValid = (req: any, secret: string) => {
    if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length !== 2) {
            throw new InvalidHeaderError("Invalid authorization header");
        }
        const [scheme, accessToken] = parts;
        if (scheme !== "Bearer") {
            throw new InvalidHeaderError("Invalid authorization header");
        }
        const options: VerifyOptions = {
            algorithms: ["HS256"],
        };
        try {
            const decoded = jwt.verify(accessToken, secret, options);
            return decoded as AccessTokenInstance;
        } catch (err) {
            throw new AccessTokenExpiredError("Token expired or has invalid signature");
        }
    }
    return null;
};

export const configureGraphQL = async (app: Application, sequelize: Sequelize) => {
    const models = sequelize.models as ModelsType;
    const logger = console.log;
    const graphqlServer = new ApolloServer({
        schema: schemaWithMiddleware,
        context: async ({ req }) => {
            const requestID = req.headers["x-request-id"];
            if (typeof requestID !== "string") {
                throw new AuthenticationError("requestID wasn't provided");
            }

            const deviceInfoBase64 = req.headers["x-device"];
            if (typeof deviceInfoBase64 !== "string") {
                throw new AuthenticationError("device info wasn't provided");
            }

            const deviceInfo: DeviceInfoInstance = JSON.parse(
                Buffer.from(deviceInfoBase64, "base64").toString()
            );

            const [device, created] = await Device.findOrCreate(
                { where: { ...deviceInfo } });
            if (created) {
                logger(`New device object ${device.deviceID} was created`);
            } else {
                // logger(`Device with ID = ${device.deviceID} already exists`);
            }
            const tokenPayload = getTokenPayloadIfValid(req, process.env.SECRET_KEY!);
            if (tokenPayload) {
                const { userID, deviceID, sessionID } = tokenPayload;
                if (deviceID !== device.deviceID) {
                    throw new AuthenticationError(
                        `Got incorrect deviceID (In access token = ${deviceID}`
                        + `and in device-info header = ${device.deviceID})`);
                }
                const session = await models.Session.findByPk(sessionID);
                if (!session) {
                    throw new AuthenticationError("Session not found");
                }
                if (session.deviceID !== deviceID) {
                    await session.update({ status: "INVALID" });
                    throw new AuthenticationError("Session has another deviceID");
                }
                if (session.userID != userID) {
                    throw new AuthenticationError("Received incorrect userID");
                }
                // console.log(JSON.stringify(session));
                if (session.status === "INVALID") {
                    throw new AuthenticationError("Session is INVALID");
                }
            }
            if (process.env.KAFKA_TOPIC_NAME === undefined) {
                throw new Error("CANNOT GET TOPIC NAME FROM .env");
            }
            const topicNames = {
                DepAlgs: process.env.KAFKA_TOPIC_NAME,
            };
            const contextObject: Context =
                { models, logger, device, sessionInfo: tokenPayload, topicNames };
            return contextObject;
        },
        introspection: true,
    });
    app.get(
        "/graphql",
        graphqlHTTP({
            schema,
            graphiql: isDevelopment,
        })
    );
    await graphqlServer.start()
        .then(() => console.debug("GraphQL was successfully configured"))
        .catch(() => {
            throw new Error("Error while graphql configuring");
        });

    graphqlServer.applyMiddleware({
        app,
        path: "/graphql",
    });
};
