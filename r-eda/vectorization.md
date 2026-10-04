# Vectorization & Functional Iteration

## Why Learn Functional Iteration and Vectorization?

Traditional loops are essential for low-level algorithms, but writing them in R is often slow, verbose, and error-prone. R's primary strength is **Vectorization**—the ability to perform operations across entire vectors in a single step without writing explicit loops. 

For complex data structures (like lists, data frame columns, or nested tables), the tidyverse provides the **`purrr`** package. `purrr`'s **`map()`** family of functions provides a highly readable, type-safe, and robust alternative to writing loops.

---

## Part 1: Vectorization & Element-Wise Arithmetic

In R, basic mathematical operations are performed element-by-element automatically.

```r
prices <- c(10.00, 25.50, 8.00, 120.00)

# 1. Scalar Arithmetic (Vector vs. Number)
taxed_prices <- prices * 1.08
print(taxed_prices) # 10.80 27.54  8.64 129.60

# 2. Vector-Vector Arithmetic (Vectors of Equal Length)
quantities <- c(2, 5, 10, 1)
total_costs <- taxed_prices * quantities
print(total_costs)
```

### The Vector Recycling Rule
If you operate on two vectors of different lengths, R repeats (recycles) the elements of the shorter vector to match the length of the longer vector:

```r
long_vector  <- c(1, 2, 3, 4)
short_vector <- c(10, 20)

# short_vector gets recycled to c(10, 20, 10, 20)
print(long_vector + short_vector) # 11 22 13 24
```

*Warning:* If the longer length is not an exact multiple of the shorter length, R still performs the operation but displays a warning.

---

## Part 2: Functional Mapping with `purrr::map()`

An alternative to writing a `for` loop is using **`map(seq, f)`**, which takes a sequence (list or vector) and maps a function `f` over each element.

### A. Case Study: Compound Random Variables
In traditional statistical models, sample size $n$ is assumed to be fixed. But what if the sample size itself is random? A **compound random variable** is one where a discrete random variable determines the sample size, and another distribution is drawn that many times.

Let's simulate three random samples where the sample sizes are randomized between 8 and 10:

```r
library(tidyverse)
library(purrr)

r_pois_norm <- function(n, mu = 0, sd = 1) {
  replicate(n, {
    # Generate random sample size between 8 and 10
    n_i <- sample(8:10, 1)
    rnorm(n_i, mu, sd)
  })
}

samples <- r_pois_norm(3)
print(samples) # Returns a list of 3 vectors of random lengths
```

---

### B. Extracting Statistics using `map()`
How can we extract the maximum value from each random sample?

```r
# map() always returns a LIST
map(samples, max)
```

To find the maximum absolute value (magnitude), we can define a helper function or chain operations:

```r
# Option 1: Custom helper function
get_max_magnitude <- function(x) {
  max(abs(x))
}
map(samples, get_max_magnitude)

# Option 2: Chained mappings
map(samples, abs) |> map(max)
```

---

### C. Type-Safe Maps: `map_*()`
Because `map()` always returns a list, you often need to flatten the output to a standard atomic vector. `purrr` provides typed map variants:
* **`map_dbl()`**: Returns a double-precision (decimal) vector.
* **`map_int()`**: Returns an integer vector.
* **`map_lgl()`**: Returns a logical (boolean) vector.
* **`map_chr()`**: Returns a character (string) vector.

```r
# Return a standard double vector directly
max_magnitudes <- map_dbl(samples, ~ max(abs(.x)))
print(max_magnitudes) # c(1.42, 2.11, 0.98)
```

---

### D. Passing Ellipsis Arguments
If the nested function accepts optional arguments, you can pass them as trailing parameters in the map function:

```r
samples_missing <- samples
samples_missing[[1]][1] <- NA # Introduce missing value

# Pass na.rm = TRUE down to mean()
map_dbl(samples_missing, mean, na.rm = TRUE)
```

---

## Part 3: Advanced Mapping Operations

### A. Parallel Mapping: `map2()`
To map over two vectors or lists in parallel, use **`map2()`**:

```r
# Generate secondary outcomes in parallel
samples_y <- map(samples, ~ runif(length(.x)))

# Calculate correlations within each sample in parallel
map2_dbl(samples, samples_y, cor)

# Calculate ratio averages with anonymous formulas: .x represents list 1, .y list 2
map2_dbl(samples, samples_y, ~ mean(.x / .y))
```

---

### B. List Filtering: `keep()` and `discard()`
Instead of using complex indexing, filter lists using predicate checks:

```r
# Retain only samples with more than 9 elements
keep(samples, ~ length(.x) > 9)

# Discard samples with average magnitudes below 1.0
discard(samples, ~ mean(abs(.x)) < 1.0)
```

---

### C. Loop Accumulations: `reduce()` and `accumulate()`
Many traditional loops accumulate values across iterations. `purrr` replaces this bookkeeping using `reduce()` (combining elements) and `accumulate()` (returning intermediate states):

```r
# Sum a vector
reduce(c(1, 10, 100, 2), `+`) # 113

# Track running sums
accumulate(c(1, 10, 100, 2), `+`) # 1 11 111 113
```

---

### D. Table-Returning Maps: `map_dfr()` and `imap_dfr()`
To bind mapped outputs together into a tidy data frame, use **`map_dfr()`** (row bind) or **`map_dfc()`** (column bind). 

To preserve group indices, use an **indexed map (`imap_dfr`)** where `.x` is the value and `.y` is the sequence index:

```r
# Row bind lists into a single dataframe preserving sample IDs
combined_df <- imap_dfr(samples, ~ tibble(value = .x, sample_id = .y))

# Perform centering on group means
combined_df |>
  group_by(sample_id) |>
  mutate(centered_value = value - mean(value))
```

---

### E. Handling Execution Errors with `safely()`
If you run `map()` over a list where a single item is corrupted, the entire process crashes:

```r
corrupt_list <- list(1, 10, "corrupted", 7)
# map(corrupt_list, log) # CRASHES!
```

To prevent crashes and capture errors gracefully, wrap your function in **`safely()`**. It returns a list containing two elements for each index: `result` and `error`.

```r
# Wrap log function safely
safe_log <- safely(log)

# Execute without crashing
outputs <- map(corrupt_list, safe_log)

# Inspect outcomes
print(outputs[[3]]) # result is NULL, error contains diagnostic message
```

---

## Hands-on Exercises

### Exercise 1: Extracting First Words from Text Arrays
**How can we parse a list of categorical fruit labels in parallel to extract only their first words, handling single-word categories gracefully?**

*Analytical Guidance*:
Process parallel text arrays. Your analysis should:
1. Identify the position of the first space inside `stringr::fruit` using:
   `first_space <- str_locate(stringr::fruit, " ")[, 1]`.
2. Write a custom parsing function `get_first_word <- function(text, space_idx)` that:
   * Returns the entire text string if `space_idx` is `NA` (the fruit name is a single word).
   * Otherwise, extracts the text from character `1` to `space_idx - 1` using `str_sub()`.
3. Use `map2()` and `flatten_chr()` to extract the first word of all items, printing the head of the resulting vector.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(purrr)

# Find first space indices
first_space <- str_locate(stringr::fruit, " ")[, 1]

# Define extraction logic
get_first_word <- function(text, space_idx) {
  if (is.na(space_idx)) {
    return(text)
  }
  return(str_sub(text, start = 1, end = space_idx - 1))
}

# Map over lists in parallel
first_words <- map2(stringr::fruit, first_space, get_first_word) |> 
  flatten_chr()

# Display results
print(head(first_words, 15))
```
</details>

---

### Exercise 2: Column-wise DataFrame Summarizations
**How can we iterate across the columns of a dataset in parallel to extract unified descriptive statistics for every column without hardcoding names?**

*Analytical Guidance*:
Generate column summaries. Your analysis should:
1. Load the `nycflights13` package and isolate the `flights` table.
2. Write a `map()` expression that applies the standard **`summary()`** function across every column of the dataframe.
3. Print the resulting list on the console.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(nycflights13)

# Map summary function across all columns
column_summaries <- map(flights, ~ summary(.x))

# Print first 3 columns as an example
print(column_summaries[1:3])
```
</details>
