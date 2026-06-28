# Use Node.js LTS as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy the entire project repository
COPY . .

# Move into the web application directory
WORKDIR /app/smart-study-assistant

# Install dependencies
RUN npm install

# Build the frontend and backend bundle
RUN npm run build

# Expose the application port
EXPOSE 3000

# Set runtime variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
CMD ["node", "dist/server.cjs"]
