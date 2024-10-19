module.exports = {
  apps: [
    {
      name: "nextjs-app",
      script: "npm",
      args: "start",
      cwd: "./",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "python-api",
      interpreter: "python3",
      script: "process_audio.py",
      cwd: "./",
      env: {
        PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
        PYTHONPATH: ".",
        FFMPEG_PATH: "/usr/local/bin/ffmpeg",
        FFPROBE_PATH: "/usr/local/bin/ffprobe",
      },
    },
  ],
};
