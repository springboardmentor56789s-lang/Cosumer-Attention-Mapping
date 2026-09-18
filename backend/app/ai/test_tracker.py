from tracker import PersonTracker


tracker = PersonTracker()

video_path = r"..\uploads\istockphoto-2175577591-640_adpp_is.mp4"

result = tracker.track_video(video_path)


print("\nTracking Summary")
print("----------------")
print("FPS:", result["fps"])
print("Unique people tracked:", result["unique_people_tracked"])


for person_id, data in result["people"].items():

    print(
        f"Person {person_id}: "
        f"{data['frames_seen']} frames, "
        f"{data['dwell_time_seconds']} seconds"
    )