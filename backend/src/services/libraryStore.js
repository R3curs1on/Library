const fs = require('node:fs/promises')
const path = require('node:path')
const crypto = require('node:crypto')
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'library_app'
const COLLECTION_NAME = 'library_state'
const DOCUMENT_ID = 'default'
const SEED_FILE = path.join(process.cwd(), 'data', 'library.json')

let mongoClientPromise

function getMongoUri() {
  const uri = process.env.MONGODB_URI || MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is required. Configure it before starting the server.')
  }
  return uri
}

function getDatabaseName() {
  return process.env.MONGODB_DB_NAME || MONGODB_DB_NAME
}

function buildInitialState() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminPasswd'

  return {
    users: [
      {
        username: adminUsername,
        password: adminPassword,
        role: 'admin',
      },
    ],
    books: [],
    sessions: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

async function readSeedState() {
  try {
    const raw = await fs.readFile(SEED_FILE, 'utf-8')
    const parsed = JSON.parse(raw)

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      books: Array.isArray(parsed.books) ? parsed.books : [],
      sessions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch {
    return buildInitialState()
  }
}

async function buildSeedState() {
  const seedState = await readSeedState()
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminPasswd'

  const users = Array.isArray(seedState.users) ? [...seedState.users] : []
  const hasAdmin = users.some((user) => user.username === adminUsername)

  if (!hasAdmin) {
    users.unshift({
      username: adminUsername,
      password: adminPassword,
      role: 'admin',
    })
  }

  return {
    ...seedState,
    users,
    books: Array.isArray(seedState.books) ? seedState.books : [],
  }
}

async function getMongoCollection() {
  if (!mongoClientPromise) {
    const client = new MongoClient(getMongoUri())
    mongoClientPromise = client.connect()
  }

  const client = await mongoClientPromise
  return client.db(getDatabaseName()).collection(COLLECTION_NAME)
}

async function readState() {
  const collection = await getMongoCollection()
  const document = await collection.findOne({ _id: DOCUMENT_ID })

  if (!document) {
    const seedState = await buildSeedState()
    await collection.insertOne({ _id: DOCUMENT_ID, ...seedState })
    return seedState
  }

  const { _id, ...state } = document
  return state
}

async function writeState(state) {
  const collection = await getMongoCollection()
  const nextState = {
    ...state,
    updatedAt: new Date().toISOString(),
  }

  await collection.replaceOne(
    { _id: DOCUMENT_ID },
    { _id: DOCUMENT_ID, ...nextState },
    { upsert: true },
  )

  return nextState
}

async function initializeStorage() {
  const collection = await getMongoCollection()
  const document = await collection.findOne({ _id: DOCUMENT_ID })

  if (!document) {
    const seedState = await buildSeedState()
    await collection.insertOne({ _id: DOCUMENT_ID, ...seedState })
    return
  }

  const seedState = await buildSeedState()
  const updates = {}

  if (!Array.isArray(document.books) || document.books.length === 0) {
    updates.books = seedState.books
  }

  if (!Array.isArray(document.users) || document.users.length === 0) {
    updates.users = seedState.users
  } else if (!document.users.some((user) => user.username === (process.env.ADMIN_USERNAME || 'admin'))) {
    updates.users = [
      {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'adminPasswd',
        role: 'admin',
      },
      ...document.users,
    ]
  }

  if (Object.keys(updates).length > 0) {
    await collection.updateOne(
      { _id: DOCUMENT_ID },
      { $set: { ...updates, updatedAt: new Date().toISOString() } },
    )
  }
}

async function pingStorage() {
  const collection = await getMongoCollection()
  await collection.findOne({ _id: DOCUMENT_ID }, { projection: { _id: 1 } })
}

function normalizeBook(book) {
  return {
    id:
      book.id ||
      book.Name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    Name: book.Name,
    Author: book.Author,
    Pages: Number(book.Pages) || null,
    Publisher: book.Publisher,
    Rating: Number(book.Rating) || 0,
    img: book.img || 'https://placehold.co/150x200?text=No+Image',
    Category: book.Category || 'Unknown',
    Description: book.Description || '',
    AvailableCopies: Number(book.AvailableCopies) || 1,
    TotalCopies: Number(book.TotalCopies) || Math.max(Number(book.AvailableCopies) || 1, 1),
    Tags: Array.isArray(book.Tags) ? book.Tags : [],
  }
}

async function getBooks() {
  const state = await readState()
  return (state.books || []).map(normalizeBook)
}

async function getUsers() {
  const state = await readState()
  return state.users || []
}

async function saveUsers(users) {
  const state = await readState()
  return writeState({ ...state, users })
}

async function updateUserPassword(username, password) {
  const users = await getUsers()
  const nextUsers = users.map((user) =>
    user.username === username ? { ...user, password } : user,
  )
  await saveUsers(nextUsers)
}

function isPasswordHashed(password) {
  return typeof password === 'string' && password.startsWith('$2')
}

async function getSessions() {
  const state = await readState()
  return state.sessions || {}
}

async function saveSessions(sessions) {
  const state = await readState()
  return writeState({ ...state, sessions })
}

async function createSession(username) {
  const sessions = await getSessions()
  const token = crypto.randomUUID()
  sessions[token] = {
    username,
    createdAt: new Date().toISOString(),
  }
  await saveSessions(sessions)
  return token
}

async function findSession(token) {
  const sessions = await getSessions()
  return sessions[token] || null
}

async function deleteSession(token) {
  if (!token) {
    return
  }

  const sessions = await getSessions()
  if (!sessions[token]) {
    return
  }

  delete sessions[token]
  await saveSessions(sessions)
}

async function saveBooks(books) {
  const state = await readState()
  return writeState({
    ...state,
    books: books.map(normalizeBook),
  })
}

async function addBook(book) {
  const books = await getBooks()
  const normalized = normalizeBook(book)
  books.push(normalized)
  await saveBooks(books)
  return normalized
}

async function deleteBook(bookId) {
  const books = await getBooks()
  const nextBooks = books.filter((book) => book.id !== bookId)

  if (nextBooks.length === books.length) {
    return null
  }

  await saveBooks(nextBooks)
  return true
}

async function findUser(username) {
  const users = await getUsers()
  return users.find((user) => user.username === username) || null
}

async function createUser(username, password) {
  const users = await getUsers()
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const newUser = {
    username,
    password,
    role: username === adminUsername ? 'admin' : 'user',
  }
  users.push(newUser)
  await saveUsers(users)
  return newUser
}

module.exports = {
  createSession,
  createUser,
  addBook,
  deleteSession,
  deleteBook,
  findSession,
  findUser,
  getBooks,
  getSessions,
  getUsers,
  initializeStorage,
  isPasswordHashed,
  normalizeBook,
  pingStorage,
  readState,
  saveBooks,
  saveSessions,
  updateUserPassword,
}