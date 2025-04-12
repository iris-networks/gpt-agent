import axios from 'axios';
import jwt from 'jsonwebtoken';

/**
 * Fetches environment variables from the external API and populates process.env
 * @param {object} options Configuration options
 * @param {string} options.secretKey JWT secret key for token generation
 * @param {string} options.agentId Agent ID to identify this agent
 * @param {string} options.baseUrl Base URL for the API endpoint (defaults to https://agent.tryiris.dev)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function fetchEnvironmentVariables({
  secretKey,
  agentId,
  baseUrl = 'https://agent.tryiris.dev'
}: {
  secretKey: string;
  agentId: string;
  baseUrl?: string;
}): Promise<boolean> {
  try {
    // Create JWT token with no expiration
    const token = jwt.sign(
      {
        agentId,
        timestamp: Date.now(),
      },
      secretKey
    );

    // Make the request to fetch environment variables
    const response = await axios.get(`${baseUrl}/api/config`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    });

    // Validate response
    if (!response.data || typeof response.data !== 'object') {
      console.error('Invalid response format from environment API');
      return false;
    }

    // Populate process.env with the response data
    Object.entries(response.data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        process.env[key] = value;
      } else if (value !== null && value !== undefined) {
        process.env[key] = JSON.stringify(value);
      }
    });

    console.log(`Successfully fetched ${Object.keys(response.data).length} environment variables`);
    return true;
  } catch (error) {
    console.error('Failed to fetch environment variables:', error);
    return false;
  }
}

/**
 * Initialize environment variables with retry
 * @param {object} config Configuration options for JWT and API endpoint
 * @param {number} maxRetries Maximum number of retry attempts
 * @param {number} retryDelay Base delay between retries in ms (uses exponential backoff)
 * @returns {Promise<boolean>} True if successful, false if all retries failed
 */
export async function initializeEnvironment(
  config: {
    secretKey: string;
    agentId: string;
    baseUrl?: string;
  },
  maxRetries = 3,
  retryDelay = 1000
): Promise<boolean> {
  let retries = 0;
  
  while (retries <= maxRetries) {
    const success = await fetchEnvironmentVariables(config);
    
    if (success) {
      return true;
    }
    
    retries++;
    
    if (retries <= maxRetries) {
      const delay = retryDelay * Math.pow(2, retries - 1); // Exponential backoff
      console.log(`Retrying environment fetch in ${delay}ms (attempt ${retries}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`Failed to fetch environment variables after ${maxRetries} attempts`);
  return false;
}