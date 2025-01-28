const BASE_PATH = '/comic/';

let comics = [];
let currentIndex = 0;

async function loadComics() {
    try {
        console.log('Loading comics from:', BASE_PATH + 'comics.yml');
        const response = await fetch(BASE_PATH + 'comics.yml');
        const text = await response.text();
        console.log('YAML content:', text); // Debug the YAML content
        
        comics = jsyaml.load(text).comics;
        console.log('Parsed comics:', comics); // Debug the parsed comics
        
        // Add base path to image URLs but avoid double paths
        comics = comics.map(comic => ({
            ...comic,
            image: BASE_PATH + (comic.image.startsWith('/') ? comic.image.slice(1) : comic.image)
        }));
        
        console.log('Processed comics:', comics); // Debug the final comics array
        
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
    console.log('Displaying comic:', comic); // Debug the current comic
    console.log('Image URL:', comic.image); // Debug the image URL
    
    document.getElementById('comic-title').textContent = comic.title;
    document.getElementById('comic-image').src = comic.image;
    document.getElementById('comic-image').alt = comic.alt_text || comic.title;
    document.getElementById('comic-date').textContent = new Date(comic.date).toLocaleDateString();
    
    // Add blurb if it exists
    const blurbElement = document.getElementById('comic-blurb');
    if (blurbElement) {
        blurbElement.textContent = comic.blurb || '';
    }
    
    currentIndex = index;
    updateNavButtons();
}

// Rest of your JavaScript remains the same...
