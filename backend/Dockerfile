FROM node:slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the project
COPY . .

# Set environment variables
ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "start:dev"]