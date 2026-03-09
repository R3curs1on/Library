'use client'

import * as React from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommandSearch } from './command-search'
import type { Book } from '@/lib/books-data'

interface HeaderProps {
  onMenuClick: () => void
  onSelectBook: (book: Book) => void
}

export function Header({ onMenuClick, onSelectBook }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="hidden flex-col sm:flex">
          <h1 className="font-serif text-xl font-semibold tracking-tight">
            Library Collection
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and rent from our curated selection
          </p>
        </div>
      </div>

      <CommandSearch onSelectBook={onSelectBook} />
    </header>
  )
}
