#!/usr/bin/env python3
"""
Backend CLI helper for Email OTP dispatch.
"""
import sys
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
sys.path.insert(0, script_dir)
sys.path.insert(0, root_dir)

from send_email_otp import main

if __name__ == "__main__":
    main()
