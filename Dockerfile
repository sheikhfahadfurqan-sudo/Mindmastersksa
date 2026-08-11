FROM node:18-alpine

WORKDIR /app

COPY . .

EXPOSE 10000
ENV PORT=10000

CMD ["node", "server.js"]
