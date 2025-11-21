# ===== Base stage =====
FROM node:18-alpine AS base
WORKDIR /home/node/app
COPY package*.json ./

RUN npm ci

# ===== Build stage =====
FROM base AS build-stage
WORKDIR /home/node/app

COPY . .

RUN npm run build

# ===== Production stage =====
FROM node:18-alpine AS production-stage
WORKDIR /home/node/app

ENV NODE_ENV=production
ENV NODE_PATH=./build

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build-stage /home/node/app/build ./build
COPY --from=build-stage /home/node/app/src/secrets ./build/src/secrets

# Xóa cache npm để image nhẹ hơn
RUN rm -rf /root/.npm /tmp/*

# Đổi user để chạy app không cần root
USER node

# Khởi chạy app
CMD ["npm", "run", "deploy"]
