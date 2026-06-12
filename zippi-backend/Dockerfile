# Use the official Node.js 18 alpine image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app
# Copy package files from zippi-backend
COPY zippi-backend/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application code from zippi-backend
COPY zippi-backend/ .

EXPOSE 3001

# Command to run the application
CMD [ "npm", "start" ]
