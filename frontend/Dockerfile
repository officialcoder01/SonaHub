FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 10000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set registry https://registry.npmjs.org/ \
    && sh -c 'for attempt in 1 2 3 4 5; do npm ci --no-audit --no-fund && exit 0; echo "frontend npm ci failed (attempt $attempt), retrying..."; sleep 5; done; exit 1'

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
