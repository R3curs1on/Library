'use client'

import * as React from 'react'
import { BookOpen, Search, User } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { books, type Book } from '@/lib/books-data'

interface CommandSearchProps {
  onSelectBook: (book: Book) => void
}

export function CommandSearch({ onSelectBook }: CommandSearchProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (book: Book) => {
    setOpen(false)
    onSelectBook(book)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:w-64 lg:w-80"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search books...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Library"
        description="Search through the entire book collection"
      >
        <CommandInput placeholder="Search by title, author, or genre..." />
        <CommandList>
          <CommandEmpty>No books found.</CommandEmpty>
          <CommandGroup heading="Books">
            {books.map((book) => (
              <CommandItem
                key={book.id}
                value={`${book.title} ${book.author} ${book.genre}`}
                onSelect={() => handleSelect(book)}
                className="gap-3"
              >
                <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{book.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {book.author}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {book.genre}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Authors">
            {Array.from(new Set(books.map((b) => b.author)))
              .slice(0, 5)
              .map((author) => (
                <CommandItem key={author} value={author}>
                  <User className="mr-2 size-4 text-muted-foreground" />
                  {author}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
