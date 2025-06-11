// Newsletter RSS Feed Integration
class NewsletterFeed {
    constructor() {
        this.rssUrl = 'https://sendfull.substack.com/feed';
        this.maxPosts = 9;
        this.gridElement = document.getElementById('newsletter-grid');
        this.init();
    }

    async init() {
        try {
            await this.loadPosts();
        } catch (error) {
            console.error('Error loading newsletter posts:', error);
            this.showError();
        }
    }

    async loadPosts() {
        // Try multiple CORS proxies for reliability, with cache-busting
        const proxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/',
            'https://cors-anywhere.herokuapp.com/',
            'https://cors.bridged.cc/',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://cors.io/?'
        ];

        let lastError;
        
        for (const proxy of proxies) {
            try {
                // Add cache-busting parameter to ensure fresh content
                const cacheBuster = '&_t=' + Date.now();
                const url = proxy + encodeURIComponent(this.rssUrl) + cacheBuster;
                
                console.log(`Trying proxy: ${proxy}`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/xml, text/xml, */*',
                        'User-Agent': 'Mozilla/5.0 (compatible; Sendfull/1.0)',
                        'Cache-Control': 'no-cache'
                    },
                    timeout: 15000
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const xmlText = await response.text();
                console.log(`Successfully fetched RSS feed from ${proxy}, length: ${xmlText.length}`);
                
                // Check if we got valid XML
                if (!xmlText.includes('<rss') && !xmlText.includes('<feed')) {
                    throw new Error('Invalid RSS feed format');
                }

                const posts = this.parseRSSFeed(xmlText);
                console.log(`Parsed ${posts.length} posts from RSS feed`);
                
                if (posts.length > 0) {
                    console.log('Latest post date:', posts[0].pubDate);
                    console.log('Latest post title:', posts[0].title);
                }
                
                this.displayPosts(posts);
                return; // Success, exit the loop
                
            } catch (error) {
                console.warn(`Proxy ${proxy} failed:`, error);
                lastError = error;
                continue; // Try next proxy
            }
        }
        
        // If all proxies failed, try direct fetch (might work in some browsers)
        try {
            console.log('Trying direct fetch...');
            const response = await fetch(this.rssUrl + '?_t=' + Date.now(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/xml, text/xml, */*',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const xmlText = await response.text();
                console.log(`Direct fetch successful, length: ${xmlText.length}`);
                const posts = this.parseRSSFeed(xmlText);
                this.displayPosts(posts);
                return;
            }
        } catch (directError) {
            console.warn('Direct fetch also failed:', directError);
        }
        
        // If RSS feed fails, try fallback JSON
        try {
            console.log('Trying fallback posts...');
            await this.loadFallbackPosts();
            return;
        } catch (fallbackError) {
            console.warn('Fallback also failed:', fallbackError);
        }
        
        // If everything failed, show error
        throw lastError || new Error('All fetch methods failed');
    }

    async loadFallbackPosts() {
        try {
            const response = await fetch('newsletter-fallback.json?_t=' + Date.now());
            if (!response.ok) {
                throw new Error('Failed to load fallback posts');
            }
            
            const data = await response.json();
            if (data.posts && data.posts.length > 0) {
                console.log('Using fallback posts');
                this.displayPosts(data.posts);
            } else {
                throw new Error('No posts in fallback data');
            }
        } catch (error) {
            throw new Error('Fallback posts failed to load');
        }
    }

    parseRSSFeed(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Failed to parse RSS feed XML');
        }
        
        const items = xmlDoc.querySelectorAll('item');
        console.log(`Found ${items.length} items in RSS feed`);
        
        if (items.length === 0) {
            throw new Error('No posts found in RSS feed');
        }
        
        const posts = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const post = {
                title: this.getTextContent(item, 'title'),
                description: this.getTextContent(item, 'description'),
                link: this.getTextContent(item, 'link'),
                pubDate: this.getTextContent(item, 'pubDate'),
                image: this.extractImage(item),
                readTime: this.extractReadTime(item)
            };
            
            // Only add posts with at least a title
            if (post.title.trim()) {
                posts.push(post);
            }
        }
        
        // Sort posts by date (newest first) to ensure we get the latest
        posts.sort((a, b) => {
            const dateA = new Date(a.pubDate);
            const dateB = new Date(b.pubDate);
            return dateB - dateA;
        });
        
        // Take only the first maxPosts
        const finalPosts = posts.slice(0, this.maxPosts);
        console.log(`Returning ${finalPosts.length} posts (sorted by date, newest first)`);
        
        return finalPosts;
    }

    getTextContent(element, tagName) {
        const tag = element.querySelector(tagName);
        return tag ? tag.textContent.trim() : '';
    }

    extractImage(item) {
        // Try to extract image from enclosure or content
        const enclosure = item.querySelector('enclosure[type^="image"]');
        if (enclosure) {
            return enclosure.getAttribute('url');
        }

        // Try to extract from content:encoded
        const content = item.querySelector('content\\:encoded, content:encoded');
        if (content) {
            const imgMatch = content.textContent.match(/<img[^>]+src="([^"]+)"/);
            if (imgMatch) {
                return imgMatch[1];
            }
        }

        // Try to extract from description
        const description = this.getTextContent(item, 'description');
        const descImgMatch = description.match(/<img[^>]+src="([^"]+)"/);
        if (descImgMatch) {
            return descImgMatch[1];
        }

        // Default placeholder image using Picsum
        return 'https://picsum.photos/400/250?random=' + Math.floor(Math.random() * 1000);
    }

    extractReadTime(item) {
        const description = this.getTextContent(item, 'description');
        const readTimeMatch = description.match(/(\d+)\s*min\s*read/);
        return readTimeMatch ? `${readTimeMatch[1]} min read` : '5 min read';
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Recent';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Recent';
        }
    }

    displayPosts(posts) {
        if (posts.length === 0) {
            this.showError();
            return;
        }

        console.log(`Displaying ${posts.length} posts`);
        const postsHTML = posts.map(post => this.createPostCard(post)).join('');
        this.gridElement.innerHTML = postsHTML;
    }

    createPostCard(post) {
        const formattedDate = this.formatDate(post.pubDate);
        
        return `
            <article class="newsletter-card">
                <div class="newsletter-card-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy" onerror="this.src='https://picsum.photos/400/250?random=' + Math.floor(Math.random() * 1000)">
                </div>
                <div class="newsletter-card-content">
                    <div class="newsletter-card-meta">
                        <span class="newsletter-card-date">${formattedDate}</span>
                        <span class="newsletter-card-read-time">${post.readTime}</span>
                    </div>
                    <h3 class="newsletter-card-title">${post.title}</h3>
                    <p class="newsletter-card-description">${this.truncateDescription(post.description)}</p>
                    <a href="${post.link}" target="_blank" rel="noopener" class="newsletter-card-link">
                        Read Full Post →
                    </a>
                </div>
            </article>
        `;
    }

    truncateDescription(description) {
        // Remove HTML tags and truncate
        const cleanText = description.replace(/<[^>]*>/g, '');
        return cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;
    }

    showError() {
        this.gridElement.innerHTML = `
            <div class="newsletter-error">
                <h3>Unable to load posts</h3>
                <p>Please visit our <a href="https://sendfull.substack.com" target="_blank" rel="noopener">Substack</a> to read the latest posts.</p>
                <p><small>Technical note: This may be due to CORS restrictions. The newsletter feed is available at <a href="https://sendfull.substack.com/feed" target="_blank" rel="noopener">https://sendfull.substack.com/feed</a></small></p>
            </div>
        `;
    }
}

// Initialize the newsletter feed when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NewsletterFeed();
}); 