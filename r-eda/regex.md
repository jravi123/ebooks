# Regular Expressions (Regex)

## Why Learn Regular Expressions in Data Analytics?

Imagine you are cleaning a public registry of telephone numbers submitted through an online web form. The raw values are extremely messy:
* `"123-456-7890"` (hyphens)
* `"1234567890"` (raw digits)
* `"(123) 456-7890"` (parentheses and spaces)
* `"Call 123-456-7890"` (text mixed with digits)

If you try to write custom `substring` code for each row, your script will quickly become hundreds of lines long and fail on the very next typo. You need a way to say: *"Identify any sequence of exactly 10 digits, ignoring all surrounding text, parentheses, and spaces."*

This is solved using **Regular Expressions (Regex)**. Regex is a powerful pattern-matching language used throughout computer science to identify, extract, and clean unstructured text data.

---

## Part 1: Raw Strings vs. Escaping Headaches

When writing regular expressions, we use many backslash (`\`) characters to define special patterns. However, in R, a single backslash is also used to escape standard string characters (such as double quotes `\"` or tabs `\t`). 

This creates a serious double-escaping problem when writing regular expressions in standard strings.

### The Double Backslash Headache
In standard R strings, to pass a single regex backslash to the search engine, you must double-escape it by writing **`\\`**:

```r
# standard R string literal matching a digit (\\d)
tricky_pattern <- "\\d"
```

If you have highly complex patterns, this double-escaping quickly becomes unreadable:

```r
# extremely confusing standard string with nested quotes and backslashes
tricky <- "double_quote <- \"\\\"\" # or '\"' single_quote <- '\\\''"
```

---

### The Modern Solution: Raw String Literals (R 4.0+)
To eliminate double-escapes, R 4.0+ introduced **Raw String Literals** using the **`r"(...)"`** syntax. Inside a raw string literal, backslashes are treated as literal characters, allowing you to write clean, unescaped regex patterns:

```r
# clean raw string matching a digit (\d)
clean_pattern <- r"(\d)"

# writing the complex nested quote expression clearly
simple <- r"(double_quote <- "\"" # or '"' single_quote <- '\'')")
cat(simple)
```

> [!TIP]
> Always use raw string literals `r"(...)"` when writing regular expressions in R to keep your code readable and prevent syntax errors!

---

## Part 2: Simple Patterns, Wildcards, & Base R Functions

The most basic regular expression is a plain string. It matches if the target text contains it as a substring.

### Simple Matches
We can use **`str_view()`** to visually inspect how a regex matches text:

```r
library(tidyverse)

# Search for the pattern "an" inside a vector of fruits
x <- c("apple", "banana", "pear")
str_view(x, pattern = "an")
# Highlights "an" twice in "banana"

# Find all fruits containing "berry"
str_view(fruit, "berry")
```

---

### The Wildcard Dot (`.`)
The period character **`.`** is a wildcard that matches **any single character** except a newline:

```r
# Matches "e", followed by any two characters, followed by "e"
str_view("else every eele etcetera", "e..e")
```

To extract matched text instead of just viewing it, use **`str_extract()`** (for the first match) or **`str_extract_all()`** (for all matches):

```r
# Extract the first match
str_extract("else every eele etcetera", "e..e")
# Output: "else"

# Extract all matches as a vector
str_extract_all("else every eele etcetera", "e..e") |> unlist()
# Output: "else" "ever" "eele"
```

---

### Base R Regex Functions
Before learning tidyverse tools, it is important to understand R's built-in regex helpers, which you will encounter in many legacy codebases:

* **`grepl(pattern, x)`**: Returns a logical vector (`TRUE`/`FALSE`) indicating if a match was found.
* **`grep(pattern, x)`**: Returns the numeric indices of elements that matched.
* **`sub(pattern, replacement, x)`**: Replaces the **first** match with new text.
* **`gsub(pattern, replacement, x)`**: Replaces **all** matches with new text (Global SUBstitution).

```r
raw_text <- "cat_orange_cat_dog"

# Replaces only the first "cat"
sub("cat", "CAT", raw_text)  # "CAT_orange_cat_dog"

# Replaces all occurrences of "cat"
gsub("cat", "CAT", raw_text) # "CAT_orange_CAT_dog"
```

---

## Part 3: Character Classes & Word Boundaries

To match broader categories of text, we use **Character Classes**:

| Class | Matches | Standard R String | Raw String Literal | Equivalent Set |
| :--- | :--- | :--- | :--- | :--- |
| **Digits** | Any single number | `"\\d"` | `r"(\d)"` | `[0-9]` |
| **Word Characters** | Letters, numbers, or `_` | `"\\w"` | `r"(\w)"` | `[A-Za-z0-9_]` |
| **Whitespace** | Spaces, tabs, or newlines | `"\\s"` | `r"(\s)"` | `[\t\n\r\f\v ]` |
| **Word Boundaries** | Edges of words | `"\\b"` | `r"(\b)"` | *Pattern location* |

```r
# Match any digit inside a vector of strings
str_view(c("number1", "two", "3hree"), r"(\d)")
```

---

### Custom Character Classes using `[ ]`
You can create your own character classes by placing characters inside square brackets **`[ ]`**. This matches exactly **one** character from the set:

* **`[abc]`**: Matches `a`, `b`, or `c`.
* **`[a-e]`**: Matches any lowercase letter from `a` to `e`.
* **`[A-Z]`**: Matches any single uppercase letter.
* **`[A-Za-z]`**: Matches any uppercase or lowercase letter.

```r
# Match either 'b' or 'e', followed by 'a'
str_view(fruit, "[be]a")

# Match any uppercase letter in a vector
str_view(c("These", "are", "some Capitalized words"), "[A-Z]")
```

---

### Word Boundaries (`\b`)
A word boundary **`\b`** matches the empty string at the beginning or end of a word:

```r
# Highlight word boundaries
str_view(c("Rafael Nadal", "Roger Federer"), r"(\b)")
```

Word boundaries are incredibly useful when searching for complete words without accidentally matching longer words containing them (such as matching `"cat"` but not `"catalog"` or `"bobcat"`):

```r
# Matches "cat" as a whole word
str_view(c("cat", "catalog", "bobcat"), r"(\bcat\b)")
# Highlights only the standalone word "cat"
```

---

## Part 4: Quantifiers & Negations

By default, character classes match exactly one character. **Quantifiers** allow you to specify how many times a character or pattern should repeat:

| Quantifier | Meaning | Example | Matches |
| :--- | :--- | :--- | :--- |
| **`?`** | Zero or one times | `r"(\d?)"` | Optional digit |
| **`+`** | One or more times | `r"(\d+)"` | At least one digit |
| **`*`** | Zero or more times | `r"(\d*)"` | Optional repeating digits |
| **`{x}`** | Exactly `x` times | `r"(\d{5})"` | Exactly 5 digits |
| **`{x,y}`** | Between `x` and `y` times | `r"(\d{2,4})"` | Between 2 and 4 digits |
| **`{x,}`** | At least `x` times | `r"(\d{3,})"` | 3 or more digits |

```r
# Extract all words that are between 10 and 22 characters long from Chapter 1
str_extract_all(ch1, r"(\w{10,22}\b)") |> unlist()
```

---

### Negation Classes (`[^ ]`)
By placing a carat **`^`** as the first character inside square brackets, you invert the class, matching any character **not** in the set:

* **`[^aeiou]`**: Matches any character that is not a lowercase vowel.
* **`[^0-9]`**: Matches any non-digit character (equivalent to `\D`).

```r
# Highlight all non-vowel sequences
str_view("match doesn't match", "[^aeiou]+")
```

We can use negations to extract nested text, such as text inside quotes. The pattern is: *a double quote, followed by one or more characters that are not a double quote, followed by a closing double quote*:

```r
# Extract text inside double quotes
str_view('"Here is a quote", said the professor.', r"("[^"]+")")
```

---

## Part 5: Grouping, Anchors, & Backreferences

Let's master advanced regular expressions using grouping, anchors, and backreferences.

### Grouping with `( )`
By wrapping a portion of a regex inside parentheses **`( )`**, you create a **Group**. This allows you to apply quantifiers to the entire group or refer to the group later in the expression:

```r
# Grouping word characters and spaces, matching repeating patterns
str_view("this will be grouped", "([a-z]+ ?)+")
```

---

### Anchoring the Start (`^`) and End (`$`)
Use **Anchors** to force your pattern to match only at the absolute boundaries of a string:
* **`^`**: Anchors a pattern to the **beginning** of the string.
* **`$`**: Anchors a pattern to the **end** of the string.

```r
x <- c("apple", "banana", "pear")

# Match strings starting with 'b'
str_view(x, "^b") # Highlights "b" in "banana"

# Match strings ending with 'r'
str_view(x, "r$") # Highlights "r" in "pear"
```

---

### Backreferences (`\1`, `\2`)
When you define a group with parentheses, the regex engine assigns it a numeric index (`\1` for the first group, `\2` for the second, etc.). You can refer to these captured groups later in the pattern.

A classic example is matching repeated characters (such as double letters in `"apple"`):

```r
# Match any character, followed by the exact same character
# Using raw string literals:
repeated_char_pattern <- r"((.)\1)"

# Using standard R strings (requires double escape):
repeated_char_pattern_std <- "(.)\\1"

word <- "apple"
str_detect(word, repeated_char_pattern) # TRUE (matches "pp")
```

---

### Extracting Group Structure with `str_match()`
While `str_extract()` pulls out the full match, **`str_match()`** returns a character matrix where the first column is the full match, and subsequent columns contain each individual capture group:

```r
log_entry <- "USER_125: Login Successful"

# Group 1 is the ID digits, Group 2 is the status message
pattern <- r"(USER_(\d+): (.*))"

matches <- str_match(log_entry, pattern)
print(matches)

# Extract individual components
user_id <- matches[1, 2] # "125" (Group 1)
status  <- matches[1, 3] # "Login Successful" (Group 2)
```

---

## Hands-on Exercises

### Exercise 1: Isolating Phone Directory Elements
**How can we identify, extract, and clean irregular telephone numbers from user-submitted text records?**

*Analytical Guidance*:
Filter and clean dirty string lists. Your analysis should:
1. Store a target customer list vector:
   `customers <- c("TX_1001", "ERROR_992", "TX_1002", "MISSING_88")`.
2. Use **`grepl()`** to find element vectors that **start with** `"TX_"`.
3. Filter the original vector using your logical mask to output only these valid transactions.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Raw user directory
customers <- c("TX_1001", "ERROR_992", "TX_1002", "MISSING_88")

# Logical mask identifying elements starting with TX_
valid_mask <- grepl("^TX_", customers)
print(valid_mask)
# TRUE FALSE  TRUE FALSE

# Clean subset list
valid_ids <- customers[valid_mask]
print(valid_ids)
# "TX_1001" "TX_1002"
```
</details>

---

### Exercise 2: Sanitizing Ledger Price Formats
**How can we strip away currency symbols and thousands separators from scraped ledger columns to safely convert them to numeric prices?**

*Analytical Guidance*:
Sanitize dirty currency vectors. Your analysis should:
1. Store a target price vector: `prices <- c("$1,200", "$25", "$450.50")`.
2. Use **`gsub()`** with an OR regex pattern to find dollar signs `$` **OR** commas `,` and replace them with an empty string `""`. Note that `$` is a special character meaning "end of string", so you must escape it as `"\\$"` or use a raw string literal `r"(\$)"`.
3. Convert the resulting strings to numeric values using **`as.numeric()`** and print the output.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Raw pricing ledger
prices <- c("$1,200", "$25", "$450.50")

# Clean dollar signs and commas
clean_strings <- gsub("\\$|,", "", prices)
print(clean_strings)
# "1200" "25" "450.50"

# Convert to numeric values
numeric_prices <- as.numeric(clean_strings)
print(numeric_prices)
# 1200.00   25.00  450.50
```
</details>
