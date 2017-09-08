const galleryPhotos = [];
let doneLoading = true;

// Add events to searchfield and search button
document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    addSearchfieldEvent();
    addSearchBtnEvent();
  }
};

// Debounce switch for search function, simple way of keeping users from spamming search function
debounce = (func, wait, immediate) => {
	let timeout;
	return function() {
		let context = this, args = arguments;
		let later = () => {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// Searchfield event if user presses enter
addSearchfieldEvent = () => {
    const debounceSetSearch = getDebounceSetSearch();
    document.getElementById('searchfield').onkeypress = (e) => {
        if (!e) e = window.event;
        let keyCode = e.keyCode || e.which;
        if (keyCode == '13'){
            debounceSetSearch();
        }
    }
}

// Using debounce function to make setUrlAndSarch function un-spam-able
getDebounceSetSearch = () => {
    var debounceSetSearch = debounce(() => {
        setUrlAndSearch();
    }, 250);

    return debounceSetSearch;
}

addSearchBtnEvent = () => {
    const debounceSetSearch = getDebounceSetSearch();

    document.getElementById('submitbutton').onclick = (e) => {
        debounceSetSearch();
    }
}

setUrlAndSearch = () => {
    let input = document.getElementById('searchfield').value;
    let url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api key=1d1eb183424ab781ff4027a6ad9c72fb&text='+input+'&per_page=10&format=json&nojsoncallback=1';
    cleanCenteredContent();
    showLoader();
    searchPhotos(url);
}

// Using promises and fetch method made possible by es6 native javascript standards,
// to get images from flickr
searchPhotos = (url) => {
    fetch(url)
    .then(status)
    .then(json)
    .then(showPhotos)
    .then(activateChecked)
    .then((data) => {
        console.log('Request succeeded with JSON response', data);
    }).catch((error) => {
        console.log('Request failed', error);
    });
}

/* Simple functions for hiding, showing and cleaning some divs */
showLoader = () => {
    document.getElementById('loader').className += ' visibleLoader';
}

hideLoader = () => {
    document.getElementById('loader').className = 'loader';
}

showParagraph = () => {
    document.getElementById('placeholderParagraph').className = 'placeholderParagraph';
}

hideParagraph = () => {
    document.getElementById('placeholderParagraph').className += ' hiddenPlaceholderParagraph';
}

showGalleryBtn = () => {
    document.getElementById('galleryBtn').className += ' visible-gallery-button';
}

hideGalleryBtn = () => {
    document.getElementById('galleryBtn').className = 'flat-button gallery-button';
}

disableGalleryBtn = () => {
    document.getElementById('galleryBtn').disabled = true;
    document.getElementById('galleryBtn').style.backgroundColor = 'grey';
}

enableGalleryBtn = () => {
    document.getElementById('galleryBtn').disabled = false;
    document.getElementById('galleryBtn').style.backgroundColor = '#33cc33';
}

cleanCenteredContent = () => {
    const photoContainer = document.getElementById('photoContainer');
    hideParagraph();
    hideGalleryBtn();

    while(photoContainer.firstChild){
        photoContainer.removeChild(photoContainer.firstChild);
    }
}

// Checking status for fetch and throwing errors if errors occur
status = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
}

// Transforming data to json
json = (response) => {
    hideLoader();
    return response.json()
}

// Looping through flickr response and createing templates to attach to dom for each img fetched
showPhotos = (response) => {
    if(response.photos === undefined) {
        document.getElementById('placeholderParagraph').innerHTML = 'Sorry, we could not find anything that matched your search :,-(';
        showParagraph();
    } else {
        showGalleryBtn();
        response.photos.photo.forEach((photo) => {
            constructPhoto(photo);
        }, this);
    }
}

// Constructing the photo-divs, kinda messy, sorry about that
constructPhoto =(photo) => {
    const responseDiv = document.getElementById('photoContainer');
    const photoDiv = document.createElement('div');
    const imgTag = document.createElement('img');
    const hr = document.createElement('hr');
    const checkboxContainer = document.createElement('div');
    const checkbox = document.createElement('input');
    const label = document.createElement('label');
    const photoText = document.createElement('p');

    checkboxContainer.className = 'checkboxContainer';

    checkbox.type = 'checkbox';
    checkbox.setAttribute('id', photo.id);
    checkbox.name = photo.id;
    checkbox.value = photo.id;

    label.htmlFor = photo.id;

    photoText.className = 'photoText';
    photoText.innerHTML = 'Add to Gallery?';

    photoDiv.className = 'photo';
    photoDiv.setAttribute('id', photo.farm + '/' + photo.server + '/' + photo.id + '/' + photo.secret);

    imgTag.src='https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';

    photoDiv.appendChild(imgTag);
    photoDiv.appendChild(hr);
    photoDiv.appendChild(photoText);

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    photoDiv.appendChild(checkboxContainer);

    responseDiv.appendChild(photoDiv);

    addPhotoEvents(imgTag);
    addCheckboxEvents(checkbox, photo);
}

// Add event to be able to enlarge imgs/photos
addPhotoEvents = (img) => {
    img.addEventListener('click', () => {
        const simplePhotoModal = document.getElementById('simplePhotoModal');
        const simplePhotoContainer = document.getElementById('simplePhotoContainer');
        const imgTag = document.createElement('img');

        imgTag.src = img.src;
        simplePhotoModal.style.visibility = 'visible';
        simplePhotoContainer.appendChild(imgTag);
    });
}

// Looping through the photos that the user has marked as checked before entering a new search
activateChecked = () => {
    galleryPhotos.forEach((photo) => {
        let checkbox = document.getElementById(photo.id);
        console.log(checkbox);
        if(checkbox !== undefined && checkbox !== null) {
            console.log('asdf');
            checkbox.checked = true;
        }
    });
}

addCheckboxEvents = (checkbox, photo) => {
    checkbox.addEventListener('click', () => {
        galleryPhotos.forEach((savedPhoto, index) => {
            if(savedPhoto.id === photo.id) {
                galleryPhotos.splice(index, 1);
            }
        });

        if(checkbox.checked  === true){
            galleryPhotos.push(photo);
        }

        if(galleryPhotos.length !== 0) {
            enableGalleryBtn();
        } else {
            disableGalleryBtn();
        }
    });
}

closePhotoModal = () => {
    document.getElementById('simplePhotoModal').style.visibility = 'hidden';
    cleanSimpleModalPhotoContainer();
}

closeGalleryModal = () => {
    document.getElementById('simpleGalleryModal').style.visibility = 'hidden';
    cleanSimpleGalleryModal();
}

cleanSimpleModalPhotoContainer = () => {
    const simplePhotoContainer = document.getElementById('simplePhotoContainer');

    while(simplePhotoContainer.firstChild){
        simplePhotoContainer.removeChild(simplePhotoContainer.firstChild);
    }
}

createGallery = () => {
    const simpleGalleryModal = document.getElementById('simpleGalleryModal');
    const simpleGalleryContainer = document.getElementById('simpleGalleryContainer');

    galleryPhotos.forEach((photo, index) => {
        const imgTag = document.createElement('img');

        imgTag.src='https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';
        simpleGalleryContainer.appendChild(imgTag);

        addGalleryPhotoEvents(imgTag);
    });
    simpleGalleryModal.style.visibility = 'visible';
}

// Making it possible to enlarge photos even in "gallery-mode"
addGalleryPhotoEvents = (imgTag) => {
    imgTag.addEventListener('click', () => {
        shrinkRemainingPhotos();
        if(imgTag.style.offsetHeight === '55%') {
            imgTag.style.height = '15%'
        } else {
            imgTag.style.height = '55%';
        }
    })
}

shrinkRemainingPhotos = () => {
    const simpleGalleryModal = document.getElementById('simpleGalleryModal');
    const imgs = simpleGalleryModal.getElementsByTagName('img');

    for (var i = 0, len = imgs.length; i < len; i++) {
        imgs[i].style.height = '15%';
    }
}

cleanSimpleGalleryModal = () => {
    const simpleGalleryContainer = document.getElementById('simpleGalleryContainer');

    while(simpleGalleryContainer.firstChild){
        simpleGalleryContainer.removeChild(simpleGalleryContainer.firstChild);
    }
}
