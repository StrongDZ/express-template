# ===== Base stage =====
FROM node:18-alpine AS base
WORKDIR /home/node/app
COPY package*.json ./

RUN npm ci

# ===== Build stage =====
FROM node:18-alpine AS build-stage
WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== Production stage =====
FROM node:18-alpine AS production-stage
WORKDIR /home/node/app

ENV NODE_ENV=production
ENV NODE_PATH=./build

# copy package.json trước để cache npm layer
COPY package*.json ./
RUN npm ci --omit=dev

# copy file build output (JS compiled) từ build stage
COPY --from=build-stage /home/node/app/build ./build
COPY --from=build-stage /home/node/app/swagger ./swagger
COPY --from=build-stage /home/node/app/src/secrets ./build/src/secrets

# xóa cache npm để nhẹ hơn
RUN rm -rf /root/.npm /tmp/*

# đổi user để chạy không cần root
USER node

# khởi chạy app
CMD ["node", "build/src/server.js"]
