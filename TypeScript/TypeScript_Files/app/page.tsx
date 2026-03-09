'use client'

import * as React from 'react'
import { Sidebar } from '@/components/library/sidebar'
import { Header } from '@/components/library/header'
import { GenreFilter } from '@/components/library/genre-filter'
import { LibraryGrid } from '@/components/library/library-grid'
import { BookDetailSheet } from '@/components/library/book-detail-sheet'
import { type Book, type Genre } from '@/lib/books-data'

export default function LibraryDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [selectedGenre, setSelectedGenre] = React.useState<Genre>('All')
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const handleSelectBook = React.useCallback((book: Book) => {
    setSelectedBook(book)
    setSheetOpen(true)
  }, [])

  const handleToggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
        />
      </div>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <Header
          onMenuClick={handleToggleSidebar}
          onSelectBook={handleSelectBook}
        />

        <div className="flex-1 px-4 py-6 lg:px-6">
          {/* Stats Bar */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Books" value="1,247" />
            <StatCard label="Available" value="983" />
            <StatCard label="On Loan" value="264" />
            <StatCard label="New This Month" value="42" />
          </div>

          {/* Genre Filter */}
          <div className="mb-6">
            <h2 className="mb-3 font-serif text-lg font-medium">
              Browse by Genre
            </h2>
            <GenreFilter
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
            />
          </div>

          {/* Book Grid */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium">
                {selectedGenre === 'All' ? 'All Books' : selectedGenre}
              </h2>
            </div>
            <LibraryGrid
              selectedGenre={selectedGenre}
              onSelectBook={handleSelectBook}
            />
          </section>
        </div>
      </main>

      {/* Book Detail Sheet */}
      <BookDetailSheet
        book={selectedBook}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card p-4 shadow-sm ring-1 ring-border/50">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  )
}
