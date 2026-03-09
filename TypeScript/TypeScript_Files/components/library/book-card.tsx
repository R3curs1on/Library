'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Book } from '@/lib/books-data'
import { cn } from '@/lib/utils'

interface BookCardProps {
  book: Book
  index: number
  onClick: () => void
}

export function BookCard({ book, index, onClick }: BookCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Book Cover with Spine Shadow */}
      <div className="relative mb-3 overflow-hidden rounded-sm">
        <div className="aspect-[2/3] relative">
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          {/* Spine shadow effect - right side */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/30 via-black/15 to-transparent" />
          {/* Top highlight for 3D effect */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
          {/* Availability badge */}
          {!book.available && (
            <div className="absolute left-2 top-2 rounded bg-muted/90 px-2 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              On Loan
            </div>
          )}
        </div>
      </div>

      {/* Book Info */}
      <div className="space-y-1">
        <h3 className="font-serif text-base font-medium leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {book.author}
        </p>
        <div className="flex items-center gap-1.5">
          <Star className="size-3.5 fill-primary text-primary" />
          <span className="text-sm font-medium text-foreground">
            {book.rating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            · {book.genre}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
