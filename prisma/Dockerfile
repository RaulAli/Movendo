# Stage 1: Build the application and Prisma client
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build the TypeScript application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Stage 2: Run the application
FROM node:20-alpine AS production

WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3002

CMD [ "npm", "start" ]
