FROM node:17-alpine3.14

WORKDIR /app

COPY --from=jwilder/dockerize /usr/local/bin/dockerize /app
COPY ./package.json /app/
COPY ./package-lock.json /app/

RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]