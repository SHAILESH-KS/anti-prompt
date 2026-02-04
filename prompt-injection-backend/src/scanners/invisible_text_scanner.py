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
        self.last_detected_chars = []

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

        # Clear previous detections
        self.last_detected_chars = []
        
        # Detect invisible characters before scanning
        invisible_chars_map = {
            '\u200B': 'Zero-Width Space',
            '\u200C': 'Zero-Width Non-Joiner',
            '\u200D': 'Zero-Width Joiner',
            '\u200E': 'Left-to-Right Mark',
            '\u200F': 'Right-to-Left Mark',
            '\u202A': 'Left-to-Right Embedding',
            '\u202B': 'Right-to-Left Embedding',
            '\u202C': 'Pop Directional Formatting',
            '\u202D': 'Left-to-Right Override',
            '\u202E': 'Right-to-Left Override',
            '\u2060': 'Word Joiner',
            '\u2061': 'Function Application',
            '\u2062': 'Invisible Times',
            '\u2063': 'Invisible Separator',
            '\u2064': 'Invisible Plus',
            '\uFEFF': 'Zero-Width No-Break Space',
            '\u180E': 'Mongolian Vowel Separator'
        }
        
        # Track found invisible characters
        found_chars = {}
        
        for i, char in enumerate(prompt):
            if char in invisible_chars_map:
                char_name = invisible_chars_map[char]
                if char not in found_chars:
                    found_chars[char] = {
                        'char': char,
                        'name': char_name,
                        'unicode': f'U+{ord(char):04X}',
                        'positions': [],
                        'count': 0
                    }
                found_chars[char]['positions'].append(i)
                found_chars[char]['count'] += 1
        
        # Convert to list of entities (use unicode escape for JSON serialization)
        for char_data in found_chars.values():
            self.last_detected_chars.append({
                'character': f"\\u{ord(char_data['char']):04x}",
                'name': char_data['name'],
                'unicode': char_data['unicode'],
                'count': char_data['count'],
                'positions': char_data['positions'][:10]  # First 10 positions
            })
        
        print(f"DEBUG: Found {len(self.last_detected_chars)} invisible characters")
        print(f"DEBUG: last_detected_chars = {self.last_detected_chars}")
        
        # Perform the scan
        result = self.scanner.scan(prompt)
        
        return result

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected invisible characters from the prompt"""
        print(f"DEBUG get_detected_entities: Returning {len(self.last_detected_chars)} entities")
        print(f"DEBUG get_detected_entities: last_detected_chars = {self.last_detected_chars}")
        return self.last_detected_chars