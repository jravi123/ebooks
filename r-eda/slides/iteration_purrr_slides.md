# Loops & Vectorized Iteration
## Conditional Execution, Imperative Loops, Tidy Evaluation, and purrr Maps

```r block=setup
library(tidyverse)
library(nycflights13)
set.seed(42)

r_pois_norm <- function(n, mu = 0, sd = 1) {
  replicate(n, {
    n_i <- sample(8:10, 1)
    rnorm(n_i, mu, sd)
  })
}

samples <- r_pois_norm(3)
samples_y <- map(samples, ~ runif(length(.x)))
```

---
# Today's Topic & Agenda

After today's lecture you will understand:
* **Conditional statements**: `if`, `else if`, and `else`
* **Iteration**: `for` and `while` loops (`break` and `next`)
* **Dataframe functions**: Tidy evaluation and embracing with `{{ }}`
* **`purrr` Map family functions**: `map()`, `map_*()`, `map2()`, `keep()`, `reduce()`, `accumulate()`, `imap_dfr()`, and `safely()`

*(These notes correspond to Chapters 26 & 27 of R for Data Science.)*

---
# Conditional Execution

Often when writing functions we need to do different things depending on what data is passed in. This is known as **conditional execution**, and is accomplished using the `if` and/or `else` construct:

```r
# General syntax:
# if (condition) {
#   # code executed when condition is TRUE
# } else {
#   # code executed when condition is FALSE
# }
```

---
# `if` Statements

The workhorse for conditional execution in R is the `if` statement:

```r
if (TRUE) { # hard-coded to TRUE, so the if-block always executes
  print("do something if true")
}

x <- 1
if (x > 2) {
  print(x)
}
print("hello")
```

---
# Optional `else` Block

Use an `else` block to control the flow when the condition is `FALSE`, without separately checking the condition's negation:

```r
if ((2 + 3) == 5) {
  print("the statement is true")
} else {
  print("the statement is false")
}
```

---
# `if-else` Chains

For more complex cases, you can check multiple conditions in sequence using `else if`:

```r
a <- -1
b <- 1

if (a * b > 0) {
  print("Zero is not between a and b")
} else if (a < b) {
  smaller <- a
  larger  <- b
} else {
  smaller <- b
  larger  <- a
}

c(smaller, larger)
```

---
# Function with Multiple Returns: `fizzbuzz()`

This function returns `'fizz'` if the given number is a multiple of 3, `'buzz'` if it is a multiple of 5, and the original number if it is neither:

```r
fizzbuzz <- function(x) {
  if (x %% 3 == 0) {
    return("fizz")
  } else if (x %% 5 == 0) {
    return("buzz")
  }
  return(x)
}

fizzbuzz(9)
fizzbuzz(10)
fizzbuzz(7)
```

---
# Iteration with `for` Loops

Sometimes you want to repeat a set of statements for every element in a sequence. That is when you use a `for` loop:

```r
# Syntax:
# for (<index> in <vector>) {
#   [do something for each value of <index>]
# }

x <- sample(1:100, 10, replace = FALSE)
print(x)

for (item in x) {
  print(item)
}
```

---
# Exercise: Filtering Even Numbers with a `for` Loop

Print the values that are **even numbers** in the vector `x` using a `for` loop and an `if` statement (not a vectorized filter):

```r
x <- sample(1:100, 10, replace = FALSE)

# Write your for loop below:

```

```r block=answer
x <- sample(1:100, 10, replace = FALSE)
print(x)

for (item in x) {
  if (item %% 2 == 0) {
    print(item)
  }
}
```

---
# The `while` Loop & Random Walk Simulation

A `while()` loop is useful when you **aren't sure beforehand how many iterations are needed** — a common situation in statistical simulations.

A **random walk** describes a path constructed by a series of random steps. Here is a random walk that terminates if the value is more than 10 units from `0` (with a safety limit `maxIter = 1000`):

```r
maxIter <- 1000 # always limit the total iterations allowed!
val <- c()
val[1] <- rnorm(1) # initialize
val[1]

k <- 1
while (abs(val[k]) < 10 && k <= maxIter) {
  val[k + 1] <- val[k] + rnorm(1)
  k <- k + 1
}
val <- val[1:k]

plot(val, type = "l", main = "Random Walk Simulation", xlab = "Step", ylab = "Value")
```

---
# Loop Keywords: `next`

Two keywords are useful inside loops:
* **`break`**: Break out of the currently executing loop immediately.
* **`next`**: Move to the next iteration immediately, skipping the rest of the current iteration (like `continue` in Python/C++).

Here is an example using `next` to skip even numbers and print only odd numbers:

```r
for (i in 1:10) {
  if (i %% 2 == 0) next
  cat(i, "\n")
}
```

---
# Loop Keywords: `break`

Here is our random walk simulation refactored to use `break` when `abs(val[k]) > 10`:

```r
maxIter <- 1000 # always limit the total iterations allowed
val <- c()
val[1] <- rnorm(1) # initialize

k <- 1
while (k <= maxIter) {
  val[k + 1] <- val[k] + rnorm(1)
  k <- k + 1
  if (abs(val[k]) > 10)
    break
}
val <- val[1:k]

plot(val, type = "l", main = "Random Walk with break", xlab = "Step", ylab = "Value")
```

---
# Advanced Functions: Scope (`<<-`) & Ellipsis (`...`)

Before writing dataframe and mapping functions, recall two key R function features:

1. **Super-Assignment (`<<-`)**: Modifies a variable in a parent/global environment rather than the function's local scope.
2. **The Ellipsis (`...`)**: Captures arbitrary extra arguments and passes them down to inner functions:

```r
total_runs <- 0

custom_mean <- function(data, ...) {
  total_runs <<- total_runs + 1
  mean(data, ...)
}

custom_mean(c(10, 20, NA, 30), na.rm = TRUE)
print(total_runs)
```

---
# Dataframe Functions & Embracing (`{{ }}`)

`dplyr` uses **tidy evaluation** (data masking) so you can refer to column names without quotes. However, passing column names into a custom function causes a problem of **indirection**:

```r
# Why does grouped_mean(mpg, model, hwy) fail without {{ }}?
# Fix grouped_mean below by embracing group_var and mean_var with {{ }}:
grouped_mean <- function(df, group_var, mean_var) {
  df |>
    group_by({{ group_var }}) |>
    summarize(mean({{ mean_var }}))
}

grouped_mean(mpg, model, hwy) |> head(5)
```

```r block=answer
grouped_mean <- function(df, group_var, mean_var) {
  df |>
    group_by({{ group_var }}) |>
    summarize(mean({{ mean_var }}))
}

grouped_mean(mpg, model, hwy)
```

---
# Functional Iteration with `purrr::map()`

An alternative to writing a `for` loop is to use the **`map(seq, f)`** function from `purrr`. It takes a sequence (`seq`: a list or vector) and "maps" a function `f` over each element:

```
  Input List/Vector:    [ x1 ]      [ x2 ]      [ x3 ]
                          │           │           │
  Apply Function f:     f(x1)       f(x2)       f(x3)
                          │           │           │
                          ▼           ▼           ▼
  Output List:         [[1]]       [[2]]       [[3]]
```

---
# Compound Random Variables

Many times we take sample sizes $n$ to be fixed. What if our sample size itself is random?

A **compound random variable** is one in which a discrete random variable sets the sample size, and then another random variable is drawn that many times:

```r
r_pois_norm <- function(n, mu = 0, sd = 1) {
  replicate(n, {
    # generate a random integer between 8 and 10
    n_i <- sample(8:10, 1)
    rnorm(n_i, mu, sd)
  })
}

samples <- r_pois_norm(3)
samples
```

---
# Maximum of the Samples with `map()`

What was the largest value of each sample?

```r
map(samples, max)
```

What was the largest **magnitude** (absolute value) in each sample?

```r
# Version 1: Define a helper function
get_max <- function(x) {
  max(abs(x))
}
map(samples, get_max)

# Version 2: Chain two map() calls with a pipe
map(samples, abs) |> map(max)
```

---
# Exercise: Squaring Numbers with `map()`

Use `map()` to square (raise to the power of 2) each number in the vector `v`:

```r
v <- c(2, 4, 5, 7)

# Use map() with a formula (~ .x^2) or a custom function:

```

```r block=answer
v <- c(2, 4, 5, 7)

map(v, ~ .x^2)

# OR using a named function:
pow_2 <- function(x) {
  x^2
}
map(v, pow_2)
```

---
# Exercise: Summarizing `flights` Columns with `map()`

Use `map()` on the `nycflights13::flights` dataframe to return a short `summary()` of each column (min, median, mean, quartiles, etc.):

```r
# Apply summary() to every column of flights using map():

```

```r block=answer
map(flights, ~ summary(.x))
```

---
# Getting Atomic Vector Outputs: `unlist()`

`map()` can take either a list or a vector as input, but **always returns a `list`** as output.

If you know that all outputs are scalars of the same type, you can pipe to `unlist()` to get an atomic vector:

```r
map(samples, ~ max(abs(.x))) |> unlist()
```

---
# Flattening to Known Types: `flatten_*()`

If you know that all entries in the list will be of a specific atomic type, you can flatten them with type-checking:
* **`dbl`**: Numeric decimal data (double)
* **`int`**: Integer data
* **`lgl`**: Logical / boolean
* **`chr`**: Character / strings

```r
map(samples, ~ max(abs(.x))) |> list_simplify()
```

If the types don't match what you asked for, `purrr` throws an informative type error instead of silently coercing!

---
# Type-Safe `map_*()` Variants

The pattern of mapping and immediately simplifying to an atomic vector is so common that `purrr` provides direct **`map_*()`** functions:

* **`map_dbl(.x, .f)`** $\rightarrow$ returns a `double` vector
* **`map_int(.x, .f)`** $\rightarrow$ returns an `integer` vector
* **`map_lgl(.x, .f)`** $\rightarrow$ returns a `logical` vector
* **`map_chr(.x, .f)`** $\rightarrow$ returns a `character` vector

```r
map_dbl(samples, ~ max(abs(.x)))
```

---
# Passing Additional Arguments (`...`) in `map_*()`

Just like we saw earlier, `map_*()` accepts `...` and passes those additional arguments along to the mapped function:

```r
samples_missing <- samples
samples_missing[[1]][1] <- NA

# Without na.rm = TRUE, the first sample returns NA:
map_dbl(samples_missing, mean)

# Passing na.rm = TRUE through map_dbl():
map_dbl(samples_missing, mean, na.rm = TRUE)
```

---
# Mapping Over Two Inputs: `map2()`

Suppose for each sample in `samples`, we have a second outcome vector of the same length in `samples_y`:

```r
samples_y <- map(samples, ~ runif(length(.x)))
samples_y
```

What is the correlation (`cor`) between `samples` and `samples_y` within each sample? Use **`map2()`** or **`map2_dbl()`**:

```r
map2(samples, samples_y, cor)
map2_dbl(samples, samples_y, cor)
```

---
# Mapping Custom Functions on Two Inputs

Suppose we want the average ratio of $X$ to $Y$ (`mean(x / y)`) within each sample. We can pass a two-argument anonymous function or use `.x` and `.y` in a formula:

```r
# Using an anonymous function(x, y)
map2_dbl(samples, samples_y, function(x, y) { mean(x / y) })

# Using formula shorthand (~ with .x and .y)
map2_dbl(samples, samples_y, ~ mean(.x / .y))
```

---
# Exercise: First Word of `fruit` Using `map2()`

Using `map2()`, extract the **first word** of each item in `stringr::fruit` (keeping single-word fruits as-is).

Helpful hints:
* `str_locate("chili pepper", " ")` finds the index of the space (`6`).
* `str_sub("chili pepper", end = 6 - 1)` extracts `"chili"`.
* `str_locate("cantaloupe", " ")` returns `NA` when there is no space.

```r
first_space <- str_locate(stringr::fruit, " ")[, 1]

# Write a helper function get_word(x, y) and apply map2_chr():

```

```r block=answer
first_space <- str_locate(stringr::fruit, " ")[, 1]

get_word <- function(x, y) {
  if (is.na(y)) {
    return(x)
  }
  return(str_sub(x, 1, y - 1))
}

map2_chr(fruit, first_space, get_word)
```

---
# Predicate List Filtering: `keep()` & `discard()`

* **`keep(.x, .p)`** keeps only the list entries that match a predicate function `.p`.
* **`discard(.x, .p)`** drops the entries that match `.p`.

```r
# Keep only samples with length >= 9
keep(samples, ~ length(.x) >= 9)

# Discard samples with length < 9
discard(samples, ~ length(.x) < 9)
```

---
# Accumulators: `reduce()` & `accumulate()`

Many `for` loops use **accumulators** to combine values step by step:

```r
max_length <- -Inf
for (i in seq_along(samples)) {
  max_length <- max(length(samples[[i]]), max_length)
}
max_length
```

`reduce()` avoids manual accumulator bookkeeping, and `accumulate()` shows all intermediate results:

```r
# Find maximum sample length using map_dbl() + reduce()
map_dbl(samples, length) |> reduce(max)

# Sum a vector with reduce() vs. viewing running sums with accumulate()
reduce(c(1, 10, 100, 2, 3, 4), `+`)
accumulate(c(1, 10, 100, 2, 3, 4), `+`)
```

---
# Map Functions That Return Tables (`map_dfr`, `imap_dfr`)

The `_dfr` variants apply functions that return data frames and **row-bind** them together:

```r
map_dfr(samples, ~ tibble(x = .x)) |> head(6)
```

To record which sample each row came from, use an **indexed map** (`imap_dfr()`), where `.x` is the element and `.y` is its index/name:

```r
imap_dfr(samples, ~ tibble(x = .x, sample_num = .y)) |>
  group_by(sample_num) |>
  mutate(x_centered = x - mean(x)) |> # within-group mean-centered values
  head(6)
```

*(There is also `map_dfc()` to bind columns together.)*

---
# Built-in Base R Apply Functions

Base R has several built-in functions that are similar to `purrr::map_*`:

* **`lapply(X, FUN)`**: Similar to `map()`, always returns a list, but does not support `~ .x` formula shorthand.
* **`sapply(X, FUN)`**: Tries to simplify output to a vector/matrix, but does **no type checking** (silently returns a list if simplification fails).
* **`vapply(X, FUN, FUN.VALUE)`**: Type-safe like `map_*()`, but more verbose syntax.
* **`mapply(FUN, ...)`**: Similar to `map2()` / `pmap()`, and Base R also has `Map()` and `Reduce()`.

```r
lapply(samples, max)
sapply(samples, max)
```

---
# Catching Errors in Iteration with `safely()`

If an error occurs mid-iteration inside `map()`, it can be frustrating when the entire pipeline halts:

```r
x <- list(1, 10, "3", 7)
# map(x, log) -> Error: non-numeric argument to mathematical function!
```

`safely()` wraps a function so it never throws an error — instead, it returns a list with `$result` and `$error` for every element:

```r
safe_log <- safely(log) # returns a new "safe" function
safe_log(10)
safe_log("3")

map(x, safe_log)
```

---
# Lecture Summary & Key Takeaways

* **Conditionals & Loops**: Use `if` / `else if` / `else` for branching, `for` loops for known sequences, `while` loops (with `maxIter` safety limits!) for simulations, and `next` / `break` for loop control.
* **Tidy Evaluation (`{{ }}`)**: Embrace column-name arguments inside custom `dplyr` / `ggplot2` functions using `{{ var }}`.
* **`purrr::map` Family**: Use `map()` for lists and `map_dbl()`, `map_int()`, `map_lgl()`, `map_chr()` for type-safe atomic vectors; use `map2()` for parallel iteration over two inputs.
* **List Operations & Error Handling**: Use `keep()` / `discard()` to filter lists, `reduce()` / `accumulate()` to fold values, `imap_dfr()` to build indexed tibbles, and `safely()` to catch iteration errors gracefully.
