const Book = (Name, Author, Pages, Publisher, Rating, img, Category) => {
    return {
        Name,
        Author,
        Pages,
        Publisher,
        Rating,
        img,
        Category
    }
}

var userType = "user";

const loginMap = {};
loginMap["admin"] = "adminPasswd";


const handleLogin = ( () => {

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (loginMap[username]) {
        if ( loginMap[username] === password ) {
            if (username === "admin") {
                userType = "admin";
            }
            alert("Login successful!");
            Library.render(); // Re-render the library to show admin features

        }else{
            alert("Login failed! wrong username or password ");
        }

    }else{
        alert(" Account Dosent exists ");
    }

})


const loginButton = document.getElementById("login-button");
if(loginButton) {
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        handleLogin();
    })
}

const handleSignup = ( () => {
    let username = document.getElementById("usernameSignup").value;
    let password = document.getElementById("passwordSignup").value;
    if (loginMap[username]) {
        alert(" Account already exists , Try other username ");
    }else{
        loginMap[username] = password;
    }
})

const createSignup = document.getElementById("Signup-button");
if(createSignup) {
    createSignup.addEventListener("click", (e) => {
        e.preventDefault();
        handleSignup();
    })
}

const loginauth = document.getElementById("login-auth-button")
if(loginauth) {
    loginauth.addEventListener("click", (e) => {
        // redirect to Login.html
        e.preventDefault();
        window.location.href = "Login.html";
    })
}

const signupauth = document.getElementById("signup-auth-button")
if(signupauth) {
    signupauth.addEventListener("click", (e) => {
        // redirect to Signup.html
        e.preventDefault();
        window.location.href = "Signup.html";
    })
}


const Library = ( () => {
    let BooksArray = JSON.parse(localStorage.getItem('books')) || [];

    const saveBooks = () => {
        localStorage.setItem('books', JSON.stringify(BooksArray));
    };

    const addBook = (Name, Author, Pages, Publisher, Rating, img, Category) => {
        const book = Book(Name, Author, Pages, Publisher, Rating, img, Category);
        BooksArray.push(book);
        saveBooks();
    }

    const getBooks = () => {
        return BooksArray;
    }

    const deleteBook = (Name) => {
        const bookIndex = BooksArray.findIndex(book => book.Name === Name);
        if (bookIndex !== -1) {
            BooksArray.splice(bookIndex, 1);
            saveBooks();
            render(); // Re-render the library after deletion
        } else {
            console.error("Book not found for deletion:", Name);
        }
    }

     const render = () => {
         // use div block with id "book" to render books
         // use bookArray to get books
         // use grids for arranging books (flexbox or grid (more recommended) of 3 columns ) ; thus for each card/cell keep height fixed (e.g. 200px) and width fixed (e.g. 150px) for img/cover if any
         const bookContainer = document.getElementById("books");
         if (!bookContainer) return; // Don't render if the container doesn't exist

         bookContainer.innerHTML = '';  // clear previous content && by default make add one block for adding new book
         BooksArray.forEach((book) => {
             const bookCard = createBookCard(book);
             bookContainer.appendChild(bookCard);
         });

         // Add this function to your code
         function createBookCard(book) {
             const bookCard = document.createElement("div");
             bookCard.className = "book-card";
             bookCard.innerHTML = `
        <div class="image-container">
            <img src="${book.img}" alt="${book.Name}" class="book-cover" onerror="this.onerror=null; this.src='https://placehold.co/150x200?text=No+Image';">
        </div>
        <h3 class="text">${book.Name}</h3>
        <p class="text">Author: ${book.Author}</p>
        <p class="text" >Pages: ${book.Pages || 'Unknown'}</p>
        <p class="text" >Publisher: ${book.Publisher}</p>
        <p class="text" >Rating: ${book.Rating !== undefined && book.Rating !== null ? book.Rating : 'Not rated'}</p>
        <p class="text" >Category: ${book.Category ? book.Category : 'Unknown'}</p>`;
             if (userType == "admin") {
                 bookCard.innerHTML += `<button class="delete-button">Delete</button>`;
                 bookCard.querySelector('.delete-button').addEventListener('click', () => {
                     Library.deleteBook(book.Name);
                 });
             }

             return bookCard;
         }

        if(userType=="admin") {

         const addBookCard = document.createElement("div");
         addBookCard.className = "book-card add-book-card";
         addBookCard.id = "add-book";
         addBookCard.innerHTML = `<img src="" alt="AddBook" class="book-cover"><h3>Add New Book</h3>`;

         const addBookButton = document.getElementById("add-book");
         addBookButton.addEventListener("click", () => {
             const bookName = prompt("Enter Book Name:");
             const bookAuthor = prompt("Enter Author Name:");

             let bookPages = Number(prompt("Enter Number of Pages:"));
             while (isNaN(Number(bookPages)) || Number(bookPages) <= 0) {
                 bookPages = prompt("Enter Number of Pages (must be a positive number):");
             }

             const bookPublisher = prompt("Enter Publisher Name:");

             let bookRating = Number(prompt("Enter Book Rating:"));
             while (Number(bookRating) > 5 || Number(bookRating) < 0 || isNaN(Number(bookRating))) {
                 bookRating = prompt("Enter Book Rating (0-5):");
             }

             const bookImg = prompt("Enter Image URL:");

             if (bookName && bookAuthor && bookPages && bookPublisher && bookRating || bookImg) {
                 const bookCategory = prompt("Enter Book Category:");
                 addBook(bookName, bookAuthor, bookPages, bookPublisher, bookRating, bookImg, bookCategory);
                 render(); // Re-render the library to show the new book
             } else {
                 alert("Please fill in all fields.");
             }
         })

            bookContainer.appendChild(addBookCard);
        }

     }

    return {
        addBook,
        getBooks,
        deleteBook,
        render
    };

}) ();


// make an onclick event for search button
const searchResult = document.getElementById("search-button") ;
if (searchResult) {
    searchResult.addEventListener("click", () => {
        const searchInput = document.getElementById("search-input").value;
        const results = searchBook(searchInput);
        const resultContainer = document.getElementById("serachResults");
        resultContainer.className = 'books'; // Reset to grid view for search results

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
                <p>Pages: ${book.Pages || 'Unknown'}</p>
                <p>Publisher: ${book.Publisher}</p>
                <p>Rating: ${book.Rating !== undefined && book.Rating !== null ? book.Rating : 'Not rated'}</p>
                <p>Category: ${book.Category ? book.Category : 'Unknown'}</p>`;
                if(userType=="admin"){
                    bookCard.innerHTML += `<button class="delete-button">Delete</button>`;
                    bookCard.querySelector('.delete-button').addEventListener('click', () => {
                        Library.deleteBook(book.Name);
                    });
                }


                resultContainer.appendChild(bookCard);
            });
        }
    });

}

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

    const matchedBooksWithAuthor = books.filter(book => {
        return inputTokens.every(token => {
            return book.Author.toLowerCase().includes(token);
        });
    });

    const matchedBooksWithPublisher = books.filter(book => {
        return inputTokens.every(token => {
            return book.Publisher.toLowerCase().includes(token);
        });
    });

    const matchedBooksWithCategory = books.filter(book => {
        return inputTokens.every(token => {
            return book.Category && book.Category.toLowerCase().includes(token);
        });
    });


    if ( matchedBooks.length===0 && matchedBooksWithAuthor.length===0  && matchedBooksWithPublisher.length===0 && matchedBooksWithCategory.length===0 ) {
        return "No books found";
    }
    return matchedBooks;
}


// Initialize the library and
// Note: Using 'null' as a placeholder for pageCount and rating, as this data was not in the source table.
// Format: Library.addBook(title, author, pageCount, publisher, rating, imageUrl);
const initializeLibrary = () => {
    const books = localStorage.getItem('books');
    if (!books) {
        Library.addBook("The Great Gatsby", "F. Scott Fitzgerald", null, "Charles Scribner's Sons", 4.2, "images/The Great Gatsby.jpg", "Classic");
        Library.addBook("1984", "George Orwell", null, "Secker & Warburg", 4.5, "images/1984.jpg", "Dystopian");
        Library.addBook("To Kill a Mockingbird", "Harper Lee", null, "J.B. Lippincott & Co.", 4.3, "images/To Kill a Mockingbird.jpg", "Classic");
        Library.addBook("Pride and Prejudice", "Jane Austen", null, "T. Egerton, Whitehall", 4.4, "images/Pride and Prejudice.jpg", "Romance");
        // Library.addBook("The Lord of the Rings", "J.R.R. Tolkien", null, "Allen & Unwin", 4.8, "", "Fantasy");
        // Library.addBook("The Hobbit", "J.R.R. Tolkien", null, "George Allen & Unwin", 4.7, "", "Fantasy");
        // Library.addBook("One Hundred Years of Solitude", "Gabriel Garcia Marquez", null, "Harper & Row", 4.1, "", "Magical Realism");
        // Library.addBook("Moby Dick", "Herman Melville", null, "Harper & Brothers", 3.9, "", "Adventure");
        // Library.addBook("War and Peace", "Leo Tolstoy", null, "William S. Gottsberger", 4.3, "", "Historical");
        // Library.addBook("The Catcher in the Rye", "J.D. Salinger", null, "Little, Brown and Company", 3.8, "", "Classic");
        // Library.addBook("The Chronicles of Narnia", "C.S. Lewis", null, "Geoffrey Bles", 4.6, "", "Fantasy");
        // Library.addBook("Don Quixote", "Miguel de Cervantes", null, "Francisco de Robles", 4.0, "", "Classic");
        // Library.addBook("Ulysses", "James Joyce", null, "Shakespeare and Company", 3.7, "", "Modernist");
        // Library.addBook("The Odyssey", "Homer", null, "Demetrios Chalkokondyles", 4.2, "", "Epic");
        // Library.addBook("The Divine Comedy", "Dante Alighieri", null, "Nicolaus Laurentii", 4.5, "", "Poetry");
        // Library.addBook("The Brothers Karamazov", "Fyodor Dostoevsky", null, "William Heinemann", 4.4, "", "Philosophical");
        // Library.addBook("Crime and Punishment", "Fyodor Dostoevsky", null, "Vizetelly & Co.", 4.3, "", "Psychological");
        // Library.addBook("Wuthering Heights", "Emily Brontë", null, "Thomas Cautley Newby", 4.0, "", "Gothic");
        // Library.addBook("Jane Eyre", "Charlotte Brontë", null, "Smith, Elder & Co.", 4.1, "", "Romance");
        // Library.addBook("The Adventures of Huckleberry Finn", "Mark Twain", null, "Charles L. Webster and Co.", 4.2, "", "Adventure");
        // Library.addBook("The Old Man and the Sea", "Ernest Hemingway", null, "Charles Scribner's Sons", 3.9, "", "Classic");
        // Library.addBook("Frankenstein", "Mary Shelley", null, "Lackington, Hughes, Harding, Mavor, & Jones", 4.0, "", "Horror");
        // Library.addBook("Alice's Adventures in Wonderland", "Lewis Carroll", null, "Macmillan", 4.3, "", "Fantasy");
        // Library.addBook("The Picture of Dorian Gray", "Oscar Wilde", null, "Ward, Lock and Co.", 4.1, "", "Philosophical");
    }
};

initializeLibrary();

function getAllBooks() {
    return Library.getBooks();
}


Library.render();
// Render the initial books
// enough books to test rendering
// Get the publisher element

const publisherElement  = document.getElementById("Authorbooks");

// Only proceed if the element exists
if (publisherElement) {
    // Get books and sort by author name
    let books = getAllBooks();

    // Group books by author using a more reliable method
    const authorMap = {};

    // Build author groups
    books.forEach(book => {
        if (!authorMap[book.Author]) {
            authorMap[book.Author] = [];
        }
        authorMap[book.Author].push(book);
    });

    publisherElement.innerHTML = '';

    // Create sections for each author
    Object.keys(authorMap).forEach(author => {
        const booksOfAuthor = authorMap[author];

        const authorDiv = document.createElement("div");
        authorDiv.className = "author-books-container";
        authorDiv.innerHTML = `<h2>${author}</h2>`;

        // Add each book to the author section
        const bookCardFLex = document.createElement("div");
        bookCardFLex.className = "author-book-flex";
        bookCardFLex.innerHTML='';
        booksOfAuthor.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.className = "author-book-card";
            bookCard.innerHTML = `
                <img src="${book.img}" alt="${book.Name}" class="author-book-cover">
                <h3>${book.Name}</h3>
                <p>Author: ${book.Author}</p>
                <p>Pages: ${book.Pages || 'Unknown'}</p>
                <p>Publisher: ${book.Publisher}</p>
                <p>Rating: ${book.Rating !== undefined && book.Rating !== null ? book.Rating : 'Not rated'}</p>
                <p>Category: ${book.Category ? book.Category : 'Unknown'}</p>
                `;
            bookCardFLex.appendChild(bookCard);
        });

        authorDiv.appendChild(bookCardFLex);

        publisherElement.appendChild(authorDiv);
    });
}


const genereElement = document.getElementById("booksGenere");

if (genereElement) {
    // Clear existing content
    genereElement.innerHTML = '';

    // Get books
    const books = getAllBooks();

    // Group books by Category
    const genereMap = {};
    books.forEach(book => {
        // Fallback for missing category
        const category = book.Category || 'Uncategorized';

        if (!genereMap[category]) {
            genereMap[category] = [];
        }
        genereMap[category].push(book);
    });

    // Create sections for each Genre
    Object.keys(genereMap).forEach(genere => {
        const booksOfGenere = genereMap[genere];

        // Create the container for this specific genre
        const genereDiv = document.createElement('div');
        genereDiv.className = "author-books-container";

        // FIX: Use the 'genere' variable from the loop, not 'books.Category'
        genereDiv.innerHTML = `<h2>${genere}</h2>`;

        // Create a flex container to hold the cards (matches your Author layout)
        const bookCardFlex = document.createElement("div");
        bookCardFlex.className = "author-book-flex";

        // Generate cards
        booksOfGenere.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.className = "author-book-card";

            // Your requested HTML template
            bookCard.innerHTML = `
                <img src="${book.img}" alt="${book.Name}" class="author-book-cover">
                <h3>${book.Name}</h3>
                <p>Author: ${book.Author}</p>
                <p>Pages: ${book.Pages || 'Unknown'}</p>
                <p>Publisher: ${book.Publisher}</p>
                <p>Rating: ${book.Rating !== undefined && book.Rating !== null ? book.Rating : 'Not rated'}</p>
                <p>Category: ${book.Category ? book.Category : 'Unknown'}</p>
                `;

            // Append card to the flex container
            bookCardFlex.appendChild(bookCard);
        });

        // Append the flex container to the genre div
        genereDiv.appendChild(bookCardFlex);

        // FIX: Append the genre div to the main element INSIDE the loop
        genereElement.appendChild(genereDiv);
    });
}