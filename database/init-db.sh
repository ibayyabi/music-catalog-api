#!/bin/bash
set -e

echo "Starting database initialization..."

# Check if the SQL dump exists
if [ -f /docker-entrypoint-initdb.d/musikk_fixed.sql.gz ]; then
    echo "Found musikk_fixed.sql.gz, decompressing and importing..."
    
    # Decompress and import the SQL dump
    gunzip -c /docker-entrypoint-initdb.d/musikk_fixed.sql.gz | mysql -u root -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}"
    
    echo "✓ Database initialized successfully from musikk_fixed.sql.gz"
else
    echo "⚠ Warning: musikk_fixed.sql.gz not found, skipping import"
fi

echo "Database initialization complete!"
