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
  isPasswordHashed,
  updateBook,
  updateUserPassword,
} = require('./lib/store')
const { searchBooks } = require('./lib/search')

const app = express()
const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '127.0.0.1'

app.use(express.json())
app.use(express.static(process.cwd()))

function getToken(request) {
  const authHeader = request.header('authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return request.header('x-library-token')
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

app.get('/api/books', async (_request, response) => {
  const books = await getBooks()
  response.json({ books })
})

app.get('/api/search', async (request, response) => {
  const books = await getBooks()
  const result = searchBooks(request.query.q || '', books)
  response.json(result)
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

app.post('/api/books', async (request, response) => {
  const admin = await requireAdmin(request, response)
  if (!admin) {
    return
  }

  const { book } = request.body || {}
  const created = await addBook(book || {})
  response.status(201).json({ book: created })
})

app.put('/api/books/:id', async (request, response) => {
  const admin = await requireAdmin(request, response)
  if (!admin) {
    return
  }

  const { book } = request.body || {}
  const updated = await updateBook(request.params.id, book || {})
  if (!updated) {
    response.status(404).json({ error: 'Book not found.' })
    return
  }

  response.json({ book: updated })
})

app.delete('/api/books/:id', async (request, response) => {
  const admin = await requireAdmin(request, response)
  if (!admin) {
    return
  }

  await deleteBook(request.params.id)
  response.status(204).end()
})

app.post('/api/logout', async (request, response) => {
  const token = getToken(request)
  await deleteSession(token)
  response.status(204).end()
})

app.get('/', (_request, response) => {
  response.sendFile(path.join(process.cwd(), 'Index.html'))
})

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Library server running on http://${HOST}:${PORT}`)
  })
}

module.exports = app
