ARG NODE_VERSION=18.18.0

FROM node:${NODE_VERSION}-alpine

# Use development node environment by default.
ENV NODE_ENV development

WORKDIR /usr/src/server

# Copy package.json and package-lock.json into the image
COPY package.json package-lock.json ./

# Install dependencies
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --omit=dev; \
    else \
      npm install; \
    fi


# Copy .env.example and set up .env if not already provided
COPY .env.example ./
RUN [ ! -f .env ] && cp .env.example .env || echo ".env already exists."

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application.
CMD if [ "$NODE_ENV" = "production" ]; then \
      npm run start; \
    else \
      npm run dev; \
    fi
