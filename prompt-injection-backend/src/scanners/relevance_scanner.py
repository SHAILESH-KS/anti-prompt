from typing import Dict, Any, List
from llm_guard.output_scanners import Relevance
from .base_scanner import BaseScanner

class RelevanceScanner(BaseScanner):
    """
    Relevance Scanner for ensuring output remains relevant to the input prompt.
    Uses embedding similarity to measure contextual relevance.
    """

    def __init__(self):
        super().__init__(
            name="Relevance Scanner",
            description="Scans for relevance between prompt and model output"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Relevance scanner"""
        try:
            self.scanner = Relevance(threshold=0.5)
            print("Relevance Scanner initialized successfully")
            self.available = True
            return True
        except Exception as e:
            print(f"Failed to initialize Relevance Scanner: {e}")
            self.scanner = None
            self.available = False
            return False

    def scan(self, prompt, model_output=None):
        """
        Scan the model output for relevance to the prompt.

        Args:
            prompt (str): The original prompt
            model_output (str): The model output to scan

        Returns:
            dict: Scan results with sanitized_output, is_valid, risk_score, and detected_entities
        """
        if self.scanner is None:
            raise RuntimeError("Relevance Scanner not initialized")

        if model_output is None:
            raise ValueError("Model output is required for Relevance scanning")

        try:
            # The scanner checks relevance between prompt and model_output
            sanitized_output, is_valid, risk_score = self.scanner.scan(prompt, model_output)

            # For output scanners, we return sanitized_output instead of sanitized_prompt
            detected_entities = []

            return {
                "sanitized_output": sanitized_output,
                "is_valid": is_valid,
                "risk_score": risk_score,
                "detected_entities": detected_entities
            }

        except Exception as e:
            raise RuntimeError(f"Relevance scanning failed: {str(e)}")

    def get_detected_entities(self, text: str) -> List[Dict[str, Any]]:
        """Return information about detected entities (none for this scanner)"""
        return []