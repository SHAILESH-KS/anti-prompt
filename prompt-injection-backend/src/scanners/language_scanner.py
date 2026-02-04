from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class LanguageScanner(BaseScanner):
    """Language Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Language Scanner",
            description="Scans prompts for language authenticity and detects non-English content"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Language scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Language
            from llm_guard.input_scanners.language import MatchType

            self.scanner = Language(valid_languages=["en"], match_type=MatchType.FULL)
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for LanguageScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing LanguageScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for language authenticity

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("LanguageScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected language information from the prompt"""
        # Language scanner doesn't provide detailed entities
        return []