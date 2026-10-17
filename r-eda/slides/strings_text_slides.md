# Text Wrangling & Strings
## String Manipulation, Concatenation, Substrings, Splitting & Literary Analysis (`Lecture 15`)

---

# Lecture Agenda & Topics

Today's lecture corresponds to Chapters 14 and 17 of *R for Data Science*:

* **Understand the basics of working with strings in R**:
  * Double (`"`) vs. single (`'`) quotes, escaping quotes (`\"`), and special characters (`\n`, `\t`, `\\`).
  * Console display functions: `print()`, `cat()`, and `writeLines()`.
  * Character encodings: **ASCII** vs. **Unicode** (`\u00A9`).
* **Convert data to strings & combine strings**:
  * Base R `paste()` / `paste0()` vs. Tidyverse `str_c()` and `str_flatten()`.
  * Vector `length()` vs. character count `str_length()`.
* **Extract data from strings**:
  * Subsetting and mutating substrings with `str_sub()`.
  * Splitting strings into lists with `str_split()` and flattening with `unlist()`.
  * Extracting tabular columns with `separate_wider_delim()` and `separate_wider_position()`.
* **Literary Text Analysis Case Study — *Harry Potter***:
  * Analyzing `philosophers_stone` with `str_length()`, `str_count()`, `str_locate()`, `str_starts()`, and `ggplot2`.

---

# Environment & Dataset Setup

Run this setup block first! It loads `tidyverse` and `nycflights13`, downloads the `harrypotter_all.rds` dataset from GitHub to create `philosophers_stone`, and initializes the Shakespeare *Sonnet 18* strings used throughout the slides:

```r
library(tidyverse)
library(nycflights13)
set.seed(2939394)

# Download and load the Harry Potter dataset directly from GitHub RDS
download.file(
  "https://raw.githubusercontent.com/jravi123/datasets/main/datasets/harrypotter_all.rds",
  "harrypotter_all.rds",
  mode = "wb"
)
hp_all <- readRDS("harrypotter_all.rds")
philosophers_stone <- hp_all$philosophers_stone

# Initialize Shakespeare Sonnet 18 lines
line1 <- "Nor shall death brag thou wander'st in his shade,"
line2 <- "When in eternal lines to time thou grow'st:"
line3 <- "So long as men can breathe or eyes can see,"
line4 <- "So long lives this, and this gives life to thee."

cat("Setup complete! Loaded", length(philosophers_stone), "chapters of Philosopher's Stone.\n")
```

---

# String Basics & Escaping Quotations

A **string** (or *character vector* in R) is character data enclosed in double (`"`) or single (`'`) quotes.

To include double quotation marks inside a double-quoted string, we must **escape** them with a backslash (`\`):

```r
mle <- "\"MLE\" stands for \"Maximum Likelihood Estimate\""
mle

# cat() prints the string directly instead of displaying escaped quotes
cat(mle)
```

### What's another way you could fix this?
Wrap the string in **single quotes (`'`)** so double quotes inside don't need escaping:
```r
# Another way of getting around this issue
'"MLE" stands for "Maximum Likelihood Estimate"'
```

---

# Other Special Characters (`\n`, `\t`, `\\`)

Since the backslash (`\`) is used to escape special characters, if you need a **literal backslash** inside your string, you must escape the backslash itself using **`\\`**.

* **Newline (`\n`)**: Starts a new line. Use `\\n` if you want the literal characters `\n` to appear as part of the output string.
* **Tab (`\t`)**: Inserts a horizontal tab stop.

```r
# \n creates an actual line break when rendered with cat()
cat('first line \n second line')
```

```r
# \\n escapes the backslash so literal \n is printed
cat('first line \\n not second line')
```

---

# Displaying Strings: `print()`, `cat()`, and `writeLines()`

Notice that R's default **`print()`** statement displays the raw escaped string representation rather than rendering newlines or tabs on the console:

```r
# print() shows the literal escape sequence \n and surrounding quotes
print('abc \n abc')
```

However, using **`cat()`** or **`writeLines()`** evaluates the escape sequences and renders the formatted text directly:

```r
# cat() renders the newline
cat('abc \nabc')
```

```r
# writeLines() renders the tab (\t) and prints a clean line
writeLines('abc \tabc')
```

---

# Character Encodings: ASCII and Unicode

* **ASCII**: Early computers could only read and write the 7-bit ASCII character set — essentially just English Roman letters (`A-Z`, `a-z`), digits (`0-9`), and basic punctuation.
* **Unicode**: Modern computers must represent alphabets, symbols, and scripts from all over the world. **Unicode** assigns a unique hexadecimal code point to every character across languages.
* You can print any Unicode character in R if you know its 4-digit hex code by prefacing it with **`\u`**.
  * For example, the copyright symbol (`©`) has Unicode `00A9` ([Wikipedia List of Unicode Characters](https://en.wikipedia.org/wiki/List_of_Unicode_characters)):

```r
# Print the copyright symbol (00A9) and Euro symbol (20AC)
print("\u00A9")
print("\u20AC")
```

---

# String Functions in R (`stringr`)

Through the **`stringr`** package (loaded automatically with `library(tidyverse)`), R provides a cohesive set of functions for combining, measuring, subsetting, and splitting strings.

> [!TIP] Consistent `str_*` Naming Convention
> Every function in `stringr` begins with **`str_`** and takes the character vector as its **first argument**, making it seamless to pipe (`|>`) inside `dplyr` workflows!

| Operation | Base R Function | `stringr` Equivalent |
| :--- | :--- | :--- |
| Concatenate strings | `paste()` / `paste0()` | `str_c()` |
| Collapse vector to 1 string | `paste(..., collapse = ...)` | `str_flatten()` |
| Count characters | `nchar()` | `str_length()` |
| Extract / replace substring | `substr()` / `substring()` | `str_sub()` |
| Split by pattern | `strsplit()` | `str_split()` |

---

# Combining Strings: Old School (`paste` and `paste0`)

If we need to build strings out of other strings, R provides two families of functions:
* **Old school (Base R)**: `paste()` (joins with a space `" "` by default) and `paste0()` (joins with `""`).
* **New school (`stringr`)**: `str_c()` (joins with `""` by default).

Let's see how `paste()` works on single strings and vectors:

```r
paste('a', 'b', 'c')

paste(
  "Section", c("200", "100", "200"),
  "meets on",
  c("Tuesday", "Monday", "Wednesday")
)
```

Notice how `paste()` automatically recycles the scalar strings `"Section"` and `"meets on"` across the 3-element vectors!

---

# Combining Strings: New School (`str_c` and `sep`)

Now let's run the same operations using **`str_c()`**:

```r
# By default, str_c() joins strings with no separator ("")
str_c('a', 'b', 'c')

str_c(
  "Section", c("100", "200", "100"),
  "meets on",
  c("Tuesday", "Monday", "Wednesday")
)
```

To separate the strings with a delimiter, pass the **`sep`** keyword argument:

```r
str_c('a', 'b', 'c', sep = ", ")

str_c(
  "Section", c("100", "200", "100"),
  "meets on",
  c("Tuesday", "Monday", "Wednesday"),
  sep = " "
)
```

---

# Why Prefer `str_c()`? Missing Value (`NA`) Propagation

There is an important analytical difference between base R's `paste()` and tidyverse's `str_c()` when encountering missing values (`NA`):

* **`paste()`** silently turns `NA` into the literal 2-letter string `"NA"`.
* **`str_c()`** propagates `NA` (returning `NA`), preventing missing records from masquerading as valid text!

```r
# Base R converts NA to literal text "NA"
paste("Score:", c(95, NA, 88))

# str_c propagates NA properly
str_c("Score:", c(95, NA, 88), sep = " ")
```

---

# Exercise 1: Joining Shakespeare's Sonnet 18 with `str_c()`

Join the four lines of Shakespeare's *Sonnet 18* below into a single multi-line string using newline characters (`sep = '\n'`) and **`str_c()`**, then display the result with `cat()`:

```r
line1 <- "Nor shall death brag thou wander'st in his shade,"
line2 <- "When in eternal lines to time thou grow'st:"
line3 <- "So long as men can breathe or eyes can see,"
line4 <- "So long lives this, and this gives life to thee."

# Join line1, line2, line3, line4 using str_c() with sep = '\n' and pass to cat():

```

```r block=answer
line1 <- "Nor shall death brag thou wander'st in his shade,"
line2 <- "When in eternal lines to time thou grow'st:"
line3 <- "So long as men can breathe or eyes can see,"
line4 <- "So long lives this, and this gives life to thee."
cat(str_c(line1, line2, line3, line4, sep = '\n'))
```

---

# Properties of Strings: `length()` vs. `str_length()`

Be careful not to confuse the length of a **vector** with the length of each **string**:

* **`length(x)`**: Tells you how many **elements (items)** are in a vector.
* **`str_length(x)`** (or `base::nchar(x)`): Tells you how many **characters** are in each string element.

```r
sonnet18_end <- c(line1, line2, line3, line4)

# Number of string elements in the vector:
length(sonnet18_end)

# Number of characters inside each of the 4 strings:
str_length(sonnet18_end) # base::nchar(sonnet18_end) also works
```

---

# Flattening Strings: `str_flatten()`

While `str_c()` joins multiple arguments element-by-element, **`str_flatten()`** takes a **single vector of strings** and collapses them into a single scalar string.

This is especially useful inside `dplyr::summarize()` after grouping:

```r
# Distinct (origin, carrier) combinations in nycflights13
distinct(flights, origin, carrier)

# Collapse all carriers flying out of each NYC airport into one comma-separated string
distinct(flights, origin, carrier) |>
  group_by(origin) |>
  summarize(carrier = str_flatten(carrier, ", "))
```

---

# Subsetting Strings: `str_sub()`

The **`str_sub(string, start, end)`** function retrieves **substrings** by character position (1-indexed, inclusive):

* Positive indices count forward from the start of the string (`1` = first character).
* **Negative indices** count backward from the end of the string (`-1` = last character, `-8` = 8th character from the end).
* Omitting `end` extracts everything from `start` through the end of the string.

```r
line1
str_sub(line1, 11, 20)

line2
str_sub(line2, 36)
str_sub(line2, -8)
```

---

# Mutating Substrings In-Place with `str_sub() <-`

You can also assign a replacement string to `str_sub()` to modify characters at specific positions in-place:

```r
line4

# Make a copy and replace characters 1 through 10 with "REMOVED"
line4b <- line4
str_sub(line4b, 1, 10) <- "REMOVED"
line4b
```

Notice that the replacement string (`"REMOVED"`, 7 characters) does not even have to be the same length as the slice being replaced (`1:10`, 10 characters)!

---

# Splitting Strings: The `str_split()` Function

The **`str_split()`** function breaks a single string (or vector of strings) into smaller pieces wherever it finds a delimiter pattern.

### Key Arguments
* **`string`**: The character vector you want to split.
* **`pattern`**: The delimiter character or regular expression pattern to split by.

Let's split the full text of Shakespeare's *Sonnet 18* into individual lines using `"\n"`:

```r
sonnet18 <- "Shall I compare thee to a summer's day?\nThou art more lovely and more temperate:\nRough winds do shake the darling buds of May,\nAnd summer's lease hath all too short a date;\nSometime too hot the eye of heaven shines,\nAnd often is his gold complexion dimm'd;\nAnd every fair from fair sometime declines,\nBy chance or nature's changing course untrimm'd;\nBut thy eternal summer shall not fade,\nNor lose possession of that fair thou ow'st;\nNor shall death brag thou wander'st in his shade,\nWhen in eternal lines to time thou grow'st:\n\tSo long as men can breathe or eyes can see,\n\tSo long lives this, and this gives life to thee."

sonnet18_lines <- str_split(sonnet18, "\n") # notice use of newline
sonnet18_lines
```

---

# Flattening Lists with `unlist()`

Why did `str_split(sonnet18, "\n")` return a **list** (`[[1]]`) instead of a character vector?
Because when `str_split()` is given a vector of strings, each input string might split into a different number of pieces!

To flatten a list into a plain atomic vector, use **`unlist()`**:

```r
x <- list('abc', 'xyz')

# Single bracket [1] returns a sub-list; double bracket [[1]] extracts the element
x[1]
x[[1]]

# unlist() flattens the entire list into a character vector
z <- unlist(x)
z[1]
```

---

# Exercise 2: Tokenizing *Sonnet 18* into Words

**Tokenization** is the process computer languages use to turn text strings into discrete words (or "tokens").
Use `str_split()` to split `sonnet18` by spaces (`" "`), flatten the result with `unlist()`, and determine: **how many words are there?**

```r
sonnet18 <- "Shall I compare thee to a summer's day?\nThou art more lovely and more temperate:\nRough winds do shake the darling buds of May,\nAnd summer's lease hath all too short a date;\nSometime too hot the eye of heaven shines,\nAnd often is his gold complexion dimm'd;\nAnd every fair from fair sometime declines,\nBy chance or nature's changing course untrimm'd;\nBut thy eternal summer shall not fade,\nNor lose possession of that fair thou ow'st;\nNor shall death brag thou wander'st in his shade,\nWhen in eternal lines to time thou grow'st:\n\tSo long as men can breathe or eyes can see,\n\tSo long lives this, and this gives life to thee."

# Split sonnet18 by " ", unlist(), and find the length():

```

```r block=answer
str_split(sonnet18, " ") |> unlist() |> length()
```

---

# Tidyverse `separate_*` Functions for Data Frames

When working with string columns inside a `tibble`, `tidyr` provides built-in functions to split a single character column into multiple rows or multiple columns (analogous to `pivot_longer` and `pivot_wider`):

* **`separate_longer_delim()`** & **`separate_longer_position()`**: Split a string column and place each piece into its own **row** (making the table longer).
* **`separate_wider_delim()`** & **`separate_wider_position()`**: Extract pieces of a string column into multiple **new columns** (making the table wider).

---

# Splitting Columns by Delimiter & Position (`separate_wider_*`)

* **`separate_wider_delim()`** splits a column using a delimiter character (`delim = "."`).
* **`separate_wider_position()`** splits a column using fixed character widths (`widths = c(...)`).

```r
# 1. Split by delimiter (".") into code, edition, and year columns
df <- tibble(x = c("a10.1.2022", "b10.2.2011", "e15.1.2015"))
df |> separate_wider_delim(
  x,
  delim = ".",
  names = c("code", "edition", "year")
)

# 2. Split by fixed character widths (1 char, 2 chars, 4 chars)
df_pos <- tibble(x = c("a102022", "b102011", "e152015"))
df_pos |> separate_wider_position(
  x,
  widths = c(code = 1, edition = 2, year = 4)
)
```

---

# Case Study: *Harry Potter and the Philosopher's Stone*

Let's practice literary text analysis on the full text of *Harry Potter and the Sorcerer's Stone* (titled *Philosopher's Stone* in the U.K.).

* **`philosophers_stone`** is a character vector/list containing **17 entries** — one full-text string for each chapter of the book!

```r
ch1 <- philosophers_stone[[1]]

# Number of chapters in the book
length(philosophers_stone)

# Preview the first 350 characters of Chapter 1
str_sub(ch1, 1, 350)
```

---

# Exercise 3: Finding the Longest Chapter

What is the longest chapter (in number of characters) in *Philosopher's Stone*?
*(Hint: Combine `str_length()` with `which.max()`!)*

```r
# Find which chapter index has the maximum character length:

```

```r block=answer
which.max(str_length(philosophers_stone))
```

---

# Counting Pattern Matches: `str_count()`

Use **`str_count(string, pattern)`** to count the number of times a `pattern` occurs within each string:

```r
# How many times does 'Harry' occur in Chapter 1?
str_count(ch1, "Harry")

# Compare mentions of Harry, Dursley, and Dumbledore in Chapter 1
c(
  Harry      = str_count(ch1, "Harry"),
  Dursley    = str_count(ch1, "Dursley"),
  Dumbledore = str_count(ch1, "Dumbledore")
)
```

---

# Finding Match Positions: `str_locate()` & `str_locate_all()`

* **`str_locate(string, pattern)`**: Returns the `start` and `end` character positions of the **first** match in each string.
* **`str_locate_all(string, pattern)`**: Returns a list of matrices containing the `start` and `end` positions of **every** match.

```r
# Locate the very first mention of 'Harry' in Chapter 1
str_locate(ch1, "Harry")

# Verify by extracting characters 5243 through 5247 with str_sub()
str_sub(ch1, 5243, 5247)
```

---

# Exercise 4: Last 100 Characters of Chapter 1

What are the last 100 characters of Chapter 1 (`ch1`)?
*(Hint: Use `str_sub()` with a negative start index!)*

```r
ch1 <- philosophers_stone[[1]]

# Extract the last 100 characters of ch1:

```

```r block=answer
# Using negative indexing to count 100 characters from the end:
ch1 |> str_sub(-100)
```

---

# Exercise 5: Extracting the Last Sentence of Chapter 1

What is the last sentence of Chapter 1?
* **Hint**: Use `str_split()` to split `ch1` on periods. Because a period (`.`) is a special wildcard character in regular expressions, you must escape it as **`"\\."`**! Then `unlist()` and use `tail(..., 1)`.

```r
ch1 <- philosophers_stone[[1]]

# Split ch1 by "\\.", unlist(), and extract the last element with tail(..., 1):

```

```r block=answer
ch1 <- philosophers_stone[[1]]
ch1 |> str_split("\\.") |> unlist() -> sentences
last_sentence_body <- tail(sentences, 1)
last_sentence_body
```

---

# Exercise 6: Checking Chapter Prefixes with `str_starts()`

Which chapter of *Philosopher's Stone* starts with the words **`THE POTIONS MASTER`**?
*(Hint: Use `str_starts(string, pattern)`!)*

```r
# Check which chapter starts with 'THE POTIONS MASTER':

```

```r block=answer
str_starts(philosophers_stone, "THE POTIONS MASTER")
```

---

# Converting the Chapter List to a `tibble`

We often find it useful to convert a character vector or list of texts into a **`tibble`** so we can apply `dplyr` and `ggplot2` pipelines directly.

Here is the previous `str_starts()` check written as a tidyverse pipeline:

```r
df <- tibble(philosophers_stone)

df |>
  mutate(
    chapter = row_number(),
    starts_with = str_starts(philosophers_stone, "THE POTIONS MASTER")
  ) |>
  select(chapter, starts_with) |>
  print()
```

Chapter 8 returns `TRUE`!

---

# Exercise 7: Plotting "Harry" Mentions Across Chapters

Create a bar chart (`geom_col()`) showing how many times the name `"Harry"` appears in each of the 17 chapters of *Philosopher's Stone*:

```r
# Build a tibble with chapter and text, mutate harry_mentions = str_count(text, "Harry"), and plot:

```

```r block=answer
tibble(
  chapter = 1:length(philosophers_stone),
  text = philosophers_stone
) |>
  mutate(harry_mentions = str_count(text, "Harry")) |>
  ggplot(aes(x = chapter, y = harry_mentions)) +
  geom_col(fill = "steelblue") +
  labs(
    title = "Frequency of 'Harry' in Each Chapter",
    x = "Chapter",
    y = "Number of Mentions"
  ) +
  theme_minimal()
```

---

# Summary & Key Takeaways

1. **Escapes & Console Output**: Use `\"` to escape quotes, `\n` for newlines, `\\` for literal backslashes, and `cat()` or `writeLines()` to render escaped formatting.
2. **Combining Strings**: Use `str_c(..., sep = "")` for element-wise concatenation (which safely propagates `NA`s) and `str_flatten()` to collapse an entire vector into one string.
3. **Lengths & Substrings**: `length()` counts vector items while `str_length()` counts characters; `str_sub(x, start, end)` extracts or modifies substrings using positive or negative indices.
4. **Splitting & Separating**: `str_split()` splits strings into a list (flatten with `unlist()`), while `separate_wider_delim()` and `separate_wider_position()` split data frame columns into new variables.
5. **Pattern Counting & Locating**: `str_count()`, `str_locate()`, and `str_starts()` enable quantitative text analysis across large document collections like `philosophers_stone`.
