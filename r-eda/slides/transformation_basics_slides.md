# Data Transformation Basics: Select, Filter, & Mutate

---
#  Lecture Agenda & Topics

Tabular data is rarely clean or formatted for analysis. Data transformation is the deliberate reshaping of rows and columns to reveal relationships.

Today we will cover:
* **Column Extraction**: Accessing columns using standard `$` vs. `pull()`.
* **Testing and Converting Types**: The `is.*` and `as.*` functions.
* **Row Selection & Deduplication**: Old-school indexing, `filter()`, and `distinct()`.
* **The Core Verbs**: Picking variables (`select()`), sifting cases (`filter()`), and computing features (`mutate()`).
* **Feature Scaling & Column Dropping**: Rescaling, Z-scores, and `NULL` column removal.
* **The Tricky Logical Trap**: Why `cyl == 4 | 5` crashes your filter, and how `%in%` saves it.
* **Conditional Vector Evaluation**: Type-safe if-then-else columns with `if_else()`.

---
#  Conceptual Foundations of Tabular Data

To manipulate tables effectively, we must first understand how R structures data under the hood.

Tabular data is represented as a collection of variables (columns) and observations (rows). In R:
* A table is conceptually a **list** of individual vectors.
* Each vector in the list represents a single column.
* Every vector in the list **must** have the exact same length (the number of rows).

Understanding this list-of-vectors design is key to understanding why `dplyr` verbs operate the way they do!

```r
library(tidyverse)
summary(mpg)
```

---
#  Tables as Lists of Vectors

Let's build a manual data table from scratch using R's primitive list structure:

```r
library(tidyverse)

# Create column vectors of length 5
ids <- 101:105
names <- c("Alice", "Bob", "Charlie", "David", "Eva")
active <- c(TRUE, FALSE, TRUE, TRUE, FALSE)

# Group them into a list
manual_table <- list(id = ids, name = names, status = active)
print(manual_table)
```

Notice that R prints this as a list of distinct vectors, not a grid. We need a proper table class to force R to treat it as a grid.

---
#  The Strictness of the Tibble

In base R, lists of equal-length vectors are wrapped in a standard `data.frame`. In the Tidyverse, we use a refined, stricter version called a **`tibble`**.

### Why standard `data.frame` can be dangerous:
If you pass vectors of unequal lengths to `data.frame()`, it quietly recycles (repeats) the shorter vector, introducing silent data bugs:

```r
# data.frame quietly repeats "A", "B" to match length 4:
data.frame(x = 1:4, y = c("A", "B"))
#   x y
# 1 1 A
# 2 2 B
# 3 3 A  <-- silently duplicated!
# 4 4 B

# tibble throws an immediate, protective error:
tibble(x = 1:4, y = c("A", "B"))
# Error: Tibble columns must have size 4 or 1. Column `y` has size 2.
```

### Why `tibble` is superior:
1. **No silent recycling**: Fails fast if column lengths do not match (only recycling scalar length-1 values).
2. **Optimized console printing**: Displays column types (`<int>`, `<chr>`) and prints only the first 10 rows.

---
#  Code Comparison: instantiating Tibbles

Let's convert our manual list into both a standard `data.frame` and a `tibble`:

```r
# Convert manual list to data.frame
df_version <- as.data.frame(manual_table)
print(df_version)

# Convert to modern tidyverse tibble
tibble_version <- as_tibble(manual_table)
print(tibble_version)
```

* **Observation**: Notice how the tibble output explicitly annotates each column's type (`<int>`, `<chr>`, `<lgl>`) directly below the column name, giving you immediate diagnostic insight.

---
#  Column Extraction: `$`, `[[ ]]`, vs. `pull()`

Frequently, you need to extract a single column out of a data frame to use as a bare vector. R provides three main extraction operators:

* **The Dollar Operator (`$`)**: `df$column_name`. Quickest, but requires typing out the literal name.
* **The Double Bracket (`[[ ]]`)**: `df[["column_name"]]` or `df[[1]]`. Useful when the column name is stored as a character string inside a variable.
* **The Tidyverse Pull (`pull()`)**: `pull(df, column_name)`. Convenient to use within pipelines.

---
#  Interactive Code Example: Extraction

Let's compare these extraction methods side by side:

```r
# 1. Base R Dollar Sign
vec_dollar <- tibble_version$name

# 2. Base R Double Brackets
target <- "name"
vec_brackets <- tibble_version[[target]]

# 3. Tidyverse pull()
tibble_version |> pull(name) -> vec_pull

# Verify all are identical vectors
identical(vec_dollar, vec_brackets) # Output: TRUE
identical(vec_dollar, vec_pull)     # Output: TRUE
```

* **The Pipeline Advantage**: Since `pull()` accepts the data frame as its first argument, it integrates cleanly inside a pipe chain (`|>`), whereas `$`, and `[[ ]]` cannot be piped.

---
#  Type Verification: The `is.*` Family

Data cleaning requires verifying that your columns contain the correct type of measurements. The `is.*` family of functions returns a single `TRUE` or `FALSE` indicating the object's class:

* `is.character()`: Strings / text vectors.
* `is.numeric()`: General numeric numbers.
* `is.double()` / `is.integer()`: Decimal vs. integer numeric types.
* `is.factor()`: Discrete categorical factors.
* `is.logical()`: Boolean (`TRUE` / `FALSE`).

```r
# Verify types
is.character(tibble_version$name)   # Output: TRUE
is.numeric(tibble_version$id)       # Output: TRUE
is.logical(tibble_version$status)   # Output: TRUE
is.double(tibble_version$id)        # Output: FALSE (it is an integer vector)
```

Use `where(is.numeric)` or `where(is.character)` inside `select()` to pull multiple columns of a specific class.

---
#  Type Coercion: The `as.*` Family

When columns are imported with incorrect types (such as numbers read as characters), you must force a type conversion using the `as.*` family:

```r
# Successful coercions
as.numeric("123.45")   # Output: 123.45 (double numeric)
as.logical("T")        # Output: TRUE (logical)
as.character(48103)      # Output: "101" (character)

# Failing coercions (Returns NA with a warning)
as.numeric("abc")      # Output: NA (Warning: NAs introduced by coercion)
as.logical("hello")    # Output: NA
```

Always check for `NA` generation immediately after running `as.*` conversions on raw files!

---
#  Row and Column Indexing

Before looking at `dplyr` verbs, let's look at how base R selects rows and columns using coordinates.

Tabular indexing uses a **two-dimensional indexing matrix**:
$$\text{table}[\text{row\_expression}, \text{column\_expression}]$$

* If `row_expression` is left blank, R selects **all rows**.
* If `column_expression` is left blank, R selects **all columns**.

Let's see how this coordinate selection behaves.

---
#  Two-Dimensional Slicing & Matrix Indexing

We can slice our tabular data using coordinates: `table[row_expression, column_expression]`. If either expression is left blank, R selects *all* entries along that dimension.

Let's construct a demo tibble and execute complex slices:
```r
d3 <- tibble(column_x = 1:5, column_y = c("A", "B", "C", "D", "E"))
d3$letter <- letters[d3$column_x]
d3$LETTER <- LETTERS[27 - d3$column_x]

# 1. Grab the 1st row, all columns
d3[1, ]

# 2. Grab rows 2 to 4, all columns
d3[2:4, ]

# 3. Grab all rows, only specific columns
d3[, c("column_x", "LETTER")]

# 4. Grab rows 1 to 3, only specific columns
d3[1:3, c("letter", "LETTER")]
```

---
#  Old-School Logical Filtering

Before `dplyr` was created, data analysts filtered rows by passing a vector of logical `TRUE`/`FALSE` values inside the row coordinate:

```r
# Old school way: filter rows where column_y is greater than "B"
filtered_df <- d3[d3$column_y > "B", ]
print(filtered_df)
```

### Why this is a bottleneck:
1. It is highly redundant (you have to type `d3` twice).
2. It is difficult to read.
3. It cannot be combined easily with column mutations or selections inside a unified pipeline.

---
#  The Core dplyr Verbs

To solve the limitations of coordinate indexing, `dplyr` introduces a unified grammar for data manipulation. We use specific verbs for specific tasks:

* 📐 **`select()`**: Subsets and reorders columns (variables).
* 🔍 **`filter()`**: Subsets rows (observations) based on criteria.
* 🛠️ **`mutate()`**: Computes new columns or alters existing ones.

Let's study each of these verbs in rigorous detail.

---
#  Picking Columns: The `select()` Verb

`select()` reduces the width of your dataset, keeping only the variables you need for plotting or modeling:

```r
library(tidyverse)

# Basic select by column name
small_mpg <- select(mpg, model, year, hwy)
head(small_mpg, 3)
```

### Slicing Contiguous Ranges
You can select a continuous sequence of columns using the colon (`:`) operator:
```r
# Select all columns from 'model' through 'hwy' inclusive
range_mpg <- select(mpg, model:hwy)
head(range_mpg, 2)
```

---
#  Advanced Column Selection & Helpers

`select()` supports robust helper functions to locate columns based on string patterns or data types:

* **Negation (`!`, `-`)**: Exclude specific columns.
* **`starts_with("abc")`**: Matches columns starting with the string "abc".
* **`ends_with("xyz")`**: Matches columns ending with the string "xyz".
* **`contains("efg")`**: Matches columns containing "efg".
* **`where(is.numeric)`**: Selects columns based on data type.

```r
# Exclude model and year, but select everything else
select(mpg, !c(model, year)) |> head(2)

# Select only numeric columns
select(mpg, where(is.numeric)) |> head(2)
```

---
#  Column Relocation

A common task is relocating specific columns to the front of a wide table. We can combine targeted selection with the **`everything()`** helper:

```r
# Move 'class' and 'cyl' to the front, followed by all other columns
relocated_mpg <- select(mpg, class, cyl, everything())
head(relocated_mpg, 3)
```

Using `everything()` acts as a wildcard, ensuring you do not lose the unmentioned columns during selection!

---
#  The `filter()` Verb

`filter()` subsets rows based on logical expressions. It evaluates the expression for each row, keeping only rows that return `TRUE`.

```r
# Filter for compact cars with highly efficient highway mileage
efficient_compacts <- filter(mpg, class == "compact", hwy > 30)
efficient_compacts
```

### Combining Logical Operators
* **AND (`&` or comma `,`)**: Both conditions must be `TRUE`.
* **OR (`|`)**: At least one condition must be `TRUE`.
* **NOT (`!`)**: Inverts the logical state.

---
#  Set Membership: The `%in%` Operator

When filtering a categorical column for multiple allowed classes, using multiple OR (`|`) statements becomes extremely repetitive. Instead, use the set membership operator **`%in%`**:

```r
# Repetitive and error-prone OR statements:
filter(mpg, class == "compact" | class == "subcompact" | class == "2seater")

# Clean, robust set membership:
allowed_classes <- c("compact", "subcompact", "2seater")
filter(mpg, class %in% allowed_classes) |> head(3)
```

The `%in%` operator takes each row's value and checks if it exists anywhere inside your target vector.

---
#  The Tricky Logical Trap: `cyl == 4 | 5`

This is a notorious beginner trap in R:

```r
# Attempting to filter for 4 or 5 cylinders:
filter(mpg, cyl == 4 | 5)
```

### Why this returns EVERY single row in the dataset:
1. R evaluates operations in order of operator precedence. It first evaluates the equality comparison: `cyl == 4` (returns `TRUE` or `FALSE`).
2. It then evaluates the OR operator: `[TRUE/FALSE] | 5`.
3. In logical contexts, R coerces any non-zero numeric value to `TRUE`. Thus, `5` is coerced to `TRUE`.
4. Since `[TRUE/FALSE] | TRUE` is always `TRUE`, the entire expression evaluates to `TRUE` for every single row!

**The Correct Way**: Use `cyl == 4 | cyl == 5` or `cyl %in% c(4, 5)`.

---
#  Handling NA Values in Filters

By design, any comparison involving an `NA` (missing) value returns `NA` (unknown), not `TRUE` or `FALSE`. Because of this, `filter()` automatically drops rows with `NA` values in the criteria column.

To explicitly isolate or remove `NA` records, you must use **`is.na()`** or **`!is.na()`**:

```r
# Correct way to remove rows where 'cty' is missing
clean_cars <- filter(mpg, !is.na(cty))

# Incorrect way (returns empty table because cty != NA yields NA)
# clean_cars <- filter(mpg, cty != NA)
```

---
#  Removing Duplicate Rows: `distinct()`

**Extracting Unique Rows**

To eliminate duplicate rows or retrieve unique categorical combinations, use **`distinct()`**:

```r
# Extract unique vehicle manufacturers
mpg |> distinct(manufacturer)

# Extract unique combinations of class and drivetrain
mpg |> distinct(class, drv)
```

`distinct()` provides a clean way to inspect categorical levels without writing manual frequency aggregations.

---
#  Creating Variables: The `mutate()` Verb

`mutate()` adds new columns to your dataset while preserving all existing columns. If your new column name matches an existing column, it overwrites it:

```r
# Create a new column "displacement_ratio"
mpg_updated <- mutate(mpg, displ_ratio = displ / hwy)

# Check the results
select(mpg_updated, model, displ, hwy, displ_ratio) |> head(3)
```

Note that `mutate()` returns a **brand new table** in memory; it does not alter the original `mpg` object unless you explicitly reassign it (`mpg <- mutate(mpg, ...)`).

---
#  Sequential Mutation

A powerful feature of `mutate()` is that it evaluates expressions sequentially. This means you can create a column and immediately refer to it inside the exact same statement:

```r
# Create a metric conversion, then round it immediately
mpg_metric <- mutate(mpg,
  hwy_metric = hwy * 0.425,           # Convert MPG to km/L
  hwy_rounded = round(hwy_metric, 1)  # Refer to hwy_metric immediately
)

select(mpg_metric, model, hwy, hwy_metric, hwy_rounded) |> head(3)
```

---
#  Dropping Columns inside `mutate()`

**Removing Columns with `NULL`**

You can delete a column directly within `mutate()` by assigning its value to **`NULL`**:

```r
# Add a temporary column, then drop it by assigning NULL
df_temp <- mutate(mpg, temp_metric = displ * 10)
df_clean <- mutate(df_temp, temp_metric = NULL)

# Verify column was dropped
"temp_metric" %in% colnames(df_clean) # Output: FALSE
```

Assigning `NULL` removes the specified column from memory while keeping all other columns intact.

---
#  Feature Scaling & Z-Scores in `mutate()`

**Standardizing and Rescaling Variables**

`mutate()` easily applies mathematical transformations across entire columns using vector arithmetic:

* **Z-Score Normalization**: $Z = \frac{X - \bar{X}}{\sigma}$ (centers mean at 0 with standard deviation of 1)
* **Min-Max Scaling**: $Y = \frac{X - \min(X)}{\max(X) - \min(X)}$ (rescales values onto a $0$ to $1$ range)

```r
# Compute Z-score standardized highway mileage and 0-1 min-max scaling
mpg |>
  mutate(
    z_hwy = (hwy - mean(hwy)) / sd(hwy),
    scaled_hwy = (hwy - min(hwy)) / (max(hwy) - min(hwy))
  ) |>
  select(model, hwy, z_hwy, scaled_hwy) |>
  head(3)
```

---
#  Conditional Column Evaluation: `if_else()`

Often, your mutations require conditional calculations (if-then-else logic). The `dplyr` package provides a highly optimized, type-safe function called **`if_else()`**:

```r
# Syntax: if_else(condition, true_vector, false_vector)
mpg_coded <- mpg |>
  mutate(efficiency_status = if_else(hwy > 30, "Highly Efficient", "Standard"))

select(mpg_coded, model, hwy, efficiency_status) |> head(3)
```

### Why `if_else()` is safer than base R `ifelse()`:
Base R's `ifelse()` will silently coerce mismatched data types, leading to bugs. `dplyr`'s `if_else()` is strictly **type-safe**; it throws an immediate error if the `true` and `false` return vectors are of different classes.

---
#  Vector Recycling in Conditionals

When writing `if_else()`, R relies on **vector recycling** to match the output lengths. If you pass a single value (scalar) as the true or false value, R automatically replicates it to fill the column:

```r
# Vector of values
x <- c(-2.5, 4.2, -0.1, 8.5)

# Recycle 0 to replace any negative value
clean_x <- if_else(x < 0, 0, x)
print(clean_x) # Output: 0.0 4.2 0.0 8.5
```

Here, the scalar `0` (numeric) is recycled to match the length of vector `x`.

---
#  Pipes and Pipelines

Writing nested functions in R makes your code incredibly difficult to read and maintain:

```r
# Nested functions are read from the inside out (highly unreadable!)
final_nested <- head(select(mutate(filter(mpg, displ <= 2.0), fuel_cost_100 = (100 / cty) * 3.50), model, displ, cty, fuel_cost_100), 3)
```

To solve this, we use R's native **pipe operator `|>`** (or the magrittr pipe `%>%`) to chain operations chronologically.

---
#  Chaining Calculations: The Pipe Operator (`|>`)

The pipe takes the output of the expression on its left and passes it as the **first argument** to the function on its right:

$$\text{data} \mid> \text{f}(\text{arg2}) \implies \text{f}(\text{data}, \text{arg2})$$

Using pipes, we can write clean, top-to-bottom transformation pipelines:

```r
# Clean, readable data pipeline
final_piped <- mpg |>
  filter(displ <= 2.0) |>
  mutate(fuel_cost_100 = (100 / cty) * 3.50) |>
  select(model, displ, cty, fuel_cost_100) |>
  head(3)

print(final_piped)
```

---
#  Synthesis Code Case Study

Let's look at a case study utilizing all three verbs to isolate efficient city vehicles.

To evaluate overall vehicle efficiency, we compute a weighted combined mileage using the standard **EPA driving split** (55% city driving, 45% highway driving):
$$\text{Performance Score} = (\text{cty} \times 0.55) + (\text{hwy} \times 0.45)$$

[Reference](https://www.epa.gov/greenvehicles/fuel-economy-and-ev-range-testing)


```r
# Identify highly efficient urban compacts
urban_compacts <- mpg |>
  # 1. Select variables of interest
  select(manufacturer, model, displ, class, cty, hwy) |>
  # 2. Filter for compact cars with city mileage above 20 MPG
  filter(class == "compact", cty > 20) |>
  # 3. Create a unified performance score
  mutate(
    performance_score = (cty * 0.55) + (hwy * 0.45),
    performance_rating = if_else(performance_score > 25, "Excellent", "Standard")
  )

head(urban_compacts, 3)
```

---
#  Introducing Real-World Flight Data: `nycflights13`

To explore real-world data wrangling and statistical quality challenges, we use the **`nycflights13`** package. It contains 336,776 flight records departing New York City (JFK, LGA, EWR) in 2013.

Key tracking variables include:
* `dep_time`, `sched_dep_time`: Actual and scheduled departure times (`NA` if cancelled).
* `dep_delay`, `arr_delay`: Departure and arrival delays in minutes (negative = early).
* `origin`, `dest`, `carrier`: Airport codes and two-letter airline identifiers.
* `air_time`, `distance`: Flight duration (minutes) and distance (miles).

```r
library(nycflights13)
library(tidyverse)

# Explore flight delays using core transformation verbs
flights |>
  select(carrier, flight, origin, dest, dep_delay, arr_delay) |>
  filter(dep_delay > 60) |>
  mutate(net_gain = dep_delay - arr_delay) |>
  head(3)
```

---
#  Statistical Pitfalls in Data Wrangling

When writing data transformation pipelines, it is incredibly easy to introduce silent statistical biases into your summaries and visualizations:

* 🚨 **Survival Bias**: Subsetting only "completed" rows (e.g. `!is.na(dep_time)`), omitting critical failures.
* ✂️ **Truncation**: Deleting values above/below a threshold (e.g. `dep_delay >= 0`), destroying natural variance.
* 🛡️ **Censoring**: Capping values at a threshold (topcoding/bottomcoding) instead of deleting rows.
* 📊 **Cohort Bias**: Comparing individuals against a global mean instead of their group/seasonal peer cohort.

* 📋 **Non-Response / Self-Selection Bias**: Drawing conclusions from volunteer/survey responses without analyzing who systematically opted out.
* ⏱️ **Measurement Bias**: Systemic recording shifts (like comparing flight times across unaligned timezones).
* 🔗 **Multicollinearity**: Including highly correlated, redundant features (like departure AND arrival delay).



---
#  Exercise: Capping Extreme Outliers

**Topcoding and Bottomcoding Outliers**

Censor a distribution of values by capping any value greater than 1 at 1, and any value less than -1 at -1:

```r
d <- tibble(x = c(-0.19, 1.35, 1.21, -0.11, -0.99, -0.4, -0.04, -0.4, 0.82, -1.55))

# Solution using nested if_else():
d |> mutate(x = if_else(x > 1, 1, if_else(x < -1, -1, x)))

# Alternative using sequential mutate steps:
d |>
  mutate(
    x = if_else(x > 1, 1, x),
    x = if_else(x < -1, -1, x)
  )
```
