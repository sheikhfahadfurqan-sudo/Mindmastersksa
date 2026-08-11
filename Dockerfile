# Dockerfile for Mind Masters KSA Deployment
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose port
EXPOSE 10000
ENV PORT=10000

# Start server
CMD ["npm", "start"]
