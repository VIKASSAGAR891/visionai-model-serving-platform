# PostgreSQL Migration Checklist

## ✅ Pre-Migration Tasks

- [ ] Backup existing SQLite database (predictions.db)
- [ ] Review current SQLite database schema
- [ ] Document any custom SQLite configurations
- [ ] Ensure PostgreSQL is installed (version 12+)
- [ ] Verify PostgreSQL is running

## ✅ Installation & Setup

- [ ] Download all migration files
- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Update `.env` file with PostgreSQL credentials
- [ ] Verify DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME in .env

## ✅ Database Setup

- [ ] Create PostgreSQL user (usually 'postgres')
- [ ] Run database setup script:
  - [ ] Windows: `.\setup_db.ps1`
  - [ ] macOS/Linux: `./setup_db.sh`
  - [ ] Or manually: `createdb -U postgres aivision`
- [ ] Verify database created: `psql -l` or pgAdmin
- [ ] Check database is empty and ready for migration

## ✅ Code Migration

- [ ] Verify `backend/database.py` updated
  - [ ] PostgreSQL URL configured
  - [ ] Environment variables loaded
  - [ ] Connection pooling enabled
  - [ ] DateTime column type used
  - [ ] init_db() function exists
  
- [ ] Verify `backend/main.py` updated
  - [ ] Imports dotenv
  - [ ] Startup event added
  - [ ] Error handling with try-except
  - [ ] Health check endpoint added
  - [ ] Datetime handling fixed
  - [ ] Response structures improved

- [ ] Verify `requirements.txt` updated
  - [ ] psycopg2-binary >= 2.9
  - [ ] python-dotenv >= 1.0
  - [ ] All FastAPI dependencies included

## ✅ Configuration Files

- [ ] `.env` created with credentials
- [ ] `.gitignore` includes .env
- [ ] `docker-compose.yml` created (optional)
- [ ] `Dockerfile` created (optional)
- [ ] `setup_db.ps1` or `setup_db.sh` created

## ✅ Testing & Verification

- [ ] Run verification script: `python verify_migration.py`
  - [ ] All file checks pass
  - [ ] All environment checks pass
  - [ ] All code checks pass

- [ ] Test database connection:
  ```bash
  python -c "from backend.database import engine; engine.connect(); print('✓ Connected')"
  ```

- [ ] Start application:
  ```bash
  python -m uvicorn backend.main:app --reload
  ```

- [ ] Test endpoints:
  - [ ] GET `/health` - Returns healthy status
  - [ ] GET `/` - Returns API message
  - [ ] GET `/docs` - Swagger UI loads
  - [ ] GET `/history` - Returns empty predictions (or existing data)

- [ ] Upload test image:
  ```bash
  curl -X POST -F "file=@test.jpg" http://localhost:8000/predict
  ```

- [ ] Verify prediction stored in PostgreSQL:
  ```bash
  curl http://localhost:8000/history
  ```

## ✅ Data Migration (If Migrating from Existing DB)

- [ ] Export data from SQLite:
  ```bash
  sqlite3 predictions.db "SELECT * FROM predictions;" > predictions_backup.csv
  ```

- [ ] Import data to PostgreSQL (if needed):
  ```sql
  COPY predictions FROM 'predictions_backup.csv' CSV;
  ```

- [ ] Verify all data migrated correctly
- [ ] Run data validation queries

## ✅ Docker Setup (Optional)

- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Test Docker Compose:
  ```bash
  docker-compose up -d
  ```
- [ ] Verify containers running:
  ```bash
  docker-compose ps
  ```
- [ ] Test API via Docker:
  ```bash
  curl http://localhost:8000/health
  ```
- [ ] Check logs:
  ```bash
  docker-compose logs -f fastapi_app
  ```

## ✅ Security Hardening

- [ ] `.env` added to `.gitignore`
- [ ] Credentials NOT committed to version control
- [ ] Strong password set for PostgreSQL user
- [ ] CORS origins configured for production
- [ ] Connection pooling configured
- [ ] Connection health checks enabled

## ✅ Documentation

- [ ] MIGRATION_GUIDE.md reviewed
- [ ] MIGRATION_SUMMARY.md reviewed
- [ ] Code comments added where necessary
- [ ] API documentation updated (FastAPI /docs)
- [ ] README updated with PostgreSQL info

## ✅ Backup & Rollback

- [ ] Original SQLite database backed up
- [ ] Original code backed up to Git
- [ ] Rollback plan documented
- [ ] All team members notified of migration

## ✅ Production Deployment

- [ ] Update production `.env` file
- [ ] Create production PostgreSQL instance
- [ ] Test with production data volume
- [ ] Configure SSL/TLS for connections
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Load testing completed

## ✅ Final Verification

- [ ] Prediction storage working: ✓
- [ ] Confidence storage working: ✓
- [ ] Timestamp storage working: ✓
- [ ] History endpoint working: ✓
- [ ] Image processing working: ✓
- [ ] Frontend unchanged and working: ✓
- [ ] Database performance acceptable: ✓

## 📞 Troubleshooting Checklist

If any issue occurs, check:

- [ ] PostgreSQL is running: `pg_isready`
- [ ] Database exists: `psql -l`
- [ ] Credentials in `.env` are correct
- [ ] `.env` file in project root
- [ ] All dependencies installed: `pip list | grep -i psycopg`
- [ ] No SQLite imports remaining in code
- [ ] All imports using new database module
- [ ] Network connectivity to database server
- [ ] Firewall allows port 5432
- [ ] Database user has create table permissions

## 🎯 Sign-Off

- [ ] Migration completed successfully
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Team trained on new setup
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

**Migration Date:** _____________  
**Completed By:** _____________  
**Verified By:** _____________  

---

### Notes:
```
[Add any special notes or issues encountered during migration]




```

---

**Status: ✅ MIGRATION CHECKLIST COMPLETE**
