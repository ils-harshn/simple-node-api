# Use the official Node.js image with a specific version of Node (LTS is recommended)
FROM node:18-slim

# Set working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY . .

# Install dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Expose the port on which the app will run
# EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
