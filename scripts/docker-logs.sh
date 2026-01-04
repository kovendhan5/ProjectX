#!/bin/bash

# View Docker Compose Logs

echo "Viewing Docker Compose logs..."
echo "Press Ctrl+C to exit"
echo ""

cd infrastructure
docker-compose logs -f "$@"
