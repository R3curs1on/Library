const state = {
  books: [],
  currentUser: JSON.parse(localStorage.getItem('libraryUser') || 'null'),
  filters: {
    author: '',
    genre: '',
    rating: '',
    availability: '',
  },
  pagination: {
    page: 1,
    perPage: 9,
  },
}

function saveSession() {
  if (state.currentUser) {
    localStorage.setItem('libraryUser', JSON.stringify(state.currentUser))
  } else {
    localStorage.removeItem('libraryUser')
  }
}

if (state.currentUser && !state.currentUser.token) {
  state.currentUser = null
  saveSession()
}

function updateAuthUI() {
  const isLoggedIn = Boolean(state.currentUser?.token)
  const loginLinks = document.querySelectorAll('[data-auth="login"]')
  const logoutButtons = document.querySelectorAll('[data-auth="logout"]')
  const userBadges = document.querySelectorAll('[data-auth="user"]')

  loginLinks.forEach((link) => {
    link.classList.toggle('is-hidden', isLoggedIn)
  })
  logoutButtons.forEach((button) => {
    button.classList.toggle('is-hidden', !isLoggedIn)
  })
  userBadges.forEach((badge) => {
    badge.classList.toggle('is-hidden', !isLoggedIn)
    badge.textContent = isLoggedIn
      ? `Signed in as ${state.currentUser.username}`
      : ''
  })
}

function handleSessionExpired(message) {
  state.currentUser = null
  saveSession()
  updateAuthUI()
  return message || 'Session expired. Please log in again.'
}

function getNetworkErrorMessage() {
  if (window.location && window.location.protocol === 'file:') {
    return 'API unavailable. Run `npm run dev` and open http://127.0.0.1:3000.'
  }
  return 'Network error. Is the server running?'
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (state.currentUser?.token) {
    headers.Authorization = `Bearer ${state.currentUser.token}`
  }

  let response
  try {
    response = await fetch(url, { ...options, headers })
  } catch {
    throw new Error(getNetworkErrorMessage())
  }

  if (!response.ok) {
    let errorMessage = 'Request failed.'
    try {
      const payload = await response.json()
      errorMessage = payload.error || errorMessage
    } catch {}
    if (response.status === 401 && state.currentUser?.token) {
      errorMessage = handleSessionExpired(errorMessage)
    }
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function setContainerMessage(container, message) {
  if (!container) {
    return
  }
  container.innerHTML = `
    <div class="search-results-panel">
      <p class="text">${message}</p>
    </div>
  `
}

function getFilterElements() {
  const panel = document.getElementById('filter-panel')
  if (!panel) {
    return null
  }
  return {
    panel,
    author: document.getElementById('filter-author'),
    genre: document.getElementById('filter-genre'),
    rating: document.getElementById('filter-rating'),
    availability: document.getElementById('filter-availability'),
    clear: document.getElementById('filter-clear'),
    count: document.getElementById('filter-count'),
  }
}

function setSelectOptions(select, values, defaultLabel) {
  if (!select) {
    return
  }
  const current = select.value
  select.innerHTML = `<option value="">${defaultLabel}</option>`
  values.forEach((value) => {
    const option = document.createElement('option')
    option.value = value
    option.textContent = value
    select.appendChild(option)
  })
  if (current && values.includes(current)) {
    select.value = current
  }
}

function updateFilterOptions(books) {
  const elements = getFilterElements()
  if (!elements) {
    return
  }
  const authors = Array.from(new Set(books.map((book) => book.Author))).sort()
  const genres = Array.from(
    new Set(books.map((book) => book.Category || 'Unknown')),
  ).sort()

  setSelectOptions(elements.author, authors, 'All authors')
  setSelectOptions(elements.genre, genres, 'All genres')
}

function syncFiltersFromControls() {
  const elements = getFilterElements()
  if (!elements) {
    return
  }
  state.filters.author = elements.author?.value || ''
  state.filters.genre = elements.genre?.value || ''
  state.filters.rating = elements.rating?.value || ''
  state.filters.availability = elements.availability?.value || ''
  state.pagination.page = 1
  renderBooksGrid()
}

function clearFilters() {
  state.filters = {
    author: '',
    genre: '',
    rating: '',
    availability: '',
  }
  const elements = getFilterElements()
  if (elements) {
    if (elements.author) elements.author.value = ''
    if (elements.genre) elements.genre.value = ''
    if (elements.rating) elements.rating.value = ''
    if (elements.availability) elements.availability.value = ''
  }
  state.pagination.page = 1
  renderBooksGrid()
}

function applyFilters(books) {
  const { author, genre, rating, availability } = state.filters
  return books.filter((book) => {
    if (author && book.Author !== author) {
      return false
    }
    if (genre && (book.Category || 'Unknown') !== genre) {
      return false
    }
    if (rating) {
      const minRating = Number(rating)
      if (!Number.isNaN(minRating) && Number(book.Rating || 0) < minRating) {
        return false
      }
    }
    if (availability === 'available' && Number(book.AvailableCopies || 0) <= 0) {
      return false
    }
    if (
      availability === 'unavailable' &&
      Number(book.AvailableCopies || 0) > 0
    ) {
      return false
    }
    return true
  })
}

function paginateBooks(books) {
  const perPage = state.pagination.perPage
  const totalPages = Math.max(1, Math.ceil(books.length / perPage))
  const page = Math.min(state.pagination.page, totalPages)
  const start = (page - 1) * perPage
  return {
    page,
    totalPages,
    totalCount: books.length,
    pageBooks: books.slice(start, start + perPage),
  }
}

function renderPagination(totalPages, currentPage) {
  const container = document.getElementById('pagination')
  if (!container) {
    return
  }
  container.innerHTML = ''

  if (totalPages <= 1) {
    return
  }

  const createButton = (label, page, disabled = false) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'page-button'
    button.textContent = label
    if (disabled) {
      button.disabled = true
    } else {
      button.addEventListener('click', () => {
        state.pagination.page = page
        renderBooksGrid()
      })
    }
    return button
  }

  container.appendChild(createButton('Prev', currentPage - 1, currentPage === 1))

  const maxButtons = 5
  const start = Math.max(1, currentPage - Math.floor(maxButtons / 2))
  const end = Math.min(totalPages, start + maxButtons - 1)
  for (let page = start; page <= end; page += 1) {
    const button = createButton(String(page), page, false)
    if (page === currentPage) {
      button.classList.add('is-active')
      button.disabled = true
    }
    container.appendChild(button)
  }

  container.appendChild(
    createButton('Next', currentPage + 1, currentPage === totalPages),
  )
}

async function loadBooks() {
  const booksContainer = document.getElementById('books')
  if (booksContainer) {
    booksContainer.innerHTML = '<p class="text">Loading books...</p>'
  }

  try {
    const payload = await apiFetch('/api/books')
    state.books = payload.books || []
    renderAllViews()
  } catch (error) {
    const message = error.message || 'Failed to load books.'
    setContainerMessage(booksContainer, message)
    setContainerMessage(document.getElementById('Authorbooks'), message)
    setContainerMessage(document.getElementById('booksGenere'), message)
  }
}

function getSearchInputValue() {
  const searchInput = document.getElementById('search-input')
  return searchInput ? searchInput.value.trim() : ''
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function tokenizeQuery(text) {
  return String(text || '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || []
}

function highlightText(text, tokens) {
  const safeText = escapeHtml(text || '')
  if (!tokens || tokens.length === 0) {
    return safeText
  }
  const pattern = tokens
    .filter(Boolean)
    .map((token) => escapeRegex(token))
    .join('|')
  if (!pattern) {
    return safeText
  }
  return safeText.replace(
    new RegExp(`(${pattern})`, 'gi'),
    '<mark class="highlight">$1</mark>',
  )
}

function renderSearchResults(results = [], suggestions = [], query = '') {
  const resultContainer = document.getElementById('serachResults')
  if (!resultContainer) {
    return
  }

  resultContainer.innerHTML = ''

  if (!query) {
    return
  }

  const wrapper = document.createElement('div')
  wrapper.className = 'search-results-panel'

  const heading = document.createElement('h2')
  heading.className = 'section-title'
  heading.textContent = `Search results for "${query}"`
  wrapper.appendChild(heading)

  if (suggestions.length > 0) {
    const suggestionRow = document.createElement('div')
    suggestionRow.className = 'suggestions-row'

    suggestions.forEach((suggestion) => {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'suggestion-chip'
      chip.textContent = suggestion.label
      chip.addEventListener('click', async () => {
        const searchInput = document.getElementById('search-input')
        if (searchInput) {
          searchInput.value = suggestion.label
        }
        await runSearch(suggestion.label)
      })
      suggestionRow.appendChild(chip)
    })

    wrapper.appendChild(suggestionRow)
  }

  const cards = document.createElement('div')
  cards.className = 'books'
  const highlightTokens = tokenizeQuery(query)

  if (results.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'text'
    empty.textContent = 'No books found'
    wrapper.appendChild(empty)
  } else {
    results.forEach((book) => {
      cards.appendChild(createBookCard(book, false, highlightTokens))
    })
    wrapper.appendChild(cards)
  }

  resultContainer.appendChild(wrapper)
}

function createBookCard(book, compact = false, highlightTokens = []) {
  const bookCard = document.createElement('div')
  bookCard.className = compact ? 'book-card book-card--compact' : 'book-card'
  const description = String(book.Description || '').trim()
  const ratingValue =
    typeof book.Rating === 'number' && !Number.isNaN(book.Rating)
      ? book.Rating
      : null
  const ratingLabel = ratingValue ? `${ratingValue} rating` : 'Not rated'

  const nameText = highlightText(book.Name || '', highlightTokens)
  const authorText = highlightText(book.Author || '', highlightTokens)
  const categoryText = highlightText(book.Category || 'Unknown', highlightTokens)
  const publisherText = highlightText(book.Publisher || '', highlightTokens)
  const descriptionText = description
    ? highlightText(description, highlightTokens)
    : ''

  bookCard.innerHTML = `
    <div class="image-container">
      <img
        src="${book.img}"
        alt="${book.Name}"
        class="book-cover"
        onerror="this.onerror=null; this.src='https://placehold.co/150x200?text=No+Image';"
      >
    </div>
    <div class="book-body">
      <h3 class="book-title">${nameText}</h3>
      <p class="book-author">by ${authorText}</p>
      <div class="book-badges">
        <span class="badge">${categoryText}</span>
        <span class="badge">${ratingLabel}</span>
      </div>
      ${descriptionText ? `<p class="book-description">${descriptionText}</p>` : ''}
      <p class="book-detail">Publisher: ${publisherText}</p>
      <p class="book-detail">Pages: ${book.Pages || 'Unknown'}</p>
      <p class="book-detail">Available: ${book.AvailableCopies}/${book.TotalCopies}</p>
    </div>
  `

  if (
    state.currentUser?.role === 'admin' &&
    state.currentUser?.token &&
    !compact
  ) {
    const actions = document.createElement('div')
    actions.className = 'card-actions'

    const editButton = document.createElement('button')
    editButton.type = 'button'
    editButton.className = 'secondary-button'
    editButton.textContent = 'Edit'
    editButton.addEventListener('click', () => {
      openBookModal({ mode: 'edit', book })
    })

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'delete-button'
    deleteButton.textContent = 'Delete'
    deleteButton.addEventListener('click', async () => {
      if (!confirm(`Delete "${book.Name}"?`)) {
        return
      }
      try {
        await apiFetch(`/api/books/${book.id}`, {
          method: 'DELETE',
        })
        await loadBooks()
      } catch (error) {
        alert(error.message)
      }
    })

    actions.append(editButton, deleteButton)
    bookCard.appendChild(actions)
  }

  return bookCard
}

let activeModal = null

function closeModal() {
  if (!activeModal) {
    return
  }
  activeModal.remove()
  activeModal = null
}

function setFieldError(input, message) {
  if (!input) {
    return
  }
  input.classList.add('input-error')
  let error = input.parentElement?.querySelector('.field-error')
  if (!error) {
    error = document.createElement('span')
    error.className = 'field-error'
    input.parentElement?.appendChild(error)
  }
  error.textContent = message
}

function clearFieldError(input) {
  if (!input) {
    return
  }
  input.classList.remove('input-error')
  const error = input.parentElement?.querySelector('.field-error')
  if (error) {
    error.textContent = ''
  }
}

function openBookModal({ mode = 'add', book = null } = {}) {
  closeModal()

  const isEdit = mode === 'edit'
  const headingText = isEdit ? 'Edit book' : 'Add a new book'
  const helperText = isEdit
    ? 'Update the details below and save your changes.'
    : 'Fill in the details below to add a title to the catalog.'
  const submitLabel = isEdit ? 'Save changes' : 'Add book'

  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop'
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="book-title">${headingText}</h3>
        <button class="modal-close" type="button" data-close>&times;</button>
      </div>
      <p class="text">${helperText}</p>
      <form class="form-grid" data-mode="${mode}">
        <div class="form-field">
          <label for="book-name">Book title</label>
          <input id="book-name" name="name" type="text" placeholder="The Great Gatsby" required>
        </div>
        <div class="form-field">
          <label for="book-author">Author</label>
          <input id="book-author" name="author" type="text" placeholder="F. Scott Fitzgerald" required>
        </div>
        <div class="form-field">
          <label for="book-publisher">Publisher</label>
          <input id="book-publisher" name="publisher" type="text" placeholder="Scribner" required>
        </div>
        <div class="form-field">
          <label for="book-category">Category</label>
          <input id="book-category" name="category" type="text" placeholder="Classic">
        </div>
        <div class="form-field">
          <label for="book-pages">Pages</label>
          <input id="book-pages" name="pages" type="number" min="1" placeholder="320">
        </div>
        <div class="form-field">
          <label for="book-rating">Rating (0-5)</label>
          <input id="book-rating" name="rating" type="number" min="0" max="5" step="0.1" placeholder="4.5">
        </div>
        <div class="form-field">
          <label for="book-image">Cover image URL</label>
          <input id="book-image" name="image" type="url" placeholder="https://...">
        </div>
        <div class="form-field">
          <label for="book-tags">Tags (comma separated)</label>
          <input id="book-tags" name="tags" type="text" placeholder="classic, jazz age, american fiction">
        </div>
        <div class="form-field">
          <label for="book-available">Available copies</label>
          <input id="book-available" name="availableCopies" type="number" min="0" placeholder="2">
        </div>
        <div class="form-field">
          <label for="book-total">Total copies</label>
          <input id="book-total" name="totalCopies" type="number" min="1" placeholder="4">
        </div>
        <div class="form-field">
          <label for="book-description">Description</label>
          <textarea id="book-description" name="description" rows="3" placeholder="Short summary..."></textarea>
        </div>
        <p class="form-error" data-error></p>
        <div class="modal-actions">
          <button class="secondary-button" type="button" data-close>Cancel</button>
          <button class="primary-button" type="submit">${submitLabel}</button>
        </div>
      </form>
    </div>
  `

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      closeModal()
    }
  })

  backdrop.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => {
      closeModal()
    })
  })

  const form = backdrop.querySelector('form')
  const errorField = backdrop.querySelector('[data-error]')
  const nameInput = backdrop.querySelector('#book-name')
  const authorInput = backdrop.querySelector('#book-author')
  const publisherInput = backdrop.querySelector('#book-publisher')
  const categoryInput = backdrop.querySelector('#book-category')
  const pagesInput = backdrop.querySelector('#book-pages')
  const ratingInput = backdrop.querySelector('#book-rating')
  const imageInput = backdrop.querySelector('#book-image')
  const tagsInput = backdrop.querySelector('#book-tags')
  const availableInput = backdrop.querySelector('#book-available')
  const totalInput = backdrop.querySelector('#book-total')
  const descriptionInput = backdrop.querySelector('#book-description')

  ;[
    nameInput,
    authorInput,
    publisherInput,
    categoryInput,
    pagesInput,
    ratingInput,
    imageInput,
    tagsInput,
    availableInput,
    totalInput,
    descriptionInput,
  ].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => clearFieldError(input))
    }
  })

  if (book) {
    form.dataset.bookId = book.id
    if (nameInput) nameInput.value = book.Name || ''
    if (authorInput) authorInput.value = book.Author || ''
    if (publisherInput) publisherInput.value = book.Publisher || ''
    if (categoryInput) categoryInput.value = book.Category || ''
    if (pagesInput && book.Pages) pagesInput.value = book.Pages
    if (ratingInput && book.Rating) ratingInput.value = book.Rating
    if (imageInput) imageInput.value = book.img || ''
    if (tagsInput && Array.isArray(book.Tags)) {
      tagsInput.value = book.Tags.join(', ')
    }
    if (availableInput) {
      availableInput.value = book.AvailableCopies ?? ''
    }
    if (totalInput) {
      totalInput.value = book.TotalCopies ?? ''
    }
    if (descriptionInput) {
      descriptionInput.value = book.Description || ''
    }
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (errorField) {
      errorField.textContent = ''
    }

    const formData = new FormData(form)
    const Name = String(formData.get('name') || '').trim()
    const Author = String(formData.get('author') || '').trim()
    const Publisher = String(formData.get('publisher') || '').trim()
    const Category = String(formData.get('category') || '').trim() || 'Unknown'
    const Pages = Number(formData.get('pages')) || null
    const Rating = Number(formData.get('rating')) || 0
    const img = String(formData.get('image') || '').trim()
    const Description = String(formData.get('description') || '').trim()
    const AvailableCopies = Number(formData.get('availableCopies')) || 0
    const TotalCopies = Number(formData.get('totalCopies')) || 0
    const Tags = String(formData.get('tags') || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    let isValid = true
    if (!Name) {
      setFieldError(nameInput, 'Title is required.')
      isValid = false
    }
    if (!Author) {
      setFieldError(authorInput, 'Author is required.')
      isValid = false
    }
    if (!Publisher) {
      setFieldError(publisherInput, 'Publisher is required.')
      isValid = false
    }
    if (!Number.isNaN(Rating) && (Rating < 0 || Rating > 5)) {
      setFieldError(ratingInput, 'Rating must be between 0 and 5.')
      isValid = false
    }
    if (TotalCopies && AvailableCopies > TotalCopies) {
      setFieldError(totalInput, 'Total copies must be >= available copies.')
      isValid = false
    }

    if (!isValid) {
      if (errorField) {
        errorField.textContent = 'Fix the highlighted fields to continue.'
      }
      return
    }

    const normalizedAvailable = AvailableCopies || 1
    const normalizedTotal = Math.max(TotalCopies || normalizedAvailable, 1)
    const payload = {
      Name,
      Author,
      Pages,
      Publisher,
      Rating,
      img,
      Category,
      Description,
      AvailableCopies: normalizedAvailable,
      TotalCopies: normalizedTotal,
      Tags,
    }

    const isEditMode = form.dataset.mode === 'edit'
    const endpoint = isEditMode
      ? `/api/books/${form.dataset.bookId}`
      : '/api/books'
    const method = isEditMode ? 'PUT' : 'POST'

    try {
      await apiFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book: payload }),
      })
      closeModal()
      await loadBooks()
    } catch (error) {
      if (errorField) {
        errorField.textContent =
          error.message || 'Unable to save changes. Try again.'
      }
    }
  })

  document.body.appendChild(backdrop)
  activeModal = backdrop
  const firstInput = backdrop.querySelector('input')
  if (firstInput) {
    firstInput.focus()
  }
}

function createBookFromPrompt() {
  openBookModal()
}

function renderBooksGrid() {
  const container = document.getElementById('books')
  if (!container) {
    return
  }

  container.innerHTML = ''

  const filterElements = getFilterElements()
  let booksToRender = [...state.books]

  if (filterElements) {
    updateFilterOptions(state.books)
    booksToRender = applyFilters(booksToRender)
    if (filterElements.count) {
      filterElements.count.textContent = `${booksToRender.length} results`
    }
    const pagination = paginateBooks(booksToRender)
    state.pagination.page = pagination.page
    booksToRender = pagination.pageBooks
    renderPagination(pagination.totalPages, pagination.page)
  } else {
    renderPagination(0, 0)
  }

  if (booksToRender.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'text'
    empty.textContent = 'No books match the current filters.'
    container.appendChild(empty)
  } else {
    booksToRender.forEach((book) => {
      container.appendChild(createBookCard(book))
    })
  }

  if (state.currentUser?.role === 'admin' && state.currentUser?.token) {
    const addBookCard = document.createElement('div')
    addBookCard.className = 'book-card add-book-card'
    addBookCard.innerHTML = '<h3>Add New Book</h3>'
    addBookCard.addEventListener('click', () => {
      void createBookFromPrompt()
    })
    container.appendChild(addBookCard)
  }
}

function renderAuthorGroups() {
  const container = document.getElementById('Authorbooks')
  if (!container) {
    return
  }

  container.innerHTML = ''
  const authorMap = {}

  state.books.forEach((book) => {
    if (!authorMap[book.Author]) {
      authorMap[book.Author] = []
    }
    authorMap[book.Author].push(book)
  })

  Object.keys(authorMap).forEach((author) => {
    const authorDiv = document.createElement('div')
    authorDiv.className = 'author-books-container'
    authorDiv.innerHTML = `<h2 class="section-title">${author}</h2>`

    const row = document.createElement('div')
    row.className = 'author-book-flex'

    authorMap[author].forEach((book) => {
      row.appendChild(createBookCard(book, true))
    })

    authorDiv.appendChild(row)
    container.appendChild(authorDiv)
  })
}

function renderGenreGroups() {
  const container = document.getElementById('booksGenere')
  if (!container) {
    return
  }

  container.innerHTML = ''
  const genreMap = {}

  state.books.forEach((book) => {
    const category = book.Category || 'Uncategorized'
    if (!genreMap[category]) {
      genreMap[category] = []
    }
    genreMap[category].push(book)
  })

  Object.keys(genreMap).forEach((category) => {
    const genreDiv = document.createElement('div')
    genreDiv.className = 'author-books-container'
    genreDiv.innerHTML = `<h2 class="section-title">${category}</h2>`

    const row = document.createElement('div')
    row.className = 'author-book-flex'

    genreMap[category].forEach((book) => {
      row.appendChild(createBookCard(book, true))
    })

    genreDiv.appendChild(row)
    container.appendChild(genreDiv)
  })
}

function renderAllViews() {
  renderBooksGrid()
  renderAuthorGroups()
  renderGenreGroups()
}

async function runSearch(explicitQuery) {
  const query = explicitQuery ?? getSearchInputValue()
  const resultContainer = document.getElementById('serachResults')
  if (resultContainer) {
    setContainerMessage(resultContainer, 'Searching...')
  }

  try {
    const payload = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`)
    renderSearchResults(payload.results || [], payload.suggestions || [], query)
  } catch (error) {
    setContainerMessage(resultContainer, error.message || 'Search failed.')
  }
}

async function handleLogin() {
  const username = document.getElementById('username')?.value.trim()
  const password = document.getElementById('password')?.value

  try {
    const payload = await apiFetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    state.currentUser = { ...payload.user, token: payload.token }
    saveSession()
    alert('Login successful!')
    window.location.href = 'Index.html'
  } catch (error) {
    alert(error.message)
  }
}

async function handleSignup() {
  const username = document.getElementById('usernameSignup')?.value.trim()
  const password = document.getElementById('passwordSignup')?.value

  try {
    const payload = await apiFetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    state.currentUser = { ...payload.user, token: payload.token }
    saveSession()
    alert('Signup successful!')
    window.location.href = 'Index.html'
  } catch (error) {
    alert(error.message)
  }
}

async function handleLogout() {
  try {
    await apiFetch('/api/logout', { method: 'POST' })
  } catch {}
  state.currentUser = null
  saveSession()
  updateAuthUI()
  window.location.href = 'Index.html'
}

function attachEvents() {
  const loginButton = document.getElementById('login-button')
  if (loginButton) {
    loginButton.addEventListener('click', (event) => {
      event.preventDefault()
      void handleLogin()
    })
  }

  const signupButton = document.getElementById('Signup-button')
  if (signupButton) {
    signupButton.addEventListener('click', (event) => {
      event.preventDefault()
      void handleSignup()
    })
  }

  const searchButton = document.getElementById('search-button')
  if (searchButton) {
    searchButton.addEventListener('click', (event) => {
      event.preventDefault()
      void runSearch()
    })
  }

  const searchInput = document.getElementById('search-input')
  if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        void runSearch()
      }
    })
  }

  const logoutButton = document.getElementById('logout-button')
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault()
      void handleLogout()
    })
  }

  const filterElements = getFilterElements()
  if (filterElements) {
    ;[
      filterElements.author,
      filterElements.genre,
      filterElements.rating,
      filterElements.availability,
    ].forEach((element) => {
      if (element) {
        element.addEventListener('change', () => {
          syncFiltersFromControls()
        })
      }
    })

    if (filterElements.clear) {
      filterElements.clear.addEventListener('click', () => {
        clearFilters()
      })
    }
  }

  const loginAuthButton = document.getElementById('login-auth-button')
  if (loginAuthButton) {
    loginAuthButton.addEventListener('click', (event) => {
      event.preventDefault()
      window.location.href = 'Login.html'
    })
  }

  const signupAuthButton = document.getElementById('signup-auth-button')
  if (signupAuthButton) {
    signupAuthButton.addEventListener('click', (event) => {
      event.preventDefault()
      window.location.href = 'SignUp.html'
    })
  }
}

attachEvents()
updateAuthUI()
void loadBooks()
