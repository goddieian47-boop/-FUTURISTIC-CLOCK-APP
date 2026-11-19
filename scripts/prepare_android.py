#!/usr/bin/env python3
"""Prepare Android-only resources after `npx cap add android`.

Creates a minimal notification/ringtone resource set so Gradle builds can
consume the app even though source audio and PNG assets are not committed.
"""

from pathlib import Path
import struct
import wave

ROOT = Path(__file__).resolve().parents[1]
ANDROID = ROOT / "android"
RES = ANDROID / "app" / "src" / "main" / "res"
RAW = RES / "raw"


def write_tone(path: Path, frequency: int = 880, duration_seconds: float = 1.0) -> None:
    """Write a small mono 16-bit PCM WAV file."""
    sample_rate = 22050
    frame_count = int(sample_rate * duration_seconds)

    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)

        for frame in range(frame_count):
            position = frame / sample_rate
            envelope = min(1.0, position * 20, (duration_seconds - position) * 20)
            amplitude = int(7000 * envelope)
            sample = amplitude if int(position * frequency) % 2 == 0 else -amplitude
            wav.writeframesraw(struct.pack("<h", sample))
        wav.writeframes(b"")


def main() -> None:
    if not ANDROID.is_dir():
        raise RuntimeError("Android project not found; run `npx cap add android` first")

    RAW.mkdir(parents=True, exist_ok=True)
    write_tone(RAW / "orbit_alarm.wav", 880, 1.2)

    print("Prepared Android ringtone resources:")
    print(f"  {RAW / 'orbit_alarm.wav'}")


if __name__ == "__main__":
    main()
