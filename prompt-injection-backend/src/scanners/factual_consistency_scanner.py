from typing import Dict, Any, List
from llm_guard.output_scanners import FactualConsistency
from .base_scanner import BaseScanner

class FactualConsistencyScanner(BaseScanner):
    """
    Factual Consistency Scanner for detecting contradictions between prompt and model output.
    Uses NLI models to check if the output contradicts the input prompt.
    """

    def __init__(self):
        super().__init__(
            name="Factual Consistency Scanner",
            description="Scans for factual consistency between prompt and model output"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Factual Consistency scanner"""
        try:
            self.scanner = FactualConsistency(minimum_score=0.7)
            print("Factual Consistency Scanner initialized successfully")
            self.available = True
            return True
        except Exception as e:
            print(f"Failed to initialize Factual Consistency Scanner: {e}")
            self.scanner = None
            self.available = False
            return False

    def scan(self, prompt, model_output=None):
        """
        Scan the model output for factual consistency with the prompt.

        Args:
            prompt (str): The original prompt
            model_output (str): The model output to scan

        Returns:
            dict: Scan results with sanitized_output, is_valid, risk_score, and detected_entities
        """
        if self.scanner is None:
            raise RuntimeError("Factual Consistency Scanner not initialized")

        if model_output is None:
            raise ValueError("Model output is required for Factual Consistency scanning")

        try:
            # The scanner expects prompt as premise and model_output as the text to check
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
            raise RuntimeError(f"Factual Consistency scanning failed: {str(e)}")

    def get_detected_entities(self, text: str) -> List[Dict[str, Any]]:
        """Return information about detected entities (none for this scanner)"""
        return []
