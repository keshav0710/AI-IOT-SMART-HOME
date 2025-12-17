from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

OLLAMA_BASE_URL = "http://localhost:11434"

# ================== PROJECT-ONLY CONFIG ==================

PROJECT_SYSTEM_PROMPT = """
You are a Smart Home Assistant for an ESP32 + Firebase IoT system.

IMPORTANT: Keep responses SHORT and DIRECT. No lengthy explanations unless asked.

For greetings: Respond naturally and briefly.
For questions: Give concise, accurate answers using current data.
For unrelated topics: Say "I can only help with the Smart Home project."

Topics you know: ESP32, sensors (PIR, flame, ultrasonic, PZEM), relays, Firebase, Blynk, Google Assistant integration.
"""

# Keywords to roughly detect if a question is about the project
PROJECT_KEYWORDS = [
    "smart home", "smarthome", "esp32", "esp32-cam", "firebase",
    "relay", "relays", "pzem", "pzem-004t", "pir", "flame sensor",
    "ultrasonic", "distance sensor", "water level", "blynk",
    "led1", "led2", "pump", "iot", "home automation",
    "dashboard", "sensor", "sensors", "chatbot", "google assistant",
    "light", "fan", "power", "voltage", "current", "water", "tank",
    "motion", "fire", "device", "control", "status"
]

BLOCK_MESSAGE = "I can only answer questions about the Smart Home project."


def is_project_related(text: str) -> bool:
    """Simple keyword-based filter to allow only project-related queries."""
    if not text:
        return False
    text_lower = text.lower()
    return any(kw in text_lower for kw in PROJECT_KEYWORDS)


def extract_last_user_message(messages):
    """Get the last user message content from a chat messages array."""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            return msg.get("content", "")
    return ""
# ========================================================


@app.route('/ollama', methods=['POST', 'OPTIONS'])
def ollama_proxy():
    """
    Proxy endpoint for Ollama API
    Accepts: { model: string, prompt: string }
    Returns: { response: string }
    """
    # Handle preflight CORS request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        print(f"📨 Received request from client")
        
        data = request.get_json()
        model = data.get('model', 'phi3')
        prompt = data.get('prompt', '')
        
        if not prompt:
            print("❌ No prompt provided")
            return jsonify({'error': 'Prompt is required'}), 400

        # 🔒 Project restriction check (but allow greetings)
        # Detect casual greetings/messages
        casual_patterns = ['hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'okay', 
                          'bye', 'goodbye', 'yes', 'no', 'cool', 'nice', 'great', 'awesome']
        is_casual = prompt.strip().lower() in casual_patterns
        
        if not is_casual and not is_project_related(prompt):
            print("🚫 Prompt blocked as non-project related")
            return jsonify({
                'response': BLOCK_MESSAGE,
                'model': model,
                'done': True
            }), 200
        
        print(f"🤖 Sending to Ollama (project-allowed): '{prompt[:50]}...'")
        
        # Call Ollama API with system prompt to keep it in-scope
        ollama_response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                'model': model,
                'prompt': prompt,
                'system': PROJECT_SYSTEM_PROMPT,  # 🔒 System prompt restriction
                'stream': False
            },
            timeout=60
        )
        
        if ollama_response.status_code != 200:
            print(f"❌ Ollama error: {ollama_response.status_code}")
            return jsonify({
                'error': f'Ollama API error: {ollama_response.status_code}'
            }), 500
        
        result = ollama_response.json()
        response_text = result.get('response', '')
        
        print(f"✅ Ollama responded: '{response_text[:50]}...'")
        
        return jsonify({
            'response': response_text,
            'model': model,
            'done': result.get('done', True)
        })
        
    except requests.exceptions.Timeout:
        print("⏱️ Request timeout")
        return jsonify({'error': 'Request timeout - AI is taking too long'}), 504
    
    except requests.exceptions.ConnectionError:
        print("🔌 Cannot connect to Ollama")
        return jsonify({
            'error': 'Cannot connect to Ollama - make sure it is running on port 11434'
        }), 503
    
    except Exception as e:
        print(f"💥 Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/ollama/chat', methods=['POST', 'OPTIONS'])
def ollama_chat():
    """
    Chat endpoint for conversational context
    Accepts: { model: string, messages: [{ role: string, content: string }] }
    Returns: { response: string }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        model = data.get('model', 'phi3')
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'Messages array is required'}), 400
        
        print(f"💬 Chat request with {len(messages)} messages")

        # 🔎 Extract last user message and apply restriction
        last_user_content = extract_last_user_message(messages)
        if not is_project_related(last_user_content):
            print("🚫 Chat blocked as non-project related")
            return jsonify({
                'response': BLOCK_MESSAGE,
                'model': model,
                'done': True
            }), 200

        # 🔒 Inject system message at the beginning
        system_message = {
            "role": "system",
            "content": PROJECT_SYSTEM_PROMPT
        }

        # Ensure system message is at index 0
        # If there's already a system message, you can choose to override or keep it.
        has_system = any(m.get("role") == "system" for m in messages)
        if not has_system:
            messages.insert(0, system_message)
        else:
            # Optional: force-replace existing system messages
            messages = [m for m in messages if m.get("role") != "system"]
            messages.insert(0, system_message)
        
        # Call Ollama Chat API
        ollama_response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                'model': model,
                'messages': messages,
                'stream': False
            },
            timeout=60
        )
        
        if ollama_response.status_code != 200:
            return jsonify({
                'error': f'Ollama API error: {ollama_response.status_code}'
            }), 500
        
        result = ollama_response.json()
        response_text = result.get('message', {}).get('content', '')
        
        print(f"✅ Chat response: '{response_text[:50]}...'")
        
        return jsonify({
            'response': response_text,
            'model': model,
            'done': result.get('done', True)
        })
        
    except Exception as e:
        print(f"💥 Chat error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Check if Ollama is running"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        ollama_running = response.status_code == 200
        
        return jsonify({
            'status': 'healthy' if ollama_running else 'unhealthy',
            'ollama_running': ollama_running,
            'server': 'running',
            'port': 5001
        })
    except:
        return jsonify({
            'status': 'unhealthy',
            'ollama_running': False,
            'server': 'running',
            'port': 5001
        }), 200


@app.route('/test', methods=['GET'])
def test():
    """Simple test endpoint"""
    return jsonify({
        'message': 'Ollama Proxy Server is working! 🚀',
        'port': 5001,
        'endpoints': ['/ollama', '/ollama/chat', '/health', '/test']
    })


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 OLLAMA PROXY SERVER")
    print("="*60)
    print("📡 Server running on: http://localhost:5001")
    print("🌐 Accessible at: http://0.0.0.0:5001")
    print("🤖 Ollama backend: http://localhost:11434")
    print("\n📋 Available endpoints:")
    print("   POST http://localhost:5001/ollama")
    print("   POST http://localhost:5001/ollama/chat")
    print("   GET  http://localhost:5001/health")
    print("   GET  http://localhost:5001/test")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
