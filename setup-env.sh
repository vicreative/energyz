#!/bin/bash

# Check if .env file already exists
if [ -f .env ]; then
  echo ".env file already exists."
else
  # Copy .env.example to .env
  cp .env.example .env
  echo ".env file created successfully."
fi
