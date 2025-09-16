#!/usr/bin/env python3
"""
BRAMBLE Climate Data Platform - Setup Script
Automated setup and installation script for the BRAMBLE project.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            check=True
        )
        print(f"✅ {command}")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running: {command}")
        print(f"Error: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")

def check_node_version():
    """Check if Node.js version is compatible"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        version = result.stdout.strip()
        print(f"✅ Node.js {version}")
        return True
    except FileNotFoundError:
        print("❌ Node.js is not installed")
        return False

def setup_backend():
    """Setup the FastAPI backend"""
    print("\n🔧 Setting up Backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Install Python dependencies
    print("Installing Python dependencies...")
    if run_command("pip install -r requirements.txt", cwd=backend_dir) is None:
        return False
    
    # Create .env file if it doesn't exist
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("Creating .env file...")
        env_content = """# BRAMBLE Backend Environment Variables
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///./bramble_climate.db
DEBUG=True
"""
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file")
    
    print("🗄️ SQLite database will be created automatically on first run")
    
    # Seed database with sample data
    print("🌱 Seeding database with sample data...")
    if run_command("python seed_data.py", cwd=backend_dir) is None:
        print("⚠️ Database seeding failed, but setup can continue")
    
    return True

def setup_frontend():
    """Setup the React frontend"""
    print("\n🔧 Setting up Frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install Node.js dependencies
    print("Installing Node.js dependencies...")
    if run_command("npm install", cwd=frontend_dir) is None:
        return False
    
    return True

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    directories = [
        "data",
        "docs",
        "ml_pipeline/models",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created {directory}/")

def main():
    """Main setup function"""
    print("🌍 BRAMBLE Climate Data Platform Setup")
    print("=" * 50)
    
    # Check system requirements
    print("\n🔍 Checking system requirements...")
    check_python_version()
    if not check_node_version():
        print("Please install Node.js from https://nodejs.org/")
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the backend: cd backend && python main.py")
    print("2. Start the frontend: cd frontend && npm start")
    print("3. Open http://localhost:3000 in your browser")
    print("\n📚 For more information, see README.md")

if __name__ == "__main__":
    main()
