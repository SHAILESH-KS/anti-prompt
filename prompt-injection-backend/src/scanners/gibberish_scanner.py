from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class GibberishScanner(BaseScanner):
    """Gibberish Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Gibberish Scanner",
            description="Scans prompts for gibberish or nonsensical inputs in English language text"
        )
        self.scanner = None
        self.last_detected_gibberish = []

    def initialize(self) -> bool:
        """Initialize the Gibberish scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Gibberish
            from llm_guard.input_scanners.gibberish import MatchType

            self.scanner = Gibberish(threshold=0.5, match_type=MatchType.FULL)
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for GibberishScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing GibberishScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for gibberish content

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("GibberishScanner is not available")

        # Clear previous detections
        self.last_detected_gibberish = []

        # Perform the scan
        sanitized_prompt, scanner_is_valid, risk_score = self.scanner.scan(prompt)

        # Capture gibberish analysis results
        try:
            # Try to access the classifier directly (gibberish scanner uses _classifier, not _pipeline)
            if hasattr(self.scanner, '_classifier'):
                classifier = self.scanner._classifier
                print(f"[DEBUG] Found _classifier: {type(classifier)}")
                
                # Try to use the classifier to get detailed results
                try:
                    # The classifier might be a pipeline or model
                    if hasattr(classifier, '__call__'):
                        results = classifier(prompt, return_all_scores=True, truncation=True, max_length=512)
                        print(f"[DEBUG] Classifier results: {results}")
                        
                        # Results might be nested
                        if results and isinstance(results[0], list):
                            results = results[0]
                        
                        # Convert to detected entities format
                        detected = []
                        for item in results:
                            label = item['label']
                            score = item['score']
                            
                            # Include all categories with score > 0.0001 for transparency
                            if score > 0.0001:
                                detected.append({
                                    'type': label,
                                    'score': round(score, 6),
                                    'severity': 'high' if score > 0.8 else ('medium' if score > 0.5 else 'low'),
                                    'exceeds_threshold': score > 0.5
                                })
                        
                        # Sort by score descending and take top 5
                        detected.sort(key=lambda x: x['score'], reverse=True)
                        self.last_detected_gibberish = detected[:5]
                        print(f"[DEBUG] Detected gibberish entities: {len(self.last_detected_gibberish)}")
                        
                except Exception as e2:
                    print(f"[DEBUG] Classifier call failed: {e2}")
                    
            elif hasattr(self.scanner, '_pipeline'):
                # Fallback to pipeline approach (like toxicity scanner)
                pipeline = self.scanner._pipeline
                results = pipeline(prompt, return_all_scores=True, truncation=True, max_length=512)
                
                if results and isinstance(results[0], list):
                    results = results[0]
                
                detected = []
                for item in results:
                    label = item['label']
                    score = item['score']
                    if score > 0.0001:
                        detected.append({
                            'type': label,
                            'score': round(score, 6),
                            'severity': 'high' if score > 0.8 else ('medium' if score > 0.5 else 'low'),
                            'exceeds_threshold': score > 0.5
                        })
                
                detected.sort(key=lambda x: x['score'], reverse=True)
                self.last_detected_gibberish = detected[:5]
            else:
                print(f"[DEBUG] No classifier or pipeline found in gibberish scanner")
                
        except Exception as e:
            print(f"Warning: Could not extract gibberish details: {e}")
            import traceback
            traceback.print_exc()

        # Override is_valid: only return false if high severity gibberish is detected
        has_high_severity = any(entity.get('severity') == 'high' for entity in self.last_detected_gibberish)
        is_valid = not has_high_severity

        return sanitized_prompt, is_valid, risk_score

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected gibberish content from the prompt"""
        return self.last_detected_gibberish