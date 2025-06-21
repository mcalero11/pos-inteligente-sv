#!/bin/bash

# Database Seeder Script for POS Inteligente SV
# This script runs the database seeder to populate initial data

set -e

echo "🌱 POS Database Seeder"
echo "======================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to the project directory
cd "$PROJECT_DIR"

# Default database path (relative to project root)
DB_PATH="pos_database.db"

# Check if a custom database path was provided
if [ $# -gt 0 ]; then
    DB_PATH="$1"
fi

echo "Project directory: $PROJECT_DIR"
echo "Database path: $DB_PATH"
echo

# Check if the database file exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Error: Database file '$DB_PATH' not found!"
    echo "Please run the application first to create the database with migrations."
    echo
    echo "Or specify a different database path:"
    echo "  ./scripts/run_seeder.sh /path/to/your/database.db"
    exit 1
fi

echo "📦 Building seeder..."
cargo build --bin seed --release

if [ $? -ne 0 ]; then
    echo "❌ Failed to build seeder"
    exit 1
fi

echo
echo "🚀 Running seeder..."
echo

# Run the seeder with the database path
./target/release/seed "$DB_PATH"

echo
echo "✅ Seeder completed!"
echo
echo "You can now run this script again to re-seed the database if needed."
echo "Note: The seeder uses INSERT OR IGNORE, so existing data won't be duplicated." 
