ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-slim AS base
ARG GIT_BRANCH

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends git
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts
RUN pnpm run --filter backend postinstall

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter backend build

FROM base
ENV NODE_ENV production
ENV GIT_BRANCH=${GIT_BRANCH}

COPY --from=prod-deps /app/node_modules node_modules
COPY --from=prod-deps /app/package*.json .
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=prod-deps /app/backend/package*.json ./backend
COPY --from=build /app/backend/dist ./backend/dist

EXPOSE 3000
CMD ["node", "backend/dist/src/main.js"]
