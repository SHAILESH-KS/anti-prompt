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

            # Comprehensive security patterns
            patterns = [
                # SQL Injection patterns
                r"(?i)(union\s+select|drop\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set)",
                r"(?i)(select\s+.+\s+from|or\s+1\s*=\s*1|and\s+1\s*=\s*1)",
                r"(?i)(exec\s*\(|execute\s+immediate|xp_cmdshell)",
                r"--\s*$|#\s*$|/\*.*\*/",  # SQL comments
                r"(?i)(';|'--|\\'|'\s+or\s+|'\s+and\s+)",
                
                # XSS patterns
                r"(?i)<script[^>]*>.*?</script>",
                r"(?i)javascript\s*:",
                r"(?i)on(error|load|click|mouseover)\s*=",
                r"(?i)<iframe[^>]*>",
                r"(?i)<embed[^>]*>",
                r"(?i)<object[^>]*>",
                
                # Command Injection patterns
                r"[;&|`$]\s*(cat|ls|pwd|wget|curl|nc|netcat|bash|sh|cmd|powershell)",
                r"(?i)(rm\s+-rf|del\s+/f|format\s+c:)",
                r"\|\s*(curl|wget|nc|netcat)",
                
                # Path Traversal patterns
                r"(\.\./){2,}",  # ../ repeated
                r"(\.\.\\){2,}",  # ..\ repeated
                r"(?i)(etc/passwd|windows/system32|boot\.ini)",
                
                # SSRF patterns
                r"(?i)(localhost|127\.0\.0\.1|0\.0\.0\.0|169\.254\.169\.254)",
                r"(?i)file:///|ftp://localhost",
                
                # NoSQL Injection patterns
                r"(?i)(\$ne|\$gt|\$lt|\$where|\$regex)",
                r"(?i)(\.match\(|\.test\(|\.exec\()",
                
                # LDAP Injection patterns
                r"\*\)\(|\)\(|\||\&",
                
                # XML/XXE patterns
                r"(?i)<!DOCTYPE[^>]*<!ENTITY",
                r"(?i)<!ENTITY[^>]*SYSTEM",
                
                # Template Injection patterns
                r"\{\{.*\}\}",  # {{}}
                r"\$\{.*\}",    # ${}
                r"<%=.*%>",     # <%= %>
                
                # Code Injection patterns
                r"(?i)(eval\s*\(|exec\s*\(|system\s*\(|passthru\s*\()",
                r"(?i)(__import__|compile\s*\()",
                
                # Bearer tokens and API keys
                r"Bearer [A-Za-z0-9-._~+/]+",
                r"(?i)(api[_-]?key|apikey|access[_-]?token)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]+['\"]?",
            ]

            self.scanner = Regex(
                patterns=patterns,
                is_blocked=True,
                match_type=MatchType.SEARCH,
                redact=False  # Don't redact, just detect
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