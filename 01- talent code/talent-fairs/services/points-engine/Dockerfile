FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm i --omit=dev
COPY src src
CMD ["node","src/index.js"]
