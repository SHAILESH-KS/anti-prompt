from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class PromptInjectionScanner(BaseScanner):
    """Prompt Injection Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Prompt Injection Scanner",
            description="Scans prompts for prompt injection attacks targeting large language models"
        )
        self.scanner = None

    def initialize(self) -> bool:
        """Initialize the Prompt Injection scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import PromptInjection
            from llm_guard.input_scanners.prompt_injection import MatchType

            self.scanner = PromptInjection(threshold=0.5, match_type=MatchType.FULL)
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for PromptInjectionScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing PromptInjectionScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for prompt injection attacks

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("PromptInjectionScanner is not available")

        return self.scanner.scan(prompt)

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected injection indicators from the prompt"""
        # Prompt injection scanner doesn't provide detailed entities like anonymize
        return []