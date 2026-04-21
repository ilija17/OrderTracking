FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm install --force
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/server/db/migrations /app/server/db/migrations
RUN mkdir -p /app/data/uploads
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", ".output/server/index.mjs"]
