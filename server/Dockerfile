FROM node:16.15

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY app.js .

# Expose port
EXPOSE 8080

# Entrypoint
CMD [ "node", "app.js" ]
