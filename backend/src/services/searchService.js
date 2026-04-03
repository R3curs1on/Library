function tokenize(text) {
  return String(text || '').toLowerCase().match(/[a-z0-9]+/g) || []
}

function buildSearchText(book) {
  return [
    book.Name,
    book.Author,
    book.Publisher,
    book.Category,
    book.Description,
    ...(book.Tags || []),
  ].join(' ')
}

function dedupeSuggestions(suggestions) {
  const seen = new Set()
  return suggestions.filter((suggestion) => {
    const key = `${suggestion.type}:${String(suggestion.label).toLowerCase()}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function buildFallbackSearch(query, books) {
  const tokens = tokenize(query)

  if (tokens.length === 0) {
    const results = books.slice(0, 6)
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

function searchBooks(query, books) {
  return buildFallbackSearch(query, books)
}

module.exports = {
  searchBooks,
}