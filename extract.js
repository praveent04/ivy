const axios = require('axios');

// Simple delay function
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function extractNames() {
// Track what we've found and processed
const foundNames = new Set();
const processedQueries = new Set();

// Start with a-z as our initial queries
const queue = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Keep some stats
let requestCount = 0;
let rateLimitHits = 0;
const startTime = Date.now();

console.log("Starting name extraction...");

while (queue.length > 0) {
const query = queue.shift();

// Skip if we've already processed this query
if (processedQueries.has(query)) {
  continue;
}

try {
  // Add a small delay between requests to avoid hammering the API
  // Using a smaller delay to speed things up
  await wait(150 + Math.random() * 50); // Randomize a bit to avoid patterns
  
  const response = await axios.get(`http://35.200.185.69:8000/v1/autocomplete?query=${query}`);
  requestCount++;
  
  // Mark this query as processed
  processedQueries.add(query);
  
  // Process the results
  if (response.data && response.data.results) {
    const results = response.data.results;
    
    for (const name of results) {
      // If this is a new name, add it to our collection
      if (!foundNames.has(name)) {
        foundNames.add(name);
        
        // Also add it as a new query if we haven't processed it yet
        if (!processedQueries.has(name)) {
          queue.push(name);
        }
      }
    }
  }
  
  // Show progress every 25 requests
  if (requestCount % 25 === 0) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const rate = (foundNames.size / elapsed).toFixed(1);
    
    console.log(`Progress: ${foundNames.size} names, ${queue.length} queries left`);
    console.log(`Made ${requestCount} requests (${rateLimitHits} rate limits)`);
    console.log(`Running for ${formatTime(elapsed)} (${rate} names/sec)\n`);
  }
  
} catch (error) {
  // Handle rate limiting
  if (error.response && error.response.status === 429) {
    rateLimitHits++;
    
    // Get retry time from header or use default
    let retryTime = 200; // Start with a small retry time to speed up
    
    if (rateLimitHits > 5) {
      // If we're getting a lot of rate limits, back off more aggressively
      retryTime = 500 * Math.min(rateLimitHits - 5, 5);
    }
    
    console.log(`Hit rate limit on "${query}" - waiting ${retryTime}ms`);
    
    // Put the query back in the queue and wait
    queue.unshift(query);
    await wait(retryTime);
  } else {
    // For other errors, log and retry later
    console.error(`Error with query "${query}": ${error.message}`);
    queue.push(query); // Add to end of queue to retry later
    await wait(300);
  }
}
}

// We're done! Show the results
const names = Array.from(foundNames);
const elapsed = Math.floor((Date.now() - startTime) / 1000);

console.log("\n===== EXTRACTION COMPLETE =====");
console.log(`Found ${names.length} names`);
console.log(`Made ${requestCount} API requests`);
console.log(`Encountered ${rateLimitHits} rate limits`);
console.log(`Completed in ${formatTime(elapsed)}`);

return {
names,
count: names.length,
requests: requestCount,
time: elapsed
};
}

// Format seconds as hours, minutes, seconds
function formatTime(seconds) {
const hrs = Math.floor(seconds / 3600);
const mins = Math.floor((seconds % 3600) / 60);
const secs = seconds % 60;
return `${hrs}h ${mins}m ${secs}s`;
}

// Run it!
(async () => {
try {
console.log("Extracting names from autocomplete API...");
const result = await extractNames();
console.log(`Successfully extracted ${result.count} names in ${formatTime(result.time)}`);
console.log("Sample names:", result.names.slice(0, 10));
} catch (err) {
console.error("Something went wrong:", err);
}
})();