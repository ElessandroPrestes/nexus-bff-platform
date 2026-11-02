# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm@9.0.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm nx build api-bff --configuration=production

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN npm install -g pnpm@9.0.0
COPY --from=build /app/dist/apps/api-bff ./
RUN pnpm install --prod --frozen-lockfile \
    && addgroup -S -g 10001 app \
    && adduser -S -u 10001 -G app app
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api || exit 1
CMD ["node", "main.js"]
