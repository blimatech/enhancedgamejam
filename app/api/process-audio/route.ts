import { NextRequest, NextResponse } from "next/server";

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

// Get API keys from environment
const groq_api_key = process.env.GROQ_API_KEY;
const elevenlabs_api_key = process.env.ELEVENLABS_API_KEY;

const execAsync = promisify(exec);

// Function to get the path to the Python interpreter in the virtual environment
function getPythonPath() {
  const venvPath = path.join(process.cwd(), ".venv");
  return process.platform === "win32"
    ? path.join(venvPath, "Scripts", "python.exe")
    : path.join(venvPath, "bin", "python");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const tempDir = path.join(process.cwd(), "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const tempInputPath = path.join(tempDir, `input_${Date.now()}.wav`);
    fs.writeFileSync(tempInputPath, Buffer.from(audioBuffer));

    const pythonPath = getPythonPath();
    const pythonScriptPath = path.join(process.cwd(), "process_audio.py");

    console.log(
      `Executing Python script: ${pythonPath} ${pythonScriptPath} "${tempInputPath}"`
    );

    const { stdout, stderr } = await execAsync(
      `${pythonPath} ${pythonScriptPath} "${tempInputPath}"`,
      {
        env: {
          ...process.env,
          GROQ_API_KEY: groq_api_key,
          ELEVENLABS_API_KEY: elevenlabs_api_key,
        },
      }
    );

    // Log the Python script output
    console.log("Python script stdout:", stdout);
    if (stderr) {
      console.error("Python script stderr:", stderr);
    }

    // Clean up the temporary input file
    fs.unlinkSync(tempInputPath);

    const audioDir = path.join(process.cwd(), "public", "audio", "sounds");
    const audioFilePath = path.join(audioDir, "ai_shooting_sound.mp3");

    if (fs.existsSync(audioFilePath)) {
      const audioBuffer = fs.readFileSync(audioFilePath);
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": "attachment; filename=ai_shooting_sound.mp3",
        },
      });
    } else {
      console.error("Generated audio file not found");
      return NextResponse.json(
        { error: "Generated audio file not found" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      {
        error: "Failed to process audio",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
