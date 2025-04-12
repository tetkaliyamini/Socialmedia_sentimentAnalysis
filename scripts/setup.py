import subprocess
import sys

def install_dependencies():
    dependencies = [
        "tweepy",
        "textblob",
        "vaderSentiment",
        "pymongo",
        "requests"
    ]
    
    print("Installing Python dependencies...")
    for dep in dependencies:
        print(f"Installing {dep}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
    
    print("All dependencies installed successfully!")

if __name__ == "__main__":
    install_dependencies()

