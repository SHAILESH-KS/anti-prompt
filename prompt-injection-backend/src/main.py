from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import uvicorn
import datetime
import os

# Set model cache environment variables for consistent caching
os.environ.setdefault('TRANSFORMERS_CACHE', '/app/models/cache')
os.environ.setdefault('HF_HOME', '/app/models/hf')

from scanners.scanner_manager import scanner_manager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/scanners")
async def get_scanners():
    """Get information about all available scanners"""
    return {
        "available_scanners": scanner_manager.get_available_scanners(),
        "scanners": scanner_manager.get_all_scanners_info()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint with scanner availability"""
    return {
        "status": "healthy",
        "features": {
            "anonymize_scanner": scanner_manager.get_scanner("anonymize") is not None,
            "prompt_injection_scanner": scanner_manager.get_scanner("prompt_injection") is not None,
            "regex_scanner": scanner_manager.get_scanner("regex") is not None,
            "secrets_scanner": scanner_manager.get_scanner("secrets") is not None,
            "invisible_text_scanner": scanner_manager.get_scanner("invisible_text") is not None,
            "language_scanner": scanner_manager.get_scanner("language") is not None,
            "sentiment_scanner": scanner_manager.get_scanner("sentiment") is not None,
            "toxicity_scanner": scanner_manager.get_scanner("toxicity") is not None,
            "token_limit_scanner": scanner_manager.get_scanner("token_limit") is not None,
            "sensitive_scanner": scanner_manager.get_scanner("sensitive") is not None,
            "factual_consistency_scanner": scanner_manager.get_scanner("factual_consistency") is not None,
            "relevance_scanner": scanner_manager.get_scanner("relevance") is not None,
            "malicious_urls_scanner": scanner_manager.get_scanner("malicious_urls") is not None
        }
    }

@app.post("/scan-input")
async def scan_input(request: Dict[str, Any]):
    """
    Scan input prompt for issues using specified input scanner

    Request body should contain:
    - prompt: The text to scan (required)
    - scanner_type: Type of scanner to use (required)
    """
    prompt = request.get("prompt")
    scanner_type = request.get("scanner_type")

    if not prompt or not isinstance(prompt, str):
        raise HTTPException(
            status_code=400,
            detail="Prompt must be a non-empty string."
        )

    if not scanner_type or not isinstance(scanner_type, str):
        raise HTTPException(
            status_code=400,
            detail="Scanner type must be a non-empty string."
        )

    try:
        result = scanner_manager.scan_with_scanner(scanner_type, prompt, None)

        # Add timestamp to response
        result["timestamp"] = datetime.datetime.now().isoformat()

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Scanning failed: {str(e)}"
        )

@app.post("/scan-output")
async def scan_output(request: Dict[str, Any]):
    """
    Scan model output for issues using specified output scanner

    Request body should contain:
    - prompt: The original prompt (required)
    - model_output: The model output to scan (required)
    - scanner_type: Type of scanner to use (required)
    """
    prompt = request.get("prompt")
    model_output = request.get("model_output")
    scanner_type = request.get("scanner_type")

    if not prompt or not isinstance(prompt, str):
        raise HTTPException(
            status_code=400,
            detail="Prompt must be a non-empty string."
        )

    if not model_output or not isinstance(model_output, str):
        raise HTTPException(
            status_code=400,
            detail="Model output must be a non-empty string."
        )

    if not scanner_type or not isinstance(scanner_type, str):
        raise HTTPException(
            status_code=400,
            detail="Scanner type must be a non-empty string."
        )

    try:
        result = scanner_manager.scan_with_scanner(scanner_type, prompt, model_output)

        # Add timestamp to response
        result["timestamp"] = datetime.datetime.now().isoformat()

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Scanning failed: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )