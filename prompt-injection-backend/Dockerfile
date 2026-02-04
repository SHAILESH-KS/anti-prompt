# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for some ML libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY prebuild_models.py ./

# Create model cache directory and set environment variables for better caching
ENV TRANSFORMERS_CACHE=/app/models/cache
ENV HF_HOME=/app/models/hf
RUN mkdir -p /app/models/cache /app/models/hf

# Pre-download models during build (this will be cached in Docker layer)
RUN echo "Starting model pre-download..." && \
    python prebuild_models.py && \
    echo "Model pre-download completed"

# Clean up any temporary files to reduce image size
RUN find /app/models -name "*.tmp" -delete 2>/dev/null || true

# Expose port 8000
EXPOSE 8000

# Run the application
CMD ["python", "src/main.py"]