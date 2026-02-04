from typing import Dict, Any, List, Optional
import numpy as np
from .base_scanner import BaseScanner
from .anonymize_scanner import AnonymizeScanner
from .prompt_injection_scanner import PromptInjectionScanner
from .regex_scanner import RegexScanner
from .secrets_scanner import SecretsScanner
from .invisible_text_scanner import InvisibleTextScanner
from .language_scanner import LanguageScanner
from .toxicity_scanner import ToxicityScanner
from .factual_consistency_scanner import FactualConsistencyScanner
from .relevance_scanner import RelevanceScanner
from .malicious_urls_scanner import MaliciousURLsScanner
from .ban_topics_scanner import BanTopicsScanner
from .code_scanner import CodeScanner
from .gibberish_scanner import GibberishScanner


def convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj


class ScannerManager:
    """Manager for loading and managing different input scanners"""

    def __init__(self):
        self.scanners: Dict[str, BaseScanner] = {}
        self._load_scanners()

    def _load_scanners(self):
        """Load all available scanners"""
        # Load Anonymize Scanner
        anonymize_scanner = AnonymizeScanner()
        if anonymize_scanner.initialize():
            self.scanners["anonymize"] = anonymize_scanner
            print("✓ Anonymize Scanner loaded successfully")
        else:
            print("✗ Anonymize Scanner failed to load")

        # Load Prompt Injection Scanner
        prompt_injection_scanner = PromptInjectionScanner()
        if prompt_injection_scanner.initialize():
            self.scanners["prompt_injection"] = prompt_injection_scanner
            print("✓ Prompt Injection Scanner loaded successfully")
        else:
            print("✗ Prompt Injection Scanner failed to load")

        # Load Regex Scanner
        regex_scanner = RegexScanner()
        if regex_scanner.initialize():
            self.scanners["regex"] = regex_scanner
            print("✓ Regex Scanner loaded successfully")
        else:
            print("✗ Regex Scanner failed to load")

        # Load Secrets Scanner
        secrets_scanner = SecretsScanner()
        if secrets_scanner.initialize():
            self.scanners["secrets"] = secrets_scanner
            print("✓ Secrets Scanner loaded successfully")
        else:
            print("✗ Secrets Scanner failed to load")

        # Load Invisible Text Scanner
        invisible_text_scanner = InvisibleTextScanner()
        if invisible_text_scanner.initialize():
            self.scanners["invisible_text"] = invisible_text_scanner
            print("✓ Invisible Text Scanner loaded successfully")
        else:
            print("✗ Invisible Text Scanner failed to load")

        # Load Language Scanner
        language_scanner = LanguageScanner()
        if language_scanner.initialize():
            self.scanners["language"] = language_scanner
            print("✓ Language Scanner loaded successfully")
        else:
            print("✗ Language Scanner failed to load")

        # Load Toxicity Scanner
        toxicity_scanner = ToxicityScanner()
        if toxicity_scanner.initialize():
            self.scanners["toxicity"] = toxicity_scanner
            print("✓ Toxicity Scanner loaded successfully")
        else:
            print("✗ Toxicity Scanner failed to load")

        # Load Gibberish Scanner
        gibberish_scanner = GibberishScanner()
        if gibberish_scanner.initialize():
            self.scanners["gibberish"] = gibberish_scanner
            print("✓ Gibberish Scanner loaded successfully")
        else:
            print("✗ Gibberish Scanner failed to load")

        # Load Ban Topics Scanner
        ban_topics_scanner = BanTopicsScanner()
        if ban_topics_scanner.initialize():
            self.scanners["ban_topics"] = ban_topics_scanner
            print("✓ Ban Topics Scanner loaded successfully")
        else:
            print("✗ Ban Topics Scanner failed to load")

        # Load Code Scanner
        code_scanner = CodeScanner()
        if code_scanner.initialize():
            self.scanners["code"] = code_scanner
            print("✓ Code Scanner loaded successfully")
        else:
            print("✗ Code Scanner failed to load")

        # Load Factual Consistency Scanner
        factual_consistency_scanner = FactualConsistencyScanner()
        if factual_consistency_scanner.initialize():
            self.scanners["factual_consistency"] = factual_consistency_scanner
            print("✓ Factual Consistency Scanner loaded successfully")
        else:
            print("✗ Factual Consistency Scanner failed to load")

        # Load Relevance Scanner
        relevance_scanner = RelevanceScanner()
        if relevance_scanner.initialize():
            self.scanners["relevance"] = relevance_scanner
            print("✓ Relevance Scanner loaded successfully")
        else:
            print("✗ Relevance Scanner failed to load")

        # Load Malicious URLs Scanner
        malicious_urls_scanner = MaliciousURLsScanner()
        if malicious_urls_scanner.initialize():
            self.scanners["malicious_urls"] = malicious_urls_scanner
            print("✓ Malicious URLs Scanner loaded successfully")
        else:
            print("✗ Malicious URLs Scanner failed to load")

    def get_scanner(self, scanner_type: str) -> Optional[BaseScanner]:
        """Get a scanner by type"""
        return self.scanners.get(scanner_type.lower())

    def get_available_scanners(self) -> List[str]:
        """Get list of available scanner types"""
        return list(self.scanners.keys())

    def get_scanner_info(self, scanner_type: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific scanner"""
        scanner = self.get_scanner(scanner_type)
        if scanner:
            return scanner.get_info()
        return None

    def get_all_scanners_info(self) -> List[Dict[str, Any]]:
        """Get information about all scanners"""
        return [scanner.get_info() for scanner in self.scanners.values()]

    def scan_with_scanner(self, scanner_type: str, prompt: str, model_output: str = None) -> Dict[str, Any]:
        """Scan a prompt with a specific scanner"""
        scanner = self.get_scanner(scanner_type)
        if not scanner:
            raise ValueError(f"Scanner type '{scanner_type}' not found or not available")

        if not scanner.is_available():
            raise RuntimeError(f"Scanner '{scanner_type}' is not available")

        try:
            if model_output is not None:
                # Output scanner
                sanitized_output, is_valid, risk_score = scanner.scan(prompt, model_output)
                detected_entities = scanner.get_detected_entities(model_output)
                result = {
                    "scanner_type": scanner_type,
                    "prompt": prompt,
                    "model_output": model_output,
                    "sanitized_output": sanitized_output,
                    "is_valid": is_valid,
                    "risk_score": risk_score,
                    "detected_entities": detected_entities,
                    "scanner_info": scanner.get_info()
                }
                return convert_numpy_types(result)
            else:
                # Input scanner
                sanitized_prompt, is_valid, risk_score = scanner.scan(prompt)
                detected_entities = scanner.get_detected_entities(prompt)
                result = {
                    "scanner_type": scanner_type,
                    "sanitized_prompt": sanitized_prompt,
                    "is_valid": is_valid,
                    "risk_score": risk_score,
                    "detected_entities": detected_entities,
                    "scanner_info": scanner.get_info()
                }
                return convert_numpy_types(result)
        except Exception as e:
            raise RuntimeError(f"Scan failed with scanner '{scanner_type}': {str(e)}")


# Global scanner manager instance
scanner_manager = ScannerManager()