'use client'

import * as React from 'react'
import Image from 'next/image'
import { Star, BookOpen, Building2, Calendar, Hash, FileText } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Book } from '@/lib/books-data'

interface BookDetailSheetProps {
  book: Book | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookDetailSheet({
  book,
  open,
  onOpenChange,
}: BookDetailSheetProps) {
  if (!book) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-2xl">{book.title}</SheetTitle>
          <SheetDescription className="text-base">
            by {book.author}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Cover Image */}
          <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-md shadow-xl">
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              sizes="192px"
            />
            {/* Spine shadow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/30 via-black/15 to-transparent" />
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="gap-1.5">
              <Star className="size-3 fill-primary text-primary" />
              {book.rating.toFixed(1)}
            </Badge>
            <Badge variant="outline">{book.genre}</Badge>
            <Badge variant={book.available ? 'default' : 'secondary'}>
              {book.available ? 'Available' : 'On Loan'}
            </Badge>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-semibold">Description</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {book.description}
            </p>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <MetadataItem
              icon={Building2}
              label="Publisher"
              value={book.publisher}
            />
            <MetadataItem
              icon={Calendar}
              label="Year"
              value={book.year > 0 ? book.year.toString() : `${Math.abs(book.year)} BCE`}
            />
            <MetadataItem
              icon={FileText}
              label="Pages"
              value={`${book.pages} pages`}
            />
            <MetadataItem icon={Hash} label="ISBN" value={book.isbn} />
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full font-medium"
              size="lg"
              disabled={!book.available}
            >
              <BookOpen className="mr-2 size-4" />
              {book.available ? 'Rent Now' : 'Join Waitlist'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {book.available
                ? 'Available for 14-day rental'
                : 'Currently on loan. Join the waitlist to be notified when available.'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MetadataItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
