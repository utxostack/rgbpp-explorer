ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base as build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter backend build 

FROM base
ENV NODE_ENV production
COPY --from=prod-deps /app/node_modules node_modules
COPY --from=prod-deps /app/package*.json .
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=prod-deps /app/backend/package*.json ./backend
COPY --from=build /app/backend/dist ./backend/dist

CMD ["node", "backend/dist/main.js"]
