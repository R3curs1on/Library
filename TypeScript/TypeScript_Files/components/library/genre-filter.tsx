'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { genres, type Genre } from '@/lib/books-data'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface GenreFilterProps {
  selectedGenre: Genre
  onSelectGenre: (genre: Genre) => void
}

export function GenreFilter({ selectedGenre, onSelectGenre }: GenreFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-3">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onSelectGenre(genre)}
            className={cn(
              'relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              selectedGenre === genre
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {selectedGenre === genre && (
              <motion.div
                layoutId="genre-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{genre}</span>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="h-2" />
    </ScrollArea>
  )
}
