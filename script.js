// Add this at the top of your script.js
const BASE_PATH = '/comic/';

let comics = [];
let currentIndex = 0;

// Update the loadComics function to use the base path
async function loadComics() {
    try {
        const response = await fetch(BASE_PATH + 'comics.yml');
        const text = await response.text();
        comics = jsyaml.load(text).comics;
        
        // Add base path to image URLs
        comics = comics.map(comic => ({
            ...comic,
            image: BASE_PATH + comic.image
        }));
        
        currentIndex = comics.length - 1;
        displayComic(currentIndex);
        updateNavButtons();
    } catch (error) {
        console.error('Error loading comics:', error);
        document.getElementById('comic-display').innerHTML = 
            '<p>Error loading comics. Check console for details.</p>';
    }
}

function displayComic(index) {
    const comic = comics[index];
    
    // Update title and metadata
    document.getElementById('comic-title').textContent = comic.title;
    document.getElementById('comic-date').textContent = new Date(comic.date).toLocaleDateString();
    document.getElementById('comic-blurb').textContent = comic.blurb || '';
    
    // Clear existing images
    const comicDisplay = document.getElementById('comic-display');
    const oldImages = comicDisplay.querySelectorAll('.comic-image-container');
    oldImages.forEach(img => img.remove());
    
    // Create container for all images
    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'comic-images';
    
    // Add each image
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
    
    // Insert images after the title
    const titleElement = document.getElementById('comic-title');
    titleElement.insertAdjacentElement('afterend', imagesContainer);
    
    currentIndex = index;
    updateNavButtons();
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
