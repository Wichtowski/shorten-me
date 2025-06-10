FROM node:20-alpine as build

WORKDIR /app

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
COPY --from=build /app/src/app/favicon.ico ./

EXPOSE 80

CMD ["node", "server.js"] 