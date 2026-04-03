require('dotenv').config()

const express = require('express')
const path = require('node:path')
const bcrypt = require('bcryptjs')
const {
  addBook,
  createSession,
  createUser,
  deleteBook,
  deleteSession,
  findSession,
  findUser,
  getBooks,
  initializeStorage,
  isPasswordHashed,
  pingStorage,
  updateUserPassword,
} = require('./src/services/libraryStore')
const { searchBooks } = require('./src/services/searchService')

const app = express()
const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '0.0.0.0'

app.set('view engine', 'ejs')
app.set('views', path.join(process.cwd(), 'views'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(process.cwd(), 'public')))

function getToken(request) {
  const authHeader = request.header('authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return request.header('x-library-token') || request.body?.token
}

async function requireSession(request, response) {
  const token = getToken(request)
  if (!token) {
    response.status(401).json({ error: 'Login required.' })
    return null
  }

  const session = await findSession(token)
  if (!session) {
    response.status(401).json({ error: 'Session expired. Please log in again.' })
    return null
  }

  const user = await findUser(session.username)
  if (!user) {
    response.status(401).json({ error: 'Account not found.' })
    return null
  }

  return { user, token }
}

async function requireAdmin(request, response) {
  const session = await requireSession(request, response)
  if (!session) {
    return null
  }

  if (session.user.role !== 'admin') {
    response.status(403).json({ error: 'Admin access required.' })
    return null
  }

  return session.user
}

app.get('/', async (_request, response) => {
  const books = await getBooks()
  response.render('pages/index', {
    activePage: 'home',
    pageTitle: 'Library',
    books: books.slice(0, 6),
    featuredBooks: books.slice(0, 6),
  })
})

app.get('/books', async (request, response) => {
  const books = await getBooks()
  const query = String(request.query.q || '').trim()
  const searchResult = query ? searchBooks(query, books) : null
  response.render('pages/books', {
    activePage: 'books',
    pageTitle: 'Books',
    books: searchResult?.results || books,
    query,
    searchResult,
  })
})

app.get('/genres', async (_request, response) => {
  const books = await getBooks()
  const genres = Array.from(new Set(books.map((book) => book.Category || 'Unknown'))).sort()
  response.render('pages/genres', {
    activePage: 'genres',
    pageTitle: 'Genres',
    genres,
    books,
  })
})

app.get('/publishers', async (_request, response) => {
  const books = await getBooks()
  const publishers = Array.from(new Set(books.map((book) => book.Publisher || 'Unknown'))).sort()
  response.render('pages/publishers', {
    activePage: 'publishers',
    pageTitle: 'Publishers',
    publishers,
    books,
  })
})

app.get('/contacts', (_request, response) => {
  response.render('pages/contacts', { activePage: 'contacts', pageTitle: 'Contacts' })
})

app.get('/login', (_request, response) => {
  response.render('pages/login', { activePage: 'login', pageTitle: 'Login' })
})

app.get('/signup', (_request, response) => {
  response.render('pages/signup', { activePage: 'signup', pageTitle: 'Sign up' })
})

app.get('/api/books', async (_request, response) => {
  const books = await getBooks()
  response.json({ books })
})

app.post('/api/books', async (request, response) => {
  const admin = await requireAdmin(request, response)
  if (!admin) {
    return
  }

  const { book } = request.body || {}
  if (!book || !book.Name || !book.Author) {
    response.status(400).json({ error: 'Book name and author are required.' })
    return
  }

  const created = await addBook(book)
  response.status(201).json({ book: created })
})

app.delete('/api/books/:id', async (request, response) => {
  const admin = await requireAdmin(request, response)
  if (!admin) {
    return
  }

  const deleted = await deleteBook(request.params.id)
  if (!deleted) {
    response.status(404).json({ error: 'Book not found.' })
    return
  }

  response.status(204).end()
})

app.get('/api/search', async (request, response) => {
  const books = await getBooks()
  response.json(searchBooks(request.query.q || '', books))
})

app.post('/api/login', async (request, response) => {
  const { username, password } = request.body || {}
  const user = await findUser(username)

  if (!user || !password) {
    response.status(401).json({ error: 'Invalid username or password.' })
    return
  }

  if (isPasswordHashed(user.password)) {
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      response.status(401).json({ error: 'Invalid username or password.' })
      return
    }
  } else if (user.password !== password) {
    response.status(401).json({ error: 'Invalid username or password.' })
    return
  } else {
    const hashed = await bcrypt.hash(password, 10)
    await updateUserPassword(user.username, hashed)
  }

  const token = await createSession(user.username)
  response.json({
    user: {
      username: user.username,
      role: user.role,
    },
    token,
  })
})

app.post('/api/signup', async (request, response) => {
  const { username, password } = request.body || {}

  if (!username || !password) {
    response.status(400).json({ error: 'Username and password are required.' })
    return
  }

  const existing = await findUser(username)
  if (existing) {
    response.status(409).json({ error: 'Account already exists.' })
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await createUser(username, hashed)
  const token = await createSession(user.username)
  response.status(201).json({
    user: {
      username: user.username,
      role: user.role,
    },
    token,
  })
})

app.post('/api/logout', async (request, response) => {
  const token = getToken(request)
  await deleteSession(token)
  response.status(204).end()
})

app.get('/api/session', async (request, response) => {
  const session = await requireSession(request, response)
  if (!session) {
    return
  }

  response.json({
    user: {
      username: session.user.username,
      role: session.user.role,
    },
  })
})

app.get('/api/health', async (_request, response) => {
  try {
    await pingStorage()
    response.json({ status: 'ok', storage: 'mongodb' })
  } catch {
    response.status(503).json({ status: 'error', storage: 'mongodb' })
  }
})

async function startServer() {
  try {
    await initializeStorage()
    app.listen(PORT, HOST, () => {
      console.log(`Library server running on http://${HOST}:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = app
