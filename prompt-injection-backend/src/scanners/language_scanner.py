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
        self.last_detected_languages = []

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

        # Clear previous detections
        self.last_detected_languages = []
        
        # Detect languages using langdetect
        try:
            from langdetect import detect_langs
            
            # Get language detections with probabilities
            detections = detect_langs(prompt)
            
            for detection in detections:
                lang_code = detection.lang
                confidence = detection.prob
                
                self.last_detected_languages.append({
                    "language": lang_code,
                    "language_name": self._get_language_name(lang_code),
                    "confidence": round(confidence, 4),
                    "is_valid": lang_code in ["en"]
                })
                
        except Exception as e:
            print(f"Error detecting languages: {e}")
        
        # Perform the scan
        result = self.scanner.scan(prompt)
        
        return result

    def _get_language_name(self, code: str) -> str:
        """Convert language code to full name"""
        language_names = {
            "en": "English",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "ru": "Russian",
            "ja": "Japanese",
            "ko": "Korean",
            "zh": "Chinese",
            "ar": "Arabic",
            "hi": "Hindi",
            "nl": "Dutch",
            "pl": "Polish",
            "tr": "Turkish",
            "vi": "Vietnamese",
            "th": "Thai",
            "sv": "Swedish",
            "da": "Danish",
            "fi": "Finnish",
            "no": "Norwegian",
            "cs": "Czech",
            "el": "Greek",
            "he": "Hebrew",
            "id": "Indonesian",
            "ms": "Malay",
            "ro": "Romanian",
            "uk": "Ukrainian"
        }
        return language_names.get(code, code.upper())

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected language information from the prompt"""
        return self.last_detected_languages