from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class ToxicityScanner(BaseScanner):
    """Toxicity Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Toxicity Scanner",
            description="Scans prompts for toxic content and offensive language"
        )
        self.scanner = None
        self.last_detected_toxicity = []

    def initialize(self) -> bool:
        """Initialize the Toxicity scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import Toxicity
            from llm_guard.input_scanners.toxicity import MatchType

            self.scanner = Toxicity(threshold=0.5, match_type=MatchType.SENTENCE)
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for ToxicityScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing ToxicityScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for toxicity

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("ToxicityScanner is not available")

        # Clear previous detections
        self.last_detected_toxicity = []
        
        # Perform the scan
        sanitized_prompt, is_valid, risk_score = self.scanner.scan(prompt)
        
        # Capture toxicity analysis results
        try:
            # Try to access the classifier from various possible attributes
            classifier = None
            if hasattr(self.scanner, '_pipeline'):
                # Try to access classifier through the pipeline
                pipeline = self.scanner._pipeline
                if hasattr(pipeline, 'model') or hasattr(pipeline, 'classifier'):
                    classifier = pipeline.model if hasattr(pipeline, 'model') else pipeline.classifier
                elif hasattr(pipeline, '__getitem__') and len(pipeline) > 0:
                    # Pipeline might be a list/tuple
                    classifier = pipeline[0]
            
            if classifier:
                # Use the pipeline directly instead of the raw model
                pipeline = self.scanner._pipeline
                
                # Split prompt into sentences for analysis
                sentences = [s.strip() for s in prompt.split('.') if s.strip()]
                if not sentences:
                    sentences = [prompt]
                
                all_toxic_categories = {}
                
                # Analyze each sentence using the pipeline
                for sentence in sentences:
                    # Use pipeline with return_all_scores=True to get all categories
                    results = pipeline(sentence, return_all_scores=True, truncation=True, max_length=512)
                    
                    # Results is a list of lists (one per sentence), take first
                    if results and isinstance(results[0], list):
                        results = results[0]
                    
                    # Aggregate scores across sentences
                    for item in results:
                        label = item['label']
                        score = item['score']
                        
                        if label not in all_toxic_categories:
                            all_toxic_categories[label] = score
                        else:
                            # Keep the maximum score for each category
                            all_toxic_categories[label] = max(all_toxic_categories[label], score)
                
                # Convert to list and sort by score
                detected = []
                for label, score in all_toxic_categories.items():
                    # Include all categories with score > 0.0001 for transparency
                    if score > 0.0001:
                        detected.append({
                            'type': label,
                            'score': round(score, 6),
                            'severity': 'high' if score > 0.8 else ('medium' if score > 0.5 else 'low'),
                            'exceeds_threshold': score > 0.5
                        })
                
                # Sort by score descending and take top 10
                detected.sort(key=lambda x: x['score'], reverse=True)
                self.last_detected_toxicity = detected[:10]
                
        except Exception as e:
            print(f"Warning: Could not extract toxicity details: {e}")
            import traceback
            traceback.print_exc()
        
        return sanitized_prompt, is_valid, risk_score

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected toxic content from the prompt"""
        return self.last_detected_toxicity