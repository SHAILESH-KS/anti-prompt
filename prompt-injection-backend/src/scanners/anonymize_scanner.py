from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class AnonymizeScanner(BaseScanner):
    """PII Anonymization Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Anonymize Scanner",
            description="Scans prompts for Personally Identifiable Information (PII) and anonymizes sensitive data"
        )
        self.vault = None
        self.scanner = None
        self.last_detected_entities = []  # Store detected entities from last scan

    def initialize(self) -> bool:
        """Initialize the Anonymize scanner with LLM Guard"""
        try:
            from llm_guard.vault import Vault
            from llm_guard.input_scanners import Anonymize
            from llm_guard.input_scanners.anonymize_helpers import BERT_LARGE_NER_CONF

            self.vault = Vault()
            self.scanner = Anonymize(
                self.vault,
                preamble="Insert before prompt",
                allowed_names=["John Doe"],
                hidden_names=["Test LLC"],
                recognizer_conf=BERT_LARGE_NER_CONF,
                language="en"
            )
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for AnonymizeScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing AnonymizeScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for PII using Anonymize scanner

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("AnonymizeScanner is not available")

        # Clear previous entities and vault
        self.last_detected_entities = []
        
        # Scan the prompt
        result = self.scanner.scan(prompt)
        
        # Extract entities from the vault
        vault_tuples = self.vault.get()
        
        # Convert vault tuples to entity format
        entities = []
        for vault_tuple in vault_tuples:
            # Vault stores tuples dynamically - handle any tuple format
            if not vault_tuple or len(vault_tuple) < 2:
                continue
                
            # First element is always the placeholder, second is the original value
            placeholder = vault_tuple[0]
            original_value = vault_tuple[1]
            
            # Extract entity type from placeholder
            # [REDACTED_EMAIL_ADDRESS_1] -> EMAIL_ADDRESS
            import re
            entity_type_match = re.search(r'\[REDACTED_(.+?)_\d+\]', placeholder)
            entity_type = entity_type_match.group(1) if entity_type_match else "UNKNOWN"
            
            # Find the position of the original value in the prompt
            start = prompt.find(original_value)
            if start != -1:
                entity_dict = {
                    "type": entity_type,
                    "original_value": original_value,
                    "placeholder": placeholder,
                    "start": start,
                    "end": start + len(original_value)
                }
                
                # Add any additional fields from the tuple dynamically
                if len(vault_tuple) > 2:
                    for i, value in enumerate(vault_tuple[2:], start=2):
                        entity_dict[f"field_{i}"] = value
                
                entities.append(entity_dict)
        
        self.last_detected_entities = entities
        
        return result

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected PII entities from the prompt"""
        # Return entities detected during the last scan
        return self.last_detected_entities