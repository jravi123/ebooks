# Text Wrangling & Strings

## Why Master Text Wrangling in Data Analytics?

In the business world, structured numeric tables represent only a fraction of the available data. The vast majority of valuable information lives in unstructured text:
* **Customer Support Logs**: `"The transaction was REFUNDED yesterday because the user complained about a system crash."`
* **Product SKUs**: `"PROD_9982_USA_2022"`
* **Customer Reviews**: `"Love the app, but it freezes on startup!"`

If you do not know how to parse, extract, and clean these text fields, you cannot run sentiment analyses, verify product lineages, or extract transaction statuses.

In R, text is stored inside **Character Strings**. In this chapter, we will master the mechanics of string manipulation, from quote escapes and special formatting to the tidyverse **`stringr`** package, and apply our skills to an extensive literary data analysis case study of *Harry Potter*.

---

## Part 1: String Basics, Special Characters, & Unicode

A character string represents text wrapped in double quotes (`"`) or single quotes (`'`). Double quotes are preferred by R developers.

### Escaping Internal Quotes
If your text contains quote characters inside it, you must **escape** them using a backslash (`\`) so R doesn't interpret them as the end of the string:

```r
# Using escapes
mle_definition <- "\"MLE\" stands for \"Maximum Likelihood Estimate\""

# Alternative: wrapping double quotes inside single quotes to avoid escapes
mle_definition_alt <- '"MLE" stands for "Maximum Likelihood Estimate"'
```

---

### Special Characters & Escaping Backslashes
Because R uses the backslash (`\`) to escape characters, if you want a literal backslash inside your string, you must write a double backslash (`\\`):

* **Newline (`\n`)**: Forces text to a new line.
* **Tab (`\t`)**: Adds horizontal spacing.
* **Literal Backslash (`\\`)**: Prints a single backslash.

```r
# String containing newline formatting
raw_text <- "First Line \n Second Line"
```

---

### Printing Raw Formatting on the Console
R provides three functions for displaying text, but they handle special characters differently:
1. **`print()`**: Displays the string as R sees it, keeping quote marks and escaped backslashes (`\n`).
2. **`cat()`**: Evaluates and prints raw, unescaped formatting to the console (recommended for displaying newlines and tabs).
3. **`writeLines()`**: R's standard wrapper to print clean text lines on the console.

```r
text_with_newline <- "abc \n xyz"

# 1. print keeps the escapes
print(text_with_newline)
# Output: [1] "abc \n xyz"

# 2. cat renders the newlines and strips quotes
cat(text_with_newline)
# Output:
# abc
#  xyz

# 3. writeLines prints clean lines
writeLines("abc \t xyz")
# Output: abc     xyz
```

---

### Accessing the Global Character Set: Unicode
Historically, early systems could only understand ASCII characters (basic English letters, numbers, and punctuation). Modern data science requires **Unicode**, which can represent characters from any language.

To print any Unicode character, look up its hexadecimal ID and preface it with `\u`:

```r
# Print the copyright symbol (Unicode: 00A9)
print("\u00A9")
# Output: "©"

# Print the Euro currency symbol (Unicode: 20AC)
print("\u20AC")
# Output: "€"
```

---

## Part 2: String Concatenation and Length Pitfalls

When joining strings and measuring text, there are several common pitfalls to avoid.

### The Concatenation Trap
> [!CAUTION] The Plus Operator Trap
> In Python, you can join strings using the `+` operator (`"a" + "b"`). 
> In R, using `+` on text will throw an error! 
> Instead, we use R's built-in **`paste()`** functions or the tidyverse equivalent **`str_c()`**:

* **`paste(..., sep = " ")`**: Joins strings together, separating them with a single space by default.
* **`paste0(...)`**: Joins strings with **no** separator (equivalent to `paste(..., sep = "")`).
* **`str_c(..., sep = "")`**: The tidyverse equivalent of `paste0()`, but handles missing values differently.

```r
first <- "Alice"
last  <- "Smith"

# Joining with a space
paste(first, last) # "Alice Smith"

# Joining with no separator
paste0("ID_", 105) # "ID_105"
```

---

### Propagation of Missing Values (`NA`)
It is critical to understand how base R and the Tidyverse handle missing values during concatenation:
* `paste()` converts `NA` to a literal character string, returning `"Hello NA"`.
* `str_c()` propagates `NA`, returning `NA` (since the concatenation of a known string with a missing value is mathematically unknown).

```r
library(tidyverse)
library(stringr)

# Base R converts NA to text
paste("Hello", NA) # "Hello NA"

# Tidyverse propagates NA
str_c("Hello", NA) # NA
```

---

### String Length vs. Vector Length
To find the number of characters in a string, do **not** use `length()`.
* **`length()`**: Measures the number of elements in the vector (a single string is a vector of length 1).
* **`nchar()`** or **`str_length()`**: Measures the actual number of characters in the string.

```r
feedback <- "Great app!"

length(feedback)   # 1 (Because feedback is a vector containing one element)
str_length(feedback) # 10 (Because "Great app!" contains 10 characters)
```

---

## Part 3: Advanced String Wrangling with `stringr`

Let's master the advanced text processing functions in **`stringr`** (all starting with the `str_` prefix).

### A. Flattening Character Vectors: `str_flatten()`
To combine a vector of multiple strings into a single string, use **`str_flatten()`**:

```r
words <- c("R", "is", "awesome")

# Collapse vector into a single string
str_flatten(words, collapse = " ")
# Output: "R is awesome"
```

In data analytics, `str_flatten()` is incredibly useful when summarizing records during grouping:

```r
# List all unique airlines flying out of each airport
distinct(flights, origin, carrier) |>
  group_by(origin) |>
  summarize(carriers = str_flatten(carrier, collapse = ", "))
```

---

### B. Substring Extraction & Replacement: `str_sub()`
Use **`str_sub(string, start, end)`** to extract or replace a portion of text:

```r
text <- "Nor shall death brag thou wander'st in his shade,"

# Extract characters from index 11 to 20
str_sub(text, 11, 20) # "death brag"
```

Unlike base R's `substring()`, `str_sub()` supports **negative indexes** to count characters backwards from the end of the string:

```r
# Extract the last 5 characters
str_sub(text, -5) # "hade,"
```

You can also use `str_sub()` to replace portions of a string directly:

```r
text_copy <- text

# Replace the first 3 characters
str_sub(text_copy, 1, 3) <- "REPLACED"
print(text_copy) # "REPLACED shall death brag..."
```

---

### C. Splitting Strings: `str_split()` & `unlist()`
Use **`str_split(string, pattern)`** to split a string into smaller strings based on a separator (such as a comma or space). 

Because a string could potentially be split into a variable number of outputs, `str_split()` always returns a **list**. To convert this list back into a simple character vector, use **`unlist()`**:

```r
phrase <- "apple,banana,orange"

# Split by comma
split_list <- str_split(phrase, ",")
print(split_list)
# Returns: [[1]] "apple" "banana" "orange" (A list containing a vector)

# Convert list to a vector
split_vector <- unlist(split_list)
print(split_vector)
# Returns: "apple" "banana" "orange"
```

---

### D. Rectangular String Parsing: `separate_wider_*`
When text columns inside a tibble contain multiple pieces of information (e.g., serial codes containing IDs and years), we can split them into separate columns using tidyverse's `separate_wider` functions:

* **`separate_wider_delim(col, delim, names)`**: Splits a column into multiple columns based on a delimiter character.
* **`separate_wider_position(col, widths)`**: Splits a column into multiple columns based on fixed character widths.

```r
# Sample tibble with delimited codes
df_delim <- tibble(x = c("a10.1.2022", "b10.2.2011", "e15.1.2015"))

# Split by dot
df_delim |> 
  separate_wider_delim(
    x,
    delim = ".",
    names = c("code", "edition", "year")
  )

# Sample tibble with fixed-width codes
df_position <- tibble(x = c("a102022", "b102011", "e152015"))

# Split by exact character widths
df_position |> 
  separate_wider_position(
    x,
    widths = c(code = 1, edition = 2, year = 4)
  )
```

---

## Part 4: Literary Data Analysis: *Harry Potter* Case Study

Let's apply our string-wrangling skills to analyze the text of *Harry Potter and the Sorcerer's Stone*.

The dataset **`philosophers_stone`** is a list of 17 long character strings, with each string representing the full text of one chapter.

```r
# Download and load the dataset directly from GitHub RDS
download.file("https://raw.githubusercontent.com/jravi123/datasets/main/datasets/harrypotter_all.rds", "harrypotter_all.rds", mode = "wb")
hp_all <- readRDS("harrypotter_all.rds")
philosophers_stone <- hp_all$philosophers_stone

# Extract chapter 1 text
ch1 <- philosophers_stone[[1]]

# Total number of chapters
length(philosophers_stone) # 17
```

---

### A. Finding the Longest Chapter
We can find which chapter contains the most characters by calculating the string length of each chapter and identifying the maximum value using **`which.max()`**:

```r
# Calculate character lengths for all chapters
chapter_lengths <- str_length(philosophers_stone)

# Find the index of the longest chapter
longest_chapter_index <- which.max(chapter_lengths)
print(longest_chapter_index) # Chapter 17 is the longest
```

---

### B. Counting Word Tokens
To count the total number of words in a chapter, we can split the text on space characters (`" "`), convert the resulting list into a vector using `unlist()`, and measure its length:

```r
# Split chapter 1 by spaces to isolate individual words
word_tokens <- str_split(ch1, " ") |> unlist()

# Total word count of chapter 1
length(word_tokens)
```

---

### C. Pattern Frequency Analysis: `str_count()`
To count how many times a specific word appears in a chapter, use **`str_count()`**:

```r
# Count the number of times "Harry" appears in Chapter 1
str_count(ch1, "Harry") # 121
```

---

### D. Finding Pattern Positions: `str_locate()`
To find the exact character indexes where a word first appears, use **`str_locate()`**:

```r
# Find the start and end positions of the first occurrence of "Harry"
str_locate(ch1, "Harry")
# Returns: start 5243, end 5247

# Verify the result by extracting that substring
str_sub(ch1, 5243, 5247) # "Harry"
```

To find the positions of all occurrences of a word in a chapter, use `str_locate_all()`, which returns a list containing matrices of positions.

---

### E. Chapter End Substrings
To view the last 100 characters of a chapter, we can use negative indexing inside `str_sub()`:

```r
# Extract the last 100 characters of Chapter 1
str_sub(ch1, -100)
```

---

### F. Extracting Sentences with Regular Expressions
We can split text into sentences by looking for period characters (`.`). However, because a period is a special character in regular expressions, we must escape it with a double backslash (`\\.`) to treat it as a literal period:

```r
# Split Chapter 1 into individual sentences
sentences <- str_split(ch1, "\\.") |> unlist()

# Extract the last sentence of Chapter 1
last_sentence <- tail(sentences, 1)
print(last_sentence)
```

---

### G. Checking Prefixes: `str_starts()`
To check if a chapter starts with a specific sequence of characters, use **`str_starts()`**:

```r
# Identify which chapters start with "THE POTIONS MASTER"
str_starts(philosophers_stone, "THE POTIONS MASTER")
# Returns a logical vector of length 17 (TRUE for Chapter 8)
```

---

### H. Visualizing Word Mentions Across Chapters
We can convert our unstructured text list into a structured tibble and plot word frequencies across chapters using `ggplot`:

```r
# Create a tibble of chapters
hp_tibble <- tibble(
  chapter = 1:length(philosophers_stone),
  text    = philosophers_stone
)

# Calculate mentions and plot
hp_tibble |>
  mutate(harry_mentions = str_count(text, "Harry")) |>
  ggplot(aes(x = chapter, y = harry_mentions)) +
  geom_col(fill = "steelblue") +
  labs(
    title = "Mentions of 'Harry' Across Chapters",
    x = "Chapter",
    y = "Number of Mentions"
  )
```

---

## Hands-on Exercises

### Exercise 1: Format Warnings Programmatically
**How can we standardize customer username strings and join them with security alerts to automatically build security log entries?**

*Analytical Guidance*:
Format and concatenate warning messages. Your analysis should:
1. Store a target customer username: `username <- "alice_dev"`.
2. Convert the username string to uppercase.
3. Concatenate the uppercase username with the message string `" is not authorized to access database "` and the category integer `5` using **`paste0()`**.
4. Print the final message, and verify that the final string contains exactly 45 characters using **`nchar()`**.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Define username
username <- "alice_dev"

# Convert to uppercase
upper_user <- toupper(username)

# Concatenate warning log message
warning_log <- paste0(upper_user, " is not authorized to access database ", 5)
print(warning_log)
# "ALICE_DEV is not authorized to access database 5"

# Audit final character length
print(nchar(warning_log)) # 45
```
</details>

---

### Exercise 2: Splitting Irregular Server Codes
**How can we split irregular, delimited server inventory strings in our database into structured columns for code type, edition, and year?**

*Analytical Guidance*:
Parse a tibble of delimited codes. Your analysis should:
1. Create a tibble with a column of delimited server string codes:
   `df <- tibble(x = c("a10.1.2022", "b10.2.2011", "e15.1.2015"))`.
2. Use **`separate_wider_delim()`** to split the column `x` into three separate columns: `"code"`, `"edition"`, and `"year"`, using the dot (`"."`) as your delimiter.
3. Print the resulting tibble to verify that the string columns were split correctly.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Raw inventory codes
df <- tibble(x = c("a10.1.2022", "b10.2.2011", "e15.1.2015"))

# Split into distinct fields using wider delimiter
df_clean <- df |> 
  separate_wider_delim(
    x,
    delim = ".",
    names = c("code", "edition", "year")
  )

print(df_clean)
# Expected columns: code, edition, year
```
</details>
