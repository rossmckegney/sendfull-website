#!/usr/bin/env node

/**
 * RSS Feed Updater for Sendfull Website
 * 
 * This script fetches the latest posts from the Sendfull Substack RSS feed
 * and updates the newsletter-rss.json file for the website.
 * 
 * Usage: node update-rss.js
 */

const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

const RSS_URL = 'https://sendfull.substack.com/feed';

function fetchRSS() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache'
      }
    };
    
    const req = https.get(RSS_URL, options, (res) => {
      console.log(`📡 Fetching RSS feed... (Status: ${res.statusCode})`);
      
      let data = '';
      let stream = res;
      
      // Handle compression
      if (res.headers['content-encoding'] === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (res.headers['content-encoding'] === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      } else if (res.headers['content-encoding'] === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      }
      
      stream.on('data', (chunk) => {
        data += chunk;
      });
      
      stream.on('end', () => {
        resolve(data);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function parseRSS(xmlText) {
  const posts = [];
  
  // Simple XML parsing to extract posts
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract title
    const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    
    // Extract description
    const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
    const description = descMatch ? descMatch[1] : '';
    
    // Extract link
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
    const link = linkMatch ? linkMatch[1] : '';
    
    // Extract pubDate
    const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
    const pubDate = dateMatch ? dateMatch[1] : '';
    
    // Extract image from enclosure
    const imageMatch = itemContent.match(/<enclosure[^>]*url="([^"]*)"[^>]*>/);
    const image = imageMatch ? imageMatch[1] : `https://picsum.photos/400/250?random=${Math.floor(Math.random() * 1000)}`;
    
    // Extract read time from description
    const readTimeMatch = description.match(/(\d+)\s*min\s*read/);
    const readTime = readTimeMatch ? `${readTimeMatch[1]} min read` : '5 min read';
    
    if (title && link) {
      posts.push({
        title: title,
        description: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        link: link,
        pubDate: pubDate,
        image: image,
        readTime: readTime
      });
    }
  }
  
  return posts.slice(0, 9); // Return only the first 9 posts
}

async function main() {
  try {
    console.log('🚀 Starting RSS feed update...\n');
    
    const xmlText = await fetchRSS();
    
    // Validate RSS feed
    if (!xmlText.includes('<rss') && !xmlText.includes('<feed')) {
      throw new Error('Invalid RSS feed format');
    }
    
    const posts = parseRSS(xmlText);
    console.log(`✅ Successfully parsed ${posts.length} posts`);
    
    if (posts.length === 0) {
      throw new Error('No posts found in RSS feed');
    }
    
    const output = {
      lastUpdated: new Date().toISOString(),
      posts: posts
    };
    
    fs.writeFileSync('newsletter-rss.json', JSON.stringify(output, null, 2));
    console.log('💾 Updated newsletter-rss.json');
    
    console.log('\n📋 Latest posts:');
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
    });
    
    console.log('\n🎉 RSS feed update complete!');
    console.log('💡 Next steps:');
    console.log('   git add newsletter-rss.json');
    console.log('   git commit -m "Update RSS feed"');
    console.log('   git push');
    
  } catch (error) {
    console.error('❌ Error updating RSS feed:', error.message);
    process.exit(1);
  }
}

main(); 