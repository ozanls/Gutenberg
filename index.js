const express = require("express");
const path = require("path"); // Needed when setting up static/file paths
const { MongoClient, ObjectId } = require("mongodb"); // Get the MongoClient class of objects, so we can create one

// Create a new MongoClient
const dbUrl = ""
const client = new MongoClient(dbUrl);

// Set up Express App
const app = express();
const port = process.env.PORT || "4444";


// Express App Settings
app.set("views", path.join(__dirname, "templates")); // Setting for "views" is set to path: __dirname/views
app.set("view engine", "pug");

// Setting folder for static files (e.g. CSS, client-side JS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Convert query string formats in form data to JSON format
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting page paths
app.get("/", async (request, response) => {
    let books = await getBooks();
    response.render("index", { title: "Home", books: books});
});
app.get("/catalogue", async (request, response) => {
    let books = await getBooks();
    response.render("catalogue", { title: "Catalogue", books: books});
});
app.get("/about", (request, response) => {
    response.render("about", {title: "About"})
})
app.get("/admin/menu", async(request, response) => {
    let books = await getBooks();
    response.render("admin/menu-list", {title: "Admin Menu", books: books})
})
app.get("/admin/menu/add", (request, response) => {
    response.render("admin/menu-add", {title: "Add a book"})
})
app.get("/admin/menu/edit/:id", async(request, response) => {
    let bookId = request.params.id;
    let book = await getBookById(bookId);
    response.render("admin/menu-edit", {title: "Edit a book", book: book})
})


// Path for processing 'Add Book' form
app.post("/admin/menu/add/submit", async (request, response) => {
    let name = request.body.name;
    let description = request.body.description;
    let author = request.body.author;
    let publisher = request.body.publisher;
    let category = request.body.category;
    let price = request.body.price;
    let releasedate = request.body.releasedate;
    let image = request.body.image
    let newBook = {
        name: name,
        description: description,
        author: author,
        publisher: publisher,
        category: category,
        price: price,
        releasedate: releasedate,
        image: image
        }
    await addBook(newBook);
    response.redirect("/")
})

// Path for processing 'Edit Book' form
app.post("/admin/menu/edit/:id/submit", async (request, response) => {
    let id = request.body.id;
    let editedBook = {
        name: request.body.name,
        description: request.body.description,
        author: request.body.author,
        publisher: request.body.publisher,
        category: request.body.category,
        price: request.body.price,
        releasedate: request.body.releasedate,
        image: request.body.image
        }
    await editBook(id, editedBook);
    response.redirect("/admin/menu")
})

// Path for processing the delete form
app.get("/admin/menu/delete", async(request,response) => {
    let id = request.query.bookId
    deleteBook(id);
    response.redirect("/admin/menu")
})

// Set up server listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});

// MongoDb functions
async function connection() {
    db = client.db("Gutenberg");
    return db // return the Gutenberg database
}
 
// Get all books from the books collection
async function getBooks() {
    db = await connection();
    let results = db.collection("books").find({})
    return await results.toArray(); // Convert results to an array
}

// Get a specific book from the books collection
async function getBookById(id) {
    db = await connection();
    let book = await db.collection("books").findOne({_id: new ObjectId(id)});
    return book;
}
 
// Insert one book into books collection
async function addBook(newBook){
    db = await connection();
    await db.collection("books").insertOne(newBook);
    console.log("book added");
}

// Edit one book from books collection
async function editBook(id, editedBook){
    db = await connection();
    const updateIdFilter = { _id: new ObjectId(id) };
    const updateOperation = { 
        $set: editedBook
    };
    await db.collection("books").updateOne(updateIdFilter, updateOperation);
    console.log("book with id " + id + " has been successfully edited");
}

// Delete one book from books collection
async function deleteBook(id){
    db = await connection();
    const deleteIdFilter = { _id: new ObjectId(id) };
    await db.collection("books").deleteOne(deleteIdFilter);
    console.log("book with id " + id + " has been successfully deleted");
}