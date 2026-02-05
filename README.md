# Anti-Prompt

A comprehensive AI safety testing platform designed to evaluate and strengthen AI systems against various prompt-based attacks and vulnerabilities.

## Overview

Anti-Prompt is a full-stack application that provides tools for testing AI models against common security threats including prompt injection, toxicity detection, secret leakage, and other adversarial inputs. The platform consists of a Next.js frontend for user interaction and a Python FastAPI backend for AI scanning and analysis.

## Features

### Frontend (Next.js)
- **Interactive Testing Interface**: User-friendly web interface for testing prompts
- **Real-time Results**: Immediate feedback on prompt analysis
- **Multiple Test Categories**:
  - Prompt Injection Detection
  - Toxicity Analysis
  - Secret Detection
  - Code Security Scanning
  - Language and Gibberish Detection
  - Anonymization Testing
  - Regex Pattern Analysis
  - Banned Topics Filtering

### Backend (FastAPI)
- **AI-Powered Scanners**: Multiple specialized models for different threat categories
- **RESTful API**: Clean API endpoints for integration
- **Model Caching**: Efficient model loading and caching system
- **Docker Support**: Containerized deployment

## Architecture

```
anti-prompt/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Next.js app router
│   │   ├── components/# React components
│   │   └── lib/       # Utilities and configurations
│   └── docs/          # Documentation and examples
└── prompt-injection-backend/
    ├── src/           # FastAPI application
    │   ├── main.py    # Main application
    │   ├── routers/   # API routes
    │   └── scanners/  # AI scanning modules
    └── models/        # Pre-trained models cache
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Docker (optional)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd prompt-injection-backend
pip install -requirements.txt
python src/main.py
```

### Docker Deployment
```bash
cd prompt-injection-backend
docker build -t anti-prompt-backend .
docker run -p 8000:8000 anti-prompt-backend
```

## API Usage

### Test a Prompt
```bash
POST /api/chat/test
Content-Type: application/json

{
  "message": "Your test prompt here",
  "test_types": ["injection", "toxicity", "secrets"]
}
```

### Response Format
```json
{
  "results": {
    "injection_score": 0.85,
    "toxicity_level": "high",
    "secrets_detected": ["api_key", "password"],
    "recommendations": ["Block this prompt", "Log incident"]
  }
}
```

## Testing Examples

See `docs/prompt-examples.md` for comprehensive testing scenarios including:
- Single-aspect prompts for isolated testing
- Combined multi-input prompts for complex scenarios
- Edge cases and adversarial examples

## Security Considerations

- **Ethical Testing**: Use only for security research and improvement
- **Controlled Environment**: Test in isolated environments
- **Responsible Disclosure**: Report vulnerabilities appropriately
- **Data Privacy**: No user data is stored or transmitted

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is designed for defensive security testing and AI safety research. It should not be used for malicious purposes or to circumvent safety measures in production AI systems.