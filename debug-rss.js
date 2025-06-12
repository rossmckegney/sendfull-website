const https = require('https');

const RSS_URL = 'https://sendfull.substack.com/feed';

function fetchRSS() {
  return new Promise((resolve, reject) => {
    const req = https.get(RSS_URL, (res) => {
      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function main() {
  try {
    console.log('Fetching RSS feed from:', RSS_URL);
    const xmlText = await fetchRSS();
    
    console.log('\n=== RSS FEED CONTENT (first 1000 chars) ===');
    console.log(xmlText.substring(0, 1000));
    console.log('\n=== END OF SAMPLE ===');
    
    console.log('\n=== VALIDATION CHECKS ===');
    console.log('Contains <rss:', xmlText.includes('<rss'));
    console.log('Contains <feed:', xmlText.includes('<feed'));
    console.log('Contains <item:', xmlText.includes('<item'));
    console.log('Contains <title:', xmlText.includes('<title'));
    
    console.log('\n=== FEED LENGTH ===');
    console.log('Total length:', xmlText.length, 'characters');
    
    if (!xmlText.includes('<rss') && !xmlText.includes('<feed')) {
      console.log('\n❌ ERROR: Invalid RSS feed format - no <rss> or <feed> tags found');
      
      // Check if it's an HTML page instead
      if (xmlText.includes('<html') || xmlText.includes('<!DOCTYPE')) {
        console.log('⚠️  WARNING: This appears to be an HTML page, not an RSS feed');
        console.log('The RSS URL might be redirecting to a login page or error page');
      }
    } else {
      console.log('\n✅ RSS feed format appears valid');
    }
    
  } catch (error) {
    console.error('Error fetching RSS feed:', error.message);
  }
}

main(); 