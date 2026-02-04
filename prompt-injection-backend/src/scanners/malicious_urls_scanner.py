from typing import Dict, Any, List
from llm_guard.output_scanners import MaliciousURLs
from .base_scanner import BaseScanner

class MaliciousURLsScanner(BaseScanner):
    """
    Malicious URLs Scanner for detecting harmful URLs in model output.
    Uses ML model to identify phishing and malware websites.
    """

    def __init__(self):
        super().__init__(
            name="Malicious URLs Scanner",
            description="Scans for malicious URLs in model output"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Malicious URLs scanner"""
        try:
            self.scanner = MaliciousURLs(threshold=0.7)
            print("Malicious URLs Scanner initialized successfully")
            self.available = True
            return True
        except Exception as e:
            print(f"Failed to initialize Malicious URLs Scanner: {e}")
            self.scanner = None
            self.available = False
            return False

    def scan(self, prompt, model_output=None):
        """
        Scan the model output for malicious URLs.

        Args:
            prompt (str): The original prompt
            model_output (str): The model output to scan

        Returns:
            dict: Scan results with sanitized_output, is_valid, risk_score, and detected_entities
        """
        if self.scanner is None:
            raise RuntimeError("Malicious URLs Scanner not initialized")

        if model_output is None:
            raise ValueError("Model output is required for Malicious URLs scanning")

        try:
            # The scanner detects malicious URLs in the model_output
            result = self.scanner.scan(prompt, model_output)
            
            # Handle different return formats from LLMGuard
            if isinstance(result, dict):
                sanitized_output = result.get("sanitized_output", model_output)
                is_valid = result.get("is_valid", True)
                risk_score = result.get("risk_score", 0.0)
            elif isinstance(result, (list, tuple)):
                if len(result) >= 3:
                    sanitized_output, is_valid, risk_score = result[0], result[1], result[2]
                else:
                    # Fallback if unexpected format
                    sanitized_output = model_output
                    is_valid = True
                    risk_score = 0.0
            else:
                # Fallback for unexpected return type
                sanitized_output = model_output
                is_valid = True
                risk_score = 0.0

            return sanitized_output, is_valid, risk_score

        except Exception as e:
            raise RuntimeError(f"Malicious URLs scanning failed: {str(e)}")

    def get_detected_entities(self, text: str) -> List[Dict[str, Any]]:
        """Return information about detected entities (none for this scanner)"""
        return []