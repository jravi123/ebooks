# Window Functions & Advanced Custom Functions

## Why Learn Advanced Transformations in Exploratory Data Analysis?

Sometimes you need to compare observations not against an aggregate summary, but against neighboring observations or custom business rules.

Imagine you are analyzing stock prices over a 12-month period:
* You want to calculate the price change from **yesterday** to **today**. To do this, you must shift your columns vertically to align successive dates.
* You want to identify the top 3 highest-valued stock days. You must rank the rows in order, handling instances where two days have the exact same price.
* You want to categorize numerical scores into grade tiers, cleanly extract numeric values from messy text string logs, or select columns that meet custom logical criteria.

In `dplyr`, we achieve this using **Window Functions** and **Custom User-Defined Functions**. Unlike aggregate functions (which collapse many rows into one), window functions take $N$ values and return $N$ values, maintaining the table's original height. Let's learn how to sort, relocate, rank, lag, and extend R's capabilities with custom-designed operations.

---

## 1. Sorting Rows: `arrange()`

`arrange()` reorders the rows of a table based on values in one or more columns. By default, it sorts in **ascending** order. Wrap the column in `desc()` to sort in **descending** order.

```r
library(tidyverse)

# Sort cars by highway mileage (ascending)
sorted_hwy <- mpg |> arrange(hwy)

# Sort cars by displacement (descending)
sorted_displ <- mpg |> arrange(desc(displ))

# Sort by manufacturer (alphabetical), then by hwy mileage (highest first)
complex_sort <- mpg |> arrange(manufacturer, desc(hwy))
```

---

## 2. Reordering and Renaming Columns: `relocate()` and `rename()`

To make tables more readable in reports or console views, we use two highly intuitive structural verbs:

### Moving Columns: `relocate()`
Use `relocate()` to shift columns to the front, or position them relative to other variables using `.before` or `.after`:

```r
# Move 'class' and 'hwy' to the very beginning of the table
mpg |> relocate(class, hwy)

# Move 'displ' to immediately follow 'manufacturer'
mpg |> relocate(displ, .after = manufacturer)
```

### Renaming Columns: `rename()`
To rename columns, use the syntax `rename(new_name = old_name)`:

```r
# Rename hwy to highway_mpg
mpg |> rename(highway_mpg = hwy)
```

---

## 3. Ranking Functions: `min_rank()`, `dense_rank()`, and `row_number()`

Ranking functions assign integers representing ordering positions to values in a vector. R provides different ranking options to handle duplicate values (ties):

* **`min_rank()`**: Standard competitive ranking (e.g., 1st, 1st, 3rd—skips a rank for ties). This is the default competitive rank.
* **`dense_rank()`**: Dense ranking (e.g., 1st, 1st, 2nd—no gaps in rank numbers).
* **`row_number()`**: Assigns a sequential row index (ties are ordered arbitrarily based on their physical row sequence).

```r
# Illustrating tie handling
scores <- c(90, 90, 80, 70)

print(min_rank(desc(scores)))   # Output: 1 1 3 4 (Standard)
print(dense_rank(desc(scores))) # Output: 1 1 2 3 (Dense)
print(row_number(desc(scores))) # Output: 1 2 3 4 (Arbitrary tie breaker)
```

We can combine ranking with `filter()` to extract top items within a dataset:

```r
# Find the top 3 most fuel-efficient cars in the dataset
mpg |>
  mutate(rank = min_rank(desc(hwy))) |>
  filter(rank <= 3) |>
  arrange(rank)
```

---

## 4. Shifts and Offsets: `lead()` and `lag()`

To compare a value in a row with values in preceding or succeeding rows (highly common in time-series stock tracking or daily weather changes):

* **`lag(x, n)`**: Shifts elements **down**, returning the value `n` steps before (default is 1). The first element becomes `NA`.
* **`lead(x, n)`**: Shifts elements **up**, returning the value `n` steps after. The last element becomes `NA`.

```r
values <- c(10, 15, 20, 25)

print(lag(values))  # Output: NA 10 15 20
print(lead(values)) # Output: 15 20 25 NA
```

---

## 5. Cumulative Summaries

Cumulative functions compute running statistics along a sequence:
* **`cumsum(x)`**: Running total sum.
* **`cummean(x)`**: Running average.
* **`cummax(x)`** / `cummin(x)`: Running limits.

```r
sales <- c(100, 150, 200)
print(cumsum(sales)) # Output: 100 250 450
```

---

## 6. Parsing Numeric Data: `parse_number()`

Messy datasets often mix numbers with unit characters, currency symbols, or string labels (e.g., `"$1,234"`, `"59%"`, or `"USD 3,513"`). To extract the bare numeric values, use the versatile **`parse_number()`** function:

```r
# Extract numbers from raw character string lists
dirty_strings <- c("$1,234", "USD 3,513", "59%")

clean_numbers <- parse_number(dirty_strings)
print(clean_numbers) # Output: 1234 3513 59
```

`parse_number()` ignores leading and trailing non-numeric characters, parses grouping decimals and thousands separators correctly, and returns a clean numeric vector ready for mathematical operations.

---

## 7. Categorizing Continuous Data: `cut()`

A common analytical task is categorizing continuous variables into discrete groupings or tiers. The **`cut()`** function divides a continuous vector into intervals (bins) based on custom cut points (breaks):

```r
# Vector of values to group
x <- c(1, 2, 5, 6, 10, 14, 15, 20)

# Cut into intervals: (0,5], (5,10], (10,15], (15,20]
cut(x, breaks = c(0, 5, 10, 15, 20))
```

By default, the resulting intervals are mathematical notation (open on the left, closed on the right, e.g., `(0, 5]`). You can assign readable character labels to each bin using the `labels` parameter:

```r
# Assign labels to the bins
cut(x, 
    breaks = c(0, 5, 10, 15, 20), 
    labels = c("Small", "Medium", "Large", "Extra Large")
)
```

### Case Study: Grouping Test Scores
Let's apply `cut()` inside a pipeline to convert numerical student grades into categorical Pass/Fail outcomes (using 70 as the boundary):

```r
scores <- tibble(
  student = c("Alice", "Bob", "Charlie", "David", "Emily", "Frank"),
  score = c(75, 92, 68, 85, 50, 98)
)

# Mutate a new categorical grade column
scores |>
  mutate(grade = cut(score, 
                     breaks = c(0, 70, 100), 
                     labels = c("Fail", "Pass")))
```

---

## 8. Advanced Missing Value Filtering: `na.omit()`

In the previous chapters, we learned how to remove rows containing missing values from a specific column using `filter(!is.na(column_name))`. If you want to drop rows that contain **any** `NA` values across the entire dataset, you can use **`na.omit()`**:

```r
# Create a test tibble with scattered missing values
x_table <- tibble(
  col1 = c(1:10, NA),
  col2 = c(10:15, NA, NA, NA, NA, NA)
)

# Remove any row that contains at least one NA in any column
na.omit(x_table)
```

You can also apply `na.omit()` to a specific vector to extract only its non-missing elements:
```r
# Pull col2 and extract only non-missing values
clean_vector <- na.omit(x_table$col2)
print(clean_vector) # Output: 10 11 12 13 14 15

# Calculate the mean of non-missing values
mean(na.omit(x_table$col2)) # Equivalent to mean(x_table$col2, na.rm = TRUE)
```

---

## 9. Custom Functions: Writing Your Own Data Wranglers

Writing custom functions allows you to wrap complex calculations into clean, reusable blocks. This enforces code modularity, eliminates copy-paste redundancies, and makes pipelines more readable.

### Defining custom functions in R follows this syntax:
```r
function_name <- function(argument_1, argument_2 = default_value) {
  # Perform calculations inside the function body
  result <- (argument_1 + argument_2)
  
  # Return the final value
  return(result)
}
```
*Note*: R functions automatically return the value of the last evaluated expression, but using `return()` explicitly is highly recommended for clarity.

---

### Case Study: Manual Z-Score and Correlation

Let's write a custom function to calculate the $Z$-score of a vector. A $Z$-score (standard score) measures how many standard deviations a value is from the mean:
$$Z = \frac{x - \bar{x}}{s}$$

```r
# Declare standardizing Z-score function
z_score <- function(input_vector) {
  (input_vector - mean(input_vector, na.rm = TRUE)) / sd(input_vector, na.rm = TRUE)
}

# Test our function
test_vector <- c(-1, 2, 1.1)
z_score(test_vector)
```

#### Computing Correlation Manually
The correlation coefficient ($r_{xy}$) can be expressed as the average product of $Z$-scores:
$$r_{xy} = \frac{1}{n - 1} \sum_{i=1}^n \left(\frac{x_i - \bar{x}}{s_x}\right) \left(\frac{y_i - \bar{y}}{s_y}\right)$$

By utilizing our custom `z_score()` function, we can calculate this manually on Ann Arbor temperature data (`aatemp`) and verify against R's built-in `cor()` function:

```r
# Calculate manual correlation using our custom function inside mutate
aatemp |>
  mutate(
    zx = z_score(TMAX),
    zy = z_score(TMIN),
    zz = zx * zy
  ) |>
  summarize(r_manual = sum(zz) / (n() - 1))

# Verify using built-in cor()
aatemp |>
  summarize(r_builtin = cor(TMAX, TMIN, use = "complete.obs"))
```

---

### Case Study: IQR Scaling and Outliers
Suppose we want to scale values relative to their Interquartile Range (IQR) to identify outliers. We define a scaling function and use it inside a grouped mutation to plot seasonal anomalies:

```r
# Scale values by IQR distance from the median
scale_IQR <- function(x) {
  (x - median(x, na.rm = TRUE)) / IQR(x, na.rm = TRUE)
}

# Apply locally within year cohorts and visualize distributions
aatemp |>
  group_by(year = year(DATE)) |>
  mutate(TMAX_scaled = scale_IQR(TMAX)) |>
  ggplot(aes(x = factor(year), y = TMAX_scaled)) +
  geom_violin() +
  labs(title = "Annual IQR-Scaled Temperature Distributions")
```

---

## 10. Applying Custom Functions inside `across()`

In the previous chapter, we introduced `across()` for multi-column summaries. We can pass our custom functions directly into `across()` to evaluate custom metrics across several columns at once.

### Case Study: Calculating the Coefficient of Skewness
Skewness measures the asymmetry of a probability distribution around its mean. The sample coefficient of skewness is given by:
$$\text{Skewness} = \frac{\frac{1}{n}\sum(X_i - \bar{X})^3}{\sigma^3}$$

Let's write a custom skewness function and calculate it simultaneously for both maximum and minimum daily temperatures:

```r
# Custom skewness function
skewness <- function(x) {
  clean_x <- na.omit(x)
  n <- length(clean_x)
  mean((clean_x - mean(clean_x))^3) / (sd(clean_x)^3)
}

# Summarize multiple columns using skewness inside across
aatemp |>
  summarize(across(c(TMAX, TMIN), skewness))
```

---

## 11. Diverse Return Objects: Vectors, Lists, and Tibbles

R functions can return at most **one** object. However, that single object can be a complex collection like a vector, a list, or an entire tibble, allowing you to return multiple related outputs at once:

```r
# A. Return a vector (combining first and last elements)
first_last <- function(x) {
  c(x[1], x[length(x)])
}
first_last(LETTERS) # Output: "A" "Z"

# B. Return a list (containing multiple classes/shapes of data)
mean_range <- function(x) {
  list(
    mean = mean(x, na.rm = TRUE),
    range = range(x, na.rm = TRUE)
  )
}
mr_results <- mean_range(rnorm(100))
mr_results$mean
mr_results$range

# C. Return an entire structured tibble
numbered_table <- function(character_vector) {
  tibble(
    index = seq_along(character_vector),
    value = character_vector
  )
}
numbered_table(letters[1:5])
```

---

## 12. Predicates & Selecting Columns with Custom Rules

A **predicate function** is a function that takes an input and returns a single `TRUE` or `FALSE` value. Examples of built-in predicate functions include `is.numeric()` and `is.character()`.

We can write our own predicate functions and combine them with `where()` inside `select()` to pull columns that meet custom constraints:

```r
# Declare custom predicate checking if a column is entirely free of missing values
no_missing <- function(column_vector) {
  !any(is.na(column_vector))
}

# Select only columns that do not contain a single missing value
aatemp |>
  select(where(no_missing)) |>
  colnames()
```

---

## 13. Functions with Optional Arguments

We can make our custom functions highly versatile by defining arguments with default values. If the user does not specify a value for that argument, R automatically falls back to the default:

```r
# Custom multiplier function with a default of 1
multiply_by <- function(x, multiplier = 1) {
  x * multiplier
}

# Test basic behaviors
multiply_by(10)     # Output: 10 (multiplier defaults to 1)
multiply_by(10, 2)  # Output: 20 (multiplier overridden to 2)

# Apply inside a mutate pipeline
aatemp |>
  mutate(
    TMAX_original = TMAX,
    TMAX_doubled = multiply_by(TMAX, 2)
  ) |>
  select(TMAX_original, TMAX_doubled) |>
  head(3)
```

---

## Hands-on Exercises

### Exercise 1: Finding the Most Fuel-Intense Fleet Tiers
**Which vehicle manufacturer lineup has the lowest recorded city fuel mileage, and how do we isolate these models to evaluate their specific efficiency metrics?**

*Analytical Guidance*:
Sort and filter the `mpg` dataset to analyze the bottom-performing vehicle models. Your analysis should:
1. Sort the records in ascending order of city mileage (`cty`).
2. Retain only the manufacturer name, model name, and city mileage columns.
3. Extract and display the first 5 records to pinpoint the models with the absolute lowest city fuel efficiency.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

mpg |>
  arrange(cty) |>
  select(manufacturer, model, cty) |>
  head(5)
```
</details>

---

### Exercise 2: Segmenting Top-Performers by Brand
**Which specific vehicle model represents the pinnacle of highway fuel efficiency for each automotive manufacturer in our dataset, and how do these brand leaders compare?**

*Analytical Guidance*:
Rank and isolate the single most fuel-efficient highway vehicle for each unique manufacturer in the `mpg` dataset. Your analysis should:
1. Segment the vehicles by manufacturer.
2. Calculate a highway performance rank column `hwy_rank` using competitive ranking (`min_rank()`) in descending order (highest highway mileage gets rank 1).
3. Filter the records to keep only the top rank (`hwy_rank == 1`) for each brand.
4. Relocate the ranking and highway efficiency columns to the front of the table for easy comparison.
5. Release the grouping constraints and return the final table.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

mpg |>
  group_by(manufacturer) |>
  mutate(hwy_rank = min_rank(desc(hwy))) |>
  filter(hwy_rank == 1) |>
  relocate(hwy_rank, hwy) |>
  ungroup()
```
</details>

---

### Exercise 3: Custom Scaling Operations
**How do daily temperature distributions behave when centered around their median and normalized by their interquartile range (IQR), and how can we write a custom function to calculate this?**

*Analytical Guidance*:
Create a custom normalization function to standardize daily temperatures in the `aatemp` dataset. Your analysis should:
1. Write a custom function named `scale_IQR` that takes a numeric vector, subtracts its median, and divides by its Interquartile Range (`IQR()`). Ensure the function is robust to missing values.
2. Apply this custom function inside a mutation on `aatemp` to calculate a new column named `TMAX_scale_IQR` from maximum temperatures.
3. Render a violin plot of this new standardized metric grouped by calendar year to visualize distribution stability over time.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# 1. Custom function
scale_IQR <- function(x) {
  (x - median(x, na.rm = TRUE)) / IQR(x, na.rm = TRUE)
}

# 2. Mutate and plot pipeline
aatemp |>
  mutate(TMAX_scale_IQR = scale_IQR(TMAX)) |>
  ggplot(aes(x = factor(year(DATE)), y = TMAX_scale_IQR)) +
  geom_violin() +
  labs(x = "Year", y = "IQR-Scaled Max Temperature", title = "Standardized Temperature Over Time")
```
</details>

---

### Exercise 4: Custom Higher-Order Centering
**How can we write a flexible, higher-order mathematical centering function that lets us center a vector of numeric values using either its mean or median dynamically based on a user-provided functional argument?**

*Analytical Guidance*:
Write a flexible custom higher-order function that takes another function as an argument. Your analysis should:
1. Write a function named `center` that accepts a numeric vector `x` and a functional argument `f` (which defaults to `mean`).
2. Inside the function body, calculate and return:
   $$x - f(x)$$
3. Test your centering function on the provided vector `myvec`:
   * Center using the default argument (mean).
   * Center explicitly passing `mean`.
   * Center explicitly passing the `median` function.

```r
myvec <- c(203404, 292, 1010, 3, -10930, 39)
```

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
myvec <- c(203404, 292, 1010, 3, -10930, 39)

# 1. Custom higher-order function
center <- function(x, f = mean) {
  x - f(x)
}

# 2. Testing evaluations
center(myvec)            # Mean-centered (default)
center(myvec, f = mean)   # Mean-centered (explicit)
center(myvec, f = median) # Median-centered
```
</details>
