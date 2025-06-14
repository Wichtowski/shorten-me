FROM node:20-alpine as build

WORKDIR /app

ARG COSMOSDB_ENDPOINT
ARG COSMOSDB_KEY

ENV COSMOSDB_ENDPOINT=${COSMOSDB_ENDPOINT}
ENV COSMOSDB_KEY=${COSMOSDB_KEY}

COPY package*.json ./
RUN npm install

COPY . ./

RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV PORT=80
ENV WEBSITES_PORT=80
ENV NODE_ENV=production

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/public/favicon.ico ./

EXPOSE 80

CMD ["node", "server.js"] 