# # Use a Debian-based Node.js image for better compatibility
# FROM node:18-bullseye

# # Install pnpm globally
# RUN npm install -g pnpm

# # Set the global pnpm store directory
# RUN pnpm config set store-dir /app/.pnpm-store --global

# # Copy package.json and (if necessary) generate a fresh pnpm-lock.yaml
# COPY package.json ./

# # Install dependencies ensuring a clean environment
# RUN rm -rf node_modules /app/.pnpm-store && pnpm install --no-frozen-lockfile

# # Rebuild native dependencies
# RUN pnpm rebuild snappy

# # Copy the rest of the application source code
# COPY . .

# # Expose the development port (Vite's default port is 5173)
# EXPOSE 5173

# # Start the application in development mode
# CMD ["pnpm", "dev", "--host"]


# Use a Debian-based Node.js image for better compatibility
FROM node:18-bullseye

# Install pnpm globally
RUN npm install -g pnpm

# Set the global pnpm store directory
RUN pnpm config set store-dir /app/.pnpm-store --global

# Set working directory
WORKDIR /app

# Copy project files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --shamefully-hoist

# Copy the rest of the application source code
COPY . .

# Expose the development port (Vite's default port is 5173)
EXPOSE 5173

# Start the application with --host
CMD ["pnpm", "dev", "--host"]