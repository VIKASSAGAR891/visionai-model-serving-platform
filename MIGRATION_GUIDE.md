# AI Vision Platform - PostgreSQL Migration Guide

## Overview
This document provides complete instructions for migrating from SQLite to PostgreSQL.

## Prerequisites
- **PostgreSQL** 12+ installed locally or available as a service
- **Python** 3.8+
- **pip** package manager

---

## Step 1: Install PostgreSQL

### Windows
1. Download installer from: https://www.postgresql.org/download/windows/
2. Run the installer with default settings
3. **Remember the password you set for the `postgres` user**
4. Install pgAdmin (optional, for GUI management)

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## Step 2: Configure Environment Variables

1. Edit the `.env` file in your project root:
```bash
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aivision
```

**⚠️ IMPORTANT:** Update `DB_PASSWORD` with your actual PostgreSQL password.

---

## Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Key packages added:
- `psycopg2-binary` - PostgreSQL adapter for Python
- `python-dotenv` - Load environment variables from .env
- Additional SQLAlchemy optimizations

---

## Step 4: Create PostgreSQL Database

### Option A: Windows (PowerShell)
```powershell
.\setup_db.ps1
```

### Option B: macOS/Linux (Bash)
```bash
chmod +x setup_db.sh
./setup_db.sh
```

### Option C: Manual Creation
```bash
psql -U postgres -h localhost

# In psql prompt:
CREATE DATABASE aivision;
\q
```

---

## Step 5: Verify Database Connection

```bash
python -c "from backend.database import engine; engine.connect(); print('✓ Connected to PostgreSQL')"
```

---

## Step 6: Run the Application

```bash
python -m uvicorn backend.main:app --reload
```

The API will be available at: `http://localhost:8000`

---

## Step 7: Test Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

### Upload Image for Prediction
```bash
curl -X POST -F "file=@test_image.jpg" http://localhost:8000/predict
```

### View Prediction History
```bash
curl http://localhost:8000/history
```

---

## Key Changes Made

### 1. **database.py**
- Uses `postgresql://` driver instead of `sqlite:///`
- Loads credentials from `.env` file
- Added connection pooling
- Changed timestamp from `String` to `DateTime`
- Added `init_db()` function for table creation

### 2. **main.py**
- Imports from `.env` using `python-dotenv`
- Added startup event to initialize database
- Improved error handling with try-except blocks
- Fixed timestamp handling (datetime objects vs strings)
- Added health check endpoint
- Better response structures

### 3. **.env**
- Contains all database credentials
- Keep this file secret (added to `.gitignore`)

### 4. **requirements.txt**
- Added PostgreSQL adapter: `psycopg2-binary`
- Added environment management: `python-dotenv`

---

## Docker Deployment (Optional)

### Build and Run with Docker Compose
```bash
docker-compose up -d
```

This will:
1. Create a PostgreSQL container
2. Build and run the FastAPI application
3. Set up networking between services

### View Logs
```bash
docker-compose logs -f fastapi_app
```

### Stop Services
```bash
docker-compose down
```

---

## Preserving Functionality

All original features are preserved with PostgreSQL:

✓ **Prediction Storage** - Objects detected stored in database  
✓ **Confidence Storage** - Detection confidence scores stored  
✓ **Timestamp Storage** - When predictions were made (with better DateTime handling)  
✓ **History Endpoint** - `/history` endpoint returns all predictions  
✓ **Image Processing** - YOLOv8 model works unchanged  
✓ **Frontend** - No changes needed to frontend code  

---

## Migration Checklist

- [ ] PostgreSQL installed locally
- [ ] `.env` file created and updated with credentials
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Database created: `setup_db.ps1` or `setup_db.sh`
- [ ] Connection verified
- [ ] Application running: `uvicorn backend.main:app --reload`
- [ ] `/health` endpoint responds
- [ ] Image prediction works: `/predict` endpoint
- [ ] History loads: `/history` endpoint

---

## Troubleshooting

### Connection Refused
```
Error: could not connect to server: Connection refused
```
- Ensure PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Check credentials in `.env` file
- Verify port 5432 is not blocked by firewall

### Database Does Not Exist
```
Error: database "aivision" does not exist
```
- Run `setup_db.ps1` (Windows) or `setup_db.sh` (macOS/Linux)
- Or manually create: `createdb -U postgres aivision`

### Wrong Password
```
Error: FATAL: password authentication failed
```
- Update `DB_PASSWORD` in `.env` file
- Ensure it matches your PostgreSQL user password

### Module Not Found
```
ModuleNotFoundError: No module named 'psycopg2'
```
- Run: `pip install -r requirements.txt`
- Ensure you're in the correct Python environment

---

## Performance Optimizations

### Connection Pooling
SQLAlchemy connection pooling is configured in `database.py`:
- `pool_size=10` - Default connections
- `max_overflow=20` - Additional connections under load
- `pool_pre_ping=True` - Verify connections before use

### Database Indexes
Indexes are automatically created on:
- `id` (primary key)
- `filename`
- `timestamp`

These improve query performance for history retrieval.

---

## Next Steps

1. Set up automated backups for PostgreSQL
2. Configure SSL connections for production
3. Implement connection string encryption
4. Set up monitoring and logging
5. Consider horizontal scaling with read replicas

---

## Support

For issues, check:
1. PostgreSQL logs: `/var/log/postgresql/`
2. Application logs: `stdout` from uvicorn
3. `.env` file configuration

---

**Migration completed successfully! Your project now uses PostgreSQL.** 🎉
