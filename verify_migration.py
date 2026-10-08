#!/usr/bin/env python3
"""
Database Migration Verification Script
Checks if PostgreSQL migration is properly configured
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    exists = Path(filepath).exists()
    status = "✓" if exists else "✗"
    print(f"{status} {description}: {filepath}")
    return exists

def check_env_file():
    """Check .env file configuration"""
    print("\n📋 Checking .env Configuration...")
    env_file = Path(".env")
    
    if not env_file.exists():
        print("✗ .env file not found!")
        return False
    
    print("✓ .env file found")
    
    # Check required variables
    with open(env_file, 'r') as f:
        content = f.read()
    
    required_vars = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME"]
    all_present = True
    
    for var in required_vars:
        if var in content:
            print(f"  ✓ {var} is configured")
        else:
            print(f"  ✗ {var} is missing")
            all_present = False
    
    return all_present

def check_python_packages():
    """Check if required Python packages are installed"""
    print("\n📦 Checking Python Packages...")
    
    required_packages = {
        "fastapi": "FastAPI framework",
        "sqlalchemy": "SQLAlchemy ORM",
        "psycopg2": "PostgreSQL adapter",
        "uvicorn": "ASGI server",
        "ultralytics": "YOLOv8 model",
        "dotenv": "Environment variables",
    }
    
    all_installed = True
    
    for package, description in required_packages.items():
        try:
            __import__(package)
            print(f"✓ {package}: {description}")
        except ImportError:
            print(f"✗ {package}: {description} - NOT INSTALLED")
            all_installed = False
    
    if not all_installed:
        print("\n⚠️  Missing packages. Run: pip install -r requirements.txt")
    
    return all_installed

def check_database_config():
    """Check if database.py is configured for PostgreSQL"""
    print("\n🗄️  Checking Database Configuration...")
    
    db_file = Path("backend/database.py")
    
    if not db_file.exists():
        print("✗ backend/database.py not found!")
        return False
    
    with open(db_file, 'r') as f:
        content = f.read()
    
    checks = [
        ("postgresql://", "PostgreSQL driver configured"),
        ("DB_USER = os.getenv", "DB_USER from environment"),
        ("DB_PASSWORD = os.getenv", "DB_PASSWORD from environment"),
        ("pool_size=10", "Connection pooling configured"),
        ("pool_pre_ping=True", "Connection health check enabled"),
        ("DateTime", "DateTime column type used"),
        ("def init_db()", "Database initialization function"),
    ]
    
    all_good = True
    for check_string, description in checks:
        if check_string in content:
            print(f"✓ {description}")
        else:
            print(f"✗ {description}")
            all_good = False
    
    return all_good

def check_main_py():
    """Check if main.py is updated for PostgreSQL"""
    print("\n⚙️  Checking main.py Configuration...")
    
    main_file = Path("backend/main.py")
    
    if not main_file.exists():
        print("✗ backend/main.py not found!")
        return False
    
    with open(main_file, 'r') as f:
        content = f.read()
    
    checks = [
        ("from dotenv import load_dotenv", "Environment loading"),
        ("init_db", "Database initialization"),
        ("@app.on_event(\"startup\")", "Startup event configured"),
        ("datetime.utcnow()", "Proper datetime handling"),
        ("/health", "Health check endpoint"),
        ("order_by", "Query ordering in history"),
    ]
    
    all_good = True
    for check_string, description in checks:
        if check_string in content:
            print(f"✓ {description}")
        else:
            print(f"✗ {description}")
            all_good = False
    
    return all_good

def print_summary(results):
    """Print migration verification summary"""
    print("\n" + "="*50)
    print("MIGRATION VERIFICATION SUMMARY")
    print("="*50)
    
    if all(results.values()):
        print("\n✅ All checks passed!")
        print("\nNext steps:")
        print("1. Update .env with your PostgreSQL credentials")
        print("2. Create database: python -m psycopg2 or ./setup_db.ps1")
        print("3. Run: python -m uvicorn backend.main:app --reload")
    else:
        print("\n⚠️  Some checks failed. Please review above.")
        
        if not results.get("env_file"):
            print("  - Create/update .env file")
        if not results.get("python_packages"):
            print("  - Run: pip install -r requirements.txt")
        if not results.get("database_config"):
            print("  - Review backend/database.py")
        if not results.get("main_py"):
            print("  - Review backend/main.py")

def main():
    """Run all verification checks"""
    print("\n" + "="*50)
    print("PostgreSQL Migration Verification")
    print("="*50)
    
    results = {
        "files": all([
            check_file_exists("backend/database.py", "Database configuration"),
            check_file_exists("backend/main.py", "Main FastAPI app"),
            check_file_exists("requirements.txt", "Python requirements"),
            check_file_exists(".env", "Environment variables"),
        ]),
        "env_file": check_env_file(),
        "python_packages": check_python_packages(),
        "database_config": check_database_config(),
        "main_py": check_main_py(),
    }
    
    print_summary(results)
    
    # Return exit code
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    sys.exit(main())
