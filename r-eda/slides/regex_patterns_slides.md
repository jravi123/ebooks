# Regular Expressions (Regex)
## Pattern Matching, Character Classes, Quantifiers, and Capture Groups with stringr

---
# Lecture Agenda & Topics

Regular Expressions (Regex) provide a concise, flexible language for describing text patterns. When rigid substring searches fail, regex allows you to extract phone numbers, emails, timestamps, and unstructured tokens.

Today we will cover:
* **The Regex Engine**: How patterns match character streams.
* **Raw Strings in R (`r"(...)"`)**: Avoiding double-backslash escape issues.
* **Wildcards & Character Classes**: Using `.`, `\d`, `\w`, `\s`, and custom `[...]` sets.
* **Position Anchors**: Matching line starts `^` and line ends `$`.
* **Quantifiers**: Matching repetition with `?`, `*`, `+`, and `{n,m}`.
* **Matching vs. Extracting**: `str_detect()`, `str_extract()`, and `str_extract_all()`.
* **Capture Groups & Substitutions**: Parentheses `(...)`, backreferences, and `str_replace()`.

---
# The Escape Problem & Raw String Literals

In standard R strings, `\` is an escape character. To pass a literal regex token like `\d` (digit), you traditionally had to write `"\\d"`.

In modern R (version 4.0+), use **Raw String Literals `r"(...)"`** to pass regex patterns cleanly:

```r
library(tidyverse)
library(stringr)

# Traditional string: double backslashes required
legacy_regex <- "\\d{3}-\\d{3}-\\d{4}"

# Modern raw string: written exactly as regex syntax
clean_regex <- r"(\d{3}-\d{3}-\d{4})"

print(clean_regex)
```

---
# Basic Matching: `str_detect()` & `str_view()`

* **`str_detect(string, pattern)`**: Returns `TRUE` if the pattern is found.
* **`str_view(string, pattern)`**: Visually highlights matching portions of strings.

```r
library(tidyverse)
library(stringr)

fruits <- c("apple", "banana", "pear", "pineapple", "blackberry")

# Find fruits containing "berry"
fruits |> str_detect("berry")

# Visually highlight "an" matches
fruits |> str_view("an")
```

---
# Wildcard Matching with `.`

The period **`.`** is a wildcard that matches **any single character** (except a newline):

```r
library(tidyverse)
library(stringr)

words <- c("cat", "cot", "cut", "chat", "coat")

# Match 'c', any single character, then 't'
str_subset(words, "^c.t$") # Matches: "cat", "cot", "cut"
```

---
# Character Classes & Inverted Classes

Use square brackets **`[...]`** to match any single character from a set:

* `[aeiou]`: Any single vowel.
* `[0-9]`: Any single digit (same as `\d`).
* `[a-z]`: Any lowercase letter.
* `[^0-9]`: Any character that is **NOT** a digit (inverted class).

```r
library(tidyverse)
library(stringr)

codes <- c("Item1", "ItemA", "Item9", "ItemZ")

# Match items ending in a number
str_subset(codes, r"(Item\d)")

# Match items ending in a letter
str_subset(codes, r"(Item[A-Z])")
```

---
# Quantifiers: Specifying Repetition

Quantifiers determine how many times the preceding character or group can occur:

* **`?`**: 0 or 1 time (optional).
* **`+`**: 1 or more times.
* **`*`**: 0 or more times.
* **`{n}`**: Exactly $n$ times.
* **`{min,max}`**: Between $min$ and $max$ times.

```r
library(tidyverse)
library(stringr)

phone_numbers <- c("Call 123-456-7890", "Office: 555-0199", "Direct: 734-555-1212")

# Extract full 10-digit phone numbers
str_extract(phone_numbers, r"(\d{3}-\d{3}-\d{4})")
```

---
# Position Anchors: `^` and `$`

Anchors lock pattern matching to specific positions in the string:

* **`^`**: Matches the beginning of the string.
* **`$`**: Matches the end of the string.

```r
library(tidyverse)
library(stringr)

words <- c("apple", "pineapple", "application", "crabapple")

# Matches starting with "app"
str_subset(words, "^app") # "apple", "application"

# Matches ending with "apple"
str_subset(words, "apple$") # "apple", "pineapple", "crabapple"

# Exact match for the full string "apple"
str_subset(words, "^apple$") # "apple"
```

---
# Extracting Data: `str_extract()` vs. `str_extract_all()`

* **`str_extract()`**: Extracts the **first** match in each string.
* **`str_extract_all()`**: Extracts **all** matches in each string (returns a list).

```r
library(tidyverse)
library(stringr)

text <- "The prices are $12.50, $45.00, and $9.99."

# Extract first price
str_extract(text, r"(\$\d+\.\d{2})")

# Extract all prices
str_extract_all(text, r"(\$\d+\.\d{2})")[[1]]
```

---
# Capture Groups & Backreferences: `str_replace()`

Enclosing parts of a pattern in parentheses **`(...)`** creates capture groups that can be referenced as `\1`, `\2`:

```r
library(tidyverse)
library(stringr)

names <- c("Lovelace, Ada", "Turing, Alan", "Hopper, Grace")

# Reorder "Last, First" into "First Last"
str_replace(names, r"(^(\w+),\s*(\w+)$)", r"(\2 \1)")
```

`\1` captures the last name and `\2` captures the first name.

---
# Module Summary & Key Takeaways

1. **Raw Strings (`r"(...)"`)**: Write readable regex patterns without double-escape slashes.
2. **Character Classes**: Use `\d` for digits, `\w` for word characters, `\s` for whitespace, and `[...]` for custom sets.
3. **Quantifiers**: Control repetition with `?` (0 or 1), `+` (1+), `*` (0+), and `{n,m}`.
4. **Anchors**: Use `^` for start of string and `$` for end of string.
5. **Capture Groups**: Extract and rearrange text components using `(...)` and replacement references.
