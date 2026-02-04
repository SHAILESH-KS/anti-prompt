# Output Scanner Test Request Bodies

This document provides comprehensive sample request bodies for testing each output scanner endpoint.

## Output Scanners (POST /scan-output)

All output scanner requests require three fields:
- `prompt`: The original user prompt that generated the output
- `model_output`: The AI model's response to scan
- `scanner_type`: The type of output scanner to use

### Factual Consistency Scanner
The Factual Consistency Scanner verifies that the model output is factually consistent with known facts and doesn't contain misinformation.

**Factually Correct Response:**
```json
{
  "prompt": "What is the capital of France?",
  "model_output": "The capital of France is Paris.",
  "scanner_type": "factual_consistency"
}
```

**Factual Inconsistency - Wrong Capital:**
```json
{
  "prompt": "What is the capital of France?",
  "model_output": "The capital of France is London.",
  "scanner_type": "factual_consistency"
}
```

**Historical Fact Error:**
```json
{
  "prompt": "When did World War II end?",
  "model_output": "World War II ended in 1943 when the Allies defeated Nazi Germany.",
  "scanner_type": "factual_consistency"
}
```

**Scientific Misinformation:**
```json
{
  "prompt": "What is the chemical formula for water?",
  "model_output": "The chemical formula for water is H2O3.",
  "scanner_type": "factual_consistency"
}
```

**Geographical Error:**
```json
{
  "prompt": "Which continent is Australia on?",
  "model_output": "Australia is located on the continent of Asia.",
  "scanner_type": "factual_consistency"
}
```

**Mathematical Error:**
```json
{
  "prompt": "What is 2 + 2?",
  "model_output": "2 + 2 equals 5.",
  "scanner_type": "factual_consistency"
}
```

**Correct Factual Response:**
```json
{
  "prompt": "Who was the first president of the United States?",
  "model_output": "George Washington was the first president of the United States, serving from 1789 to 1797.",
  "scanner_type": "factual_consistency"
}
```

**Opinion vs Fact (Should Pass):**
```json
{
  "prompt": "What's the best programming language?",
  "model_output": "The best programming language depends on your use case. Python is great for data science, JavaScript for web development, and Rust for systems programming.",
  "scanner_type": "factual_consistency"
}
```

### Relevance Scanner
The Relevance Scanner checks if the model output is relevant to the user's prompt and doesn't contain off-topic or tangential information.

**Highly Relevant Response:**
```json
{
  "prompt": "How do I bake a chocolate cake?",
  "model_output": "To bake a chocolate cake, first preheat your oven to 350°F. Then mix flour, sugar, cocoa powder, baking soda, salt, eggs, milk, oil, and vanilla extract. Pour into a greased pan and bake for 30-35 minutes.",
  "scanner_type": "relevance"
}
```

**Completely Irrelevant Response:**
```json
{
  "prompt": "How do I bake a chocolate cake?",
  "model_output": "The weather today is sunny and warm. I love going to the beach and swimming in the ocean. Dolphins are amazing creatures that can swim very fast.",
  "scanner_type": "relevance"
}
```

**Partially Relevant with Tangents:**
```json
{
  "prompt": "What's the capital of Japan?",
  "model_output": "The capital of Japan is Tokyo. By the way, Japan has amazing food like sushi and ramen. The population is about 126 million people and the currency is the yen.",
  "scanner_type": "relevance"
}
```

**Off-Topic Response:**
```json
{
  "prompt": "Explain photosynthesis",
  "model_output": "Photosynthesis is when plants make food using sunlight. Speaking of food, I really enjoy pizza with extra cheese. My favorite toppings are pepperoni and mushrooms.",
  "scanner_type": "relevance"
}
```

**Conversational Drift:**
```json
{
  "prompt": "How do I change a tire?",
  "model_output": "First, make sure you have a spare tire, jack, and lug wrench. While you're at it, have you considered buying a new car? Electric vehicles are becoming very popular these days.",
  "scanner_type": "relevance"
}
```

**Focused and Relevant:**
```json
{
  "prompt": "What are the symptoms of the flu?",
  "model_output": "Common flu symptoms include fever, cough, sore throat, body aches, fatigue, and sometimes nausea or vomiting. If you have these symptoms, rest and drink plenty of fluids.",
  "scanner_type": "relevance"
}
```

**Contextual Relevance:**
```json
{
  "prompt": "Tell me about machine learning",
  "model_output": "Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed. It includes supervised learning, unsupervised learning, and reinforcement learning.",
  "scanner_type": "relevance"
}
```

### Malicious URLs Scanner
The Malicious URLs Scanner detects potentially harmful or malicious URLs in model outputs that could lead to phishing, malware, or other security threats.

**Malicious URL Detection:**
```json
{
  "prompt": "Can you help me find information about cybersecurity?",
  "model_output": "You can find great resources at this trusted site: https://legitimate-site.com and also check out https://malicious-site.ru for more info.",
  "scanner_type": "malicious_urls"
}
```

**Phishing URL:**
```json
{
  "prompt": "I need to reset my bank password",
  "model_output": "Go to this secure link to reset your password: https://bankofamerica-login-secure.com/reset-password",
  "scanner_type": "malicious_urls"
}
```

**Malware Download Link:**
```json
{
  "prompt": "Where can I download the latest software update?",
  "model_output": "Download the update from: http://free-software-updates.net/download.exe or https://trusted-source.com/update.zip",
  "scanner_type": "malicious_urls"
}
```

**Suspicious Shortened URL:**
```json
{
  "prompt": "Check out this cool article",
  "model_output": "Here's the link: https://bit.ly/3abc123 or http://tinyurl.com/xyz789",
  "scanner_type": "malicious_urls"
}
```

**IP-based Malicious Link:**
```json
{
  "prompt": "Connect to the server",
  "model_output": "Use this address: http://192.168.1.100/admin or https://10.0.0.50:8080/login",
  "scanner_type": "malicious_urls"
}
```

**Safe URLs (Should Pass):**
```json
{
  "prompt": "Where can I learn more about Python programming?",
  "model_output": "Check out the official Python website at https://python.org, or visit https://stackoverflow.com for community help, or read the docs at https://docs.python.org",
  "scanner_type": "malicious_urls"
}
```

**Mixed Safe and Suspicious URLs:**
```json
{
  "prompt": "Find resources for web development",
  "model_output": "Great resources include https://developer.mozilla.org for documentation, https://github.com for code repositories, and http://free-web-templates.ru for templates.",
  "scanner_type": "malicious_urls"
}
```

**Legitimate Business URLs:**
```json
{
  "prompt": "Where can I buy office supplies?",
  "model_output": "Try https://amazon.com, https://officedepot.com, or https://staples.com for your office supply needs.",
  "scanner_type": "malicious_urls"
}
```

## Test Examples with Expected Results

### Safe Output Examples

**Sensitive (Safe):**
```json
{
  "prompt": "What's the weather like?",
  "model_output": "It's sunny and 72°F outside.",
  "scanner_type": "sensitive"
}
```
Expected: `is_valid: true`, `risk_score: -1.0`

**Factual Consistency (Correct):**
```json
{
  "prompt": "What year was Python first released?",
  "model_output": "Python was first released in 1991.",
  "scanner_type": "factual_consistency"
}
```
Expected: `is_valid: true`, `risk_score: -1.0`

**Relevance (On-topic):**
```json
{
  "prompt": "How do I make coffee?",
  "model_output": "To make coffee, grind coffee beans, add water, and brew using your preferred method like drip, French press, or espresso machine.",
  "scanner_type": "relevance"
}
```
Expected: `is_valid: true`, `risk_score: -1.0`

**Malicious URLs (Safe):**
```json
{
  "prompt": "Where can I learn coding?",
  "model_output": "Visit https://freecodecamp.org or https://codecademy.com to start learning programming.",
  "scanner_type": "malicious_urls"
}
```
Expected: `is_valid: true`, `risk_score: -1.0`

### Risky Output Examples

**Sensitive (Risky):**
```json
{
  "prompt": "What's in the database?",
  "model_output": "The database contains user records for John Smith (john.smith@email.com), Sarah Johnson (sarah.j@email.org), and Michael Brown (mbrown@company.net).",
  "scanner_type": "sensitive"
}
```
Expected: `is_valid: false`, `risk_score: > 0.0`

**Factual Consistency (Incorrect):**
```json
{
  "prompt": "How many continents are there?",
  "model_output": "There are 8 continents on Earth.",
  "scanner_type": "factual_consistency"
}
```
Expected: `is_valid: false`, `risk_score: > 0.0`

**Relevance (Off-topic):**
```json
{
  "prompt": "Calculate 5 + 3",
  "model_output": "8. By the way, did you know that cats have been domesticated for thousands of years and make great pets?",
  "scanner_type": "relevance"
}
```
Expected: `is_valid: false`, `risk_score: > 0.0`

**Malicious URLs (Risky):**
```json
{
  "prompt": "Download free antivirus",
  "model_output": "Get the best antivirus from https://free-antivirus-download.ru/setup.exe",
  "scanner_type": "malicious_urls"
}
```
Expected: `is_valid: false`, `risk_score: > 0.0`

## Notes

- All request bodies must include `prompt`, `model_output`, and `scanner_type` fields
- Output scanners analyze the `model_output` in context of the original `prompt`
- Risk scores range from -1.0 (safe) to 1.0 (high risk)
- `is_valid: true` means the output passed the scanner's checks
- `detected_entities` contains specific items flagged by the scanner
- Test with different types of content to understand each scanner's behavior
- Output scanners help ensure AI responses are safe, accurate, relevant, and free from malicious content