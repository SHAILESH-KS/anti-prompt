from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List
import datetime


class BaseScanner(ABC):
    """Abstract base class for all input scanners"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.available = False

    @abstractmethod
    def initialize(self) -> bool:
        """Initialize the scanner. Return True if successful, False otherwise."""
        pass

    @abstractmethod
    def scan(self, prompt: str) -> Tuple[str, bool, float]:
        """
        Scan the prompt for issues.

        Args:
            prompt: The input prompt to scan

        Returns:
            Tuple of (sanitized_prompt, is_valid, risk_score)
        """
        pass

    @abstractmethod
    def get_detected_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """Get detected entities from the prompt"""
        pass

    def is_available(self) -> bool:
        """Check if the scanner is available and properly initialized"""
        return self.available

    def get_info(self) -> Dict[str, Any]:
        """Get scanner information"""
        return {
            "name": self.name,
            "description": self.description,
            "available": self.available,
            "type": self.__class__.__name__
        }