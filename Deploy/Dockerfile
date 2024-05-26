# Base Image
FROM node:18

# Create app directory in the container
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Bundle app source by copying all of your backend files
COPY backend/ ./

# Copy built Angular files from your local machine to the appropriate directory in the container
COPY sakai-ng /usr/src/app/dist/sakai-ng

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "app.js"]
