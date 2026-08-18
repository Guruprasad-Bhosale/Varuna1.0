# Stage 1: Build the React Application
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
# Setting backend API URL, default fallback for internal docker networking
ENV VITE_API_BASE_URL=http://localhost:8000/api/v1/telemetry
RUN npm run build

# Stage 2: Serve the build via Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the react build from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
