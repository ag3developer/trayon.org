FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built code
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p /app/logs

# Expose P2P port
EXPOSE 30333

# Start validator
CMD ["node", "dist/index.js"]
