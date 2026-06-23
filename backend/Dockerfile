FROM node:22-slim

WORKDIR /workspace/backend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "dev"]