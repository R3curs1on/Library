const path = require('node:path')
const { spawnSync } = require('node:child_process')

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || []
}

function buildSearchText(book) {
  return [
    book.Name,
    book.Name,
    book.Author,
    book.Publisher,
    book.Category,
    book.Description,
    ...(book.Tags || []),
  ].join(' ')
}

function buildFallbackSearch(query, books) {
  const tokens = tokenize(query)

  if (tokens.length === 0) {
    const results = books.slice(0, 5)
    return {
      query,
      results,
      suggestions: results.map((book) => ({
        label: book.Name,
        type: 'book',
      })),
    }
  }

  const ranked = books
    .map((book) => {
      const haystack = tokenize(buildSearchText(book))
      const score = tokens.reduce((sum, token) => {
        return sum + haystack.filter((word) => word === token).length
      }, 0)
      return { book, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)

  const results = ranked.map((entry) => entry.book)
  const suggestions = ranked.slice(0, 5).flatMap((entry) => [
    { label: entry.book.Name, type: 'book' },
    { label: entry.book.Author, type: 'author' },
    { label: entry.book.Category, type: 'category' },
  ])

  return {
    query,
    results,
    suggestions: dedupeSuggestions(suggestions),
  }
}

function dedupeSuggestions(suggestions) {
  const seen = new Set()
  return suggestions.filter((suggestion) => {
    const key = `${suggestion.type}:${suggestion.label.toLowerCase()}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function searchBooks(query, books) {
  const trimmedQuery = String(query || '').trim()
  const scriptPath = path.join(process.cwd(), 'scripts', 'tfidf_search.py')

  if (!trimmedQuery) {
    return buildFallbackSearch('', books)
  }

  try {
    const response = spawnSync('python3', [scriptPath], {
      input: JSON.stringify({
        query: trimmedQuery,
        books: books.map((book) => ({
          id: book.id,
          name: book.Name,
          author: book.Author,
          publisher: book.Publisher,
          category: book.Category,
          description: book.Description,
          tags: book.Tags,
        })),
      }),
      encoding: 'utf-8',
      timeout: 4000,
    })

    if (response.status !== 0 || response.error || !response.stdout.trim()) {
      return buildFallbackSearch(trimmedQuery, books)
    }

    const parsed = JSON.parse(response.stdout)
    const booksById = new Map(books.map((book) => [book.id, book]))

    return {
      query: trimmedQuery,
      results: parsed.results
        .map((entry) => booksById.get(entry.id))
        .filter(Boolean),
      suggestions: dedupeSuggestions(parsed.suggestions || []).slice(0, 8),
    }
  } catch {
    return buildFallbackSearch(trimmedQuery, books)
  }
}

module.exports = {
  searchBooks,
}
