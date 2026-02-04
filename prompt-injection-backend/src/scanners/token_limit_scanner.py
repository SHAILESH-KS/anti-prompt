from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class TokenLimitScanner(BaseScanner):
    """Token Limit Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Token Limit Scanner",
            description="Scans prompts for token count limits to prevent resource exhaustion"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Token Limit scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import TokenLimit

            self.scanner = TokenLimit(limit=4096, encoding_name="cl100k_base")
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for TokenLimitScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing TokenLimitScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for token limit

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("TokenLimitScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected token information from the prompt"""
        # Token limit scanner doesn't provide detailed entities
        return []