# Stage 1: Build Dashboard React Application
FROM node:20-alpine AS build

WORKDIR /app
COPY dashboard/package.json dashboard/package-lock.json* ./
RUN npm install

COPY dashboard/ .
# Since the dashboard will be served from the same origin by NGINX, we use relative API path
ENV VITE_API_BASE_URL=/api/v1/telemetry
RUN npm run build

# Stage 2: Serve via Nginx reverse proxy
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy the react build from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
