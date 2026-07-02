# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configuration
COPY package*.json ./
RUN npm ci

# Copy source and compile production bundles
COPY . .
RUN npm run build

# Nginx Stage
FROM nginx:alpine

# Copy compiled bundles to nginx serving folder
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
