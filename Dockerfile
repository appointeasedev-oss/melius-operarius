# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Install Ollama in the container
RUN apk add --no-cache curl bash

# Download and install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000
EXPOSE 11434

# Pull a default model (you can change this to your preferred model)
RUN ollama serve & sleep 5 && ollama pull llama3

# Start the application
CMD ["sh", "-c", "ollama serve & npm start"]