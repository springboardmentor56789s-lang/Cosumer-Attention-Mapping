from __future__ import annotations

import os
from pathlib import Path
import subprocess
from uuid import uuid4


class VideoPreprocessingError(RuntimeError):
    """Raised when an uploaded video cannot be normalized for analysis."""


class FFmpegUnavailableError(VideoPreprocessingError):
    """Raised when the configured FFmpeg executable cannot be started."""


class VideoPreprocessingService:
    """Normalize uploaded videos without changing the original upload."""

    _FILTER = "scale=1280:trunc(ow/a/2)*2,fps=15"

    def __init__(self, ffmpeg_executable: str | None = None, timeout_seconds: int = 1800):
        self.ffmpeg_executable = ffmpeg_executable or os.getenv("FFMPEG_PATH", "ffmpeg")
        self.timeout_seconds = timeout_seconds

    def preprocess(self, source_path: str | Path, output_dir: str | Path | None = None) -> Path:
        source = Path(source_path)
        if not source.is_file():
            raise VideoPreprocessingError("The uploaded video could not be found for preprocessing.")

        destination_dir = Path(output_dir) if output_dir else source.parent
        destination_dir.mkdir(parents=True, exist_ok=True)
        destination = destination_dir / f"processed_{source.stem}_{uuid4().hex}.mp4"
        command = [
            self.ffmpeg_executable,
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(source),
            "-map",
            "0:v:0",
            "-map",
            "0:a?",
            "-vf",
            self._FILTER,
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-movflags",
            "+faststart",
            "-y",
            str(destination),
        ]

        try:
            subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds,
            )
        except FileNotFoundError as error:
            raise FFmpegUnavailableError(
                "FFmpeg is unavailable. Install FFmpeg or set FFMPEG_PATH to its executable."
            ) from error
        except subprocess.TimeoutExpired as error:
            self._remove_partial_output(destination)
            raise VideoPreprocessingError("Video preprocessing timed out.") from error
        except subprocess.CalledProcessError as error:
            self._remove_partial_output(destination)
            details = (error.stderr or "").strip()
            message = "Video preprocessing failed. Verify that the uploaded file is a valid video."
            if details:
                message = f"{message} FFmpeg: {details[-500:]}"
            raise VideoPreprocessingError(message) from error

        if not destination.is_file() or destination.stat().st_size == 0:
            self._remove_partial_output(destination)
            raise VideoPreprocessingError("FFmpeg completed without creating a usable processed video.")

        return destination

    @staticmethod
    def _remove_partial_output(path: Path) -> None:
        try:
            path.unlink(missing_ok=True)
        except OSError:
            pass