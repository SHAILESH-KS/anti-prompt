import os

# Set model cache environment variables BEFORE any imports
if os.name == 'nt':  # Windows
    cache_dir = os.path.join(os.getcwd(), 'models', 'cache')
    hf_dir = os.path.join(os.getcwd(), 'models', 'hf')
    os.environ.setdefault('TRANSFORMERS_CACHE', cache_dir)
    os.environ.setdefault('HF_HOME', hf_dir)
else:  # Docker/Linux
    os.environ.setdefault('TRANSFORMERS_CACHE', '/app/models/cache')
    os.environ.setdefault('HF_HOME', '/app/models/hf')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import uvicorn
import datetime

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
            "toxicity_scanner": scanner_manager.get_scanner("toxicity") is not None,
            "gibberish_scanner": scanner_manager.get_scanner("gibberish") is not None,
            "ban_topics_scanner": scanner_manager.get_scanner("ban_topics") is not None,
            "code_scanner": scanner_manager.get_scanner("code") is not None,
            "sensitive_scanner": scanner_manager.get_scanner("sensitive") is not None,
            "factual_consistency_scanner": scanner_manager.get_scanner("factual_consistency") is not None,
            "relevance_scanner": scanner_manager.get_scanner("relevance") is not None,
            "malicious_urls_scanner": scanner_manager.get_scanner("malicious_urls") is not None
        }
    }

@app.post("/scan-all")
async def scan_all(request: Dict[str, Any]):
    """
    Scan input prompt through all available input scanners sequentially

    Request body should contain:
    - prompt: The text to scan (required)

    Returns comprehensive results from all scanners with final modified prompt
    """
    prompt = request.get("prompt")

    if not prompt or not isinstance(prompt, str):
        raise HTTPException(
            status_code=400,
            detail="Prompt must be a non-empty string."
        )

    try:
        # Get all available scanners
        available_scanners = scanner_manager.get_available_scanners()

        # Define the order of input scanners only (10 scanners)
        input_scanners = [
            "anonymize",
            "prompt_injection", 
            "regex",
            "secrets",
            "invisible_text",
            "language",
            "toxicity",
            "gibberish",
            "ban_topics",
            "code"
        ]

        # Filter to only available scanners and maintain order
        scanners_to_run = [s for s in input_scanners if s in available_scanners]

        results = []
        current_prompt = prompt
        overall_valid = True
        max_risk_score = -1.0
        all_detected_entities = []

        # Run each scanner sequentially, passing the sanitized output to the next
        for scanner_type in scanners_to_run:
            try:
                result = scanner_manager.scan_with_scanner(scanner_type, current_prompt, None)

                # Update current prompt with sanitized version for next scanner
                current_prompt = result["sanitized_prompt"]

                # Track overall validity and risk score
                if not result["is_valid"]:
                    overall_valid = False
                max_risk_score = max(max_risk_score, result["risk_score"])

                # Collect detected entities
                if result["detected_entities"]:
                    all_detected_entities.extend(result["detected_entities"])

                # Add scanner result
                results.append({
                    "scanner_type": scanner_type,
                    "sanitized_prompt": result["sanitized_prompt"],
                    "is_valid": result["is_valid"],
                    "risk_score": result["risk_score"],
                    "detected_entities": result["detected_entities"],
                    "scanner_info": result["scanner_info"]
                })

            except Exception as e:
                # If a scanner fails, log the error but continue with others
                results.append({
                    "scanner_type": scanner_type,
                    "error": str(e),
                    "sanitized_prompt": current_prompt,  # Keep current prompt
                    "is_valid": True,  # Assume valid if scanner fails
                    "risk_score": 0.0,
                    "detected_entities": [],
                    "scanner_info": scanner_manager.get_scanner_info(scanner_type) or {}
                })

        # Return comprehensive response
        return {
            "original_prompt": prompt,
            "final_prompt": current_prompt,
            "overall_valid": overall_valid,
            "max_risk_score": max_risk_score,
            "scanners_run": len(results),
            "scanner_results": results,
            "all_detected_entities": all_detected_entities,
            "summary": {
                "total_scanners": len(results),
                "failed_scanners": len([r for r in results if "error" in r]),
                "invalid_results": len([r for r in results if not r.get("is_valid", True)]),
                "total_entities_detected": len(all_detected_entities)
            },
            "timestamp": datetime.datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Comprehensive scanning failed: {str(e)}"
        )

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