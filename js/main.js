// Fade in media items on scroll
const observerOptions = {
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('fade-in');
		} else {
			entry.target.classList.remove('fade-in');
		}
	});
}, observerOptions);

// Volume control
function initVolumeControl() {
	const video = document.getElementById('bgVideo');
	const muteBtn = document.getElementById('muteToggle');
	
	if (!video || !muteBtn) return;
	
	video.volume = 0.1;
	
	muteBtn.addEventListener('click', function() {
		video.muted = !video.muted;
		muteBtn.textContent = video.muted ? '▷' : '❚❚';
	});
}

// Lightbox functionality
function initLightbox(selector) {
	const lightbox = document.getElementById('lightbox');
	const lightboxContent = document.getElementById('lightboxContent');
	const lightboxClose = document.getElementById('lightboxClose');
	
	if (!lightbox || !lightboxContent || !lightboxClose) return;
	
	// Prevent default link behavior and open lightbox
	document.querySelectorAll(selector).forEach(link => {
		link.addEventListener('click', function(e) {
			e.preventDefault();
			const mediaUrl = this.getAttribute('href');
			const isVideo = mediaUrl.endsWith('.mp4');
			
			const mediaTag = isVideo 
				? `<video src="${mediaUrl}" controls autoplay loop style="max-width: 90vw; max-height: 90vh; border-radius: 10px;">` 
				: `<img src="${mediaUrl}" style="max-width: 90vw; max-height: 90vh; border-radius: 10px;">`;
			
			lightboxContent.innerHTML = mediaTag;
			lightbox.style.display = 'flex';
			document.body.style.overflow = 'hidden';
		});
	});
	
	// Close lightbox
	const closeLightbox = () => {
		lightbox.style.display = 'none';
		lightboxContent.innerHTML = '';
		document.body.style.overflow = 'auto';
	};
	
	lightboxClose.addEventListener('click', closeLightbox);
	
	// Close on background click
	lightbox.addEventListener('click', function(e) {
		if (e.target === lightbox) closeLightbox();
	});
}

// Reset transition delays based on scroll direction
function initScrollAnimations(selector) {
	let lastScrollY = window.pageYOffset;
	
	window.addEventListener('scroll', function() {
		const items = document.querySelectorAll(selector);
		const currentScrollY = window.pageYOffset;
		const scrollingDown = currentScrollY > lastScrollY;
		
		items.forEach((item, index) => {
			item.style.transitionDelay = scrollingDown 
				? `${index * 0.1}s` 
				: `${(items.length - 1 - index) * 0.1}s`;
		});
		
		lastScrollY = currentScrollY;
	});
}

// Load Next Show data from JSON
function loadNextShow() {
	fetch('/media/nextshow/nextshow.json')
		.then(response => response.json())
		.then(data => {
			document.getElementById('nextShowName').textContent = data.name;
			document.getElementById('nextShowDate').textContent = new Date(data.date).toLocaleDateString('en-US', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			});
			document.getElementById('nextShowLink').href = data.link;
			document.getElementById('nextShowImage').src = '/media/nextshow/' + data.image;
		})
		.catch(error => {
			console.error('Error loading next show data:', error);
			document.getElementById('nextShowName').textContent = 'No upcoming shows';
			document.getElementById('nextShowDate').textContent = 'Check back soon!';
			document.getElementById('nextShowLink').style.display = 'none';
		});
}

// Load captions from JSON
function loadCaptions() {
	fetch('/media/gallery/captions.json')
		.then(response => response.json())
		.then(captions => {
			document.querySelectorAll('.media-caption').forEach(caption => {
				const link = caption.closest('a');
				const href = link.getAttribute('href');
				const filename = href.split('/').pop();
				
				if (captions[filename]) {
					caption.textContent = captions[filename];
				}
			});
		})
		.catch(error => {
			console.error('Error loading captions:', error);
		});
}

// Load gallery dynamically from JSON
function loadGallery(containerSelector, limit = null) {
	fetch('/media/gallery/captions.json')
		.then(response => response.json())
		.then(captions => {
			const container = document.querySelector(containerSelector);
			if (!container) return;
			
			// Clear existing content
			container.innerHTML = '';
			
			// Get all filenames and optionally limit
			const filenames = Object.keys(captions);
			const itemsToShow = limit ? filenames.slice(0, limit) : filenames;
			
			// Create gallery items
			itemsToShow.forEach((filename, index) => {
				const isVideo = filename.endsWith('.mp4');
				const mediaPath = '/media/gallery/' + filename;
				
				// Create link wrapper
				const link = document.createElement('a');
				link.href = mediaPath;
				link.target = '_blank';
				
				// Create media wrapper
				const wrapper = document.createElement('div');
				wrapper.className = 'media-wrapper';
				
				// Create media element
				const media = document.createElement(isVideo ? 'video' : 'img');
				media.src = mediaPath;
				media.className = 'media-item';
				media.alt = filename;
				
				if (isVideo) {
					media.autoplay = true;
					media.muted = true;
					media.loop = true;
					media.setAttribute('playsinline', '');
				}
				
				wrapper.appendChild(media);
				
				// Create caption
				const caption = document.createElement('p');
				caption.className = 'media-caption';
				caption.textContent = captions[filename];
				
				// Assemble
				link.appendChild(wrapper);
				link.appendChild(caption);
				container.appendChild(link);
				
				// Observe for animation
				observer.observe(media);
			});
			
			// Re-initialize lightbox after gallery is loaded
			const parentSelector = containerSelector === '.collage' ? '.collage > a' : '.media-grid > a';
			initLightbox(parentSelector);
		})
		.catch(error => {
			console.error('Error loading gallery:', error);
		});
}

// Update active nav link based on scroll position
function initNavTracking() {
	window.addEventListener('scroll', function() {
		const sections = document.querySelectorAll('section, main');
		const navLinks = document.querySelectorAll('.nav-link');
		
		let current = 'home';
		sections.forEach(section => {
			const sectionTop = section.offsetTop;
			const sectionId = section.getAttribute('id');
			// Skip gallery section - it should be part of home
			if (sectionId && sectionId !== 'gallery' && pageYOffset >= sectionTop - 150) {
				current = sectionId;
			}
		});
		
		navLinks.forEach(link => {
			link.classList.remove('active');
			if (link.getAttribute('href') === '#' + current) {
				link.classList.add('active');
			}
		});
	});
}
