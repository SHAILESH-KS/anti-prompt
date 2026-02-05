# Scanner Architectures and Technologies

This document explains the technical architecture and underlying technologies used by each scanner in the Anti-Prompt system.

## Overview

The Anti-Prompt backend uses a modular scanner architecture built on top of the **LLM Guard** security toolkit. Most scanners leverage **transformer-based deep learning models** fine-tuned for specific security tasks. The system combines multiple AI models to provide comprehensive prompt analysis.

## Scanner Technologies

### 1. Prompt Injection Scanner
**Technology**: Transformer-based classification model (DeBERTa v3)  
**Architecture**: Zero-shot learning approach using sentence embeddings  
**Model**: MoritzLaurer/deberta-v3-base-zeroshot-v2.0  
**How it works**: Uses contextual embeddings to detect prompt manipulation attempts by analyzing semantic patterns that indicate injection attacks. The model is trained on diverse adversarial examples to identify when users try to override system instructions.

### 2. Toxicity Scanner
**Technology**: Transformer-based toxicity classification  
**Architecture**: Sentence-level analysis with threshold-based filtering  
**Model**: MoritzLaurer/deberta-v3-base-zeroshot-v2.0  
**How it works**: Employs a fine-tuned DeBERTa model that analyzes text for toxic content, hate speech, and offensive language. Uses sentence-level processing to identify harmful content while maintaining context awareness.

### 3. Secrets Scanner
**Technology**: Pattern recognition + transformer-based validation  
**Architecture**: Multi-stage detection (regex patterns + ML validation)  
**Model**: Custom LLM Guard implementation with regex pre-filtering  
**How it works**: Combines traditional regex pattern matching for common secret formats (API keys, tokens) with transformer-based validation to reduce false positives and detect obfuscated secrets.

### 4. Code Scanner
**Technology**: Programming language detection + security analysis  
**Architecture**: CodeBERT-based language identification  
**Model**: philomath-1209/programming-language-identification  
**How it works**: Uses CodeBERT, a BERT model pre-trained on code, to identify programming languages and detect potentially dangerous code patterns. Can block specific languages or code types deemed high-risk.

### 5. Gibberish Scanner
**Technology**: Transformer-based gibberish detection  
**Architecture**: Binary classification for nonsensical text  
**Model**: madhurjindal/autonlp-Gibberish-Detector-492513457  
**How it works**: Fine-tuned transformer model that distinguishes between coherent English text and gibberish/random character sequences. Useful for detecting obfuscation attempts or malformed inputs.

### 6. Language Scanner
**Technology**: Multilingual transformer model  
**Architecture**: XLM-RoBERTa for language identification  
**Model**: papluca/xlm-roberta-base-language-detection  
**How it works**: Uses XLM-RoBERTa, a multilingual transformer, to detect the language of input text and ensure it matches allowed languages (primarily English). Helps prevent multilingual prompt injection attacks.

### 7. Ban Topics Scanner
**Technology**: Zero-shot topic classification  
**Architecture**: DeBERTa-based topic detection  
**Model**: MoritzLaurer/deberta-v3-base-zeroshot-v2.0  
**How it works**: Employs zero-shot learning to detect content related to banned topics (violence, hate speech, illegal activities, etc.) without requiring topic-specific training data.

### 8. Anonymize Scanner
**Technology**: Named Entity Recognition (NER) + PII detection  
**Architecture**: BERT-based NER with specialized PII model  
**Model**: dslim/bert-large-NER + Isotonic/deberta-v3-base_finetuned_ai4privacy_v2  
**How it works**: Uses a two-stage process: first identifies named entities using BERT-large-NER, then applies specialized PII detection model to anonymize sensitive information like names, addresses, and personal data.

### 9. Regex Scanner
**Technology**: Rule-based pattern matching  
**Architecture**: Traditional regex engine with security-focused patterns  
**Model**: None (rule-based system)  
**How it works**: Uses hand-crafted regular expressions to detect common attack patterns including SQL injection, XSS, command injection, and path traversal. Fast and deterministic but limited to known patterns.

### 10. Invisible Text Scanner
**Technology**: Unicode analysis + character filtering  
**Architecture**: Rule-based invisible character detection  
**Model**: None (algorithmic approach)  
**How it works**: Scans for invisible Unicode characters (zero-width spaces, control characters) that could be used to hide malicious content or create visually deceptive prompts.

### 11. Malicious URLs Scanner
**Technology**: Transformer-based URL classification  
**Architecture**: CodeBERT fine-tuned for URL analysis  
**Model**: DunnBC22/codebert-base-Malicious_URLs  
**How it works**: Uses CodeBERT adapted for URL analysis to detect phishing sites, malware distribution URLs, and other malicious web addresses in model outputs.

## Technical Architecture Benefits

### Deep Learning Advantages
- **Context Awareness**: Transformer models understand context and semantic meaning
- **Adaptability**: Zero-shot learning allows detection of novel attack patterns
- **Accuracy**: Fine-tuned models provide high precision for specific security tasks

### Performance Optimizations
- **ONNX Runtime**: Many models support ONNX for faster inference
- **Model Caching**: Pre-downloaded models reduce initialization time
- **Batch Processing**: Efficient handling of multiple prompts

### Security Layers
- **Multi-Modal Detection**: Combines ML models with traditional security methods
- **Threshold Tuning**: Configurable sensitivity levels for different use cases
- **Fallback Mechanisms**: Graceful degradation when models are unavailable

## Model Training and Fine-Tuning

Most models are pre-trained transformer architectures fine-tuned on:
- Security-specific datasets
- Adversarial examples
- Domain-specific corpora
- Zero-shot learning techniques for broad applicability

## Scalability and Deployment

- **Containerized**: Docker deployment for consistent environments
- **Modular Design**: Easy addition of new scanners
- **API-First**: RESTful interfaces for integration
- **Monitoring**: Built-in logging and performance tracking

This architecture provides a robust, AI-powered defense system capable of detecting sophisticated prompt-based attacks while maintaining high performance and accuracy.