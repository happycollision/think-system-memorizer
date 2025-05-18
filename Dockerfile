FROM node:10

# Set the working directory in the container
WORKDIR /app

# Copy package files first to install dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of your application code
COPY . .

# Default command (can be changed)
CMD ["npm", "start"]
