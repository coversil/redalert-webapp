FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx expo export --platform web

FROM node:20-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
CMD sh -c "serve dist -l tcp://0.0.0.0:\$PORT"
