from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class CodeScanner(BaseScanner):
    """Code Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Code Scanner",
            description="Detects and validates code snippets in prompts across various programming languages"
        )
        self.scanner = None
        self.last_detected_code = []
        self.blocked_languages = []

    def initialize(self) -> bool:
        """Initialize the Code scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Code

            # Default: Block potentially dangerous languages
            # Language names must match exactly as specified by LLM Guard
            self.blocked_languages = [
                "PowerShell",
                "C",
                "C++",
                "ARM Assembly"
            ]
            
            self.scanner = Code(
                languages=self.blocked_languages,
                is_blocked=True,
                use_onnx=False
            )
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for CodeScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing CodeScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for code snippets

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("CodeScanner is not available")

        # Clear previous detections
        self.last_detected_code = []
        
        # Perform the scan
        result = self.scanner.scan(prompt)
        sanitized_prompt, is_valid, risk_score = result
        
        # Extract code snippets from the prompt
        try:
            import re
            
            # Detect code blocks in markdown format
            markdown_code_pattern = r'```(\w+)?\n(.*?)```'
            matches = re.findall(markdown_code_pattern, prompt, re.DOTALL)
            
            for language, code in matches:
                lang = language if language else "unknown"
                
                # Try to detect language if not specified
                if lang == "unknown":
                    lang = self._detect_language(code)
                
                is_blocked = lang in self.blocked_languages if lang != "unknown" else False
                
                self.last_detected_code.append({
                    "language": lang,
                    "code_snippet": code.strip()[:200],  # First 200 chars
                    "is_blocked": is_blocked,
                    "length": len(code)
                })
            
            # Also detect inline code
            inline_code_pattern = r'`([^`]+)`'
            inline_matches = re.findall(inline_code_pattern, prompt)
            
            for code in inline_matches:
                if len(code) > 20:  # Only consider longer inline code
                    lang = self._detect_language(code)
                    is_blocked = lang in self.blocked_languages if lang != "unknown" else False
                    
                    self.last_detected_code.append({
                        "language": lang,
                        "code_snippet": code.strip()[:200],
                        "is_blocked": is_blocked,
                        "length": len(code),
                        "type": "inline"
                    })
                    
        except Exception as e:
            print(f"Error extracting code snippets: {e}")
        
        return result

    def _detect_language(self, code: str) -> str:
        """Simple heuristic to detect programming language"""
        code_lower = code.lower().strip()
        
        # Python
        if any(keyword in code_lower for keyword in ['def ', 'import ', 'print(', 'class ', '__init__']):
            return "Python"
        
        # JavaScript/TypeScript
        if any(keyword in code_lower for keyword in ['function ', 'const ', 'let ', 'var ', '=>', 'console.log']):
            return "JavaScript"
        
        # Java
        if any(keyword in code_lower for keyword in ['public class', 'private ', 'public static void main']):
            return "Java"
        
        # C/C++
        if any(keyword in code_lower for keyword in ['#include', 'int main(', 'printf(', 'cout <<']):
            return "C++"
        
        # Go
        if any(keyword in code_lower for keyword in ['package main', 'func ', 'fmt.print']):
            return "Go"
        
        # Rust
        if any(keyword in code_lower for keyword in ['fn ', 'let mut', 'impl ', 'println!']):
            return "Rust"
        
        # SQL
        if any(keyword in code_lower for keyword in ['select ', 'from ', 'where ', 'insert into', 'update ']):
            return "SQL"
        
        # PowerShell
        if any(keyword in code_lower for keyword in ['$_', 'get-', 'set-', 'write-host', 'foreach-object']):
            return "PowerShell"
        
        # Bash/Shell
        if any(keyword in code_lower for keyword in ['#!/bin/bash', 'echo ', 'chmod ', 'mkdir ']):
            return "Bash"
        
        return "unknown"

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected code snippets from the prompt"""
        return self.last_detected_code
