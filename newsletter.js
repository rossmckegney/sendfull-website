// Newsletter Feed - Load from GitHub Action cached data
class NewsletterFeed {
    constructor() {
        this.cachedDataUrl = 'newsletter-rss.json';
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
        try {
            console.log('Loading cached newsletter data...');
            const response = await fetch(this.cachedDataUrl + '?_t=' + Date.now(), {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load cached data');
            }
            
            const data = await response.json();
            if (data.posts && data.posts.length > 0) {
                console.log(`Loaded ${data.posts.length} posts from cached data`);
                console.log('Last updated:', data.lastUpdated);
                this.displayPosts(data.posts);
            } else {
                throw new Error('No posts found in cached data');
            }
        } catch (error) {
            console.error('Failed to load cached data:', error);
            this.showError();
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
                <p><small>The newsletter feed is automatically updated every hour via GitHub Actions.</small></p>
            </div>
        `;
    }
}

// Initialize the newsletter feed when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NewsletterFeed();
}); 