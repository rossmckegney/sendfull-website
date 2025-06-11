// Newsletter RSS Feed Integration
class NewsletterFeed {
    constructor() {
        this.rssUrl = 'https://sendfull.substack.com/feed';
        this.maxPosts = 10;
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
        // Use a CORS proxy to fetch the RSS feed
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(this.rssUrl));
        
        if (!response.ok) {
            throw new Error('Failed to fetch RSS feed');
        }

        const xmlText = await response.text();
        const posts = this.parseRSSFeed(xmlText);
        this.displayPosts(posts);
    }

    parseRSSFeed(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const posts = [];
        for (let i = 0; i < Math.min(items.length, this.maxPosts); i++) {
            const item = items[i];
            const post = {
                title: this.getTextContent(item, 'title'),
                description: this.getTextContent(item, 'description'),
                link: this.getTextContent(item, 'link'),
                pubDate: this.getTextContent(item, 'pubDate'),
                image: this.extractImage(item),
                readTime: this.extractReadTime(item)
            };
            posts.push(post);
        }
        
        return posts;
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

        // Default placeholder image
        return 'https://via.placeholder.com/400x250/7b61ff/ffffff?text=Sendfull';
    }

    extractReadTime(item) {
        const description = this.getTextContent(item, 'description');
        const readTimeMatch = description.match(/(\d+)\s*min\s*read/);
        return readTimeMatch ? `${readTimeMatch[1]} min read` : '5 min read';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    displayPosts(posts) {
        if (posts.length === 0) {
            this.showError();
            return;
        }

        const postsHTML = posts.map(post => this.createPostCard(post)).join('');
        this.gridElement.innerHTML = postsHTML;
    }

    createPostCard(post) {
        const formattedDate = this.formatDate(post.pubDate);
        
        return `
            <article class="newsletter-card">
                <div class="newsletter-card-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
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
            </div>
        `;
    }
}

// Initialize the newsletter feed when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NewsletterFeed();
}); 