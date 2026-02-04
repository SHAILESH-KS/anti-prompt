from typing import Dict, Any, Tuple, List
import re
from .base_scanner import BaseScanner


class SecretsScanner(BaseScanner):
    """Secrets Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Secrets Scanner",
            description="Scans prompts for secrets like API keys, tokens, and private keys"
        )
        self.scanner = None
        self.last_detected_entities = []
        self.last_prompt = None

    def initialize(self) -> bool:
        """Initialize the Secrets scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Secrets

            self.scanner = Secrets(redact_mode="partial")
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for SecretsScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing SecretsScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for secrets

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("SecretsScanner is not available")

        self.last_prompt = prompt
        self.last_detected_entities = []
        
        sanitized_prompt, is_valid, risk_score = self.scanner.scan(prompt)
        
        # If secrets were detected (sanitized_prompt differs from original)
        if sanitized_prompt != prompt:
            # Find differences between original and sanitized to detect secrets
            entities = self._extract_secrets(prompt, sanitized_prompt)
            self.last_detected_entities = entities
        
        return sanitized_prompt, is_valid, risk_score

    def _extract_secrets(self, original: str, sanitized: str) -> List[Dict[str, Any]]:
        """Extract detected secrets by comparing original and sanitized text"""
        entities = []
        
        # Find all redacted patterns in the sanitized text
        # Partial redaction creates patterns like "sk..xy" or "gh..ab"
        redacted_pattern = r'\b\w{2,}\.\.\w{2,}\b'
        redacted_matches = list(re.finditer(redacted_pattern, sanitized))
        
        for match in redacted_matches:
            redacted_text = match.group()
            start_pos = match.start()
            
            # Try to find the original secret in the original prompt
            # by matching the positions and context
            prefix = redacted_text.split('..')[0]
            suffix = redacted_text.split('..')[-1]
            
            # Search for patterns that start with prefix and end with suffix
            original_pattern = re.escape(prefix) + r'[^\s]*' + re.escape(suffix)
            original_match = re.search(original_pattern, original)
            
            if original_match:
                original_secret = original_match.group()
                secret_type = self._identify_secret_type(original_secret)
                
                entities.append({
                    "type": secret_type,
                    "start": original_match.start(),
                    "end": original_match.end(),
                    "original_value": original_secret,
                    "redacted_value": redacted_text
                })
        
        return entities

    def _identify_secret_type(self, secret: str) -> str:
        """Identify the type of secret based on patterns"""
        secret_lower = secret.lower()
        
        # AWS Keys
        if secret.startswith('AKIA'):
            return "AWS_ACCESS_KEY"
        if len(secret) == 40 and secret.startswith(('wJalr', 'aws')):
            return "AWS_SECRET_KEY"
        
        # GitHub Tokens
        if secret.startswith('ghp_'):
            return "GITHUB_TOKEN"
        if secret.startswith('gho_'):
            return "GITHUB_OAUTH_TOKEN"
        if secret.startswith('ghs_'):
            return "GITHUB_APP_TOKEN"
        
        # API Keys
        if secret.startswith('sk-') or secret.startswith('sk_'):
            return "API_KEY"
        
        # JWT
        if secret.count('.') == 2 and len(secret) > 100:
            return "JWT_TOKEN"
        
        # Docker
        if secret.startswith('dckr_pat_'):
            return "DOCKER_TOKEN"
        
        # NPM
        if secret.startswith('npm_'):
            return "NPM_TOKEN"
        
        # Slack
        if 'hooks.slack.com' in secret_lower:
            return "SLACK_WEBHOOK"
        
        # Stripe
        if secret.startswith('sk_live_') or secret.startswith('sk_test_'):
            return "STRIPE_KEY"
        
        # SendGrid
        if secret.startswith('SG.'):
            return "SENDGRID_KEY"
        
        # SSH Keys
        if 'BEGIN' in secret and 'PRIVATE KEY' in secret:
            return "PRIVATE_KEY"
        
        # Generic patterns
        if 'password' in secret_lower or 'passwd' in secret_lower:
            return "PASSWORD"
        if 'token' in secret_lower:
            return "TOKEN"
        if 'key' in secret_lower:
            return "API_KEY"
        
        return "SECRET"

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected secrets from the prompt"""
        return self.last_detected_entities