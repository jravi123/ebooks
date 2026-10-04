# Data Import & Flat Files
## 

---

# Part 1: What? (The Analytical Concept)

## What is Data Import, Vector Types, & Rectangular Layouts?

Data import is the process of reading flat files (e.g. CSV, TSV) from local disk or cloud URLs and parsing them into R objects. To do this safely, you must understand R's atomic vector types and rectangular layout representations (Data Frames and Tibbles). Data frames are column-oriented lists: each column is an atomic vector of a single data type, and all columns have the same length.

---

# Conceptual Breakdown & Key Principles

• **Atomic Vector Types**: Logical, Integer, Double, Character, Raw.
• **Tibble vs Data Frame**: Tibbles print cleanly, do not coerce types, and warn on missing column matches.
• **File Parsers**: `read_csv()` for comma-separated, `read_tsv()` for tab-separated, `read_excel()` for sheets.

---

# ClassPulse: Analytical Concept Check

Let's test our conceptual understanding of the "What" before we touch any code!

<a href="/clicker/qid" target="_blank">Launch ClassPulse Question</a>

---

# Part 2: How? (R Implementation & AI Collaboration)

## How to Import Flat Files and Inspect Types in R

Read CSV files from local disk or remote URLs using `read_csv()`, and print/inspect types with `glimpse()` and `spec()`.

We can rely on modern AI tools to accelerate our code construction, provided we are thorough in our conceptual understanding and prompt structure.

---

# Implementation in R

```r
library(readr)

# Import a CSV file from a remote URL or local path
# mpg_data <- read_csv("data/mpg.csv")

# Let\'s inspect vector types of mpg using glimpse
glimpse(mpg)

# Check the column specifications
spec(mpg)
```

---

# AI Collaborative Prompt Patterns

Use these patterns with an AI coding assistant to quickly translate your analytical needs into executable R routines:

• **AI Prompt Pattern**: *'Write R code using the readr package to read a CSV file with semicolon separators, specifying column types for "id" as integer and "date" as date.'*
• **AI Prompt Pattern**: *'What is the difference between data.frame and tibble in R? Provide a code example.'*

---

# ClassPulse: Implementation & Coding Check

Let's verify our coding, synthesis, and implementation skills!

<a href="/clicker/qid" target="_blank">Launch ClassPulse Question</a>
