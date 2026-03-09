'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookCard } from './book-card'
import { books, type Book, type Genre } from '@/lib/books-data'

interface LibraryGridProps {
  selectedGenre: Genre
  onSelectBook: (book: Book) => void
}

export function LibraryGrid({ selectedGenre, onSelectBook }: LibraryGridProps) {
  const filteredBooks = React.useMemo(() => {
    if (selectedGenre === 'All') return books
    return books.filter((book) => book.genre === selectedGenre)
  }, [selectedGenre])

  return (
    <motion.div
      layout
      className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <AnimatePresence mode="popLayout">
        {filteredBooks.map((book, index) => (
          <motion.div
            key={book.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <BookCard
              book={book}
              index={index}
              onClick={() => onSelectBook(book)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
