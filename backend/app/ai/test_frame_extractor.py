from frame_extractor import extract_frames

video = r"..\uploads\istockphoto-2175577591-640_adpp_is.mp4"
output = "frames"

count = extract_frames(video, output)

print(f"{count} frames extracted successfully.")