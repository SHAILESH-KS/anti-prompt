from typing import Dict, Any, List
import torch
from llm_guard.output_scanners import FactualConsistency
from .base_scanner import BaseScanner

class FactualConsistencyScanner(BaseScanner):
    """
    Factual Consistency Scanner for detecting contradictions between prompt and model output.
    Uses NLI models to check if the output contradicts the input prompt.
    """

    def __init__(self):
        super().__init__(
            name="Factual Consistency Scanner",
            description="Scans for factual consistency between prompt and model output"
        )
        self.scanner = None
        self.last_prediction = None

    def initialize(self) -> bool:
        """Initialize the Factual Consistency scanner"""
        try:
            self.scanner = FactualConsistency(minimum_score=0.7)
            print("Factual Consistency Scanner initialized successfully")
            self.available = True
            return True
        except Exception as e:
            print(f"Failed to initialize Factual Consistency Scanner: {e}")
            self.scanner = None
            self.available = False
            return False

    def scan(self, prompt, model_output=None):
        """
        Scan the model output for factual consistency with the prompt.

        Args:
            prompt (str): The original prompt
            model_output (str): The model output to scan

        Returns:
            dict: Scan results with sanitized_output, is_valid, risk_score, and detected_entities
        """
        if self.scanner is None:
            raise RuntimeError("Factual Consistency Scanner not initialized")

        if model_output is None:
            raise ValueError("Model output is required for Factual Consistency scanning")

        try:
            # The scanner expects prompt as premise and model_output as the text to check
            result = self.scanner.scan(prompt, model_output)
            
            # Try to get the prediction from the scanner
            self.last_prediction = getattr(self.scanner, 'prediction', None)
            if self.last_prediction is None and isinstance(result, dict):
                self.last_prediction = result.get('prediction')
            if self.last_prediction is None:
                # Try to find prediction in result or scanner
                if isinstance(result, dict) and 'prediction' in result:
                    self.last_prediction = result['prediction']
                elif hasattr(self.scanner, '_prediction'):
                    self.last_prediction = self.scanner._prediction
                elif hasattr(self.scanner, 'last_prediction'):
                    self.last_prediction = self.scanner.last_prediction
                else:
                    # Run the model prediction manually
                    try:
                        # For NLI, input format is [CLS] premise [SEP] hypothesis [SEP]
                        inputs = self.scanner._tokenizer(prompt, model_output, return_tensors='pt', truncation=True, max_length=512)
                        with torch.no_grad():
                            outputs = self.scanner._model(**inputs)
                            logits = outputs.logits
                            probs = torch.softmax(logits, dim=1)
                            # Assuming labels are [entailment, not_entailment]
                            self.last_prediction = {
                                'entailment': probs[0][0].item(),
                                'not_entailment': probs[0][1].item()
                            }
                    except Exception as e:
                        print(f"Failed to get prediction: {e}")
                        self.last_prediction = None
            
            # Handle different return formats from LLMGuard
            if isinstance(result, dict):
                sanitized_output = str(result.get("sanitized_output", model_output))
                is_valid = bool(result.get("is_valid", True))
                risk_score = float(result.get("risk_score", 0.0))
            elif isinstance(result, (list, tuple)):
                if len(result) >= 3:
                    sanitized_output, is_valid, risk_score = str(result[0]), bool(result[1]), float(result[2])
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
            raise RuntimeError(f"Factual Consistency scanning failed: {str(e)}")

    def get_detected_entities(self, text: str) -> List[Dict[str, Any]]:
        """Return information about detected entities (entailment scores for this scanner)"""
        if self.last_prediction and isinstance(self.last_prediction, dict):
            entities = []
            for key, value in self.last_prediction.items():
                entities.append({
                    "entity": key,
                    "score": float(value),
                    "type": "factual_consistency_score"
                })
            return entities
        return []
