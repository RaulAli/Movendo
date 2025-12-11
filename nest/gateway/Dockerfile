FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

# Copy built artifacts from host
COPY dist ./dist

EXPOSE 3003

CMD ["node", "dist/main"]
