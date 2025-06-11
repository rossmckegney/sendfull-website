// Newsletter RSS Feed Integration
class NewsletterFeed {
    constructor() {
        this.rssDataUrl = 'newsletter-rss.json';
        this.fallbackUrl = 'newsletter-fallback.json';
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
        // Try to load the GitHub Action-generated RSS data first
        try {
            console.log('Loading RSS data from GitHub Action...');
            const response = await fetch(this.rssDataUrl + '?_t=' + Date.now(), {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.posts && data.posts.length > 0) {
                    console.log(`Loaded ${data.posts.length} posts from RSS data`);
                    console.log('Last updated:', data.lastUpdated);
                    this.displayPosts(data.posts);
                    return;
                }
            }
        } catch (error) {
            console.warn('Failed to load RSS data:', error);
        }
        
        // If RSS data fails, try fallback JSON
        try {
            console.log('Trying fallback posts...');
            await this.loadFallbackPosts();
            return;
        } catch (fallbackError) {
            console.warn('Fallback also failed:', fallbackError);
        }
        
        // If everything failed, show error
        throw new Error('All data sources failed');
    }

    async loadFallbackPosts() {
        try {
            const response = await fetch(this.fallbackUrl + '?_t=' + Date.now());
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
                <p><small>Technical note: The newsletter feed is automatically updated every hour via GitHub Actions.</small></p>
            </div>
        `;
    }
}

// Initialize the newsletter feed when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NewsletterFeed();
}); 