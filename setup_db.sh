#!/bin/bash
# PostgreSQL Database Setup Script for AI Vision Platform

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}AI Vision Platform - PostgreSQL Setup${NC}"
echo -e "${YELLOW}========================================${NC}"

# Load environment variables from .env
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo -e "${GREEN}✓ Loaded environment variables from .env${NC}"
else
    echo -e "${RED}✗ .env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file with database credentials${NC}"
    exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL client (psql) is not installed${NC}"
    echo -e "${YELLOW}Please install PostgreSQL client first${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Attempting to connect to PostgreSQL server...${NC}"

# Create the database
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -p $DB_PORT -c "CREATE DATABASE $DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database '$DB_NAME' created successfully (or already exists)${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Database setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${GREEN}1. Update .env file with your PostgreSQL credentials${NC}"
echo -e "${GREEN}2. Run: pip install -r requirements.txt${NC}"
echo -e "${GREEN}3. Run: python -m uvicorn backend.main:app --reload${NC}"
