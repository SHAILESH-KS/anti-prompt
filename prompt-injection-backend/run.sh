#!/bin/bash

# Simple script to run the FastAPI server

echo "Starting Prompt Injection Backend API..."
echo "API will be available at: http://localhost:8000"
echo "API documentation at: http://localhost:8000/docs"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate  # On Windows, this would be: venv\Scripts\activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if llm-guard is available
echo "Checking PII scanner availability..."
python -c "from llm_guard.vault import Vault; from llm_guard.input_scanners import Anonymize; print('✅ PII Scanner available')" 2>/dev/null || echo "⚠️  PII Scanner not available (llm-guard not installed)"

# Run the server
echo "Starting server..."
python src/main.py