#!/bin/bash
# Script to update selkiesTitle from "Selkies" to "Iris OS" in the index file

# Find all index-*.js files in the assets directory
INDEX_FILES=$(find /usr/share/selkies/www/assets -name "index-*.js" 2>/dev/null)

if [ -z "$INDEX_FILES" ]; then
  echo "No index-*.js files found in /usr/share/selkies/www/assets/"
  exit 1
fi

# Process each found file
for FILE in $INDEX_FILES; do
  echo "Processing file: $FILE"

  # Create a backup of the original file
  cp "$FILE" "${FILE}.bak"

  # Replace all occurrences of selkiesTitle: "Selkies" with selkiesTitle: "Iris OS"
  if grep -q 'selkiesTitle:"Selkies"' "$FILE"; then
    sed -i 's/selkiesTitle:"Selkies"/selkiesTitle:"Iris OS"/g' "$FILE"
    echo "Successfully updated selkiesTitle to 'Iris OS' in $FILE"
  else
    echo "Pattern 'selkiesTitle:\"Selkies\"' not found in $FILE"
  fi
done