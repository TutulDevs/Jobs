// Elements
const $ = x => document.querySelector(x);

const main = $('.main');
const bookContent = $('.bookmark-content');

// store the jobs
let jobsArr = [];
// store the bookmarked jobs
let bookJobs = JSON.parse(localStorage.getItem('bookJobs')) || [];

// selected btns
let selectedBtns = [];

//https://jobs.github.com/positions.json?description=javascript&full_time=true&location=newyork

//const url = 'https://jobs.github.com/positions.json?description=javascript&location=newyork';

async function getJobs(title, place, condition = false) {
    const cors = 'https://cors-anywhere.herokuapp.com/';
    const base = 'https://jobs.github.com/positions.json?';
    const query = `description=${title}&full_time=${condition}&location=${place}`;
    try {
        const res = await fetch(cors + base + query);
        const data = await res.json();
        return  data;
    }
    catch (err) {
        displayError($('.main'));
        console.log(err);
    }
}

//console.log(getJobs('aws', 'madrid'));



function displayError(container) {
    const markup = `<section class="error">
    <h2>No jobs available for this search.</h2>
    <p>Try changing the keywords. </p>
    </section>`;

    container.insertAdjacentHTML('afterbegin', markup);
}

function displayJobs(container, arr = []) {
    container.innerHTML = arr.map((el, i) => {
        return `<article class="card" data-id="${el.id}">
        <section class="card-header">
        <img onerror="this.src='https://static.thenounproject.com/png/586523-200.png'" src="${el.company_logo}" alt="${el.title}" class="card-img">
        <button class="toFav" data-id="${el.id}">💚</button>
        </section>

        <p class="card-fulltime">${el.type}</p>
        <h3 class="card-title">
        <a target="_blank" href="${el.url}">${el.title}</a>
        </h3>
        <a target="_blank" href="${el.company_url}" class="card-company">${el.company}</a>
        <p class="card-location">${el.location}</p>
        </article>`;
    })
    .join('');
}

function displayBookItem(container, arr = []) {
    container.innerHTML = arr.map((el, i) => {
        return `<div class="bookmark-item" data-index="${i}" data-id="${el.id}">
        <h4 class="bookmark-item-title">
        <a href="${el.url}" title="${el.title}">
        ${el.title}
        </a>
        </h4>
        <p class="bookmark-item-company">${el.company}</p>
        <button class="bookmark-item-remove"  data-index="${i}" data-id="${el.id}">Remove</button>
        </div>`;
    })
    .join('');
}


function showBook() {
    document.body.classList.add('show');
}
function hideBook() {
    document.body.classList.remove('show');
}



function displayBook() {
    let btns = [...document.querySelectorAll('.toFav')];
    selectedBtns = btns;

    btns.forEach(btn => {

        let inBookJobs = bookJobs.find(el => el.id == btn.dataset.id);
        if (inBookJobs) {
            btn.textContent = '❤️';
            btn.disabled = true;
        }

        // event
        btn.addEventListener('click', e=> {
            let [el, id] = [e.target, e.target.dataset.id];
            // change text & disable
            el.textContent = '❤️';
            el.disabled = true;
            // get the main obj
            let res = jobsArr.filter(el => el.id === id)[0];
            // push the obj
            bookJobs.push(res);
            // show quantity
            $('.quantity-total').textContent = bookJobs.length;
            // save the bookJobs in local
            localStorage.setItem('bookJobs', JSON.stringify(bookJobs));
            // show in bookmark
            displayBookItem(bookContent, bookJobs);
            // show the bookmark
            showBook();
        });
    });

}

function deleteBook(e) {
    let [el, index] = [e.target, e.target.dataset.index];

    if (el.classList.contains('bookmark-item-remove')) {
        // remove the el
        bookJobs.splice(index, 1);
        // show quantity
        $('.quantity-total').textContent = bookJobs.length;
        // save & show
        localStorage.setItem('bookJobs', JSON.stringify(bookJobs));
        displayBookItem(bookContent, bookJobs);
    }

}

function clearBook() {
    // clear arr
    bookJobs.length = 0;
    // show quantity
    $('.quantity-total').textContent = bookJobs.length;
    // save & show
    localStorage.setItem('bookJobs', JSON.stringify(bookJobs));
    displayBookItem(bookContent, bookJobs);
}


async function showTime(e) {
    e.preventDefault();

    // values
    const title = $('.title').value.trim();
    const place = $('.place').value.trim();
    const fulltime = $('.fulltime').checked;

    let jobs = await getJobs(title, place, fulltime);
    jobs.forEach(el => jobsArr.push(el));

    let size = jobsArr.length;
    console.log(size);

    // IF size > 0 show jobs
    size === 0 ? displayError(main): displayJobs(main, jobs);

    // display Bookmark
    displayBook();
}



// Events
$('.form').addEventListener('submit', showTime);
bookContent.addEventListener('click', deleteBook);
$('.bookmark-clear').addEventListener('click', clearBook);
$('.toggler').addEventListener('click', showBook);
$('.bookmark-close').addEventListener('click', hideBook);


// set bookmark items on load
displayBookItem(bookContent, bookJobs);
$('.quantity-total').textContent = bookJobs.length;