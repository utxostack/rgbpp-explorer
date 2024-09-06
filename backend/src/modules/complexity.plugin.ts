import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { GraphQLError } from 'graphql';
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity';
import * as Sentry from '@sentry/nestjs';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(
    private gqlSchemaHost: GraphQLSchemaHost,
    private configSErvice: ConfigService<Env>,
  ) { }

  async requestDidStart(): Promise<GraphQLRequestListener> {
    const maxComplexity = this.configSErvice.get('GRAPHQL_COMPLEXITY_LIMIT');
    const { schema } = this.gqlSchemaHost;

    return {
      async didResolveOperation({ request, document }) {
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

        if (complexity > maxComplexity) {
          Sentry.setContext('graphql', {
            query: request.query,
            variables: request.variables,
            complexity,
          });
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
          );
        }
      },
    };
  }
}
