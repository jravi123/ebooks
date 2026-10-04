# Advanced Custom Functions

## Why Learn Advanced Custom Functions?

As you transition from basic script writing to designing robust data science pipelines, standard function constructs are no longer sufficient. Real-world applications demand:
1. **State Tracking**: Maintaining or updating state variables across multiple function invocations.
2. **Flexible API Wrappers**: Passing undefined, arbitrary arguments down to underlying functions.
3. **Seamless Tidyverse Integration**: Creating custom plotting or grouping routines that work with unquoted column names (Tidy Evaluation).

Let's master the three pillars of advanced R programming: **Super-Assignment**, the **Ellipsis**, and **Tidy Evaluation**.

---

## Part 1: Scope Modification & Super-Assignment `<<-`

By default, any variable assigned inside a function is stored in its **local environment**. This local environment is destroyed immediately after execution, releasing the variables from memory.

To modify a variable residing in a parent environment (such as the global environment), use the **super-assignment operator `<<-`**:

```r
# Initialize a global counter
total_runs <- 0

log_run <- function() {
  # <<- searches up parent environments to modify the variable
  total_runs <<- total_runs + 1
}

log_run()
log_run()
print(total_runs) # Output: 2
```

> [!CAUTION] Super-Assignment Side Effects
> Modifying variables outside a function's local scope is called a **side effect**. Side effects make code difficult to debug, test, and containerize. Use `<<-` sparingly, restricting its use to logging, state tracking, and memoization (caching).

---

## Part 2: Variable Arguments and the Ellipsis `...`

To design flexible interfaces that accept any number of inputs, use the **ellipsis (`...`)** parameter. The ellipsis captures arbitrary arguments and can pass them directly down to nested functions:

```r
# A custom mean wrapper that passes arbitrary settings (like na.rm) to mean()
custom_mean <- function(data, ...) {
  print("Calculating average...")
  mean(data, ...)
}

dataset <- c(10, 20, NA, 30)

# Pass na.rm = TRUE down through the ellipsis to the underlying mean() function
print(custom_mean(dataset, na.rm = TRUE)) # Output: 20
```

---

## Part 3: Tidy Evaluation & Double Curly Braces `{{ }}`

Tidyverse packages like `dplyr` and `ggplot2` use **Data Masking** to refer to columns directly without quotation marks (e.g. `filter(mpg, class == "suv")` instead of `"class"`). 

However, trying to pass an unquoted variable name into a custom wrapper function causes **indirection**—R searches the global scope for a variable with that name and crashes:

```r
library(tidyverse)

# This wrapper function will CRASH!
grouped_mean_fail <- function(df, group_var, mean_var) {
  df |>
    group_by(group_var) |>
    summarize(mean(mean_var))
}

# Throws: Error in group_by(group_var) : object 'model' not found
# grouped_mean_fail(mpg, model, hwy)
```

### The Tidy Solution: Embracing with Curly-Curly `{{ }}`
To pass unquoted tidy columns as functional parameters, **embrace** them with double curly braces **`{{ }}`**. This instructs R to delay evaluation and mask the variables correctly inside the target dataframe:

```r
# This wrapper function WORKS perfectly!
grouped_mean_success <- function(df, group_var, mean_var) {
  df |>
    group_by({{ group_var }}) |>
    summarize(mean_value = mean({{ mean_var }}, na.rm = TRUE))
}

# Execute successfully across mpg
result <- grouped_mean_success(mpg, model, hwy)
print(head(result))
```

---

## Hands-on Exercises

### Exercise 1: Programmatic Call Tracking Counters
**How can we build an internal tracking mechanism that increments a global state variable every time a specific data loading function is invoked?**

*Analytical Guidance*:
Maintain external state counters. Your analysis should:
1. Initialize a global variable `loading_attempts <- 0`.
2. Write a custom function `load_data_source()` that:
   * Increments the global `loading_attempts` variable using the super-assignment operator `<<-`.
   * Prints the current count of total attempts to the console.
3. Call `load_data_source()` three times and verify the state counter prints `3`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
# Initialize state
loading_attempts <- 0

# Define loading wrapper
load_data_source <- function() {
  loading_attempts <<- loading_attempts + 1
  print(paste("Data loading triggered. Total attempts:", loading_attempts))
}

# Test execution
load_data_source()
load_data_source()
load_data_source()
```
</details>

---

### Exercise 2: Custom Tidyverse Graphing Wrappers
**How can we construct a reusable scatter plot template function that takes unquoted column coordinates and automatically renders a formatted chart?**

*Analytical Guidance*:
Develop tidyverse graphical wrappers. Your analysis should:
1. Load `library(ggplot2)`.
2. Define a function `create_scatter(df, x_col, y_col)` that uses double curly braces `{{ }}` inside the `aes()` mapping.
3. Call your function passing the `mpg` dataset with unquoted variables `displ` and `cty` to test the output.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(ggplot2)

# Create tidy plotter
create_scatter <- function(df, x_col, y_col) {
  ggplot(df, aes(x = {{ x_col }}, y = {{ y_col }})) +
    geom_point(color = "royalblue", size = 2) +
    theme_minimal() +
    labs(title = "Tidy-Evaluated Relationship Plot")
}

# Execute plot wrapper
create_scatter(mpg, displ, cty)
```
</details>
