
const Book = ( Name , Author , Pages , Publisher , Rating , img ) => {
    return {
        Name,
        Author,
        Pages,
        Publisher,
        Rating ,
        img
    }
}

const Library = ( () => {
    let BooksArray = [] ;
    
    const addBook = (  Name , Author , Pages , Publisher , Rating , img ) => {
        const book = Book(Name, Author, Pages, Publisher, Rating , img);
        BooksArray.push(book);
    }
    
    const getBooks = () => {
        return BooksArray;
    }
    
    const deleteBook = (name) =>{
        if(searchBook(name) != -1) {
            BooksArray.splice(searchBook(name), 1);
        }
    }
    
    const searchBook = (name) =>{
        let index = -1;
        for (let i = 0; i < BooksArray.length; i++) {
            if (BooksArray[i].Name == name){
                index = i;
                break;
            }
        }
        return index
    }
    
     const render = () =>{
        // use div block with id "book" to render books
         // use bookArray to get books 
         // use grids for arranging books (flexbox or grid (more recommended) of 3 columns ) ; thus for each card/cell keep height fixed (e.g. 200px) and width fixed (e.g. 150px) for img/cover if any 
        const bookContainer = document.getElementById("books");
         // clear previous content && by default make add one block for adding new book
        bookContainer.innerHTML = '';
        BooksArray.forEach((book) => {
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";
            bookCard.innerHTML = `
                   
                <img src="${book.img}" alt="${book.Name}"  class="book-cover">
                <h3>${book.Name}</h3>
                <p>Author: ${book.Author}</p>
                <p>Pages: ${book.Pages}</p>
                <p>Publisher: ${book.Publisher}</p>
                <p>Rating: ${book.Rating}</p>
            `;
            bookContainer.appendChild(bookCard);
        });
        const addBookCard = document.createElement("div");
           addBookCard.className = "book-card add-book-card";
           addBookCard.innerHTML = `<img src="" alt="AddBook" class="book-cover"><h3>Add New Book</h3>`;
           bookContainer.appendChild(addBookCard);
     }
     
    return {
        addBook,
        getBooks,
        deleteBook,
        searchBook,
        render
    };
    
}) ();

// make an onclick event for search button
const searchResult = document.getElementById("search-button") ;
searchResult.addEventListener("click", () => {
    const searchInput = document.getElementById("search-input").value;
    const results = searchBook(searchInput);
    const resultContainer = document.getElementById("books");

    // Clear previous results
    resultContainer.innerHTML = '';

    if (typeof results === "string") {
        resultContainer.textContent = results; // No books found
    } else {
        results.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";
            bookCard.innerHTML = `
                <img src="${book.img}" alt="${book.Name}" class="book-cover">
                <h3>${book.Name}</h3>
                <p>Author: ${book.Author}</p>
                <p>Pages: ${book.Pages}</p>
                <p>Publisher: ${book.Publisher}</p>
                <p>Rating: ${book.Rating}</p>
            `;
            resultContainer.appendChild(bookCard);
            console.log(resultContainer);
        });
    }
});
const searchBook = (input) =>{
    const books = Library.getBooks();
    const inputTokens = input.toLowerCase().split(" ");
    return bestMatchedBooks(books, inputTokens);
}
const bestMatchedBooks = (books, inputTokens) => {
    const matchedBooks = books.filter(book => {
        return inputTokens.every(token => {
            return book.Name.toLowerCase().includes(token) || book.Author.toLowerCase().includes(token);
        });
    });

    if (matchedBooks.length === 0) {
        return "No books found";
    }
    return matchedBooks;
}


// Initialize the library and
// Note: Using 'null' as a placeholder for pageCount and rating, as this data was not in the source table.
// Format: Library.addBook(title, author, pageCount, publisher, rating, imageUrl);

Library.addBook("The Great Gatsby", "F. Scott Fitzgerald", null, "Charles Scribner's Sons", null, "https://upload.wikimedia.org/wikipedia/commons/a/a0/The_Great_Gatsby_Cover_1925_Retouched.jpg");
Library.addBook("1984", "George Orwell", null, "Secker & Warburg", null, "https://commons.wikimedia.org/wiki/File:1984_first_edition_cover.jpg");
Library.addBook("To Kill a Mockingbird", "Harper Lee", null, "J.B. Lippincott & Co.", null, "https://commons.wikimedia.org/wiki/File:To_Kill_a_Mockingbird_(first_edition_cover).jpg");
Library.addBook("Pride and Prejudice", "Jane Austen", null, "T. Egerton, Whitehall", null, "https://commons.wikimedia.org/wiki/File:Pride_and_Prejudice_title_page.jpg");
Library.addBook("The Lord of the Rings", "J.R.R. Tolkien", null, "Allen & Unwin", null, "https://www.tolkienbooks.us/lotr/uk/hc/a-u-1954/the-fellowship-of-the-ring-1954");
Library.addBook("The Hobbit", "J.R.R. Tolkien", null, "George Allen & Unwin", null, "https://commons.wikimedia.org/wiki/File:The_Hobbit_first_edition_cover.jpg");
Library.addBook("One Hundred Years of Solitude", "Gabriel Garcia Marquez", null, "Harper & Row", null, "https://lithub.com/100-covers-of-gabriel-garcia-marquezs-one-hundred-years-of-solitude/");
Library.addBook("Moby Dick", "Herman Melville", null, "Harper & Brothers", null, "https://www.raptisrarebooks.com/product/moby-dick-or-the-whale-herman-melville-first-edition-rare/");
Library.addBook("War and Peace", "Leo Tolstoy", null, "William S. Gottsberger", null, "https://www.abebooks.com/servlet/BookDetailsPL?bi=30973415136");
Library.addBook("The Catcher in the Rye", "J.D. Salinger", null, "Little, Brown and Company", null, "https://commons.wikimedia.org/wiki/File:The_Catcher_in_the_Rye_(1951,_first_edition_cover).jpg");
Library.addBook("The Chronicles of Narnia", "C.S. Lewis", null, "Geoffrey Bles", null, "https://en.wikipedia.org/wiki/File:The_Lion,_the_Witch_and_the_Wardrobe_cover.gif");
Library.addBook("Don Quixote", "Miguel de Cervantes", null, "Francisco de Robles", null, "https://commons.wikimedia.org/wiki/File:Don_Quijote_de_la_Mancha,_1605.jpg");
Library.addBook("Ulysses", "James Joyce", null, "Shakespeare and Company", null, "https://commons.wikimedia.org/wiki/File:Ulysses-cover.jpg");
Library.addBook("The Odyssey", "Homer", null, "Demetrios Chalkokondyles", null, "https://commons.wikimedia.org/wiki/File:Homer_editio_princeps_1488.jpg");
Library.addBook("The Divine Comedy", "Dante Alighieri", null, "Nicolaus Laurentii", null, "https://commons.wikimedia.org/wiki/File:Dante_Landino_1481_Inferno_I.jpg");
Library.addBook("The Brothers Karamazov", "Fyodor Dostoevsky", null, "William Heinemann", null, "https://www.baumanrarebooks.com/rare-books/dostoevsky-fyodor/brothers-karamazov/113692.aspx");
Library.addBook("Crime and Punishment", "Fyodor Dostoevsky", null, "Vizetelly & Co.", null, "https://www.classiceditions.com/crime-and-punishment-first-english-edition-unique-binding-by-jamie-kamph/");
Library.addBook("Wuthering Heights", "Emily Brontë", null, "Thomas Cautley Newby", null, "https://www.bl.uk/collection-items/first-edition-of-emily-brontes-wuthering-heights-and-anne-brontes-agnes-grey");
Library.addBook("Jane Eyre", "Charlotte Brontë", null, "Smith, Elder & Co.", null, "https://www.bl.uk/collection-items/first-edition-of-jane-eyre");
Library.addBook("The Adventures of Huckleberry Finn", "Mark Twain", null, "Charles L. Webster and Co.", null, "https://commons.wikimedia.org/wiki/File:Huckleberry_Finn_book.JPG");
Library.addBook("The Old Man and the Sea", "Ernest Hemingway", null, "Charles Scribner's Sons", null, "https://www.raptisrarebooks.com/product/the-old-man-and-the-sea-ernest-hemingway-first-edition-signed/");
Library.addBook("Frankenstein", "Mary Shelley", null, "Lackington, Hughes, Harding, Mavor, & Jones", null, "https://commons.wikimedia.org/wiki/File:Frankenstein_1818_edition_title_page.jpg");
Library.addBook("Alice's Adventures in Wonderland", "Lewis Carroll", null, "Macmillan", null, "https://commons.wikimedia.org/wiki/File:Alices_Adventures_in_Wonderland_by_Lewis_Carroll_and_John_Tenniel_-Title_page-_1866.jpg");
Library.addBook("The Picture of Dorian Gray", "Oscar Wilde", null, "Ward, Lock and Co.", null, "https://www.bl.uk/collection-items/the-picture-of-dorian-gray-first-edition");

Library.render();
// Render the initial books
// enough books to test rendering