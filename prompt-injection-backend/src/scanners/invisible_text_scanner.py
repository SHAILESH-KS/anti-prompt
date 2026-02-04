from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class InvisibleTextScanner(BaseScanner):
    """Invisible Text Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Invisible Text Scanner",
            description="Scans prompts for invisible Unicode characters and removes them"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Invisible Text scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import InvisibleText

            self.scanner = InvisibleText()
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for InvisibleTextScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing InvisibleTextScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for invisible text

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("InvisibleTextScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected invisible characters from the prompt"""
        # Invisible text scanner doesn't provide detailed entities
        return []