import os
import streamlit as st
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Check for key
if not GOOGLE_API_KEY:
    st.error("Missing API key. Add it to .env file as GOOGLE_API_KEY.")
    st.stop()

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize model with correct ID
model = genai.GenerativeModel("models/gemini-pro")

# Setup Streamlit UI
st.set_page_config(page_title="Gemini Chat", page_icon="🤖")
st.title("🤖 Chat with Gemini Pro")

# Start or load chat session
if "chat_session" not in st.session_state:
    st.session_state.chat_session = model.start_chat(history=[])

# Show chat history
for msg in st.session_state.chat_session.history:
    role = "assistant" if msg.role == "model" else "user"
    with st.chat_message(role):
        st.markdown(msg.parts[0].text)

# Chat input
user_input = st.chat_input("Say something to Gemini...")

if user_input:
    st.chat_message("user").markdown(user_input)
    try:
        response = st.session_state.chat_session.send_message(user_input)
        with st.chat_message("assistant"):
            st.markdown(response.text)
    except Exception as e:
        st.error(f"Error: {e}")
