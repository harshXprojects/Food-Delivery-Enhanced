FROM node:20-alpine

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY --chown=appuser:appgroup . .

USER appuser
EXPOSE 4000
CMD ["node", "server.js"]