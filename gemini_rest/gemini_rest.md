#!/bin/bash
set -e -E

GEMINI_API_KEY="$GEMINI_API_KEY"
MODEL_ID="gemini-2.5-flash"
GENERATE_CONTENT_API="streamGenerateContent"

cat << EOF > request.json
{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "iVBORw0KGgoAA..kJggg=="
            }
          },
          {
            "text": "what do you see here ?"
          },
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "text": "This image shows a **flight search calendar or date picker**, likely from a travel booking website or app, displaying flight prices for different dates.\n\nHere's a breakdown of what's visible:\n\n*   **Header:**\n    *   \"Round trip\" dropdown, indicating the type of flight search.\n    *   \"Reset\" button.\n    *   A highlighted \"Departure\" field with a calendar icon.\n    *   \"Sun, Jul 20\" displayed next to it, confirming that July 20th has been selected as the departure date.\n    *   Navigation arrows (< >) for changing the displayed month.\n\n*   **Calendar View:**\n    *   It shows two months: **July** and **August**.\n    *   **July:**\n        *   Days of the week (S, M, T, W, T, F, S) are listed.\n        *   Dates are shown, with prices underneath them (e.g., \"6\" with \"$1,440\").\n        *   **July 20th is circled and highlighted**, indicating it's the currently selected departure date, with a price of \"$1,170\".\n        *   Prices for other days in July are visible.\n    *   **August:**\n        *   Also shows days of the week and dates with prices.\n        *   Some prices are highlighted in **green** (e.g., August 6th \"$801\", August 11th \"$801\", August 12th \"$774\"), suggesting these are lower or \"best\" prices.\n        *   There's a right arrow on the side, likely to navigate to the next month (September).\n\n*   **Footer (partially visible):**\n    *   \"Showing prices in SGD for...\" suggests the currency is Singapore Dollars.\n    *   \"...7-day trips\" indicates the duration of the trip for which prices are being displayed.\n    *   A \"Done\" button is partially visible at the bottom right, which would likely confirm the date selection.\n\nIn summary, it's a user interface for selecting a flight departure date, with an emphasis on showing prices directly on the calendar for easy comparison. The green prices indicate the most affordable options."
          },
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "iVBORw0KGgoggg=="
            }
          },
          {
            "text": "and what now ?"
          },
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "text": "This image shows a **button or a label** that indicates a software or application is available for, or associated with, Apple devices, specifically **Firefox**.\n\nHere's a breakdown:\n\n*   **Apple Logo:** The iconic white Apple logo is prominently displayed on the left, signifying Apple's products or operating systems (like macOS or iOS).\n*   **\"Firefox\" Text:** To the right of the logo, the word \"Firefox\" is written in bold white text. Firefox is a popular web browser.\n*   **Background:** The background is a solid, dark gray or olive green color, which provides good contrast for the white elements.\n\nGiven its appearance, it likely functions as:\n*   A **download button** for Firefox on Apple devices.\n*   A **section header** indicating content related to Firefox for Apple.\n*   A **list item** in a selection of operating systems or browsers."
          },
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "text": "INSERT_INPUT_HERE"
          },
        ]
      },
    ],
    "generationConfig": {
      "thinkingConfig": {
        "thinkingBudget": 0,
      },
      "responseMimeType": "text/plain",
    },
}
EOF

curl \
-X POST \
-H "Content-Type: application/json" \
"https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}" -d '@request.json'
