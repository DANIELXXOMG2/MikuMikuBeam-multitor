# Use the official Node.js v20 image as a builder
FROM node:20 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Use a smaller, more secure base image for the final stage
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy only the production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy package.json to the final stage
COPY package.json .

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start"]
