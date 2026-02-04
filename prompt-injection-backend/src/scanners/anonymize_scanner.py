from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class AnonymizeScanner(BaseScanner):
    """PII Anonymization Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Anonymize Scanner",
            description="Scans prompts for Personally Identifiable Information (PII) and anonymizes sensitive data"
        )
        self.vault = None
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Anonymize scanner with LLM Guard"""
        try:
            from llm_guard.vault import Vault
            from llm_guard.input_scanners import Anonymize
            from llm_guard.input_scanners.anonymize_helpers import BERT_LARGE_NER_CONF

            self.vault = Vault()
            self.scanner = Anonymize(
                self.vault,
                preamble="Insert before prompt",
                allowed_names=["John Doe"],
                hidden_names=["Test LLC"],
                recognizer_conf=BERT_LARGE_NER_CONF,
                language="en"
            )
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for AnonymizeScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing AnonymizeScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for PII using Anonymize scanner

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("AnonymizeScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected PII entities from the prompt"""
        if not self.available or not self.vault:
            return []

        try:
            # Get entities from vault if method exists
            if hasattr(self.vault, 'get_entities'):
                return self.vault.get_entities(prompt)
            else:
                return []
        except Exception as e:
            print(f"Error getting detected entities: {e}")
            return []