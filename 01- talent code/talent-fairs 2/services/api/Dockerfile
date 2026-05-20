FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable && pnpm i --shamefully-hoist
COPY . .
RUN npx nest build || ./node_modules/.bin/nest build || true
CMD ["node","dist/main.js"]
