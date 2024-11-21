# Use a base image with Node.js
FROM node:18-alpine

# Install pnpm globally and additional tools required for LaTeX
RUN npm install -g pnpm && \
    apk add --no-cache texlive texlive-latexextra texmf-dist texlive-xetex

# Set the working directory
WORKDIR /app

# Copy package.json and generate a fresh pnpm-lock.yaml file
COPY package.json ./
RUN pnpm install --lockfile-only

# Install dependencies based on the generated lockfile
RUN pnpm install

# Copy the rest of the application source code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["pnpm", "start"]