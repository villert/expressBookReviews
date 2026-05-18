const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const baseURL = "http://localhost:5000";

const handleAxiosError = (res, error) => {
  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }

  return res.status(500).json({ message: "Unable to retrieve books at this time" });
};


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Task 1: Get the complete list of books available in the shop using Axios.
public_users.get('/', async function (req, res) {
  //Write your code here
  if (req.headers["x-internal-request"] === "true") {
    return res.status(200).json(books);
  }

  try {
    const response = await axios.get(`${baseURL}/`, {
      headers: { "x-internal-request": "true" }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    return handleAxiosError(res, error);
  }
});

// Task 2: Get the details of a single book by its ISBN using Axios.
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  if (req.headers["x-internal-request"] === "true") {
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  }

  try {
    const response = await axios.get(`${baseURL}/isbn/${isbn}`, {
      headers: { "x-internal-request": "true" }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    return handleAxiosError(res, error);
  }
 });
  
// Task 3: Get all books written by the requested author using Axios.
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase();

  if (req.headers["x-internal-request"] === "true") {
    const matchingBooks = Object.entries(books).filter(([, book]) =>
      book.author.toLowerCase().includes(author)
    );

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: "No books found for the given author" });
    }

    return res.status(200).json(Object.fromEntries(matchingBooks));
  }

  try {
    const response = await axios.get(`${baseURL}/author/${req.params.author}`, {
      headers: { "x-internal-request": "true" }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    return handleAxiosError(res, error);
  }
});

// Task 4: Get all books that match the requested title using Axios.
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();

  if (req.headers["x-internal-request"] === "true") {
    const matchingBooks = Object.entries(books).filter(([, book]) =>
      book.title.toLowerCase().includes(title)
    );

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: "No books found for the given title" });
    }

    return res.status(200).json(Object.fromEntries(matchingBooks));
  }

  try {
    const response = await axios.get(`${baseURL}/title/${req.params.title}`, {
      headers: { "x-internal-request": "true" }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    return handleAxiosError(res, error);
  }
});

// Task 5: Get all reviews for the book that matches the given ISBN.
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
