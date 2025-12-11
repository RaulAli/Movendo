FROM node:20-alpine

WORKDIR /usr/src/app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./

# Install all dependencies to get prisma CLI
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Remove devDependencies
RUN npm prune --production

# Copy built artifacts from host
COPY dist ./dist

EXPOSE 3004

CMD ["node", "dist/main"]
