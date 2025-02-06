const BASE_PATH = '/';

let comics = [];
let currentIndex = 0;

async function loadComics() {
    try {
        console.log('Starting to load comics...');
        const response = await fetch(BASE_PATH + 'comics.yml');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const data = jsyaml.load(text);
        
        if (!data || !data.comics) {
            throw new Error('No comics data found in YAML');
        }
        
        comics = data.comics;
        
        // Add base path to image URLs
        comics = comics.map(comic => {
            if (comic.images) {
                // Handle multi-image comics
                return {
                    ...comic,
                    images: comic.images.map(img => ({
                        ...img,
                        path: BASE_PATH + (img.path.startsWith('/') ? img.path.slice(1) : img.path)
                    }))
                };
            } else {
                // Handle single image comics
                return {
                    ...comic,
                    image: BASE_PATH + (comic.image.startsWith('/') ? comic.image.slice(1) : comic.image)
                };
            }
        });
        
        currentIndex = comics.length - 1;
        displayComic(currentIndex);
        updateNavButtons();
    } catch (error) {
        console.error('Detailed error:', error);
        document.getElementById('comic-display').innerHTML = 
            `<p>Error loading comics: ${error.message}</p>`;
    }
}

function formatBlurb(blurb) {
    if (!blurb) return '';
    
    // Check if blurb uses the YAML literal block indicator '|'
    if (blurb.indexOf('\n') !== -1) {
        // Replace newlines with <br> tags and handle markdown-style formatting
        return blurb
            .split('\n')
            .map(line => line
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
                .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>') // Links
            )
            .join('<br>');
    }
    
    // Single line blurb - just handle markdown-style formatting
    return blurb
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
}

function displayComic(index) {
    try {
        const comic = comics[index];
        
        // Update title and metadata
        document.getElementById('comic-title').textContent = comic.title;
        document.getElementById('comic-date').textContent = new Date(comic.date).toLocaleDateString();
        
        // Format and display blurb with HTML/Markdown support
        const blurbElement = document.getElementById('comic-blurb');
        if (blurbElement) {
            blurbElement.innerHTML = formatBlurb(comic.blurb || '');
        }
        
        // Clear existing images
        const comicDisplay = document.getElementById('comic-display');
        const oldImages = comicDisplay.querySelectorAll('.comic-image-container');
        oldImages.forEach(img => img.remove());
        
        // Create container for all images
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'comic-images';
        
        if (comic.images) {
            // Handle multi-image comics
            comic.images.forEach((image, i) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'comic-image-container';
                
                const img = document.createElement('img');
                img.src = image.path;
                img.alt = image.alt_text || `Panel ${i + 1}`;
                img.className = 'comic-image';
                
                imgContainer.appendChild(img);
                imagesContainer.appendChild(imgContainer);
            });
        } else {
            // Handle single image comics
            const imgContainer = document.createElement('div');
            imgContainer.className = 'comic-image-container';
            
            const img = document.createElement('img');
            img.src = comic.image;
            img.alt = comic.alt_text || comic.title;
            img.className = 'comic-image';
            
            imgContainer.appendChild(img);
            imagesContainer.appendChild(imgContainer);
        }
        
        // Insert images after the title
        const titleElement = document.getElementById('comic-title');
        titleElement.insertAdjacentElement('afterend', imagesContainer);
        
        currentIndex = index;
        updateNavButtons();
    } catch (error) {
        console.error('Error in displayComic:', error);
        document.getElementById('comic-display').innerHTML += 
            `<p>Error displaying comic: ${error.message}</p>`;
    }
}

function updateNavButtons() {
    document.getElementById('first-btn').disabled = currentIndex === 0;
    document.getElementById('prev-btn').disabled = currentIndex === 0;
    document.getElementById('next-btn').disabled = currentIndex === comics.length - 1;
    document.getElementById('latest-btn').disabled = currentIndex === comics.length - 1;
}

// Navigation functions
document.getElementById('first-btn').addEventListener('click', () => {
    displayComic(0);
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex > 0) {
        displayComic(currentIndex - 1);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentIndex < comics.length - 1) {
        displayComic(currentIndex + 1);
    }
});

document.getElementById('latest-btn').addEventListener('click', () => {
    displayComic(comics.length - 1);
});

// Archive modal functionality
const modal = document.getElementById('archive-modal');
const archiveBtn = document.getElementById('archive-btn');
const closeBtn = document.getElementsByClassName('close')[0];

archiveBtn.addEventListener('click', () => {
    const archiveList = document.getElementById('archive-list');
    archiveList.innerHTML = '';
    
    comics.forEach((comic, index) => {
        const entry = document.createElement('div');
        entry.className = 'archive-entry';
        entry.textContent = `${comic.title} - ${new Date(comic.date).toLocaleDateString()}`;
        entry.addEventListener('click', () => {
            displayComic(index);
            modal.style.display = 'none';
        });
        archiveList.appendChild(entry);
    });
    
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Load comics when page loads
document.addEventListener('DOMContentLoaded', loadComics);
