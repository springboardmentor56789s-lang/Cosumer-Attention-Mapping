import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_root = os.path.dirname(backend_dir)
ai_engine_dir = os.path.join(project_root, "ai-engine")

for d in [backend_dir, project_root, ai_engine_dir]:
    if d not in sys.path:
        sys.path.insert(0, d)
