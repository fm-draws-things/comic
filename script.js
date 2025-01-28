let comics = [];
let currentIndex = 0;

// Load comics data from YAML
async function loadComics() {
    try {
        const response = await fetch('comics.yml');
        const text = await response.text();
        // Using js-yaml CDN
        comics = jsyaml.load(text).comics;
        currentIndex = comics.length - 1; // Start with latest comic
        displayComic(currentIndex);
        updateNavButtons();
    } catch (error) {
        console.error('Error loading comics:', error);
    }
}

function displayComic(index) {
    const comic = comics[index];
    document.getElementById('comic-title').textContent = comic.title;
    document.getElementById('comic-image').src = comic.image;
    document.getElementById('comic-image').alt = comic.alt_text || comic.title;
    document.getElementById('comic-date').textContent = new Date(comic.date).toLocaleDateString();
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
