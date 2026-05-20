FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm i --omit=dev
COPY src ./src
EXPOSE 4000
CMD ["npm","start"]
