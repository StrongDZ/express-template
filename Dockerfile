# ===== Base stage =====
FROM node:18-alpine AS base
WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci

# ===== Build stage =====
FROM base AS build-stage
WORKDIR /home/node/app
COPY . .

# 1. Đặt môi trường là production
ENV NODE_ENV=production

# Build
RUN npm run build

# ===== Production stage =====
FROM node:18-alpine AS production-stage
WORKDIR /home/node/app

ENV NODE_ENV=production
# Nếu cấu trúc file của bạn sau khi build là build/src/server.js thì set path này ok
ENV NODE_PATH=./build

COPY package*.json ./
# Chỉ cài dependencies production
RUN npm ci --omit=dev

# Copy code đã build
COPY --from=build-stage /home/node/app/build ./build

# Cleanup
RUN rm -rf /root/.npm /tmp/*

USER node

CMD ["npm", "start"]