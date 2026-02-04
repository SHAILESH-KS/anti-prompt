from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class SensitiveScanner(BaseScanner):
    """Sensitive Scanner using LLM Guard (Output Scanner)"""

    def __init__(self):
        super().__init__(
            name="Sensitive Scanner",
            description="Scans model outputs for sensitive information and PII"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Sensitive scanner with LLM Guard"""
        try:
            from llm_guard.output_scanners import Sensitive

            self.scanner = Sensitive(entity_types=["PERSON", "EMAIL"], redact=True)
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for SensitiveScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing SensitiveScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str, model_output: str) -> Tuple[str, bool, float]:
        """
        Scan the model output for sensitive information

        Args:
            prompt: The input prompt
            model_output: The model output to scan

        Returns:
            Tuple of (sanitized_output, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("SensitiveScanner is not available")

        return self.scanner.scan(prompt, model_output)

    def get_detected_entities(self, model_output: str) -> List[Dict[str, Any]]:
        """Get detected sensitive entities from the model output"""
        # Sensitive scanner doesn't provide detailed entities like anonymize
        return []