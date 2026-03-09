export interface Book {
  id: string
  title: string
  author: string
  genre: string
  publisher: string
  year: number
  isbn: string
  pages: number
  rating: number
  description: string
  coverUrl: string
  available: boolean
}

export const genres = [
  'All',
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Biography',
  'History',
  'Philosophy',
  'Poetry',
] as const

export type Genre = (typeof genres)[number]

export const books: Book[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    publisher: 'Viking Press',
    year: 2020,
    isbn: '978-0525559474',
    pages: 304,
    rating: 4.5,
    description:
      'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '2',
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Science Fiction',
    publisher: 'Chilton Books',
    year: 1965,
    isbn: '978-0441172719',
    pages: 688,
    rating: 4.8,
    description:
      'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '3',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    genre: 'Mystery',
    publisher: 'Celadon Books',
    year: 2019,
    isbn: '978-1250301697',
    pages: 336,
    rating: 4.3,
    description:
      "Alicia Berenson's life is seemingly perfect. Until one evening, when she shoots her husband in the face and never speaks another word.",
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    available: false,
  },
  {
    id: '4',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: 'Non-Fiction',
    publisher: 'Harper',
    year: 2015,
    isbn: '978-0062316097',
    pages: 464,
    rating: 4.6,
    description:
      "A groundbreaking narrative of humanity's creation and evolution that explores how biology and history have defined us.",
    coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '5',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    publisher: 'T. Egerton',
    year: 1813,
    isbn: '978-0141439518',
    pages: 432,
    rating: 4.7,
    description:
      'The story follows the main character, Elizabeth Bennet, as she deals with issues of manners, upbringing, morality, and marriage.',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '6',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    genre: 'Biography',
    publisher: 'Simon & Schuster',
    year: 2011,
    isbn: '978-1451648539',
    pages: 656,
    rating: 4.4,
    description:
      'Based on more than forty interviews with Jobs conducted over two years, this is the definitive biography of the Apple co-founder.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '7',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    genre: 'Non-Fiction',
    publisher: 'Bantam Books',
    year: 1988,
    isbn: '978-0553380163',
    pages: 212,
    rating: 4.5,
    description:
      'From the Big Bang to black holes, from relativity to quantum mechanics, this book is an accessible and comprehensive exploration of the universe.',
    coverUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '8',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    publisher: 'Scribner',
    year: 1925,
    isbn: '978-0743273565',
    pages: 180,
    rating: 4.4,
    description:
      'The story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island.',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    available: false,
  },
  {
    id: '9',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    genre: 'Philosophy',
    publisher: 'Penguin Classics',
    year: 180,
    isbn: '978-0140449334',
    pages: 256,
    rating: 4.6,
    description:
      'A series of personal writings by the Roman Emperor Marcus Aurelius, recording his private notes to himself and ideas on Stoic philosophy.',
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '10',
    title: 'The Iliad',
    author: 'Homer',
    genre: 'Poetry',
    publisher: 'Penguin Classics',
    year: -750,
    isbn: '978-0140275360',
    pages: 704,
    rating: 4.5,
    description:
      'One of the oldest extant works of Western literature, the Iliad is set during the Trojan War, the ten-year siege of Troy.',
    coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '11',
    title: 'Foundation',
    author: 'Isaac Asimov',
    genre: 'Science Fiction',
    publisher: 'Gnome Press',
    year: 1951,
    isbn: '978-0553293357',
    pages: 244,
    rating: 4.6,
    description:
      'For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. But only Hari Seldon, creator of psychohistory, can see into the future.',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    available: true,
  },
  {
    id: '12',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    genre: 'Mystery',
    publisher: 'Crown Publishing',
    year: 2012,
    isbn: '978-0307588371',
    pages: 419,
    rating: 4.2,
    description:
      "On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne's fifth wedding anniversary. Then Amy disappears.",
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    available: true,
  },
]
