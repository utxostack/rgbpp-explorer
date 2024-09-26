import { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

interface Context {
  request: FastifyRequest;
}

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(LoggingPlugin.name);

  async requestDidStart(requestContext: GraphQLRequestContext<Context>): Promise<GraphQLRequestListener<any>> {
    const { request } = requestContext.contextValue;
    const body = request.body as { operationName: string; variables: Record<string, any>, query: string };
    this.logger.log(`Request [${request.ip}] ${body.operationName} ${JSON.stringify(body.variables)}`);

    const start = performance.now();
    return {
      willSendResponse: async () => {
        const end = performance.now();
        this.logger.log(`Response [${request.ip}] ${body.operationName} ${end - start}ms`);
      },
    };
  }
}
