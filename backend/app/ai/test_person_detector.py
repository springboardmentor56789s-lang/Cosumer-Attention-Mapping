from person_detector import PersonDetector

detector = PersonDetector()

result = detector.detect_people(
    "frames",
    "outputs/detected_frames"
)

print(result)