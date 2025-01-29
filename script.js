const BASE_PATH = '/comic/';

let comics = [];
let currentIndex = 0;

async function loadComics() {
    try {
        console.log('Starting to load comics...');
        const response = await fetch(BASE_PATH + 'comics.yml');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Fetched YAML file, getting text...');
        const text = await response.text();
        console.log('YAML content:', text);
        
        console.log('Parsing YAML...');
        const data = jsyaml.load(text);
        console.log('Parsed data:', data);
        
        if (!data || !data.comics) {
            throw new Error('No comics data found in YAML');
        }
        
        comics = data.comics;
        console.log('Comics loaded:', comics);
        
        // Add base path to image URLs
        comics = comics.map(comic => {
            return {
                ...comic,
                images: Array.isArray(comic.images) 
                    ? comic.images.map(img => ({
                        ...img,
                        path: BASE_PATH + (img.path.startsWith('/') ? img.path.slice(1) : img.path)
                    }))
                    : [{ 
                        path: BASE_PATH + (comic.image.startsWith('/') ? comic.image.slice(1) : comic.image),
                        alt_text: comic.alt_text
                    }]
            };
        });
        
        console.log('Processed comics with paths:', comics);
        
        currentIndex = comics.length - 1;
        displayComic(currentIndex);
        updateNavButtons();
    } catch (error) {
        console.error('Detailed error:', error);
        console.error('Error stack:', error.stack);
        document.getElementById('comic-display').innerHTML = 
            `<p>Error loading comics: ${error.message}</p>`;
    }
}

function displayComic(index) {
    try {
        const comic = comics[index];
        console.log('Displaying comic:', comic);
        
        // Update title and metadata
        document.getElementById('comic-title').textContent = comic.title;
        document.getElementById('comic-date').textContent = new Date(comic.date).toLocaleDateString();
        document.getElementById('comic-blurb').textContent = comic.blurb || '';

        // Handle formatted blurb
        const blurbElement = document.getElementById('comic-blurb');
        if (comic.blurb) {
        // Option 1: Preserve line breaks but treat as plain text
        blurbElement.style.whiteSpace = 'pre-wrap';
        blurbElement.textContent = comic.blurb;
        
        // Option 2: Parse markdown/HTML (requires a markdown parser library)
        // blurbElement.innerHTML = marked(comic.blurb); // If using markdown
        // OR
        // blurbElement.innerHTML = comic.blurb; // If using HTML
    } else {
        blurbElement.textContent = '';
    }
        
        // Clear existing images
        const comicDisplay = document.getElementById('comic-display');
        const oldImages = comicDisplay.querySelectorAll('.comic-image-container');
        oldImages.forEach(img => img.remove());
        
        // Create container for all images
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'comic-images';
        
        // Handle both new and old image format
        const images = comic.images || [{ path: comic.image, alt_text: comic.alt_text }];
        
        // Add each image
        images.forEach((image, i) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'comic-image-container';
            
            const img = document.createElement('img');
            img.src = image.path;
            img.alt = image.alt_text || `Panel ${i + 1}`;
            img.className = 'comic-image';
            
            // Add load error handling
            img.onerror = () => {
                console.error(`Failed to load image: ${image.path}`);
                imgContainer.innerHTML = `<p>Failed to load image: ${image.path}</p>`;
            };
            
            imgContainer.appendChild(img);
            imagesContainer.appendChild(imgContainer);
        });
        
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
