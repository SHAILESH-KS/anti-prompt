from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class SecretsScanner(BaseScanner):
    """Secrets Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Secrets Scanner",
            description="Scans prompts for secrets like API keys, tokens, and private keys"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Secrets scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Secrets

            self.scanner = Secrets(redact_mode="partial")
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for SecretsScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing SecretsScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for secrets

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("SecretsScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected secrets from the prompt"""
        # Secrets scanner doesn't provide detailed entities like anonymize
        return []