from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class ToxicityScanner(BaseScanner):
    """Toxicity Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Toxicity Scanner",
            description="Scans prompts for toxic content and offensive language"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Toxicity scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Toxicity
            from llm_guard.input_scanners.toxicity import MatchType

            self.scanner = Toxicity(threshold=0.5, match_type=MatchType.SENTENCE)
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for ToxicityScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing ToxicityScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for toxicity

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("ToxicityScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected toxic content from the prompt"""
        # Toxicity scanner doesn't provide detailed entities
        return []