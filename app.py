import os
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS
import traceback
import mimetypes
import time

# Set correct MIME types
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')

app = Flask(__name__, static_folder='.')
CORS(app)

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

print(f"API Key loaded: {'Yes' if GOOGLE_API_KEY else 'No'}")
if GOOGLE_API_KEY:
    print(f"API Key starts with: {GOOGLE_API_KEY[:10]}...")

# Check for key
if not GOOGLE_API_KEY:
    raise ValueError("Missing API key. Add it to .env file as GOOGLE_API_KEY.")

# Configure Gemini
try:
    genai.configure(api_key=GOOGLE_API_KEY)
    print("Gemini configured successfully")
    
    # List available models for debugging
    print("Available models:")
    for model_info in genai.list_models():
        if 'generateContent' in model_info.supported_generation_methods:
            print(f"  - {model_info.name}")
    
    # Initialize model with correct model name
    model = genai.GenerativeModel("gemini-1.5-flash")
    print("Model initialized successfully")
    
except Exception as e:
    print(f"Error configuring Gemini: {e}")
    raise e

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        print("\n=== New Chat Request ===")
        
        # Check if request has JSON data
        if not request.is_json:
            print("Request is not JSON")
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        print(f"Request data: {data}")
        
        if not data:
            print("No JSON data provided")
            return jsonify({'error': 'No JSON data provided'}), 400
        
        message = data.get('message')
        print(f"Message: {message}")
        
        if not message:
            print("No message in request")
            return jsonify({'error': 'No message provided'}), 400
        
        # Send message to Gemini
        print("Sending to Gemini API...")
        
        start_time = time.time()
        response = model.generate_content(message)
        end_time = time.time()
        
        print(f"Gemini API response time: {end_time - start_time:.2f} seconds")
        
        if not response or not response.text:
            print("Empty response from Gemini")
            return jsonify({'error': 'No response from AI model'}), 500
        
        print(f"Gemini response received: {len(response.text)} characters")
        print(f"Response preview: {response.text[:100]}...")
        
        return jsonify({'response': response.text})
        
    except Exception as e:
        error_msg = str(e)
        traceback_str = traceback.format_exc()
        print(f"Error occurred: {error_msg}")
        print(f"Traceback: {traceback_str}")
        return jsonify({'error': f'Server error: {error_msg}'}), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({'status': 'OK', 'message': 'Server is running'})

@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory('.', filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    print("Starting Nova AI server...")
    app.run(debug=False, host='127.0.0.1', port=5000)
