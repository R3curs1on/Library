const state = {
  books: [],
  currentUser: JSON.parse(localStorage.getItem('libraryUser') || 'null'),
}

function saveSession() {
  if (state.currentUser) {
    localStorage.setItem('libraryUser', JSON.stringify(state.currentUser))
  } else {
    localStorage.removeItem('libraryUser')
  }
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    let errorMessage = 'Request failed.'
    try {
      const payload = await response.json()
      errorMessage = payload.error || errorMessage
    } catch {}
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

async function loadBooks() {
  const payload = await apiFetch('/api/books')
  state.books = payload.books || []
  renderAllViews()
}

function getSearchInputValue() {
  const searchInput = document.getElementById('search-input')
  return searchInput ? searchInput.value.trim() : ''
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

  if (results.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'text'
    empty.textContent = 'No books found'
    wrapper.appendChild(empty)
  } else {
    results.forEach((book) => {
      cards.appendChild(createBookCard(book))
    })
    wrapper.appendChild(cards)
  }

  resultContainer.appendChild(wrapper)
}

function createBookCard(book, compact = false) {
  const bookCard = document.createElement('div')
  bookCard.className = compact ? 'author-book-card' : 'book-card'

  bookCard.innerHTML = `
    <div class="image-container">
      <img
        src="${book.img}"
        alt="${book.Name}"
        class="${compact ? 'author-book-cover' : 'book-cover'}"
        onerror="this.onerror=null; this.src='https://placehold.co/150x200?text=No+Image';"
      >
    </div>
    <h3 class="text">${book.Name}</h3>
    <p class="text">Author: ${book.Author}</p>
    <p class="text">Pages: ${book.Pages || 'Unknown'}</p>
    <p class="text">Publisher: ${book.Publisher}</p>
    <p class="text">Rating: ${book.Rating ?? 'Not rated'}</p>
    <p class="text">Category: ${book.Category || 'Unknown'}</p>
    <p class="text">Available: ${book.AvailableCopies}/${book.TotalCopies}</p>
  `

  if (state.currentUser?.role === 'admin') {
    const deleteButton = document.createElement('button')
    deleteButton.className = 'delete-button'
    deleteButton.textContent = 'Delete'
    deleteButton.addEventListener('click', async () => {
      try {
        await apiFetch(`/api/books/${book.id}`, {
          method: 'DELETE',
          headers: {
            'x-library-role': state.currentUser.role,
          },
        })
        await loadBooks()
      } catch (error) {
        alert(error.message)
      }
    })
    bookCard.appendChild(deleteButton)
  }

  return bookCard
}

async function createBookFromPrompt() {
  const Name = prompt('Enter Book Name:')
  const Author = prompt('Enter Author Name:')
  const Pages = Number(prompt('Enter Number of Pages:') || 0)
  const Publisher = prompt('Enter Publisher Name:')
  const Rating = Number(prompt('Enter Book Rating (0-5):') || 0)
  const img = prompt('Enter Image URL:') || ''
  const Category = prompt('Enter Book Category:') || 'Unknown'
  const Description = prompt('Enter Book Description:') || ''
  const tagsInput = prompt('Enter tags separated by commas:') || ''
  const AvailableCopies = Number(prompt('Available copies:') || 1)
  const TotalCopies = Number(prompt('Total copies:') || AvailableCopies || 1)

  if (!Name || !Author || !Publisher) {
    alert('Book name, author and publisher are required.')
    return
  }

  await apiFetch('/api/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      adminUser: state.currentUser,
      book: {
        Name,
        Author,
        Pages,
        Publisher,
        Rating,
        img,
        Category,
        Description,
        AvailableCopies,
        TotalCopies,
        Tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
    }),
  })

  await loadBooks()
}

function renderBooksGrid() {
  const container = document.getElementById('books')
  if (!container) {
    return
  }

  container.innerHTML = ''

  state.books.forEach((book) => {
    container.appendChild(createBookCard(book))
  })

  if (state.currentUser?.role === 'admin') {
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
    authorDiv.innerHTML = `<h2>${author}</h2>`

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
    genreDiv.innerHTML = `<h2>${category}</h2>`

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
  const payload = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`)
  renderSearchResults(payload.results || [], payload.suggestions || [], query)
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

    state.currentUser = payload.user
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

    state.currentUser = payload.user
    saveSession()
    alert('Signup successful!')
    window.location.href = 'Index.html'
  } catch (error) {
    alert(error.message)
  }
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
void loadBooks()
