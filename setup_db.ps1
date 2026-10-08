# PostgreSQL Database Setup Script for AI Vision Platform (Windows PowerShell)

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "AI Vision Platform - PostgreSQL Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Load environment variables from .env
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]*)\s*=\s*(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✓ Loaded environment variables from .env" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with database credentials" -ForegroundColor Yellow
    exit 1
}

# Check if psql is installed
try {
    psql --version | Out-Null
} catch {
    Write-Host "✗ PostgreSQL client (psql) is not installed" -ForegroundColor Red
    Write-Host "Please install PostgreSQL first from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nAttempting to connect to PostgreSQL server..." -ForegroundColor Yellow

# Set environment variable for password
$env:PGPASSWORD = [Environment]::GetEnvironmentVariable("DB_PASSWORD", "Process")

# Get environment variables
$DB_HOST = [Environment]::GetEnvironmentVariable("DB_HOST", "Process")
$DB_USER = [Environment]::GetEnvironmentVariable("DB_USER", "Process")
$DB_PORT = [Environment]::GetEnvironmentVariable("DB_PORT", "Process")
$DB_NAME = [Environment]::GetEnvironmentVariable("DB_NAME", "Process")

# Create the database
$checkDb = psql -h $DB_HOST -U $DB_USER -p $DB_PORT -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'"

if ($checkDb -eq "1") {
    Write-Host "✓ Database '$DB_NAME' already exists" -ForegroundColor Green
} else {
    psql -h $DB_HOST -U $DB_USER -p $DB_PORT -c "CREATE DATABASE $DB_NAME"
    if ($?) {
        Write-Host "✓ Database '$DB_NAME' created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your PostgreSQL credentials" -ForegroundColor Green
Write-Host "2. Run: pip install -r requirements.txt" -ForegroundColor Green
Write-Host "3. Run: python -m uvicorn backend.main:app --reload" -ForegroundColor Green
