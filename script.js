console.log('Happy developing ✨')

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
           addBookCard.innerHTML = `<img src="addBook.jpg" alt="AddBook" class="book-cover"><h3>Add New Book</h3>`;
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


// Initialize the library and
Library.addBook("The Great Gatsby", "F. Scott Fitzgerald", 180, "Scribner", 4.5, "http://googleusercontent.com/image_collection/image_retrieval/5856020322431860813_0");
Library.addBook("1984", "George Orwell", 328, "Secker & Warburg", 4.8, "http://googleusercontent.com/image_collection/image_retrieval/7589560682955808539_0");
Library.addBook("To Kill a Mockingbird", "Harper Lee", 281, "J.B. Lippincott & Co.", 4.9, "http://googleusercontent.com/image_collection/image_retrieval/7102426850065276785_0");
Library.addBook("Pride and Prejudice", "Jane Austen", 279, "T. Egerton", 4.6, "http://googleusercontent.com/image_collection/image_retrieval/6422828293282302087_0");
Library.addBook("The Lord of the Rings", "J.R.R. Tolkien", 1178, "Allen & Unwin", 4.9, "http://googleusercontent.com/image_collection/image_retrieval/2196081143383736092_0");
Library.addBook("The Hobbit", "J.R.R. Tolkien", 310, "George Allen & Unwin", 4.7, "http://googleusercontent.com/image_collection/image_retrieval/15001351508373698191_0");
Library.addBook("One Hundred Years of Solitude", "Gabriel Garcia Marquez", 417, "Harper & Row", 4.6, "http://googleusercontent.com/image_collection/image_retrieval/8165941025364512132_0");
Library.addBook("Moby Dick", "Herman Melville", 635, "Richard Bentley", 4.3, "http://googleusercontent.com/image_collection/image_retrieval/879477944724224253_0");
Library.addBook("War and Peace", "Leo Tolstoy", 1225, "The Russian Messenger", 4.5, "http://googleusercontent.com/image_collection/image_retrieval/6360474793476985420_0");
Library.addBook("The Catcher in the Rye", "J.D. Salinger", 224, "Little, Brown and Company", 4.2, "http://googleusercontent.com/image_collection/image_retrieval/209514540363611822_0");
Library.addBook("The Chronicles of Narnia", "C.S. Lewis", 767, "Geoffrey Bles", 4.8, "http://googleusercontent.com/image_collection/image_retrieval/11824147719835079830_0");
Library.addBook("Don Quixote", "Miguel de Cervantes", 863, "Francisco de Robles", 4.4, "http://googleusercontent.com/image_collection/image_retrieval/4589067183751314871_0");
Library.addBook("Ulysses", "James Joyce", 730, "Sylvia Beach", 4.1, "http://googleusercontent.com/image_collection/image_retrieval/525566337020827441_0");
Library.addBook("The Odyssey", "Homer", 541, "N/A (Ancient)", 4.7, "http://googleusercontent.com/image_collection/image_retrieval/1819600579533339911_0");
Library.addBook("The Divine Comedy", "Dante Alighieri", 798, "N/A (14th Century)", 4.6, "http://googleusercontent.com/image_collection/image_retrieval/4876434037591304120_0");
Library.addBook("The Brothers Karamazov", "Fyodor Dostoevsky", 824, "The Russian Messenger", 4.8, "http://googleusercontent.com/image_collection/image_retrieval/15646230030258146669_0");
Library.addBook("Crime and Punishment", "Fyodor Dostoevsky", 671, "The Russian Messenger", 4.7, "http://googleusercontent.com/image_collection/image_retrieval/6602197219990425542_0");
Library.addBook("Wuthering Heights", "Emily Bronte", 416, "Thomas Cautley Newby", 4.3, "http://googleusercontent.com/image_collection/image_retrieval/9497534410069699277_0");
Library.addBook("Jane Eyre", "Charlotte Bronte", 500, "Smith, Elder & Co.", 4.5, "http://googleusercontent.com/image_collection/image_retrieval/7210283547778485867_0");
Library.addBook("The Adventures of Huckleberry Finn", "Mark Twain", 366, "Chatto & Windus", 4.4, "http://googleusercontent.com/image_collection/image_retrieval/9879706356427164186_0");
Library.addBook("The Old Man and the Sea", "Ernest Hemingway", 127, "Charles Scribner's Sons", 4.6, "http://googleusercontent.com/image_collection/image_retrieval/13946418257072768733_0");
Library.addBook("Frankenstein", "Mary Shelley", 280, "Lackington, Hughes, Harding, Mavor & Jones", 4.5, "http://googleusercontent.com/image_collection/image_retrieval/16274870210431814214_0");
Library.addBook("Alice's Adventures in Wonderland", "Lewis Carroll", 200, "Macmillan", 4.7, "http://googleusercontent.com/image_collection/image_retrieval/2987183572083454324_0");
Library.addBook("The Picture of Dorian Gray", "Oscar Wilde", 254, "Lippincott's Monthly Magazine", 4.6, "http://googleusercontent.com/image_collection/image_retrieval/10086699941633811128_0");
Library.render();
// Render the initial books
// enough books to test rendering