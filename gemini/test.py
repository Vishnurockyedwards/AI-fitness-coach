from google import genai
import os
from dotenv import load_dotenv,find_dotenv
#import google.genai as genai
load_dotenv(find_dotenv())
api_key = os.getenv("GEMINI_API_KEY")
print(api_key)
client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["How does AI work?"]
)
print(response.text)