# Prompt Injection Backend API

A FastAPI backend for testing prompt injection prevention mechanisms and PII scanning.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Run the server:
```bash
python src/main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### GET /
Root endpoint - returns API information

### GET /health
Health check endpoint

### POST /api/test
Test endpoint for prompt injection testing

**Request Body:**
```json
{
  "message": "Your test message here",
  "user_id": "optional_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message processed successfully",
  "sanitized_message": "Sanitized version of your message",
  "timestamp": "2026-02-04T...",
  "user_id": "optional_user_id"
}
```

### POST /api/chat/test
Simple chat test endpoint (mock response)

### POST /scan
**PII Anonymize Scanner** - Scan prompts for Personally Identifiable Information (PII)

The Anonymize Scanner detects and redacts sensitive information including:
- Credit Cards
- Person Names
- Phone Numbers
- URLs
- Email Addresses
- IP Addresses (IPv4/IPv6)
- UUIDs
- US Social Security Numbers
- Crypto Wallet Addresses
- IBAN Codes

**Request Body:**
```json
{
  "prompt": "Hello, my name is John Doe and my email is john.doe@example.com. My SSN is 123-45-6789.",
  "preamble": "Insert before prompt",
  "allowed_names": ["John Doe"],
  "hidden_names": ["Test LLC"],
  "entity_types": ["PERSON", "EMAIL_ADDRESS", "US_SSN"],
  "use_faker": false,
  "threshold": 0.0,
  "language": "en"
}
```

**Response:**
```json
{
  "sanitized_prompt": "Hello, my name is [REDACTED_PERSON_1] and my email is [REDACTED_EMAIL_1]. My SSN is [REDACTED_US_SSN_1].",
  "is_valid": false,
  "risk_score": 0.95,
  "detected_entities": [
    {
      "entity_type": "PERSON",
      "start": 17,
      "end": 25,
      "score": 0.99,
      "text": "John Doe"
    },
    {
      "entity_type": "EMAIL_ADDRESS",
      "start": 47,
      "end": 66,
      "score": 0.98,
      "text": "john.doe@example.com"
    },
    {
      "entity_type": "US_SSN",
      "start": 76,
      "end": 87,
      "score": 0.95,
      "text": "123-45-6789"
    }
  ],
  "timestamp": "2026-02-04T..."
}
```

**Parameters:**
- `prompt`: The text to scan for PII
- `preamble`: Text to insert before the prompt (optional)
- `allowed_names`: List of names that are allowed and won't be redacted (optional)
- `hidden_names`: List of names to redact with custom tags (optional)
- `entity_types`: Specific entity types to scan for (optional)
- `use_faker`: Whether to replace entities with fake data instead of redaction tags (optional)
- `threshold`: Confidence threshold for detection (0.0-1.0, default: 0.0)
- `language`: Language for detection ("en" or "zh", default: "en")

## Testing

You can test the API using curl:

```bash
# Health check
curl http://localhost:8000/health

# Test endpoint
curl -X POST "http://localhost:8000/api/test" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, this is a test message"}'

# PII Scanner - Basic test
curl -X POST "http://localhost:8000/scan" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "My email is john@example.com and SSN is 123-45-6789"}'

# PII Scanner - Advanced test with configuration
curl -X POST "http://localhost:8000/scan" \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "Contact John Doe at john.doe@example.com or call 555-123-4567",
       "allowed_names": ["John Doe"],
       "use_faker": false,
       "threshold": 0.5
     }'
```

Or run the test script:
```bash
python test_scanner.py
```

Or visit `http://localhost:8000/docs` for the interactive API documentation.

## Features

- **Prompt Injection Prevention**: Basic filtering of common injection patterns
- **PII Detection**: Advanced PII scanning using LLM Guard's Anonymize scanner
- **Multiple Languages**: Support for English and Chinese text
- **Configurable**: Customizable entity types, thresholds, and redaction rules
- **CORS Support**: Ready for frontend integration
- **Auto-reload**: Development server with hot reload
