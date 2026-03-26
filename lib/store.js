const fs = require('node:fs/promises')
const path = require('node:path')
const { MongoClient } = require('mongodb')

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'library.json')
const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'library_app'
const COLLECTION_NAME = 'library_state'
const DOCUMENT_ID = 'default'

let mongoClientPromise

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

async function readLocalState() {
  await ensureDataFile()
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  return JSON.parse(raw)
}

async function writeLocalState(state) {
  await ensureDataFile()
  const nextState = {
    ...state,
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(nextState, null, 2), 'utf-8')
  return nextState
}

function isMongoConfigured() {
  return Boolean(MONGODB_URI)
}

async function getMongoCollection() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not configured')
  }

  if (!mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI)
    mongoClientPromise = client.connect()
  }

  const client = await mongoClientPromise
  return client.db(MONGODB_DB_NAME).collection(COLLECTION_NAME)
}

async function readMongoState() {
  const collection = await getMongoCollection()
  const document = await collection.findOne({ _id: DOCUMENT_ID })

  if (!document) {
    const localState = await readLocalState()
    await collection.insertOne({ _id: DOCUMENT_ID, ...localState })
    return localState
  }

  const { _id, ...state } = document
  return state
}

async function writeMongoState(state) {
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

async function withStorage(primary, fallback) {
  if (!isMongoConfigured()) {
    return fallback()
  }

  try {
    return await primary()
  } catch {
    return fallback()
  }
}

async function readState() {
  return withStorage(readMongoState, readLocalState)
}

async function writeState(state) {
  return withStorage(
    () => writeMongoState(state),
    () => writeLocalState(state),
  )
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
  return state.books.map(normalizeBook)
}

async function getUsers() {
  const state = await readState()
  return state.users || []
}

async function saveUsers(users) {
  const state = await readState()
  return writeState({ ...state, users })
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
  await saveBooks(nextBooks)
}

async function findUser(username) {
  const users = await getUsers()
  return users.find((user) => user.username === username) || null
}

async function createUser(username, password) {
  const users = await getUsers()
  const newUser = {
    username,
    password,
    role: username === 'admin' ? 'admin' : 'user',
  }
  users.push(newUser)
  await saveUsers(users)
  return newUser
}

module.exports = {
  addBook,
  createUser,
  deleteBook,
  findUser,
  getBooks,
  getUsers,
  isMongoConfigured,
  normalizeBook,
  readState,
  saveBooks,
}
