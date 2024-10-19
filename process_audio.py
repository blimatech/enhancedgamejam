from flask import Flask, request, send_file
from flask_cors import CORS
import sys
import io
import os
from dotenv import load_dotenv
from groq import Groq
from elevenlabs.client import ElevenLabs
import logging
import time
import traceback

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Get API keys from environment
groq_api_key = os.getenv("GROQ_API_KEY")
elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")

if not groq_api_key or not elevenlabs_api_key:
    logger.error("Missing API keys in environment variables")
    raise ValueError("API keys are not set")

logger.info("API keys loaded successfully")

# Initialize clients
groq_client = Groq(api_key=groq_api_key)
elevenlabs_client = ElevenLabs(api_key=elevenlabs_api_key)

logger.info("Clients initialized successfully")

def generate_sound_effect(text, duration_seconds=2.0, prompt_influence=0.3):
    logger.info(f"Generating sound effect for: '{text}'")
    start_time = time.time()

    result = elevenlabs_client.text_to_sound_effects.convert(
        text=text,
        duration_seconds=duration_seconds,
        prompt_influence=prompt_influence
    )

    temp_file = "temp_sound_effect.mp3"
    with open(temp_file, "wb") as f:
        for chunk in result:
            f.write(chunk)

    total_time = (time.time() - start_time) * 1000
    logger.info(f"Sound effect generated in {total_time:.2f} ms")

    return temp_file

def process_audio(input_file):
    try:
        logger.info(f"Processing audio file: {input_file}")
        
        # Perform transcription using Groq
        with open(input_file, "rb") as file:
            logger.info("Sending file to Groq for transcription")
            transcription = groq_client.audio.transcriptions.create(
                file=(input_file, file.read()),
                model="whisper-large-v3-turbo",
                response_format="json",
                language="en",
                temperature=0.0
            )
        logger.info(f"Transcription received: {transcription.text}")

        # Generate sound effect based on transcription
        sound_effect_file = generate_sound_effect(transcription.text)
        logger.info("Sound effect generated")

        return sound_effect_file
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        logger.error("Traceback:")
        traceback.print_exc()
        return None

if __name__ == '__main__':
    logger.info("Starting __main__ from process_audio.py")
    if len(sys.argv) != 2:
        logger.error("Incorrect number of arguments")
        print("Usage: python process_audio.py <input_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    logger.info(f"Input file: {input_file}")

    sound_effect_file = process_audio(input_file)
    if sound_effect_file:
        with open(sound_effect_file, 'rb') as f:
            sys.stdout.buffer.write(f.read())
        os.remove(sound_effect_file)  # Clean up the temporary file
        logger.info("Processing completed successfully")
    else:
        logger.error("Processing failed")
        sys.exit(1)
