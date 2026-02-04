from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class SentimentScanner(BaseScanner):
    """Sentiment Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Sentiment Scanner",
            description="Scans prompts for sentiment analysis and detects negative content"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Sentiment scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Sentiment

            self.scanner = Sentiment(threshold=0)
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for SentimentScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing SentimentScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for sentiment

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("SentimentScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected sentiment information from the prompt"""
        # Sentiment scanner doesn't provide detailed entities
        return []