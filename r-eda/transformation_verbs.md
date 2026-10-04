# Core Verbs: Select, Filter & Mutate

## Why Learn Data Transformation in Exploratory Data Analysis?

A raw dataset is almost never in the exact shape you need for plotting or modeling.

Imagine you are analyzing a massive airline flights dataset containing 30 columns and 300,000 rows. You are tasked with answering a specific question: "What is the average departure delay of United Airlines (UA) flights departing from JFK airport in January?"

To answer this question, you need to:
1. Narrow down the table from 30 columns to just a few relevant columns (like flight number, carrier, origin airport, and departure delay).
2. Sift through 300,000 rows to extract only JFK departures operated by United Airlines in January.
3. Compute the delays.

If you write this in base R using row indices and dollar-sign indicators, your code will be cluttered and hard to maintain. In the Tidyverse, we use the **`dplyr`** package, which provides a cohesive grammar for data transformation. Let's learn the three fundamental verbs: `select()`, `filter()`, and `mutate()`.

---

## 1. Foundations: Tables, Tibbles, and Column Extraction

Before we dive into `dplyr` verbs, we must understand how tabular data is represented in R.

### A. Tables as Lists of Vectors
At a conceptual level, a **data table** is simply a **list of column vectors of the exact same length**. Each list item represents a column (variable), and the elements inside that vector represent the rows (observations).

```r
library(tidyverse)

x <- 1:5
y <- c("A", "B", "C", "D", "E")

# Create a list representing columns
d <- list(column_x = x, column_y = y)
print(d)
```

### B. `data.frame` vs. `tibble`
In base R, a list of equal-length vectors is typically wrapped in a standard **`data.frame`**. However, the modern Tidyverse uses a refined, more efficient version called a **`tibble`**.

* **`data.frame`**: If column lengths differ, it may quietly repeat (recycle) elements to make them match, which can lead to silent data bugs.
* **`tibble`**: Enforces strict column length checks, never silently recycles (except for single values), and provides a much cleaner print layout in the console, highlighting column data types and showing only the first 10 rows.

```r
# Convert list to standard data.frame
d2 <- as.data.frame(d)

# Convert to tidyverse tibble
d3 <- as_tibble(d2)
print(d3)
```

### C. Extracting a Single Column: `$` vs. `pull()`
To extract a single column as a bare vector, you can use the base R dollar-sign operator (`$`) or `dplyr`'s **`pull()`** function:

* **`d$column_x`**: The traditional way to pull a column out of a data frame.
* **`pull(d, column_x)`**: The tidyverse equivalent. `pull()` is highly useful because it can be integrated directly inside a pipeline (`|>`), whereas `$` cannot.

```r
# Pulling out first 5 rows of storm status column using $
storms$status[1:5]

# Pulling out same values using pull() inside a pipeline
storms |> pull(status) |> head(5)
```

### D. Testing and Converting Column Types: `is.*` vs. `as.*`
We frequently need to inspect and coerce column types during analysis:

* **`is.*` functions**: Test the class of an object and return a single `TRUE` or `FALSE` (e.g., `is.character()`, `is.numeric()`, `is.factor()`, `is.logical()`).
* **`as.*` functions**: Attempt to convert (coerce) an object into the specified type. If a value cannot be converted, R returns `NA` and raises a warning:

```r
# Convert string representations to numeric/logical
as.numeric("10")   # Returns: 10
as.numeric("abc")  # Returns: NA (with warning: NAs introduced by coercion)
as.logical("F")    # Returns: FALSE
as.logical(1)      # Returns: TRUE
```

---

## 2. Row Selection: Old-School Indexing vs. Modern Filtering

### A. Two-Dimensional Indexing: `tbl[rows, cols]`
R allows for two-dimensional indexing on any table using square brackets: **`table[row_index, column_index]`**. Leave either dimension blank to select *all* items in that dimension:

```r
# Add some letters columns to our d3 tibble for demonstration
d3$letter <- letters[d3$column_x]
d3$LETTER <- LETTERS[27 - d3$column_x]

# Grab first row, all columns
d3[1, ]

# Grab rows 2 to 4, all columns
d3[2:4, ]

# Grab all rows, specific columns
d3[, c("column_x", "LETTER")]

# Grab rows 1 to 3, specific columns
d3[1:3, c("letter", "LETTER")]
```

### B. Old-School Criteria Filtering
Before `dplyr` was created, developers filtered tables by passing a logical vector inside the row index dimension:

```r
# Old school way: Pull rows where column_y is greater than "B"
d3[d3$column_y > "B", ]
```

This is hard to read and requires repeating `d3$` multiple times. Modern data science prefers `dplyr`'s **`filter()`** function which eliminates this boilerplate and is pipeline-friendly.

---

## 3. Selecting Columns: `select()`

`select()` lets you pick specific columns from a data frame, reducing the table's width.

```r
library(tidyverse)

# Select columns by name
small_table <- select(mpg, model, year, hwy)
print(head(small_table))
```

### Advanced Selection Options
* **Columns Range**: Select all columns from `model` to `hwy` inclusive:
  ```r
  select(mpg, model:hwy)
  ```
* **Excluding Columns**: Drop specific columns using the exclamation mark `!` or minus sign `-`:
  ```r
  select(mpg, !c(model, year))
  ```
* **Selection Helpers**: Find columns matching string patterns:
  * `starts_with("abc")`: Columns starting with "abc".
  * `ends_with("xyz")`: Columns ending with "xyz".
  * `contains("efg")`: Columns containing "efg".
  * `everything()`: Selects all remaining columns (useful for relocating columns to the front).

  ```r
  # Select columns starting with "c" and everything else
  select(mpg, starts_with("c"), everything())
  ```

---

## 2. Filtering Rows: `filter()`

`filter()` extracts a subset of rows based on one or more logical conditions.

```r
# Filter for cars with city mileage greater than 30 MPG
efficient_cars <- filter(mpg, cty > 30)
print(efficient_cars)
```

### Combining Conditions
You can combine multiple criteria using logical operators:
* **AND (`&` or comma `,`)**: Both conditions must be `TRUE`.
* **OR (`|`)**: At least one condition must be `TRUE`.
* **NOT (`!`)**: Reverses the condition.

```r
# AND: Cars that are compact AND have engine displacement greater than 2L
filter(mpg, class == "compact", displ > 2)

# OR: Cars that have 4 cylinders OR 5 cylinders
filter(mpg, cyl == 4 | cyl == 5)
```

### Set Membership: `%in%`
To check if a column's value matches any element in a list/vector, use the `%in%` operator:

```r
# Filter for cars that are compact, subcompact, or 2seater
filter(mpg, class %in% c("compact", "subcompact", "2seater"))
```
### ⚠️ The Tricky Logical Trap: `n == 1 | 2`
A very common beginner mistake is trying to write:
```r
filter(mpg, cyl == 4 | 5)
```
You might expect this to filter for cars with either 4 or 5 cylinders. However, **this returns every single row in the dataset!**

Here is why:
1. R evaluates operations in order of operator precedence. It first evaluates `cyl == 4` which returns a logical vector (`TRUE` or `FALSE`).
2. It then evaluates `| 5` (OR 5).
3. In R, any numeric value other than 0 is treated as `TRUE` in a logical context. Therefore, `5` is coerced to `TRUE`.
4. Since `FALSE | TRUE` is always `TRUE`, the filter condition resolves to `TRUE` for every row, rendering the filter completely useless!

**The Correct Way**: You must write out both full comparisons, or use the `%in%` operator:
```r
# Full comparison way
filter(mpg, cyl == 4 | cyl == 5)

# Set membership way (highly recommended)
filter(mpg, cyl %in% c(4, 5))
```

### Handling Missing Values (`NA`)
`filter()` automatically drops rows where the condition evaluates to `NA` (missing). If you want to explicitly check for missing values, use `is.na()` or `!is.na()`:

```r
# Filter for rows where city mileage is NOT missing
# filter(mpg, !is.na(cty))
```

---

## 3. Creating/Modifying Columns: `mutate()` & `transmute()`

`mutate()` adds new columns to your dataset while preserving the existing columns. If the new column name matches an existing name, it overwrites it.

```r
# Create a new column "displacement_to_hwy_ratio" by dividing displ by hwy
mpg_updated <- mutate(mpg, displ_hwy_ratio = displ / hwy)
print(head(select(mpg_updated, displ, hwy, displ_hwy_ratio)))
```

You can define multiple columns in a single `mutate()` statement, and refer to columns you created earlier in that same statement:

```r
# Create two columns sequentially
mpg_converted <- mutate(mpg,
  hwy_metric = hwy * 0.425, # converts miles/gal to km/litre
  hwy_rounded = round(hwy_metric, 1)
)
```
### B. Conditional Evaluation with `if_else()`
Often, you want to calculate new column values based on a logical condition (e.g., if-then-else logic). The `dplyr` package provides a highly optimized, type-safe function called **`if_else()`**:

```r
# Syntax: if_else(condition, true_vector, false_vector)
if_else(c(TRUE, FALSE, FALSE), c("Yes", "Yes", "Yes"), c("No", "No", "No"))
```

#### Vector Recycling
R will automatically "recycle" single values to match the length of the vector. For example, if you want to replace all negative numbers in a vector with `0`, you can do:

```r
x <- c(-2, 1.4, -0.25, 7)
if_else(x < 0, 0, x) # Returns: 0.00 1.40 0.00 7.00
```

#### `if_else()` vs. Base R `ifelse()`
Base R contains a built-in `ifelse()` function, but `dplyr`'s `if_else()` is significantly better for data pipelines:
1. **Type Safety**: `if_else()` requires both the `true` and `false` arguments to be of the exact same data type (e.g., both numeric, both character). This prevents silent type coercion bugs.
2. **Efficiency**: `if_else()` is optimized for fast execution on massive datasets.

```r
# This fails in dplyr (type mismatch), which keeps your data clean:
# if_else(c(TRUE, FALSE), "text", 42)

# Using if_else() inside mutate()
mpg_coded <- mpg |>
  mutate(efficiency = if_else(hwy > 30, "Highly Efficient", "Standard"))

---

### C. Keep Only New Columns: `transmute()`

Sometimes, you want to create new variables but **discard all of the original columns** in your dataset. Doing this with `mutate()` followed by a `select()` is redundant. Instead, you can use **`transmute()`**.

`transmute()` acts exactly like `mutate()`, except it **keeps only the columns you explicitly create or specify** inside the function call, dropping all other variables immediately.

```r
# Create a new column and drop everything else
mpg_transmuted <- transmute(mpg, 
  model,                             # Specify columns you want to keep as-is
  displ_hwy_ratio = displ / hwy       # Create new variables
)

print(head(mpg_transmuted))
```

This is especially clean when you want to build a brand new scaled representation of your table from scratch!
```

---

## 4. Combining Operations: The Pipe Operator (`|>`)

Instead of writing nested functions (like `mutate(filter(select(...)))`) or saving intermediate data variables, we use R's native **pipe operator `|>`** (or the magrittr pipe `%>%`). 

The pipe takes the output of the expression on its left and passes it as the **first argument** to the function on its right:

```r
# Without pipes (hard to read)
step1 <- select(mpg, manufacturer, model, hwy)
step2 <- filter(step1, hwy > 30)
final_result <- mutate(step2, hwy_doubled = hwy * 2)

# With pipes (clean, reads left-to-right / top-to-bottom)
final_result <- mpg |>
  select(manufacturer, model, hwy) |>
  filter(hwy > 30) |>
  mutate(hwy_doubled = hwy * 2)

print(final_result)
```

---

## 5. Statistical Pitfalls and Biases in Data Transformation

When writing data transformation pipelines (like subsetting rows with `filter()` or standardizing values with `mutate()`), it is incredibly easy to introduce silent statistical biases. While these concepts are critical for getting accurate summaries and visualizations today, they will become even more vital during predictive modeling covered in future chapters.

Below is a summary of the key pitfalls to watch out for during Exploratory Data Analysis (EDA):

| Pitfall / Concept | What It Is | How it Occurs in Code | Analytical Consequence & Example |
| :--- | :--- | :--- | :--- |
| **Survival Bias** | Analyzing only the subjects that successfully completed or "survived" a process. | `flights \|> filter(!is.na(dep_time))` <br>*(Filtering out flights that never departed)* | **Artificially inflates performance.** Unreliable routes with high cancellation rates appear highly efficient because their worst failures are omitted from average delay calculations. |
| **Truncation** | Completely deleting observations above or below a numeric threshold on the variable you are studying. | `flights \|> filter(dep_delay >= 0)` <br>*(Completely omitting early departures)* | **Distorts the distribution shape.** Removes natural variance (like early flights), inflating typical delay estimates and skewing statistical summaries. |
| **Censoring** | Capping extreme values at a threshold (topcoding/bottomcoding) instead of deleting the rows. | `mutate(price = if_else(price > 10000, 10000, price))` <br>*(Capping high prices at \$10,000)* | **Preserves sample size but alters distribution tails.** Keeps extreme observations in the dataset but clusters them at the threshold boundary, creating a spike at the cap. |
| **Cohort Bias (Aggregation Bias)** | Evaluating groups or individuals by standardizing them against a global baseline instead of their specific subgroup baseline. | `mutate(delay_dev = dep_delay - mean(dep_delay, na.rm = TRUE))` <br>*(Subtracting the overall annual average)* | **Fails to control for group baselines.** A flight in December (congested travel/winter storms) is unfairly penalized, whereas grouping by month (`group_by(month)`) measures relative peer efficiency. |
| **Base-Rate Fallacy** | Ignoring the overall probability of an event (the baseline rate) when interpreting specific flagged data or alerts. | `flights \|> filter(has_critical_engine_warning == TRUE)` <br>*(Analyzing warning alerts only)* | **Triggers false-alarm panic.** If critical engine warnings are 99% accurate but engine failures occur in only 0.01% of all flights (the base rate), most warnings are actually false positives. Isolating alerts without looking at the entire fleet's base rate leads to severe overestimation of risk. |
| **Non-Response / Self-Selection Bias** | Occurs when individuals who choose to participate in a survey differ systematically from those who opt out. | `gss_cat \|> count(relig)` <br>*(Analyzing responses without checking missing/opt-out rates)* | **Distorts representativeness.** If moderate respondents systematically ignore a survey but highly opinionated individuals always participate, your tabular counts will show extreme, highly polarized preferences that do not reflect the actual population. |
| **Measurement Bias** | Systemic errors or shifts in how values are recorded across different groups. | Calculating flight durations across timezone boundaries without aligning them to a standard UTC clock first. | **Produces false correlation or offsets.** West-bound flights systematically appear to fly "faster" (or even backward in time) due to local clock offsets rather than actual speed. |
| **Multicollinearity** | Including two or more highly redundant variables that measure the exact same underlying concept. | Keeping both departure delay (`dep_delay`) and arrival delay (`arr_delay`) as independent predictor variables. | **Adds redundant descriptive features.** While fine for simple summaries, having highly correlated columns makes it impossible to isolate individual effects (a topic that becomes critical during modeling in future chapters). |

---

## Hands-on Exercises

### Exercise 1: Narrowing Down the Fleet
**Which high-efficiency vehicle models manufactured by Honda or Toyota achieve more than 30 miles per gallon on the highway, and what are their respective city and highway efficiency profiles?**

*Analytical Guidance*:
Isolate high-efficiency cohorts from the `mpg` dataset. Your analysis should:
1. Focus on vehicles produced by Honda or Toyota.
2. Identify vehicles that exceed 30 miles per gallon in highway settings.
3. Keep only the manufacturer name, model name, city mileage, and highway mileage for comparison.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

mpg |>
  select(manufacturer, model, cty, hwy) |>
  filter(manufacturer %in% c("honda", "toyota"), hwy > 30)
```
</details>

---

### Exercise 2: Fuel Cost Calculator
**What are the projected city driving fuel costs for driving 100 miles across our smallest-displacement engines, and how do we compute these costs?**

*Analytical Guidance*:
Assuming fuel costs $3.50 per gallon, evaluate the economic cost of city driving using the formula:
$$\text{Fuel Cost} = \frac{100}{\text{City Mileage}} \times \$3.50$$
Your analysis should:
1. Focus on vehicles equipped with smaller, efficient engines (displacement of 2.0 liters or less).
2. Calculate the projected fuel cost for driving 100 miles in the city.
3. Retain only the vehicle model, engine displacement, city mileage, and the newly calculated city fuel cost columns.
4. Display the first 6 records of the resulting table.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

mpg |>
  filter(displ <= 2.0) |>
  mutate(fuel_cost_100 = (100 / cty) * 3.50) |>
  select(model, displ, cty, fuel_cost_100) |>
  head()
```
</details>

---

### Exercise 3: Rescaling Data (Min-Max Scaling)
**How can we transform a vector of raw scientific measurements so that all values are scaled proportionally onto a standard range from 0 to 1?**

*Analytical Guidance*:
Perform min-max scaling to standardize variables on a bounded interval. The mathematical formula is:
$$Y_i = \frac{X_i - \min(X)}{\max(X) - \min(X)}$$
Using the provided random dataset `d`, calculate a standardized column `y_i` where the minimum value maps to 0, the maximum value maps to 1, and intermediate values scale proportionally.

```r
set.seed(42)
d <- data.frame(x = rnorm(10))
```

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

set.seed(42)
d <- data.frame(x = rnorm(10))

d |>
  mutate(y_i = (x - min(x)) / (max(x) - min(x)))
```
</details>

---

### Exercise 4: Topcoding Outliers
**How can we censor a distribution of raw values to prevent extreme positive or negative outliers from skewing our downstream statistical models?**

*Analytical Guidance*:
Topcoding and bottomcoding are standard data-cleaning procedures. Using the provided dataset `d`, cap any extreme observations by constraining values:
1. If a value is greater than 1, replace/cap it at exactly 1.
2. If a value is less than -1, replace/cap it at exactly -1.
3. Retain all other values as they are.

```r
d <- data.frame(x = c(-0.19, 1.35, 1.21, -0.11, -0.99, -0.4, -0.04, -0.4, 0.82, -1.55))
```

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

d <- data.frame(x = c(-0.19, 1.35, 1.21, -0.11, -0.99, -0.4, -0.04, -0.4, 0.82, -1.55))

# Sequential approach
d |>
  mutate(
    x = if_else(x > 1, 1, x),
    x = if_else(x < -1, -1, x)
  )

# Nested approach (Alternative)
d |>
  mutate(x = if_else(x > 1, 1, if_else(x < -1, -1, x)))
```
</details>

