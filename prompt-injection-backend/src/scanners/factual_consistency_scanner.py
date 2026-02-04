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
            raise RuntimeError(f"Factual Consistency scanning failed: {str(e)}")

    def get_detected_entities(self, text: str) -> List[Dict[str, Any]]:
        """Return information about detected entities (none for this scanner)"""
        return []
