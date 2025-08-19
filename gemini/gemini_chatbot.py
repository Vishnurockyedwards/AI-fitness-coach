import os
import google.generativeai as genai
from dotenv import load_dotenv
from google.api_core import exceptions

# 1. Load environment variables from .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
MISSING_API_KEY = not bool(API_KEY)

# 3. Configure Gemini API (only if key exists)
if not MISSING_API_KEY:
    try:
        genai.configure(api_key=API_KEY)
    except Exception as e:
        # If configuration fails, mark as missing to avoid crashing server
        MISSING_API_KEY = True

# 4. Define the system prompt for the AI's persona
SYSTEM_PROMPT = """
You are FitAI, a knowledgeable fitness assistant. You specialize in:
- Workout planning and exercise techniques
- Nutrition advice and meal planning
- Fitness motivation and goal setting
- General health and wellness guidance

Keep responses concise and focused on fitness-related topics. If asked about medical advice, 
remind users to consult healthcare professionals.
"""

# 5. Initialize the GenerativeModel (if key/config present)
model = None
if not MISSING_API_KEY:
    try:
        # Using 'gemini-1.5-flash' as it's the recommended model for chat apps.
        model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        # If model init fails, keep model None; downstream will return a helpful message
        model = None

def get_bot_response(chat_session, message: str) -> str:
    """
    Sends a user message to the Gemini API and returns the bot's response.
    Includes robust error handling for API-related issues.
    """
    if MISSING_API_KEY or model is None:
        return (
            "Gemini server is not configured. Please set GEMINI_API_KEY in gemini/.env and restart the server."
        )
    try:
        response = chat_session.send_message(message)
        return response.text
    except exceptions.NotFound as e:
        return f"Model not found: {str(e)}. Please check the model name."
    except exceptions.ClientError as e:
        return f"Client error occurred: {str(e)}. Please check your API key and network connection."
    except genai.RateLimitError:
        return "Rate limit exceeded. Please try again later."
    except Exception as e:
        return f"Something went wrong: {str(e)}. Please try again."

def start_new_session():
    """Create a new chat session if the model is available; otherwise return None."""
    if MISSING_API_KEY or model is None:
        return None
    return model.start_chat(history=[])


def main():
    """
    Main function to run the command-line interface for the FitAI chatbot.
    """
    print("🤖 FitAI is ready to chat! (Type 'exit' to quit, 'reset' to clear history)")
    
    # Initialize chat session with an empty history.
    chat_session = start_new_session()
    
    is_first_message = True

    while True:
        user_input = input("You: ").strip()

        # Handle user commands
        if not user_input:
            print("FitAI: Please enter a valid message.\n")
            continue
        
        if user_input.lower() in ["exit", "quit"]:
            print("👋 Goodbye! Stay strong 💪")
            break
        
        if user_input.lower() == "reset":
            # Re-create a new chat session to reset the history.
            chat_session = model.start_chat(history=[])
            is_first_message = True
            print("FitAI: Chat history reset!\n")
            continue

        # For the first message, prepend the system prompt to the user's input.
        if is_first_message:
            message_to_send = f"{SYSTEM_PROMPT}\n\n{user_input}"
            is_first_message = False
        else:
            message_to_send = user_input

        # Get and print the bot's response
        reply = get_bot_response(chat_session, message_to_send)
        print(f"FitAI: {reply}\n")

if __name__ == "__main__":
    main()