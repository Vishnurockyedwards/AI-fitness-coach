from flask import Flask, request, jsonify
from flask_cors import CORS
from gemini_chatbot import get_bot_response, start_new_session, SYSTEM_PROMPT

app = Flask(__name__)
# Enable CORS for all routes (adjust origins if you want to restrict)
CORS(app)

# Maintain a single chat session for simplicity (created on first request)
chat_session = None
is_first_message = True

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chatbot requests from the web UI (JSON or form-encoded)."""
    global is_first_message

    # Support both application/json and x-www-form-urlencoded
    user_message = ''
    if request.is_json:
        payload = request.get_json(silent=True) or {}
        user_message = (payload.get('message') or '').strip()
    else:
        user_message = (request.form.get('message') or '').strip()

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    global chat_session

    # Create session on first use
    if chat_session is None:
        chat_session = start_new_session()

    # Prepend system prompt once per new session
    if is_first_message:
        message_to_send = f"{SYSTEM_PROMPT}\n\n{user_message}"
        is_first_message = False
    else:
        message_to_send = user_message

    try:
        bot_response = get_bot_response(chat_session, message_to_send)
        return jsonify({'response': bot_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on localhost:5000
    app.run(host='127.0.0.1', port=5000, debug=True)