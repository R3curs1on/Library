const express = require('express')
const path = require('node:path')
const { addBook, createUser, deleteBook, findUser, getBooks } = require('./lib/store')
const { searchBooks } = require('./lib/search')

const app = express()
const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '127.0.0.1'

app.use(express.json())
app.use(express.static(process.cwd()))

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

  if (!user || user.password !== password) {
    response.status(401).json({ error: 'Invalid username or password.' })
    return
  }

  response.json({
    user: {
      username: user.username,
      role: user.role,
    },
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

  const user = await createUser(username, password)
  response.status(201).json({
    user: {
      username: user.username,
      role: user.role,
    },
  })
})

app.post('/api/books', async (request, response) => {
  const { adminUser, book } = request.body || {}

  if (!adminUser || adminUser.role !== 'admin') {
    response.status(403).json({ error: 'Admin access required.' })
    return
  }

  const created = await addBook(book || {})
  response.status(201).json({ book: created })
})

app.delete('/api/books/:id', async (request, response) => {
  const adminRole = request.header('x-library-role')

  if (adminRole !== 'admin') {
    response.status(403).json({ error: 'Admin access required.' })
    return
  }

  await deleteBook(request.params.id)
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
