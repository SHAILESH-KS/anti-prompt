#!/usr/bin/env python3
"""
Pre-build script to download and cache all ML models used by scanners.
This script should be run during Docker build to avoid downloading models at runtime.
"""

import sys
import os

# Set model cache environment variables BEFORE any imports
if os.name == 'nt':  # Windows
    cache_dir = os.path.join(os.getcwd(), 'models', 'cache')
    hf_dir = os.path.join(os.getcwd(), 'models', 'hf')
    os.environ.setdefault('TRANSFORMERS_CACHE', cache_dir)
    os.environ.setdefault('HF_HOME', hf_dir)
else:  # Docker/Linux
    os.environ.setdefault('TRANSFORMERS_CACHE', '/app/models/cache')
    os.environ.setdefault('HF_HOME', '/app/models/hf')

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_input_scanner(scanner, name):
    """Test an input scanner with appropriate test data"""
    test_prompts = [
        "This is a test prompt with some text.",
        "Hello, my name is John Doe and my email is john@example.com",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",  # Token
        "SELECT * FROM users WHERE id = 1",  # SQL
    ]
    
    for i, prompt in enumerate(test_prompts):
        try:
            print(f"  Testing {name} with prompt {i+1}...")
            result = scanner.scan(prompt)
            print(f"    ✓ Success: risk_score={result[2]:.3f}")
            break  # One successful test is enough
        except Exception as e:
            print(f"    ⚠ Failed with prompt {i+1}: {e}")
            if i == len(test_prompts) - 1:
                print(f"    ✗ All tests failed for {name}")
                return False
    return True

def test_output_scanner(scanner, name):
    """Test an output scanner with appropriate test data"""
    test_cases = [
        {
            "prompt": "What is the capital of France?",
            "output": "The capital of France is Paris."
        },
        {
            "prompt": "Tell me about John Doe",
            "output": "John Doe is a person who lives at 123 Main St and his email is john@example.com"
        },
        {
            "prompt": "What is machine learning?",
            "output": "Machine learning is a subset of AI that involves training models on data. Check out this malicious site: http://malicious-site.com"
        }
    ]
    
    for i, case in enumerate(test_cases):
        try:
            print(f"  Testing {name} with case {i+1}...")
            result = scanner.scan(case["prompt"], case["output"])
            if isinstance(result, dict):
                risk_score = result.get("risk_score", "N/A")
            else:
                risk_score = result[2] if len(result) > 2 else "N/A"
            print(f"    ✓ Success: risk_score={risk_score}")
            break  # One successful test is enough
        except Exception as e:
            print(f"    ⚠ Failed with case {i+1}: {e}")
            if i == len(test_cases) - 1:
                print(f"    ✗ All tests failed for {name}")
                return False
    return True

try:
    print("🚀 Starting comprehensive model pre-download...")
    from scanners.scanner_manager import ScannerManager
    print("📦 Initializing scanner manager...")
    manager = ScannerManager()
    
    print(f"✅ {len(manager.scanners)} scanners initialized")
    print("🔍 Testing each scanner to trigger model downloads...")
    
    successful_scanners = 0
    failed_scanners = []
    
    # Categorize scanners
    input_scanners = ['anonymize', 'prompt_injection', 'regex', 'secrets', 'invisible_text', 'language', 'toxicity']
    output_scanners = ['factual_consistency', 'relevance', 'malicious_urls']
    
    for name, scanner in manager.scanners.items():
        print(f"\n🔬 Testing scanner: {name}")
        
        if name in input_scanners:
            success = test_input_scanner(scanner, name)
        elif name in output_scanners:
            success = test_output_scanner(scanner, name)
        else:
            # Unknown scanner type, try input scanner test
            print(f"  ⚠ Unknown scanner type, trying input test...")
            success = test_input_scanner(scanner, name)
        
        if success:
            successful_scanners += 1
            print(f"  ✅ {name} ready")
        else:
            failed_scanners.append(name)
            print(f"  ❌ {name} failed")
    
    print("\n📊 Pre-download Summary:")
    print(f"  ✅ Successful: {successful_scanners}")
    print(f"  ❌ Failed: {len(failed_scanners)}")
    if failed_scanners:
        print(f"  Failed scanners: {', '.join(failed_scanners)}")
    
    print("\n💾 Models should now be cached in Docker layer")
    print(f"📋 Available scanners: {list(manager.scanners.keys())}")
    
    if successful_scanners > 0:
        print("🎉 Pre-download completed successfully!")
    else:
        print("⚠️  No scanners were successfully tested")
        
except Exception as e:
    print(f"💥 Error during model download: {e}")
    import traceback
    traceback.print_exc()
    print("⚠️  Continuing despite errors...")
    sys.exit(0)  # Don't fail the build