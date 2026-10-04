# Loops & Vectorized Iteration
## Control Flow, Imperative Loops, Vectorization, and purrr Functional Maps

---
# Lecture Agenda & Topics

Iterative computation is fundamental to data transformation, simulation, and modeling. In R, repetitive operations can be accomplished via control flow loops or functional programming maps.

Today we will cover:
* **Conditional Branching**: Decision pathways using `if`, `else if`, and `else`.
* **Imperative Loops**: Writing `for` and `while` loops.
* **Vectorization**: Why vectorized functions outperform imperative loops in R.
* **Functional Programming with `purrr`**: Using `map()`, `map_dbl()`, `map_chr()`, and `map_df()`.
* **Multi-Argument Mapping**: Coordinating parallel vectors with `map2()` and `pmap()`.
* **Resilient Iteration**: Handling errors gracefully with `safely()` and `possibly()`.

---
# Conditional Branching: `if` / `else if` / `else`

Control execution paths with logical checks:

```r
library(tidyverse)

# Fizzbuzz function with conditional branching
fizzbuzz <- function(x) {
  if (x %% 15 == 0) {
    "FizzBuzz"
  } else if (x %% 3 == 0) {
    "Fizz"
  } else if (x %% 5 == 0) {
    "Buzz"
  } else {
    as.character(x)
  }
}

c(fizzbuzz(3), fizzbuzz(5), fizzbuzz(15), fizzbuzz(7))
```

> [!CAUTION] `if` vs `ifelse`
> Base R `if (condition)` only tests a single scalar boolean. To evaluate an entire vector elementwise, use `dplyr::if_else()` or `dplyr::case_when()`.

---
# Imperative Iteration: The `for` Loop

A `for` loop executes a block of code once for each element in a vector:

```r
library(tidyverse)

# Pre-allocating output vector for performance
numbers <- c(2, 4, 6, 8, 10)
squared <- numeric(length(numbers))

for (i in seq_along(numbers)) {
  squared[i] <- numbers[i]^2
}

print(squared)
```

> [!TIP] Pre-allocation Best Practice
> Always pre-allocate the output vector (`numeric(n)`, `character(n)`) before running a loop instead of dynamically growing it with `c()`. Dynamic growth incurs heavy memory reallocation penalties.

---
# Vectorization: The Idiomatic R Alternative

In R, vectorized functions operate on entire vectors at once via compiled C/Fortran code, eliminating the need for manual loops:

```r
library(tidyverse)

numbers <- c(2, 4, 6, 8, 10)

# Vectorized operation: clean, concise, and fast
squared_vec <- numbers^2
print(squared_vec)
```

---
# Functional Iteration: The `purrr` Family

The **`purrr`** package provides type-safe mapping functions that apply a function to each element of a list or vector:

```
               Input: Vector or List [x1, x2, x3, ...]
                                 │
                                 ▼ (Applies Function .f)
               ┌─────────────────┼─────────────────┐
               ▼                 ▼                 ▼
             .f(x1)            .f(x2)            .f(x3)
               │                 │                 │
               └─────────────────┼─────────────────┘
                                 ▼
               Output: Typed Vector or List
```

### Type-Safe Mappers:
* **`map()`**: Returns a **list**.
* **`map_dbl()`**: Returns a **numeric (double) vector**.
* **`map_chr()`**: Returns a **character vector**.
* **`map_lgl()`**: Returns a **logical vector**.
* **`map_dfr()` / `list_rbind()`**: Row-binds data frames.

---
# `purrr::map_*` in Action

Calculate summary metrics across numeric columns of a tibble:

```r
library(tidyverse)
library(purrr)

# Toy dataframe
df <- tibble(
  a = c(1, 2, 3, 4, 5),
  b = c(10, 20, 30, 40, 50),
  c = c(100, 200, 300, 400, 500)
)

# Return numeric vector of column means
map_dbl(df, mean)

# Return numeric vector of standard deviations
map_dbl(df, sd)
```

---
# Anonymous Functions & Formula Shortcuts

Pass custom logic to `map()` using modern anonymous lambda syntax `\(x) ...`:

```r
library(tidyverse)
library(purrr)

sample_lists <- list(
  group_a = c(12, 15, 18, 22),
  group_b = c(85, 90, 92, 99),
  group_c = c(100, 105, 110, 120)
)

# Compute (max - min) range for each group using lambda
map_dbl(sample_lists, \(x) max(x) - min(x))
```

---
# Two-Argument Mapping: `map2()`

When iterating over two input vectors in parallel, use **`map2()`**:

```r
library(tidyverse)
library(purrr)

means <- c(0, 10, 100)
sds   <- c(1,  2,   5)

# Generate 3 simulated normal samples with differing parameters
map2(means, sds, \(m, s) rnorm(n = 4, mean = m, sd = s))
```

---
# Resilient Mapping: `safely()`

When batch-processing web requests or fitting multiple models, an error on one element halts an entire loop. **`safely()`** captures errors without stopping execution:

```r
library(tidyverse)
library(purrr)

# List containing invalid input for log()
inputs <- list(10, "corrupted_text", 100)

safe_log <- safely(log)

# Run safely across all items
results <- map(inputs, safe_log)

# Inspect output structure (returns $result and $error)
results |> map("result")
```

---
# Module Summary & Key Takeaways

1. **Vectorization First**: Whenever possible, use vectorized functions rather than manual loops for speed and readability.
2. **Pre-allocation**: If writing `for` loops, pre-allocate target vectors using `numeric(n)` or `vector("list", n)`.
3. **`purrr::map_*`**: Provides type-consistent iteration (`map_dbl()`, `map_chr()`, `map_lgl()`).
4. **`map2()` & `pmap()`**: Iterate across multiple vectors or lists simultaneously in parallel.
5. **`safely()`**: Wraps fragile functions to ensure batch jobs complete even when encountering errors.
