# Use a Node.js base image
FROM node:18-alpine

# Install necessary dependencies, including Perl for texlive
RUN apk add --no-cache \
    perl \
    wget \
    tar \
    xz \
    fontconfig \
    bash \
    curl

# Install TeX Live manually
RUN mkdir /tmp/install-tl && \
    wget -qO- https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz | \
    tar -xz -C /tmp/install-tl --strip-components=1 && \
    /tmp/install-tl/install-tl --profile=/tmp/install-tl/texlive.profile && \
    rm -rf /tmp/install-tl

# Add TeX Live binaries to PATH
ENV PATH="/usr/local/texlive/2023/bin/x86_64-linux:$PATH"

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json, pnpm-lock.yaml, and .npmrc if available
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies using pnpm
RUN pnpm install

# Copy application source code
COPY . .

# Expose the development port (Vite's default port is 5173)
EXPOSE 8080

# Start the application in development mode
CMD ["pnpm", "dev", "--host"]