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
  if (process.platform === "win32") {
    return path.join(venvPath, "Scripts", "python.exe");
  } else {
    return path.join(venvPath, "bin", "python");
  }
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
    const audioDir = path.join(
      process.cwd(),
      "public",
      "generated_files",
      "audio"
    );
    fs.mkdirSync(audioDir, { recursive: true });

    const tempInputPath = path.join(audioDir, `input_${Date.now()}.webm`);
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
        maxBuffer: 1024 * 1024 * 10, // 10 MB buffer
        encoding: "buffer", // This ensures stdout is a Buffer
      }
    );

    if (stderr) {
      console.error("Python script error:", stderr.toString());
      return NextResponse.json(
        { error: "Failed to process audio", details: stderr.toString() },
        { status: 500 }
      );
    }

    // Clean up the temporary input file
    fs.unlinkSync(tempInputPath);

    // Return the audio data
    return new NextResponse(stdout, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="processed_${Date.now()}.mp3"`,
      },
    });
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
