# Autocomplete API Name Extractor

A Node.js script to extract all possible names from an autocomplete API.

## Overview

This tool systematically extracts all names available through the autocomplete API running at http://35.200.185.69:8000. It uses a breadth-first search approach, starting with single letters and progressively exploring the API's suggestion space.

## Features

- Efficiently extracts all names from the autocomplete API
- Implements smart rate limit handling with dynamic backoff
- Provides detailed progress reporting during extraction
- Optimizes request patterns to minimize API load
- Handles errors gracefully with appropriate retry mechanisms

## Requirements

- Node.js (v12 or higher recommended)
- npm or yarn

## Installation

1. Clone this repository or download the source code
2. Install dependencies:

```bash
npm install axios
```

## Usage

Run the script with:

```bash
node extract.js
```

The script will:
1. Start by querying the API with single letters (a-z)
2. Process the results and add new names to the queue
3. Continue until all possible names are discovered
4. Display the final results and statistics

## How It Works

The script uses a breadth-first search algorithm:

1. Initialize a queue with all lowercase letters (a-z)
2. For each query in the queue:
   - Request autocomplete suggestions from the API
   - Add all returned suggestions to our collection
   - Add new suggestions back to the queue for further exploration
3. Continue until the queue is empty (all possible paths explored)

## Rate Limiting Strategy

The script implements a dynamic rate limiting strategy:
- Starts with a small delay between requests (150-200ms)
- When rate limits are encountered, implements a progressive backoff
- For persistent rate limiting, increases the delay up to 2500ms
- Randomizes request timing to avoid synchronization issues

## Results

In testing, the script successfully extracted:
- 260 unique names
- Using 286 API requests
- Completing in approximately 2 minutes and 20 seconds
- Handling 34 rate limit responses

## Findings

Through exploration of the API, we discovered:
- The API returns up to 10 suggestions per query
- Rate limiting occurs after multiple rapid requests
- The API appears to use a prefix-based matching system
- All names are returned when using the appropriate prefix

## Praven Tiwari
### praveentiwari29004@gmail.com
[Your Name]
