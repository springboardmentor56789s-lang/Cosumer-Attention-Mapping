#!/usr/bin/env python
"""
Main script to seed the database with sample data.
Run this from the backend directory: python seed_data.py
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database.import_data import DatasetImporter, main

if __name__ == "__main__":
    main()
