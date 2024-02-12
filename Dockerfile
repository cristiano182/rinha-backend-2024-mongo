FROM node:20-slim AS base

RUN corepack enable
COPY . /app
WORKDIR /app

ENV PORT=3000
ENV MONGO_CONNECTION=mongodb://root:dbpass@mongodb:27017/?authMechanism=DEFAULT

FROM base AS prod-deps
RUN yarn install

FROM base AS build
RUN yarn install
RUN yarn run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
CMD [ "yarn", "start" ]