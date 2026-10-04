# 📚 Interactive EBook Authoring Template

Welcome to the Interactive EBook Authoring Template! This repository is designed to help authors create and host interactive, Markdown-based courses and ebooks. 

Because this repository can be served directly from GitHub via a CDN, any changes you push here can instantly update your course content on the main platform!

---

## 🚀 Getting Started

When you or another author clone this repository, you should immediately configure Git to use the automated scripts included in this template. 

Run this single command in your terminal from the root of this repository:

```bash
git config core.hooksPath .githooks
```

### Why do I need to do this?
This repository relies on a `search-index.json` file for the search functionality in the app to work. We have included an automated script (`.githooks/pre-commit`) that automatically rebuilds the search index for all your books every time you run `git commit`. 
Running the command above ensures your local Git uses our shared hooks, meaning you never have to remember to build the search index manually!

---

## 📁 Repository Structure

Each ebook lives in its own dedicated folder. You can have as many books in this repository as you want.

```text
github-ebooks/
├── book-one/                  # Your first book folder
│   ├── SUMMARY.md             # REQUIRED: The table of contents for this book
│   ├── chapter1.md            # Your markdown content
│   └── search-index.json      # (Auto-generated) Do not edit manually!
├── book-two/                  # Another book
│   ├── SUMMARY.md
│   └── ...
├── build-search-index.js      # The NodeJS script that builds the search indexes
├── .githooks/                 # Shared Git hooks (like pre-commit)
└── package.json               # Required to run the build script using ES Modules
```

---

## ✍️ How to Write a Book

1. **Create a Folder**: Create a new folder for your book (e.g., `my-awesome-course`).
2. **Create a `SUMMARY.md`**: Inside that folder, you **must** create a `SUMMARY.md` file. This acts as the Table of Contents. The search indexer and the app both rely on this file.
3. **Format the Summary**: Link to your markdown files using standard Markdown lists.

**Example `SUMMARY.md`:**
```markdown
# Table of Contents

* [Introduction to the Course](intro.md)
* [Chapter 1: Basics](chapter1.md)
* [Chapter 2: Advanced](chapter2.md)
```

4. **Write your Markdown**: Create `intro.md`, `chapter1.md`, etc., in the same folder.
5. **Commit your work**: Simply `git commit -m "added a new chapter"`. The pre-commit hook will automatically detect your new files, read the `SUMMARY.md`, parse the text, and generate a fresh `search-index.json` before finishing the commit.

---

## 🛠️ Manual Index Generation (Optional)

If you ever want to test or run the search index generator manually without making a commit, ensure you have [Node.js](https://nodejs.org/) installed, and run:

```bash
node build-search-index.js
```
