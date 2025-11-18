FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run prisma:generate || true
CMD ["node", "dist/main.js"]