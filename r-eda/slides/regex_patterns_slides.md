# Regular Expressions (Regex)
## Pattern Matching, Character Classes, Quantifiers, and Capture Groups in R

```r block=setup
library(tidyverse)
set.seed(2939394)

download.file(
  "https://raw.githubusercontent.com/jravi123/datasets/main/datasets/harrypotter_all.rds",
  "harrypotter_all.rds",
  mode = "wb"
)
hp_all <- readRDS("harrypotter_all.rds")
philosophers_stone <- hp_all$philosophers_stone
ch1 <- philosophers_stone[[1]]
```

---
# Today's Lecture & Why Learn Regex?

Imagine cleaning a public registry of telephone numbers submitted through a web form:
* `"123-456-7890"` (hyphens)
* `"1234567890"` (raw digits)
* `"(123) 456-7890"` (parentheses and spaces)
* `"Call 123-456-7890"` (text mixed with digits)

**Regular expressions (regex / regexps)** are a concise pattern-matching language that allows you to describe, locate, extract, and clean unstructured text data.

> *"Some people, when confronted with a problem, think 'I know, I'll use regular expressions.' Now they have two problems."* — Jamie Zawinski

Today's goals (corresponding to Chapter 16):
* Understand basic regular expressions and raw strings (`r"(...)"`).
* Use regular expressions to extract, count, group, and replace data from text.
* A great interactive tool for testing regexps is [regex101.com](https://regex101.com/).

---
# The Escape Problem in Standard Strings

Sometimes, adding escape sequences (`\`) to escape a series of special characters becomes very confusing. Let's look at an example:

```r
tricky <- "double_quote <- \"\\\"\" # or '\"' single_quote <- '\\\'' # or \"'\""

cat(tricky)
```

Because R uses `\` to escape quotes and special characters inside standard strings, writing backslashes requires **double-escaping** (`\\`), which quickly becomes hard to read!

---
# Raw String Literals (`r"(...)"`)

Instead of piling up backslashes, R 4.0+ lets us construct **raw strings** using `r"(...)"`:

```r
simple <- r"(double_quote <- "\"" # or '"' single_quote <- '\'' # or "'")"

cat(simple)
```

Using `r"(...)"` tells R: *"Take the text inside these delimiters exactly as you see it. Do not interpret any character as special."*

---
# Simple Regular Expressions

The most basic regular expression is a plain string. It matches if the target string contains it as a substring.

We use `str_view()` to visually inspect how regular expressions match inside strings:

```r
x <- c("apple", "banana", "pear") |> print()

str_view(x, pattern = "an")
```

Here, `str_view()` has matched our regexp (`"an"`) twice inside the second string, `"banana"`, of the vector `x`.

---
# Exploring the `fruit` Vector with `str_view()`

Let's look at the built-in `fruit` vector from `stringr` and find all fruits that have `"berry"` in their name:

```r
fruit |> print()

# Find all fruits containing 'berry'
str_view(fruit, "berry")
```

---
# Using Wildcards: The Dot (`.`)

Our first non-trivial regular expression uses a wildcard: **`.`** (period).

Used inside a regular expression, the period matches **any single character** (except a newline):

```r
str_view("else every eele etcetera", "e..e ")
```

Notice how `"e..e "` matches `"else "`, `"eele "` — an `"e"`, followed by any two characters, followed by `"e"` and a space!

---
# Extracting Matches: `str_extract()` vs. `str_extract_all()`

If we want to **extract** the first match as a string instead of viewing it, we use `str_extract()`:

```r
# Extract the first match
str_extract("else every eele etcetera", "e..e ")
```

What if we want **all** the matches? Use `str_extract_all()`:

```r
# Extract all matches
str_extract_all("else every eele etcetera", "e..e")
```

---
# Exercise: Wildcard Matching in Harry Potter

What is the **first string** in Chapter 1 of *Philosopher's Stone* (`ch1`) that matches a pattern starting with `'H'`, followed by any three characters, and ending with `'y'`?

```r
# Extract the first match of 'H', any 3 characters, and 'y' from ch1
ch1 |> str_sub(1, 200)

```

```r block=answer
str_extract(ch1, "H...y")
```

---
# Base R Regex Functions

In addition to `stringr`, you will frequently encounter Base R's built-in regex functions in existing codebases:

* **`grepl(pattern, x)`**: Returns a logical vector (`TRUE` / `FALSE`) indicating if a match was found.
* **`grep(pattern, x)`**: Returns the numeric indices of matching elements.
* **`sub(pattern, replacement, x)`**: Replaces the **first** match in each string.
* **`gsub(pattern, replacement, x)`**: Replaces **all** matches in each string (Global SUBstitution).

```r
raw_text <- "cat_orange_cat_dog"

# Logical check and index lookup
grepl("cat", raw_text)

# Replace first vs. replace all
sub("cat", "CAT", raw_text)
gsub("cat", "CAT", raw_text)
```

---
# Built-in Character Classes

Instead of matching anything using `.`, we often want to match a specific **class of characters**: letters, numbers, spaces, etc.

There are four built-in character classes you should know:

| Character Class | Matches | Standard String | Raw String | Equivalent Set |
| :--- | :--- | :--- | :--- | :--- |
| **`\w`** | Any alphanumeric word character | `"\\w"` | `r"(\w)"` | `[A-Za-z0-9_]` |
| **`\s`** | Single space, tab, or newline | `"\\s"` | `r"(\s)"` | `[\t\n\r\f\v ]` |
| **`\d`** | Any digit | `"\\d"` | `r"(\d)"` | `[0-9]` |
| **`\b`** | Word boundary (edge of a word) | `"\\b"` | `r"(\b)"` | *Boundary position* |

---
# Word Characters (`\w`) & Escaping

`\w` matches any word character (letter, digit, or underscore):

```r
str_view("this is a word", "\\w")
```

Note the additional level of escaping (`"\\w"`) needed in a standard R string so that the regex engine receives `\w`.

---
# Missing Backslash vs. Raw Representation

What happens if you forget the second backslash and write `"\w"` in a standard string?
* R throws an error: `Error: '\w' is an unrecognized escape in character string starting ""\w"`!

Instead, using **raw representation** `r"(\w)"` avoids double-escaping completely:

```r
# Clean raw string representation
str_view("this is a word", r"(\w)")
```

---
# Matching Digits (`\d`)

`\d` matches any single digit (`0` through `9`):

```r
str_view(c("number1", "two", "3hree"), "\\d")

# Or using a raw string:
str_view(c("number1", "two", "3hree"), r"(\d)")
```

---
# Matching Whitespace (`\s`)

`\s` matches any single whitespace character (spaces, tabs `\t`, and newlines `\n`):

```r
y <- c("spa ce", "hello\tworld", "multi\nline")
writeLines(y)

str_view(y, "\\s")
```

---
# Custom Character Classes Using `[]`

You can create your own character class using square brackets: `[abc]` will match `a`, `b`, or `c`.

By default, the "width" of a character class is **one single character**:

```r
# Match either 'b' or 'e' followed by 'a'
str_view(fruit, "[be]a")
```

---
# Matching Capital Letters & Character Ranges

We can use a character class to match the capital letters in a vector of strings:

```r
str_view(
  c("These", "are", "some Capitalized words"),
  "[ABCDEFGHIJKLMNOPQRSTUVWXYZ]"
)
```

We don't need to type out every letter! We can use character range shortcuts like `[A-Z]` or `[a-e]`:

```r
str_view(c("These", "are", "some Capitalized words"), "[A-Z]")
str_view(c("These", "are", "some Capitalized words"), "[a-e]")
```

---
# Word Boundaries (`\b`)

A character class we use frequently is `\b`, which stands for **word boundary**. A word boundary matches the "edges" (start or end) of a word:

```r
str_view(c("Rafael Nadal", "Roger Federer", "Novak Djokovic"), "\\b")

# Match "cat" only as a complete standalone word
str_view(c("cat", "catalog", "bobcat"), r"(\bcat\b)")
```

Every word has a word boundary on either side, so we can combine `\b` with other character classes to match specific kinds of words in text.

---
# Exercise: Words Starting with `'H'` in Chapter 1

About how many words start with an uppercase `'H'` (and have at least one more word character) in Chapter 1 (`ch1`)?

Explore using `str_count()` with the pattern:
`<word boundary><character H><any other word character>`

```r
# Count matches of \bH\w in ch1

```

```r block=answer
ch1 |> str_count("\\bH\\w")
```

---
# Quantifiers: Specifying Repetition

How many total words are there in Chapter 1? We can use `\\w+` to match one or more word characters appearing together:

```r
str_count(ch1, "\\w+")
```

The six quantifiers you should know are:
* **`?`**: matches **zero or one** of the preceding characters.
* **`+`**: matches **one or more** of the preceding characters.
* **`*`**: matches **zero or more** of the preceding characters.
* **`{x}`**: matches **exactly `x`** of the preceding characters.
* **`{x,y}`**: matches **between `x` and `y`** of the preceding characters.
* **`{x,}`**: matches **at least `x`** of the preceding characters.

---
# Using Quantifier Ranges `{x,y}`

Let's extract all words in Chapter 1 that are between **10 and 22 characters long**:

```r
# Get all words that are between 10 and 22 characters long
str_extract_all(ch1, "\\w{10,22}\\b")
```

---
# Exercise: Counting Specific Word Lengths

How many words in Chapter 1 (`ch1`) match the pattern:
`<word boundary><lowercase 'h'><exactly 5 word characters><word boundary>`?

```r
# Count 6-letter words starting with lowercase 'h' in ch1

```

```r block=answer
str_count(ch1, "\\bh\\w{5}\\b")
```

---
# Negations (`[^...]`)

Earlier, we looked at quotations in *Philosopher's Stone*. The first quotation in Chapter 1 is:

```r
str_sub(ch1, 2150, 2163)
```

How can we find quotations? The pattern for a quote is:
`<quotation mark><anything that is not a quotation mark><quotation mark>`

A **negation** is a character class that begins with `^` inside square brackets `[^...]`. It matches anything that is **not** inside the character class:

```r
# Match sequences of characters that are NOT lowercase vowels
str_view("match doesn't match", "[^aeiou]+")
```

---
# Matching Quotations with Negation Classes

To match quotations, we combine opening and closing quotes `"` with `[^"]+` (one or more characters that are not a quotation mark):

```r
str_view(
  '"Here is a quotation", said the professor. "And here is another."',
  '"[^"]+"'
)
```

---
# Exercise: Finding Character Names in Chapter 1

Find all capitalized words (like character names) in Chapter 1 (`ch1`) that appear in the middle of a sentence and are at least 6 letters long.

Use `str_extract_all()` and `table()` with the pattern:
`<one or more spaces><capital letter><at least five lowercase letters><not ending in a period>`

```r
# Extract and tabulate matching names in ch1

```

```r block=answer
str_extract_all(ch1, "\\s+[A-Z][a-z]{5,}[^.]") |> table()
```

---
# Grouping with Parentheses `(...)`

"Professor" is one of the most common capitalized words in this book. Is there a character named Professor, or is it a title followed by a name?

Let's match **one or more capitalized words in a row** by creating a **group** with parentheses `(...)` and applying a quantifier to the whole group:

```r
str_view("this will be grouped", "([a-z]+ ?)+")
```

The parentheses group `[a-z]+ ?` together so that the `+` quantifier repeats the entire word-plus-optional-space pattern!

---
# Matching Multi-Word Capitalized Phrases

Now let's take our previous capitalized word pattern and group it:
`(<capital letter><at least five lowercase letters><optional space>){match 1+ times}`

```r
str_extract_all(ch1, "([A-Z][a-z]{5,} ?)+") |> table()
```

Notice how multi-word phrases like `"Professor McGonagall "` and `"Uncle Vernon "` now appear together!

---
# Inspecting `"Bonfire Night"` in Chapter 1

In the output on the previous slide, `"Bonfire "` matched, even though the book says `"Bonfire Night"`:

```r
str_locate(ch1, "Bonfire")

str_sub(ch1, 8957, 8957 + 20)
```

Why wasn't `"Night"` included in the match?
* Our pattern `[A-Z][a-z]{5,}` requires **at least five lowercase letters** after the capital letter.
* `"Night"` only has four lowercase letters (`"ight"`), so it didn't match `[A-Z][a-z]{5,}`!

---
# Backreferences (`\1`, `\2`)

Parentheses also define **capture groups** that can be referred to later in the same match as `\1`, `\2`, etc. This is called a **backreference**.

For example:
* `(.)\1` matches any character repeated twice in a row.
* `(.)x\1` matches any character, followed by `x`, followed by that exact same first character:

```r
"eyxyel" |> str_view("(.)x\\1")

# Detecting double letters using a raw string backreference
str_view(c("apple", "banana", "berry"), r"((.)\1)")
```

---
# Position Anchors: `^` and `$`

Sometimes we want a match to occur only at a specific position in the string:
* **`^`**: Matches the **start** of the string.
* **`$`**: Matches the **end** of the string.

```r
x <- c("apple", "banana", "pear")

# Match strings starting with 'b'
str_view(x, "^b")

# Match strings ending with 'r'
str_view(x, "r$")
```

*(Note: `^` at the start of a pattern is a start-of-string anchor, whereas `[^...]` inside square brackets is a negation class!)*

---
# Extracting Group Matrices with `str_match()`

`str_match(v, re)` creates a character matrix out of the grouped matches in `re`:
* Column 1 contains the **whole match**.
* Additional columns contain each **capture group** `(...)`.

```r
# Match first character and last character of built-in words
head(str_match(words, "(.).*(.)"))

# Parsing structured log entries with capture groups
log_entry <- "USER_125: Login Successful"
str_match(log_entry, r"(USER_(\d+): (.*))")
```

---
# Replacing Patterns with `str_replace()`

`str_replace(v, re, rep)` replaces the first match of `re` in `v` with `rep` (use `str_replace_all()` to replace all matches):

```r
# Basic find and replace
str_replace("Give me liberty or give me death", "death", "pizza")

# Using backreferences (\1, \2) to swap "Last, First" into "First Last"
names <- c("Lovelace, Ada", "Turing, Alan", "Hopper, Grace")
str_replace(names, r"(^(\w+),\s*(\w+)$)", r"(\2 \1)")
```

---
# Exercise: Filtering IDs & Sanitizing Prices

1. Given `customers <- c("TX_1001", "ERROR_992", "TX_1002", "MISSING_88")`, use `grepl()` with an anchor to filter only valid IDs starting with `"TX_"`.
2. Given `prices <- c("$1,200", "$25", "$450.50")`, use `gsub()` to remove `$` and `,` and convert the result to numeric with `as.numeric()`.

```r
customers <- c("TX_1001", "ERROR_992", "TX_1002", "MISSING_88")
prices <- c("$1,200", "$25", "$450.50")

# Write your solution below:

```

```r block=answer
customers <- c("TX_1001", "ERROR_992", "TX_1002", "MISSING_88")
prices <- c("$1,200", "$25", "$450.50")

valid_ids <- customers[grepl("^TX_", customers)]
print(valid_ids)

numeric_prices <- as.numeric(gsub("\\$|,", "", prices))
print(numeric_prices)
```

---
# Lecture Summary & Key Takeaways

* **Raw Strings (`r"(...)"`)**: Avoid double-backslash headaches by writing regex patterns inside raw string literals.
* **Wildcards & Character Classes**: `.` matches any character; `\w` (word), `\d` (digit), `\s` (whitespace), `\b` (word boundary), and `[...]` / `[^...]` match specific character sets.
* **Quantifiers**: Control repetition with `?` (0 or 1), `+` (1+), `*` (0+), and `{x,y}`.
* **Grouping & Backreferences**: Use `(...)` to apply quantifiers to sub-patterns, refer back with `\1`, or extract components into a matrix with `str_match()`.
* **Anchors & Replacements**: Lock matches to string boundaries with `^` and `$`, and transform text with `str_replace()` / `gsub()`.
