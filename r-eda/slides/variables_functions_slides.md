# Variables, Assignments, & Functions in R


---


# Arrows (`<-`) vs. Equals (`=`)

## What is the difference?
* **Use `<-`** for assigning values to variables in your workspace environment.
* **Use `=`** for passing named keyword arguments into functions.


```r-30
# 1. Correct variable assignment in environment
budget <- 5000

# 2. Correct named argument in function call
my_vector <- c(1:5, NA)
mean(my_vector, na.rm = TRUE) 
```
* **Danger of `<-` inside function calls**:
  - To the mean function, passing `na.rm <- TRUE` is evaluated as a variable assignment in your workspace environment (creating a global variable `na.rm`) rather than passing a named parameter.
  - Its value (`TRUE`) is passed positionally to the **2nd argument** (`trim`), causing:  
    `Error in mean.default(my_vector, na.rm <- TRUE) : 'trim' must be numeric of length one`.
---

# Rules for Naming Variables

## Syntax Constraints
R variables (identifiers) are case-sensitive and must follow strict naming rules:

* **Allowed Characters**: Letters, numbers, underscores (`_`), and periods (`.`).
* **Starting Characters**: Must start with a letter or a period (`.`).
* It **cannot** start with a number or an underscore (e.g., `_total` or `2sales` are invalid).
* **Period Starting Exception**: If a variable starts with a period (`.`), the second character **cannot** be a number (e.g., `.total` is valid, but `.2total` is invalid).
* **Reserved Words**: Cannot use keywords like `if`, `else`, `while`, `function`, `TRUE`, `FALSE`, `NULL`, `NA`.

---

# Naming Style Guide

How should we separate multi-word variables?

| Case Style | Pattern | Recommendation |
| :--- | :--- | :--- |
| **snake_case** | `marketing_budget` | **Highly Recommended** (standard, clean) |
| **camelCase** | `marketingBudget` | Common (inherited from Java/JS) |
| **dot.case** | `marketing.budget` | Deprecated (confuses object-oriented methods) |

```r-5
# Do this:
marketing_budget <- 5000

# Avoid this:
marketing.budget <- 5000
```

---

# Basic Data Types in R

Every value belongs to a data type or **class** that R detects dynamically:

| Class | Description | Example |
| :--- | :--- | :--- |
| **numeric** | Decimals / Real numbers (stored as double-precision float) | <span style="white-space: nowrap;">`sales <- 1250.50`</span> |
| **integer** | Discrete whole numbers (requires an `L` suffix) | <span style="white-space: nowrap;">`count <- 10L`</span> |
| **character** | Text strings (wrapped in single or double quotes) | <span style="white-space: nowrap;">`status <- "Closed"` or <br>`status <- 'Closed'`</span> |
| **logical** | Boolean flags (`TRUE` / `FALSE`, or `T` / `F`) | <span style="white-space: nowrap;">`is_active <- TRUE`</span> |
| **NULL** | Absence of a value / Empty | <span style="white-space: nowrap;">`empty_val <- NULL`</span> |

---

# Identifying Data Types

## The `class()` Function
Use `class()` to inspect the runtime data type of any variable in R:

```r-6
# Checking variable classes
status <- "Open"
budget <- 5000
count  <- 10L

print(class(status)) # Output: "character"
print(class(budget)) # Output: "numeric"
print(class(count))  # Output: "integer"
```

---

# Numeric vs. Integer: The `L` Suffix

## Bare Numbers Default to Numeric
In R, any bare number (e.g., `10`) defaults to a 64-bit double-precision floating-point `numeric` value.
* To store a value as a pure 32-bit whole **integer**, you must append an **`L`** suffix (e.g., `10L`).
* **Why "L"?** "L" stands for **Long integer** (a historical syntax carry-over).

```r-7
# Default double-precision
count_numeric <- 10
print(class(count_numeric)) # "numeric"

# Pure integer with 'L'
count_integer <- 10L
print(class(count_integer)) # "integer"
```

> **When does `L` actually matter?** 
> 1. **Memory**: Storing whole numbers as integers saves 50% of RAM (4 bytes vs 8 bytes per number).
> 2. **Strict APIs**: Some low-level packages expect exact integer types.

---

# Floating-Point Pitfalls & Workarounds

## Rounding Errors with Decimals
Decimals are represented using binary floating-point representation, which can cause tiny rounding errors:

```r-8
# Try this in R:
print(0.1 + 0.2 == 0.3) 
# Output: FALSE!
```

Computers store numbers in binary (base-2). Fractional decimals like `0.1` and `0.2` cannot be represented perfectly, resulting in infinite repeating binary decimals and minor rounding differences.

## Exact Matching Workaround
To bypass floating-point rounding errors when strict equality matching is required, scale decimals into integers:

```r-9
# Storing money as cents instead of dollars
item_price_dollars <- 3.50  # numeric double (risk of float error)
item_price_cents   <- 350L  # integer (mathematically exact)
```

---

#  CPC & Conversion Rates

Let's practice variable assignments, data types, and operators:

```r-10
# Marketing Analytics Campaign
budget      <- 5000     # Budget in dollars
clicks      <- 12500    # Clicks generated
conversions <- 450      # Completed sales

# Calculate Metrics
cost_per_click  <- budget / clicks
conversion_rate <- (conversions / clicks) * 100

print(paste("CPC: $", cost_per_click))
print(paste("Conversion Rate:", conversion_rate, "%"))
```

---

# Introduction to Vectors

## Homogeneous Data Collections
* A **vector** is the most basic data structure in R. It represents an ordered collection of the **same type** of data (homogeneous).
* Contrast this with a **list**, which can store different types of data (heterogeneous).
* We create vectors using the **`c()`** function, which stands for **combine** or **concatenate**.

```r-24
# Creating a numeric vector 
phone_digits <- c(8, 6, 7, 4, 3, 0, 9)

# Combining vectors together
phone_plus_area_code <- c(7, 3, 4, phone_digits)
print(phone_plus_area_code)
# Output: 7 3 4 8 6 7 4 3 0 9
```

---

# Introduction to Lists

## Heterogeneous Data Collections
* While vectors only hold elements of the same data type, a **list** is a flexible container that can store elements of **different types** (heterogeneous).
* A list can contain numbers, character strings, logical values, vectors, and even other lists or functions!
* We create lists using the **`list()`** function, and elements can optionally be given names.

```r-31
# Creating a list with mixed data types
student_profile <- list(
  name        = "Alice",
  age         = 21,
  is_enrolled = TRUE,
  quiz_scores = c(95, 88, 92)
)

print(student_profile)

# Accessing elements by name with '$' or double brackets '[[]]'
print(student_profile$name)         # Output: "Alice"
print(student_profile$quiz_scores)  # Output: 95 88 92
```

Note: When using double brackets `[[]]`, you must place the column name inside quotes. Alternatively, you can pass an integer representing the column's numerical index.

---

# Generating Sequences in R

## Creating Number Sequences
In R, generating regular number sequences is simple and common for indexing, iterations, and simulations:

* **The Colon Operator (`:`)**: Fast shortcut for integer sequences stepping by `1` (or `-1`).
* **The `seq()` Function**: Customizable sequence generator with custom step sizes (`by`) or total element count (`length.out`).

```r-32
# 1. Simple integer sequences using ':'
1:5                                    # Output: 1 2 3 4 5
5:1                                    # Output: 5 4 3 2 1

# 2. Custom step sizes with 'by'
seq(from = 0, to = 10, by = 2)         # Output: 0 2 4 6 8 10

# 3. Fixed number of evenly spaced elements
seq(from = 0, to = 1, length.out = 5)  # Output: 0.00 0.25 0.50 0.75 1.00
```

---

# Vector Indexing & Subsetting

## 1-Based Indexing in R
Unlike many programming languages that start indexing at 0, **R starts indexing at 1**.

```r-25
# Creating a vector of 10 random numbers between 0 and 1
random_u01 <- runif(10)

# 1. Accessing first and last items
random_u01[1]   # First item
random_u01[10]  # Tenth item

# 2. Negative indexing (Excludes elements!)
random_u01[-1]  # Returns all elements EXCEPT the first

# 3. Vector indexing (Multiple elements)
random_u01[1:3]          # First three elements
random_u01[c(1, 3, 7)]   # Elements at positions 1, 3, and 7
```

---

# Relational Operators in R

## Asking Questions About Data
R uses standard relational operators to compare values. Applying them to a vector evaluates the condition element-by-element, returning a logical vector (`TRUE`/`FALSE`).

| Operator | Description | Example |
| :--- | :--- | :--- |
| `<` / `>` | Less than / Greater than | `x < y` |
| `<=` / `>=` | Less than or equal / Greater than or equal | `x >= y` |
| `==` | Exactly equal to | `x == y` |
| `!=` | Not equal to | `x != y` |

```r-26
# Comparing scalars
x <- 10
y <- 15
print(x < y) 

# Comparing vector elements
scores <- c(80, 95, 90)
print(scores >= 90)
```

---

# Vector Filtering & Logical Subsetting

## Extracting Elements with Boolean Conditions
We can pass a logical `TRUE`/`FALSE` vector inside the brackets `[]` to filter and return only the values where the condition is `TRUE`:

```r-29
# Daily revenues
revenues <- c(120, 150, 90, 200, 250, 300, 180)

# 1. Ask: Which elements exceed 180?
high_sales <- revenues > 180
print(high_sales) 

# 2. Subset matching values
print(revenues[high_sales])

# 3. Direct subsetting in one step
print(revenues[revenues > 180])
```

---

# Introduction to Data Frames & Tibbles

## Tabular Data Structure
In data analytics, we work with tabular datasets where **columns are variables** and **rows are observations**.
* **Data Frame (`data.frame`)**: The traditional base R representation of tabular data.
* **Tibble (`tibble`)**: A  user-friendly extension of the data frame provided by the `tidyverse`.
* Internally, a data frame/tibble is a **named list of vectors**, where each vector (column) has the exact same length!

```r-27
# Constructing a new tibble from scratch
library(tidyverse)
my_table <- tibble(
  student_id = c(101L, 102L, 103L),
  grade      = c(95, 88, 92)
)
print(my_table)
```

---

# Working with Tabular Data

## Accessing Columns as Vectors
Since a table is a collection of vectors, we use the **`$`** operator to extract a single column as a standalone vector:

```r-28
# Extract the 'hwy' (highway mileage) column from the built-in 'mpg' table
highway_miles <- mpg$hwy
print(mean(highway_miles)) # Calculate the average highway mileage
```

`mpg` is a built-in dataset included in `ggplot2`, a popular data visualization package that is part of the `tidyverse` ecosystem.

## Useful Table Inspection Functions
* **`glimpse(df)`**: View columns, data types, and a preview of the data.
* **`dim(df)`**: Returns the dimensions (rows and columns) of the table.
* **`colnames(df)`**: Lists all column names.
* **`head(df)`**: Displays the first 6 rows of the dataset.

---

# Functions in R

## What is a Function?
* A **function** is a reusable block of code that accepts inputs (**arguments**), processes them, and returns an output.
* Functions are the action oriented "verbs", while variables are the "nouns."

<pre>
# General structure:
output <- function_name(argument1, argument2)
</pre>

---

# Function Arguments: Positional vs. Named

You can pass arguments by **position** (order matters) or by **keyword/name** (order doesn't matter):

```r-12
# Positional arguments: x is 10, digits is 2
round(3.14159, 2)     # Output: 3.14

# Named arguments: order can be changed safely!
round(digits = 2, x = 3.14159) # Output: 3.14
```

---

# Custom Functions & Returns

## Defining Functions in R
Assign functions to variable names using `function()`, parameter lists, and curly braces `{ }`:

* **Explicit Return**: Using the `return()` function.
* **Implicit Return**: R automatically returns the value of the **last statement** evaluated inside the function body (the standard R idiom).
* **Parameter Defaults**: Provide fallback values (e.g., `discount = 0.10`).

```r-33
# Custom function with implicit return and default parameter
calculate_price <- function(price, discount = 0.10) {
  price * (1 - discount) # Last statement returned automatically
}

print(calculate_price(100))        # Uses default discount (0.10) -> 90
print(calculate_price(150, 0.20))  # Overrides default discount   -> 120
```

---

# Global vs. Local Environments

* **Global Environment**:
  - The default room or "active workspace" where your general scripting variables, loaded packages, and custom functions reside.
  - These variables persist throughout your R session.
* **Local Environment**:
  - A temporary, isolated "sandbox" created automatically whenever a function runs.
  - Variables created inside a function only exist within that function's execution and disappear immediately after, keeping your Global Environment clean!

```r-4
# Global variable (accessible across session)
tax_rate <- 0.05

calculate_total <- function(price) {
  # Local variable (exists ONLY inside this function)
  discount <- 10
  return((price - discount) * (1 + tax_rate))
}

calculate_total(100)  # Output: 94.5

# Trying to access 'discount' outside causes an error:
# print(discount) 
```

---

# Built-In Data Type Conversions

We frequently need to convert text to numeric values (or vice versa). R provides helper conversion functions prefixed with `as.`:

* **`as.numeric()`**: Converts to numeric decimals.
* **`as.integer()`**: Converts to integers.
* **`as.character()`**: Converts to text strings.
* **`as.logical()`**: Converts to logical values (`TRUE`/`FALSE`).

```r-14
raw_input <- "4.8"
clean_rating <- as.numeric(raw_input)
print(class(clean_rating)) # Output: "numeric"
```

---

# Common Math & Statistical Functions

## Element-Wise and Aggregate Summaries
R offers a huge suite of built-in functions for both element-wise calculations and whole-vector statistical summaries:

| Category | Function | Description | Example |
| :--- | :--- | :--- | :--- |
| **Math** | `abs(x)` / `sqrt(x)` | Absolute / Square root of `x` | `sqrt(16)` -> `4` |
| **Math** | `round(x, digits)` | Rounds `x` to specified decimal digits | `round(3.14, 1)` -> `3.1` |
| **Math** | `ceiling(x)` / `floor(x)` | Rounds `x` up / down to nearest integer | `ceiling(12.4)` -> `13` |
| **Stats** | `sum(x)` / `mean(x)` | Sum / Arithmetic average of a vector | `mean(c(1, 2, 3))` -> `2` |
| **Stats** | `median(x)` / `sd(x)` | Median (50th percentile) / Standard deviation | `median(c(1, 5, 9))` -> `5` |
| **Stats** | `min(x)` / `max(x)` | Minimum / Maximum value in vector | `max(c(10, 20, 5))` -> `20` |

```r-15
scores <- c(80, 95, 90, 100, 85)
print(mean(scores))        # Aggregate statistical summary: 90
print(round(sqrt(scores))) # Element-wise: 9 10 9 10 9
```

---

# Combining Strings: `paste()`

## Concatenating Character Text
When writing scripts, we often need to join multiple text elements together to display outputs. R's primary tool for this is the standard built-in **`paste()`** function:

* **`paste(..., sep = " ")`**: Combines elements separated by a space (default) or other custom delimiter.
* **`paste0(...)`**: A faster shortcut that joins elements with absolutely no separation space.

```r-19
first <- "Ann"
last  <- "Arbor"

print(paste(first, last))           # "Ann Arbor" (space separated)
print(paste(first, last, sep = "-")) # "Ann-Arbor" (dash separated)
print(paste0(first, last))          # "AnnArbor" (no separator)
```

> **Note**: R has a vast suite of text cleaning helpers (like `nchar()`, `tolower()`, or `trimws()`). To keep things focused, we will cover those in detail later in the **Strings** lesson!

---

# String Concat & Math

Let's practice variable assignments, type conversions, and pasting strings:

```r-21
# User inputs from a web form
user_first <- "John"
user_last  <- "Doe"
user_age   <- "25" # String type!

# 1. Convert age to integer
age_numeric <- as.integer(user_age)

# 2. Perform simple math (years until retirement)
years_to_retire <- 65L - age_numeric

# 3. Paste a personalized response message
greeting <- paste("Hello", user_first, user_last)
print(greeting) # Output: "Hello John Doe"

message <- paste0("You have ", years_to_retire, " years left until retirement.")
print(message)  # Output: "You have 40 years left until retirement."
```

---

# Control Statements: If - Conditional Block


### The `if` Statement Syntax
In R, conditions must be enclosed in **parentheses `( )`**, and the block of code to run must be enclosed in **curly braces `{ }`**.

```r-35
score <- 750

if (score >= 700) {
  print("Status: Approved")
}
```

---

# Multi-Way Conditionals: `else if` and `else`

To handle multiple branches, chain them together using `else if` and `else`:

```r-36
score <- 650

if (score >= 700) {
  print("Status: Approved")
} else if (score >= 600) {
  print("Status: Under Review")
} else {
  print("Status: Denied")
}
```

## Syntax Layout Constraint
In R, the `else` or `else if` keyword **must** be on the same line as the closing curly brace `}` of the preceding block:

```r
# Incorrect (This will throw a syntax error in R!):
# if (score >= 700) {
#   print("Approved")
# }
# else {
#   print("Denied")
# }
```

---

# Short-Circuiting Logical Operators (`&&` and `||`)

Inside `if` statements, use scalar **`&&`** (AND) and **`||`** (OR) instead of vector operators (`&` and `|`):

| Operator Name | Notation | Example | Result |
| :--- | :--- | :--- | :--- |
| **Logical AND** | `&&` | `9 > 8 && 5 > 4` | `TRUE` (both must be TRUE) |
| **Logical OR** | `\|\|` | `8 > 9 \|\| 5 > 4` | `TRUE` (at least one must be TRUE) |

### Short-Circuit Evaluation
R evaluates expressions from left to right and stops as soon as the final result is determined:
* **`&&` stops at the first `FALSE`**: Skips evaluating the right side.
* **`||` stops at the first `TRUE`**: Skips evaluating the right side.

```r-37
x <- 0

# This is safe because !is.null(x) evaluates to FALSE.
# R "short-circuits" and never evaluates x > 0
if (!is.null(x) && 10 / x) {
  print("x is a positive number")
}
```

---

# Scalar vs. Vectorized Safety in `if` Statements

## Vector Operations (`&` / `|`) vs. Scalar Control Flow (`&&` / `||`)
* **Vector Operations (`&` and `|`)**: Evaluate element-by-element across vectors, returning a logical vector.
* **Scalar Operators (`&&` and `||`)**: Evaluate a single `TRUE`/`FALSE` and short-circuit.
* Passing a vector of length > 1 into an `if` statement causes an error in R!

```r-38
# 1. Vector Operation: Element-wise evaluation with '&' and '|'
scores <- c(75, 92, 85, 58)
passed_and_honors <- scores >= 60 & scores >= 90
print(passed_and_honors) # Output: FALSE  TRUE FALSE FALSE

# Vector filtering with '&'
filtered_scores <- scores[scores >= 60 & scores < 90]
print(filtered_scores)   # Output: 75 85

# if(filtered_scores > 60){
#  print("pass");
# }
```

---

# Inline Conditionals: `ifelse()` vs. `if_else()`

For simple conditional assignments across vectors, writing a full multi-line `if/else` block can be verbose.

### Base R: `ifelse()`
The built-in `ifelse(test, yes, no)` evaluates a test condition, returning the `yes` value if `TRUE` and the `no` value if `FALSE`:

```r-39
score <- 550
status <- ifelse(score >= 600, 100, "Fail")
print(status) # "Fail"
```

### Tidyverse: `dplyr::if_else()`
The `dplyr` package provides a stricter alternative called `if_else(condition, true, false, missing = NULL)`:

```r-40
library(dplyr)
score <- 650
status <- if_else(score > 600, "large", "small")
print(status)
```

> **Strict Type-Safety**: Unlike base `ifelse()`, the `true` and `false` arguments of `dplyr::if_else()` **must return the exact same data type**, and `missing` specifies what to return on `NA`.

---

# Packages, CRAN, & Installing/Loading

## What is a Package?
* A **package** is an add-on bundle containing curated R functions, documentation, and sample datasets.
* R's strength lies in its modularity—there are over 20,000 packages available on **CRAN** (the Comprehensive R Archive Network).

## Installing vs. Loading
* **`install.packages("name")`**: Downloads the bundle from CRAN to your hard drive. Run **once** per computer (requires quotes).
* **`library(name)`**: Loads the package from your hard drive into R's active memory. Run in **every single script** where needed (quotes optional).

```r-22
# Do once:
# install.packages("dplyr")

# Do in every script:
library(dplyr)
```

---

# Namespace Resolution with the `::` Operator

Sometimes two packages contain functions with the exact same name (e.g., `dplyr::filter` vs `stats::filter`). This is called a **namespace conflict**.

You can call a function directly from a package's namespace using the double-colon **`::`** operator.

Note, however that R resolves function name conflicts by prioritizing the package that was loaded most recently. Because dplyr was loaded after the stats package in this case, simply calling filter() will automatically run the dplyr version.

```r-23
# Call filter function directly from the dplyr package namespace safely
library(tidyverse)
audi_records <- dplyr::filter(mpg, manufacturer > 'audi')
audi_records
```

---

# Core Packages: The Tidyverse Suite

Data analysts rely on the **Tidyverse**, an integrated collection of packages designed for data science:

| Package | Purpose | Key Functions |
| :--- | :--- | :--- |
| **dplyr** | Grammar of data manipulation | `filter()`, `select()`, `mutate()`, `summarize()` |
| **ggplot2** | Grammar of graphics / visualization | `ggplot()`, `geom_point()`, `geom_col()` |
| **tidyr** | Cleaning and reshaping data structure | `pivot_longer()`, `pivot_wider()`, `drop_na()` |
| **stringr** | Cleaning character text | `str_detect()`, `str_replace()` |
| **lubridate** | Parsing dates and times | `ymd()`, `hms()`, `now()` |
