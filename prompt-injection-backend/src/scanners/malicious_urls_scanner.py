from typing import Dict, Any, List
from llm_guard.output_scanners import MaliciousURLs
from .base_scanner import BaseScanner

class MaliciousURLsScanner(BaseScanner):
    """
    Malicious URLs Scanner for detecting harmful URLs in model output.
    Uses ML model to identify phishing and malware websites.
    """

    def __init__(self):
        super().__init__(
            name="Malicious URLs Scanner",
            description="Scans for malicious URLs in model output"
        )
        self.scanner = None
        self.last_detected_urls = []

    def initialize(self) -> bool:
        """Initialize the Malicious URLs scanner"""
        try:
            self.scanner = MaliciousURLs(threshold=0.7)
            print("Malicious URLs Scanner initialized successfully")
            self.available = True
            return True
        except Exception as e:
            print(f"Failed to initialize Malicious URLs Scanner: {e}")
            self.scanner = None
            self.available = False
            return False

    def scan(self, prompt, model_output=None):
        """
        Scan the model output for malicious URLs.

        Args:
            prompt (str): The original prompt
            model_output (str): The model output to scan

        Returns:
            dict: Scan results with sanitized_output, is_valid, risk_score, and detected_entities
        """
        if self.scanner is None:
            raise RuntimeError("Malicious URLs Scanner not initialized")

        if model_output is None:
            raise ValueError("Model output is required for Malicious URLs scanning")

        # Clear previous detections
        self.last_detected_urls = []

        try:
            # The scanner detects malicious URLs in the model_output
            result = self.scanner.scan(prompt, model_output)
            
            # Try to extract URL analysis details
            try:
                import re
                from urllib.parse import urlparse
                
                # Extract URLs from model_output
                url_pattern = r'https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?'
                urls = re.findall(url_pattern, model_output)
                
                if urls:
                    # Try to get detailed analysis from the scanner
                    if hasattr(self.scanner, '_classifier') or hasattr(self.scanner, '_pipeline'):
                        classifier = getattr(self.scanner, '_classifier', None) or getattr(self.scanner, '_pipeline', None)
                        
                        if classifier:
                            for url in urls:
                                try:
                                    # Analyze each URL
                                    results = classifier(url, return_all_scores=True, truncation=True, max_length=512)
                                    
                                    if results and isinstance(results[0], list):
                                        results = results[0]
                                    
                                    # Convert to detected entities format
                                    url_analysis = {
                                        'url': url,
                                        'domain': urlparse(url).netloc,
                                        'classifications': []
                                    }
                                    
                                    for item in results:
                                        label = item['label']
                                        score = item['score']
                                        
                                        url_analysis['classifications'].append({
                                            'type': label,
                                            'score': round(score, 6),
                                            'severity': 'high' if score > 0.7 else ('medium' if score > 0.5 else 'low'),
                                            'is_malicious': score > 0.5
                                        })
                                    
                                    # Sort classifications by score
                                    url_analysis['classifications'].sort(key=lambda x: x['score'], reverse=True)
                                    
                                    self.last_detected_urls.append(url_analysis)
                                    
                                except Exception as e:
                                    print(f"Error analyzing URL {url}: {e}")
                                    # Fallback: basic URL info
                                    self.last_detected_urls.append({
                                        'url': url,
                                        'domain': urlparse(url).netloc,
                                        'classifications': [{
                                            'type': 'unknown',
                                            'score': 0.0,
                                            'severity': 'low',
                                            'is_malicious': False
                                        }]
                                    })
                        else:
                            # Fallback: basic URL extraction without analysis
                            for url in urls:
                                self.last_detected_urls.append({
                                    'url': url,
                                    'domain': urlparse(url).netloc,
                                    'classifications': [{
                                        'type': 'basic_detection',
                                        'score': 0.0,
                                        'severity': 'low',
                                        'is_malicious': False
                                    }]
                                })
                    else:
                        # Basic URL extraction
                        for url in urls:
                            self.last_detected_urls.append({
                                'url': url,
                                'domain': urlparse(url).netloc,
                                'classifications': [{
                                    'type': 'basic_detection',
                                    'score': 0.0,
                                    'severity': 'low',
                                    'is_malicious': False
                                }]
                            })
                            
            except Exception as e:
                print(f"Warning: Could not extract URL analysis details: {e}")
            
            # Handle different return formats from LLMGuard
            if isinstance(result, dict):
                sanitized_output = result.get("sanitized_output", model_output)
                is_valid = result.get("is_valid", True)
                risk_score = result.get("risk_score", 0.0)
            elif isinstance(result, (list, tuple)):
                if len(result) >= 3:
                    sanitized_output, is_valid, risk_score = result[0], result[1], result[2]
                else:
                    # Fallback if unexpected format
                    sanitized_output = model_output
                    is_valid = True
                    risk_score = 0.0
            else:
                # Fallback for unexpected return type
                sanitized_output = model_output
                is_valid = True
                risk_score = 0.0

            return sanitized_output, is_valid, risk_score

        except Exception as e:
            raise RuntimeError(f"Malicious URLs scanning failed: {str(e)}")

    def get_detected_entities(self, text: str) -> List[Dict[str, Any]]:
        """Return information about detected entities (none for this scanner)"""
        return self.last_detected_urls