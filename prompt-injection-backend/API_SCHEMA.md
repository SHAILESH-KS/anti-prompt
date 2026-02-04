# API Request and Response Schema Documentation

This document outlines the request and response schemas for the Prompt Injection Backend API endpoints.

## Base URL
All endpoints are prefixed with `/api/v1` except for the health and scanner management endpoints.

## Endpoints

### 1. GET /scanners
Returns information about all available scanners.

**Response Schema:**
```json
{
  "available_scanners": ["string"],
  "scanners": [
    {
      "name": "string",
      "description": "string",
      "type": "input|output",
      "supported_languages": ["string"],
      "version": "string"
    }
  ]
}
```

### 2. GET /health
Health check endpoint with scanner availability status.

**Response Schema:**
```json
{
  "status": "healthy",
  "features": {
    "anonymize_scanner": true|false,
    "prompt_injection_scanner": true|false,
    "regex_scanner": true|false,
    "secrets_scanner": true|false,
    "invisible_text_scanner": true|false,
    "language_scanner": true|false,
    "sentiment_scanner": true|false,
    "toxicity_scanner": true|false,
    "token_limit_scanner": true|false,
    "sensitive_scanner": true|false,
    "factual_consistency_scanner": true|false,
    "relevance_scanner": true|false,
    "malicious_urls_scanner": true|false
  }
}
```

### 3. POST /scan-input
Scans an input prompt for security issues using a specified scanner.

**Request Schema:**
```json
{
  "prompt": "string (required)",
  "scanner_type": "string (required)"
}
```

**Response Schema:**
```json
{
  "scanner_type": "string",
  "sanitized_prompt": "string",
  "is_valid": true|false,
  "risk_score": 0.0,
  "detected_entities": ["string"],
  "scanner_info": {
    "name": "string",
    "description": "string",
    "type": "input",
    "supported_languages": ["string"],
    "version": "string"
  },
  "timestamp": "2026-02-04T12:00:00.000000"
}
```

### 4. POST /scan-output
Scans model output for security issues using a specified scanner.

**Request Schema:**
```json
{
  "prompt": "string (required)",
  "model_output": "string (required)",
  "scanner_type": "string (required)"
}
```

**Response Schema:**
```json
{
  "scanner_type": "string",
  "sanitized_output": "string",
  "is_valid": true|false,
  "risk_score": 0.0,
  "detected_entities": ["string"],
  "scanner_info": {
    "name": "string",
    "description": "string",
    "type": "output",
    "supported_languages": ["string"],
    "version": "string"
  },
  "timestamp": "2026-02-04T12:00:00.000000"
}
```

### 5. POST /api/v1/chat/completions
Creates a chat completion with security measures (currently uses external AI service).

**Request Schema:**
```json
{
  "model": "string",
  "messages": [
    {
      "role": "system|user|assistant",
      "content": "string"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}
```

**Response Schema:**
```json
{
  "id": "string",
  "object": "chat.completion",
  "created": 1677649420,
  "model": "string",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "string"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### 6. GET /api/v1/models
Lists available AI models.

**Response Schema:**
```json
{
  "models": [
    {
      "id": "string",
      "name": "string",
      "provider": "string",
      "context_window": 4096,
      "supports_streaming": true|false
    }
  ]
}
```

## Scanner Types

### Input Scanners
- `anonymize`: Detects and anonymizes personal information
- `prompt_injection`: Detects prompt injection attempts
- `regex`: Uses regex patterns to detect malicious content
- `secrets`: Detects API keys, tokens, and other secrets
- `invisible_text`: Detects hidden or invisible text
- `language`: Analyzes language patterns
- `sentiment`: Analyzes sentiment
- `toxicity`: Detects toxic content
- `token_limit`: Checks token limits

### Output Scanners
- `sensitive`: Detects sensitive information in outputs
- `factual_consistency`: Checks factual accuracy
- `relevance`: Checks relevance to the prompt
- `malicious_urls`: Detects malicious URLs

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "detail": "Error message string"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid input)
- `403`: Forbidden
- `500`: Internal Server Error
- `503`: Service Unavailable (scanner not available)

## Notes

- All timestamps are in ISO 8601 format
- Risk scores range from 0.0 (safe) to 1.0 (high risk)
- `is_valid` indicates whether the content passed the scanner's checks
- `detected_entities` contains specific items flagged by the scanner
- The `/chat/completions` and `/models` endpoints currently depend on an external AI service that may not be fully implemented</content>
<parameter name="filePath">d:\Next js\anti-prompt\prompt-injection-backend\API_SCHEMA.md