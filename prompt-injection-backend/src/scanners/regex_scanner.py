from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class RegexScanner(BaseScanner):
    """Regex Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Regex Scanner",
            description="Scans prompts for patterns defined by regular expressions"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Regex scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Regex
            from llm_guard.input_scanners.regex import MatchType

            self.scanner = Regex(
                patterns=[r"Bearer [A-Za-z0-9-._~+/]+"],  # Example pattern for tokens
                is_blocked=True,
                match_type=MatchType.SEARCH,
                redact=True
            )
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for RegexScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing RegexScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for regex patterns

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("RegexScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected pattern matches from the prompt"""
        # Regex scanner doesn't provide detailed entities like anonymize
        return []