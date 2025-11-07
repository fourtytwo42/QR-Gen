/**
 * Web Risk API integration for malicious URL screening
 * Requires WEBRISK_API_KEY environment variable
 */

export interface WebRiskCheckResult {
  safe: boolean;
  threats: string[];
}

/**
 * Check URL against Google Web Risk API
 */
export async function checkURLSafety(url: string): Promise<WebRiskCheckResult> {
  const apiKey = process.env.WEB_RISK_API_KEY;
  
  if (!apiKey) {
    console.warn('WEB_RISK_API_KEY not configured, skipping safety check');
    return { safe: true, threats: [] };
  }

  try {
    // Google Web Risk API v1
    const endpoint = 'https://webrisk.googleapis.com/v1/uris:search';
    const params = new URLSearchParams({
      key: apiKey,
      threatTypes: 'MALWARE,SOCIAL_ENGINEERING,UNWANTED_SOFTWARE',
      uri: url,
    });

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Web Risk API error:', response.statusText);
      return { safe: true, threats: [] }; // Fail open
    }

    const data = await response.json();
    
    if (data.threat) {
      return {
        safe: false,
        threats: data.threat.threatTypes || [],
      };
    }

    return { safe: true, threats: [] };
  } catch (error) {
    console.error('Error checking URL safety:', error);
    return { safe: true, threats: [] }; // Fail open on error
  }
}

/**
 * Batch check multiple URLs
 */
export async function checkURLsBatch(urls: string[]): Promise<Map<string, WebRiskCheckResult>> {
  const results = new Map<string, WebRiskCheckResult>();
  
  // Check URLs sequentially to avoid rate limiting
  for (const url of urls) {
    const result = await checkURLSafety(url);
    results.set(url, result);
  }
  
  return results;
}

