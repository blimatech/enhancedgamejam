import io
import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from pydub import AudioSegment
from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.responses import FileResponse
import os
import subprocess
from gtts import gTTS
import tempfile

app = FastAPI()

# Set the path to ffmpeg and ffprobe
ffmpeg_path = subprocess.check_output(['which', 'ffmpeg']).decode().strip()
ffprobe_path = subprocess.check_output(['which', 'ffprobe']).decode().strip()

AudioSegment.converter = ffmpeg_path
AudioSegment.ffmpeg = ffmpeg_path
AudioSegment.ffprobe = ffprobe_path

# Load the Wav2Vec2 model and processor
try:
    processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
    model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")
except Exception as e:
    print(f"Error loading Wav2Vec2 model: {e}")
    processor = None
    model = None

@app.post("/api/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    if not processor or not model:
        raise HTTPException(status_code=500, detail="Wav2Vec2 model not loaded")

    try:
        # Read the uploaded audio file
        audio_content = await audio.read()
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_content), format="wav")

        # Convert audio to the required format
        audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
        audio_array = torch.FloatTensor(audio_segment.get_array_of_samples())

        # Process audio with Wav2Vec2
        inputs = processor(audio_array, sampling_rate=16000, return_tensors="pt", padding=True)
        with torch.no_grad():
            logits = model(inputs.input_values, attention_mask=inputs.attention_mask).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.batch_decode(predicted_ids)[0]

        # Generate a simple tone based on the transcription
        frequency = sum(ord(c) for c in transcription) % 1000 + 200  # Simple hash to frequency
        duration = 1000  # 1 second
        sample_rate = 44100
        t = torch.arange(0, duration, 1000.0 / sample_rate) / 1000.0
        audio = 0.5 * torch.sin(2 * torch.pi * frequency * t)

        # Save as MP3
        output_path = "temp_output.mp3"
        torchaudio.save(output_path, audio.unsqueeze(0), sample_rate, format="mp3")

        return FileResponse(output_path, media_type="audio/mpeg", filename="shoot_sound.mp3")
    except Exception as e:
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")
    finally:
        if os.path.exists("temp_output.mp3"):
            os.remove("temp_output.mp3")

@app.post("/api/process-text")
async def process_text(text: str = Body(..., embed=True)):
    try:
        # Generate speech from text
        tts = gTTS(text=text, lang='en')
        
        # Save as MP3
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            tts.save(temp_file.name)
            output_path = temp_file.name

        return FileResponse(output_path, media_type="audio/mpeg", filename="shoot_sound.mp3")
    except Exception as e:
        print(f"Error processing text: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")
    finally:
        if 'output_path' in locals() and os.path.exists(output_path):
            os.remove(output_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
