# Use the official Node.js 18 alpine image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 3001

# Command to run the application
CMD [ "npm", "start" ]
