# Text Wrangling & Strings
## String Manipulation, Concatenation, Substrings, and Splitting with stringr

---
# Lecture Agenda & Topics

Text data analysis requires specialized tools to clean strings, extract substrings, and manipulate character columns. The **`stringr`** package provides a consistent set of functions for string manipulation.

Today we will cover:
* **String Representations**: Escape sequences, special characters (`\n`, `\t`, `\\`), and Unicode.
* **Console Output**: Comparing `print()`, `cat()`, and `writeLines()`.
* **String Concatenation**: `paste()`, `paste0()`, and `str_c()`.
* **Missing Value Propagation**: How `str_c()` handles `NA` vs. base `paste()`.
* **String Length**: Distinguishing vector `length()` from character count `str_length()`.
* **Extracting Substrings**: Slicing strings with `str_sub()`.
* **Splitting and Separating**: `str_split()`, `separate_wider_delim()`, and `separate_wider_position()`.

---
# String Representation & Escaping Quotes

To include double quotes inside a string, escape them with a backslash (`\`) or enclose the string in single quotes:

```r
library(tidyverse)
library(stringr)

# Escaping internal quotes
mle <- "\"MLE\" stands for \"Maximum Likelihood Estimate\""
print(mle)

# Wrapping double quotes inside single quotes
mle_alt <- '"MLE" stands for "Maximum Likelihood Estimate"'
print(mle_alt)
```

---
# Special Characters & Escape Sequences

Common escape sequences:
* `\n`: Newline (line break)
* `\t`: Tab indentation
* `\\`: Literal backslash

```r
library(tidyverse)
library(stringr)

# String with newline escape
message_text <- "First Line\nSecond Line"

# print() displays raw escaped code
print(message_text)

# cat() evaluates escapes and prints formatted text
cat(message_text)
```

---
# Combining Strings: `paste0()` vs. `str_c()`

In R, the `+` operator cannot be used on character strings. Use `paste()`, `paste0()`, or `str_c()`:

```r
library(tidyverse)
library(stringr)

# paste0 joins strings with no delimiter
paste0("Data", "Science", "306")

# str_c allows custom separators
str_c("Department", "Statistics", sep = " of ")
```

### Missing Value Propagation in `str_c()`:
```r
library(tidyverse)
library(stringr)

# paste converts NA to literal character string "NA"
paste("Score:", NA) # Output: "Score: NA"

# str_c propagates NA (returns NA)
str_c("Score:", NA)  # Output: NA
```

`str_c()` is safer for data analysis pipelines because missing measurements remain missing.

---
# String Length: `str_length()` vs. `length()`

> [!IMPORTANT] Vector Length vs. Character Count
> * **`length(x)`**: Returns the number of **elements in the vector**.
> * **`str_length(x)`**: Returns the number of **characters inside each string**.

```r
library(tidyverse)
library(stringr)

text_vec <- c("R", "Python", "Julia")

length(text_vec)     # 3 elements in the vector
str_length(text_vec) # 1, 6, 5 characters
```

---
# Extracting Substrings: `str_sub()`

Use **`str_sub(string, start, end)`** to extract or replace characters by their index positions:

```r
library(tidyverse)
library(stringr)

codes <- c("MI-48109", "CA-94305", "MA-02138")

# Extract state abbreviation (first 2 characters)
str_sub(codes, 1, 2)

# Extract ZIP code using negative indexing (last 5 characters)
str_sub(codes, -5, -1)
```

Negative numbers count backwards from the end of the string.

---
# Rectangular Splitting: `separate_wider_delim()`

When a data frame column combines multiple fields separated by a delimiter, use `separate_wider_delim()`:

```r
library(tidyverse)

patient_data <- tibble(
  id = 1:3,
  location_record = c("Ann Arbor_MI_48109", "Stanford_CA_94305", "Cambridge_MA_02138")
)

# Separate location into city, state, and zip
patient_data |>
  separate_wider_delim(
    cols = location_record,
    delim = "_",
    names = c("city", "state", "zip")
  )
```

---
# Fixed-Position Splitting: `separate_wider_position()`

When text records have fixed character widths with no delimiter:

```r
library(tidyverse)

sensor_data <- tibble(
  reading = c("20231015T72", "20231016T68", "20231017T75")
)

# Split by exact character widths
sensor_data |>
  separate_wider_position(
    cols = reading,
    widths = c(year = 4, month = 2, day = 2, marker = 1, temp = 2)
  )
```

---
# Collapsing Vectors: `str_flatten()`

To join multiple elements of a character vector into a single string:

```r
library(tidyverse)
library(stringr)

words <- c("Exploratory", "Data", "Analysis")

# Collapse into a single comma-separated sentence
str_flatten(words, collapse = ", ")

# Using last separator
str_flatten(words, collapse = ", ", last = ", and ")
```

---
# Module Summary & Key Takeaways

1. **Escape Characters**: Use `\"` to escape quotes, `\n` for newlines, and `\\` for literal backslashes.
2. **`str_c()`**: Concatenates strings while safely propagating `NA` values.
3. **`str_length()`**: Counts individual characters in strings.
4. **`str_sub()`**: Extracts and modifies substrings using positive and negative index bounds.
5. **`separate_wider_delim()`**: Splits structured text columns into separate tabular columns based on a delimiter.
