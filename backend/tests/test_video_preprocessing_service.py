from pathlib import Path
import subprocess

import pytest

from app.services.video_preprocessing_service import FFmpegUnavailableError, VideoPreprocessingService


def test_preprocess_normalizes_a_copy_without_changing_the_original(tmp_path, monkeypatch):
    source = tmp_path / "camera.mov"
    source.write_bytes(b"original video")
    original_contents = source.read_bytes()
    calls = []

    def fake_run(command, **kwargs):
        calls.append((command, kwargs))
        Path(command[-1]).write_bytes(b"normalized video")
        return subprocess.CompletedProcess(command, 0)

    monkeypatch.setattr("app.services.video_preprocessing_service.subprocess.run", fake_run)

    processed = VideoPreprocessingService().preprocess(source)

    command, kwargs = calls[0]
    assert processed.parent == source.parent
    assert processed.name.startswith("processed_camera_")
    assert processed.suffix == ".mp4"
    assert source.read_bytes() == original_contents
    assert command[0] == "ffmpeg"
    assert command[command.index("-vf") + 1] == "scale=1280:trunc(ow/a/2)*2,fps=15"
    assert command[command.index("-c:v") + 1] == "libx264"
    assert kwargs["check"] is True


def test_preprocess_reports_missing_ffmpeg(tmp_path, monkeypatch):
    source = tmp_path / "camera.mp4"
    source.write_bytes(b"original video")

    def fake_run(*_args, **_kwargs):
        raise FileNotFoundError

    monkeypatch.setattr("app.services.video_preprocessing_service.subprocess.run", fake_run)

    with pytest.raises(FFmpegUnavailableError, match="FFmpeg is unavailable"):
        VideoPreprocessingService().preprocess(source)