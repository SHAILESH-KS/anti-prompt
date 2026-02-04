from typing import Dict, Any, Tuple, List
from .base_scanner import BaseScanner


class BanTopicsScanner(BaseScanner):
    """Ban Topics Scanner using LLM Guard"""

    def __init__(self):
        super().__init__(
            name="Ban Topics Scanner",
            description="Restricts specific topics such as religion, violence, politics from being introduced in the prompt"
        )
        self.scanner = None
        self.last_detected_topics = []
        self.banned_topics = []


    def initialize(self) -> bool:
        """Initialize the Ban Topics scanner with LLM Guard"""
        try:
            from llm_guard.input_scanners import BanTopics

            # Default banned topics - can be customized
            self.banned_topics = [
                "violence",
                "hate speech",
                "terrorism",
                "self-harm",
                "sexual content",
                "illegal activities",
                "drugs",
                "weapons",
                "graphic content"
            ]
            
            self.scanner = BanTopics(
                topics=self.banned_topics,
                threshold=0.5,
                use_onnx=False
            )
            self.available = True
            return True
        except ImportError as e:
            print(f"Warning: LLM Guard not available for BanTopicsScanner. Error: {e}")
            self.available = False
            return False
        except Exception as e:
            print(f"Error initializing BanTopicsScanner: {e}")
            self.available = False
            return False

    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for banned topics

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        if not self.available or not self.scanner:
            raise RuntimeError("BanTopicsScanner is not available")

        # Clear previous detections
        self.last_detected_topics = []
        
        # Perform the scan
        result = self.scanner.scan(prompt)
        sanitized_prompt, is_valid, risk_score = result
        
        # If banned topics are detected, extract them
        if not is_valid and risk_score > 0:
            # Try to identify which topics were detected
            try:
                from transformers import pipeline
                
                # Use zero-shot classification to identify topics
                classifier = pipeline(
                    "zero-shot-classification",
                    model="MoritzLaurer/deberta-v3-base-zeroshot-v2.0"
                )
                
                results = classifier(prompt, self.banned_topics, multi_label=True)
                
                # Extract topics with scores above threshold
                for topic, score in zip(results['labels'], results['scores']):
                    if score >= 0.5:
                        self.last_detected_topics.append({
                            "topic": topic,
                            "confidence": round(score, 4),
                            "is_banned": True
                        })
            except Exception as e:
                print(f"Error identifying banned topics: {e}")
                # Fallback: just indicate that banned topics were detected
                if risk_score > 0:
                    self.last_detected_topics.append({
                        "topic": "banned content detected",
                        "confidence": risk_score,
                        "is_banned": True
                    })
        
        return result

    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected banned topics from the prompt"""
        return self.last_detected_topics
