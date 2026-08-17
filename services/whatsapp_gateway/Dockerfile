FROM node:20-alpine

# Install dependencies required for some native modules if needed
RUN apk add --no-cache git tzdata

WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose the API port
EXPOSE 3001

# Command to run the gateway
CMD ["npm", "start"]
