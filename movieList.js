const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movie = []
let filteredMovies = []
let currentPages = 1

const movieModal = document.querySelector('#movie-modal')
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const switchMode = document.querySelector('#switch-mode')



function renderMovieList(data) {
  let rawHTML = ''
  if (dataPanel.matches('.list')) {
    // console.log("i have list")
    data.forEach((item) => {
      // console.log(item)
      rawHTML += `
      <div class="col-sm-12">
        <div class="row">
          <div class="col-sm-8 border-top border-2 pt-2 pb-2">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="col-sm-4 border-top border-2 pt-2 pb-2">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
      `
    });
    dataPanel.innerHTML = rawHTML
  }
  else {
    data.forEach((item) => {
      rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
      `
    });
    dataPanel.innerHTML = rawHTML
  }
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let i = 0; i <numberOfPages; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i + 1}">${i + 1}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movie
  startIndex = 0 + (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  const modalfavoritebtn = document.querySelector('#movie-modal-favorite-button')
  modalfavoritebtn.dataset.id = `${id}`
  // console.log(modalfavoritebtn.dataset.id)
  

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDescription.innerText = data.description
    modalDate.innerText = `Release date: ` + data.release_date
    modalImage.innerHTML = `<img src=${POSTER_URL + data.image } alt="movie-poster" class="image-fuid"></img>`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movies = movie.find((movies) => movies.id === id)
  if (list.some((item) => item.id === id)) {
    return alert('This movie already exists in your favorites list!')
  } else {
    list.push(movies)
    // console.log(list)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }
  
}

switchMode.addEventListener('click', function onSwitchClicked(event) {
  if (event.target.matches('.fa-bars')) {
    dataPanel.classList.add('list')
    renderMovieList(getMoviesByPage(currentPages))
  }
  if (event.target.matches('.fa-th')) {
    dataPanel.classList.remove('list')
    renderMovieList(getMoviesByPage(currentPages))
  }
})

movieModal.addEventListener('click', function onModalClicked(event) {
  if (event.target.matches('.btn-add-favorite')) {
    // console.log(event.target.dataset.id)
    addToFavorite(Number(event.target.dataset.id))
  }
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset.id)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  console.log(event.target.dataset.page)
  currentPages = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(currentPages))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  //// helperCode

  // if (!keyword.length) {
  //   return alert("Please enter a valid string")
  // }

  // for (const item of movie) {
  //   if (item.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(item)
  //   }
  // }

  filteredMovies = movie.filter(item => {
    return item.title.toLowerCase().includes(keyword)
  })

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + searchInput.value) 
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
  currentPages = 1
})


axios
  .get(INDEX_URL)
  .then((response) => {
    // console.log(response.data.results)
    movie.push(...response.data.results)
    renderPaginator(movie.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))
