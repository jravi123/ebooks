# Advanced dplyr & Custom Functions
## Data Parsing, Categorization, Missing Data, and more Functions

---
# Lecture Agenda & Topics

In this module, we transition from built-in aggregations to writing custom data transformations and miniature programs in R.

Today we will cover:
* **String-to-Number Parsing**: Extracting numeric values from messy text using `parse_number()`.
* **Discretizing Continuous Variables**: Binning and labeling ranges with `cut()`.
* **More Missing Data Handling**: Working with `na.omit()`, `is.na()`, and missingness diagnostics.
* **Statistical Transformations**: Implementing $Z$-scores, IQR scaling, and Skewness.
* **Higher-Order Functions**: Passing functions as arguments to other functions.

---
# Extracting Numbers from Text: `parse_number()`

Real-world data logs often mix numbers with currency signs, commas, or percentage symbols. **`parse_number()`** discards all non-numeric characters and extracts the clean number:

```r
library(tidyverse)

# Character vector with currency, symbols, and percentages
x <- c("$1,234", "USD 3,513", "59%", "Item #42")
parse_number(x)
```

`parse_number()` automatically handles thousands separators (like `,`) and floating decimals, making it ideal for cleaning scraped or imported text columns.

---
# Flight Delay Problem Solving: Monthly Extremes

Which 3 months have the highest average departure delay in the NYC flights dataset?

```r
library(tidyverse)
library(nycflights13)

# Calculating monthly mean departure delay
flights |>
  filter(!is.na(dep_delay)) |>
  group_by(month) |>
  summarize(
    mean_delay1 = mean(dep_delay),
    mean_delay2 = sum(dep_delay) / n(),
    total_flights = n(),
    .groups = "drop"
  ) |>
  slice_max(mean_delay1, n = 3, with_ties = FALSE)
  slice_max(mean_delay2, n = 3, with_ties = FALSE)
```

Notice that `sum(dep_delay) / n()` and `mean(dep_delay)` yield the exact same arithmetic result when missing values are filtered out.

---
# Discretizing Continuous Variables: `cut()`

When you need to convert a continuous numeric variable into discrete categories or bins, use **`cut()`**:

```r
library(tidyverse)

x <- c(1, 2, 5, 6, 10, 14, 15, 20)

# Bin values into intervals (0, 5], (5, 10], (10, 15], (15, 20]
cut(x, breaks = c(0, 5, 10, 15, 20))
```

### Adding Custom Labels:
```r
library(tidyverse)

x <- c(1, 2, 5, 6, 10, 14, 15, 20)

# Assign readable category names to each interval
cut(
  x,
  breaks = c(0, 5, 10, 15, 20),
  labels = c("Small", "Medium", "Large", "Extra Large")
)
```

---
# Grading Example with `cut()` and `mutate()`

We can use `cut()` inside `mutate()` to create category columns based on numeric ranges:

```r
library(tidyverse)

scores <- tibble(
  student = c("Alice", "Bob", "Charlie", "David", "Emily", "Frank"),
  score = c(75, 92, 68, 85, 50, 98)
)

# Mark scores > 70 as Pass, <= 70 as Fail
scores |>
  mutate(grade = cut(score, breaks = c(0, 70, 100), labels = c("Fail", "Pass")))
```

---
# Handling Missing Values: `na.omit()` vs. `is.na()`

R provides several tools to inspect and filter missing entries:

```r
library(tidyverse)

# Sample table with missing data
x <- tibble(
  col1 = c(1:5, NA),
  col2 = c(10:13, NA, NA)
)

print(x)
```

### Dropping Incomplete Rows:
```r
library(tidyverse)

x <- tibble(
  col1 = c(1:5, NA),
  col2 = c(10:13, NA, NA)
)

# na.omit on the entire table removes any row containing NA
na.omit(x)

# na.omit on a single vector
na.omit(x$col2)

# Finding mean after omitting NAs
mean(na.omit(x$col2))
```

---
# Identifying Cancelled Flights

In flight tracking datasets, a flight with a missing departure time (`dep_time`) represents a cancelled flight:

```r
library(tidyverse)
library(nycflights13)

# Filter for all cancelled flights
flights |>
  filter(is.na(dep_time)) |>
  select(year, month, day, sched_dep_time, dep_time, carrier, flight) |>
  head(4)
```

---

### Flight Cancellation Rate Over the Day:
```r
library(tidyverse)
library(nycflights13)

# Proportion of flights cancelled by scheduled departure hour
flights |>
  group_by(hour = sched_dep_time %/% 100) |>
  summarize(
    prop_cancelled = mean(is.na(dep_time)),
    n = n(),
    .groups = "drop"
  ) |>
  filter(hour >= 5 & hour <= 22) |>
  ggplot(aes(x = hour, y = prop_cancelled)) +
  geom_line(color = "steelblue", linewidth = 1) +
  geom_point(aes(size = n), color = "darkblue") +
  labs(title = "Flight Cancellation Rate by Hour of Day", y = "Proportion Cancelled")
```

---
# User-Defined Functions: Miniature Programs

Functions allow you to reuse steps across different variables, datasets, and pipelines:

```r
# General syntax for creating a function
function_name <- function(required_arg, optional_arg = 10) {
  # Calculations
  result <- required_arg * optional_arg
  return(result)
}
```

> [!NOTE] Return Values
> In R, the value of the last evaluated expression is automatically returned, even if `return()` is omitted.

---
# Writing a Custom $Z$-Score Function (Recap)

A standard $Z$-score measures how many standard deviations an observation lies from the sample mean:

$$Z = \frac{x - \bar{x}}{s}$$

```r
library(tidyverse)

# Define custom z-score function
z_score <- function(input) {
  (input - mean(input, na.rm = TRUE)) / sd(input, na.rm = TRUE)
}

# Test on a numeric vector
test_vals <- c(10, 20, 30, 40, 50)
z_score(test_vals)
```

---
# Computing Correlation with Custom Functions

The sample correlation coefficient $r_{xy}$ is the average product of the standardized $Z$-scores:

$$r_{xy} = \frac{1}{n - 1} \sum_{i=1}^n \left( \frac{x_i - \bar{x}}{s_x} \right) \left( \frac{y_i - \bar{y}}{s_y} \right)$$

```r
library(tidyverse)

# Sample dataset
set.seed(42)
aatemp <- tibble(
  TMAX = rnorm(100, mean = 60, sd = 15),
  TMIN = rnorm(100, mean = 40, sd = 12)
)

z_score <- function(input) {
  (input - mean(input, na.rm = TRUE)) / sd(input, na.rm = TRUE)
}

# Compute correlation manually using z_score
aatemp |>
  mutate(
    zx = z_score(TMAX),
    zy = z_score(TMIN),
    zz = zx * zy
  ) |>
  summarize(r_manual = sum(zz) / (n() - 1), r_builtin = cor(TMAX, TMIN))
```

---
# Robust Scaling: Median and IQR Scaling

When data contains outliers, centering by the median and scaling by the Interquartile Range (IQR) provides a robust alternative to $Z$-scores:

$$\text{Scale}_{\text{IQR}}(x) = \frac{x - \text{median}(x)}{\text{IQR}(x)}$$

```r
library(tidyverse)

scale_IQR <- function(x) {
  (x - median(x, na.rm = TRUE)) / IQR(x, na.rm = TRUE)
}

# Apply inside mutate
mpg |>
  select(manufacturer, model, cty, hwy) |>
  mutate(
    cty_iqr_scaled = scale_IQR(cty),
    hwy_iqr_scaled = scale_IQR(hwy)
  ) |>
  head(4)
```

---
# Applying Custom Functions with `across()`

Instead of manually writing out transformations for every column, use **`across()`**:

```r
library(tidyverse)

scale_IQR <- function(x) {
  (x - median(x, na.rm = TRUE)) / IQR(x, na.rm = TRUE)
}

# Apply scale_IQR across multiple columns simultaneously
mpg |>
  mutate(across(c(cty, hwy), scale_IQR, .names = "{col}_scaled")) |>
  select(manufacturer, model, cty, cty_scaled, hwy, hwy_scaled) |>
  head(3)
```

---
# Custom Summary Functions: Coefficient of Skewness

The sample **coefficient of skewness** measures asymmetry around the mean:

$$\text{Skew} = \frac{\frac{1}{n} \sum (x_i - \bar{x})^3}{s^3}$$

```r
library(tidyverse)

# Define skewness function
skewness <- function(x) {
  mean((x - mean(x, na.rm = TRUE))^3, na.rm = TRUE) / (sd(x, na.rm = TRUE)^3)
}

# Calculate skewness across numeric variables in mpg
mpg |>
  summarize(across(c(displ, cty, hwy), skewness))
```

---
# Functions with Multiple Return Values

An R function returns one object, but that object can be a vector, list, or tibble:

```r
library(tidyverse)

# 1. Returning a vector (first and last elements)
first_and_last <- function(x) {
  c(first = x[1], last = x[length(x)])
}
first_and_last(LETTERS)

# 2. Returning a named list
summary_stats <- function(x) {
  list(mean = mean(x), iqr = IQR(x), range = range(x))
}
res <- summary_stats(c(10, 20, 30, 40, 50))
res$mean
res$iqr

# 3. Returning a structured tibble
index_table <- function(x) {
  tibble(position = seq_along(x), value = x)
}
index_table(c("Alpha", "Beta", "Gamma"))
```

---
# Predicate Functions & `where()` Selection

A **predicate** is a function that takes an input and returns a single `TRUE` or `FALSE`:

```r
library(tidyverse)

# Custom predicate: check if a column has zero missing values
no_missing <- function(x) {
  !any(is.na(x))
}

# Test predicate
no_missing(c(1, 2, 3))    # TRUE
no_missing(c(1, NA, 3))   # FALSE
```

### Using Predicates in `select()`:
```r
library(tidyverse)

# Select only columns in airquality that contain no NA values
airquality |>
  select(where(no_missing)) |>
  head(3)
```

---
# Functions with Optional & Default Arguments

You can specify default values in function definitions so arguments are optional:

```r
library(tidyverse)

mult_factor <- function(x, factor = 1) {
  x * factor
}

mult_factor(10)            # Uses default factor = 1 -> Output: 10
mult_factor(10, factor = 3) # Uses explicit factor = 3 -> Output: 30
```

### Using Anonymous Lambda Functions:
In modern R, you can pass short inline anonymous functions using `\(x)` syntax:
```r
library(tidyverse)

# Multiply columns by 2 using an inline lambda
mpg |>
  mutate(across(c(cty, hwy), \(x) x * 2, .names = "{col}_doubled")) |>
  select(cty, cty_doubled, hwy, hwy_doubled) |>
  head(3)
```

---
# Higher-Order Functions: Functions as Arguments

A **higher-order function** accepts another function as an input argument:

```r
library(tidyverse)

# center() takes a centering function 'f' as an argument (defaults to mean)
center_by <- function(x, f = mean) {
  x - f(x, na.rm = TRUE)
}

test_vals <- c(10, 20, 30, 100)

# Mean-centering
center_by(test_vals, mean)

# Median-centering
center_by(test_vals, median)
```

Higher-order functions allow you to write reusable algorithms where the user specifies the exact mathematical strategy.

---
# Module Summary & Key Takeaways

1. **`parse_number()`**: Drops currency, commas, and formatting text to extract numeric values.
2. **`cut()`**: Bins continuous numeric ranges into labeled categorical factors.
3. **Missingness Proportions**: Calculate cancellation or error rates using `mean(is.na(x))`.
4. **Custom Functions**: Encapsulate repetitive calculations into clean, reusable functions.
5. **`across()`**: Vectorize function application across multiple columns with named prefixes or suffixes.
6. **Predicates & `where()`**: Dynamically filter columns using boolean test functions.
