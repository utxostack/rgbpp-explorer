import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { GraphQLError } from 'graphql';
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity';
import * as Sentry from '@sentry/nestjs';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';
import { Logger } from '@nestjs/common';

export enum ComplexityType {
  RequestField = 3,
  ListField = 10,
}

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  private logger = new Logger(ComplexityPlugin.name);

  constructor(
    private gqlSchemaHost: GraphQLSchemaHost,
    private configSErvice: ConfigService<Env>,
  ) { }

  async requestDidStart(): Promise<GraphQLRequestListener> {
    const maxComplexity = this.configSErvice.get('GRAPHQL_COMPLEXITY_LIMIT');
    const { schema } = this.gqlSchemaHost;

    return {
      didResolveOperation: async ({ request, document }) => {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
        });
        // Skip introspection query
        const operation = document.definitions.find((def) => def.kind === 'OperationDefinition');
        if (operation?.name?.value === 'IntrospectionQuery') {
          return;
        }

        Sentry.setMeasurement('graphql.complexity', complexity, 'none');
        this.logger.debug(`Query complexity: ${request.operationName} ${complexity}`);
        if (complexity > maxComplexity) {
          Sentry.setContext('graphql', {
            query: request.query,
            variables: request.variables,
            complexity,
          });
          const error = new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
          );
          Sentry.captureException(error);
          throw error;
        }
      },
    };
  }
}
