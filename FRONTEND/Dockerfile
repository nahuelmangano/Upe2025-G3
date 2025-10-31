## Stage 1 - Build the Angular app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage layer caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the sources and build
COPY . .
RUN npm run build

## Stage 2 - Serve the compiled app with NGINX
FROM nginx:1.27-alpine AS runtime

# Copy the compiled assets from the previous stage
COPY --from=builder /app/dist/upeclinica-frontend /usr/share/nginx/html
# Override default nginx config to support Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
