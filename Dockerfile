ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-slim AS base
ARG GIT_COMMIT_HASH
ARG GIT_BRANCH
ARG APP_VERSION

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts
RUN pnpm run --filter backend postinstall

FROM base as build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter backend build

FROM base
ENV NODE_ENV production
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV APP_VERSION=${APP_VERSION}

RUN echo "Building with GIT_COMMIT_HASH: $GIT_COMMIT_HASH"
COPY --from=prod-deps /app/node_modules node_modules
COPY --from=prod-deps /app/package*.json .
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=prod-deps /app/backend/package*.json ./backend
COPY --from=build /app/backend/dist ./backend/dist

LABEL org.opencontainers.image.revision=${GIT_COMMIT_HASH}

EXPOSE 3000
CMD ["node", "backend/dist/main.js"]
