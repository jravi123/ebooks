# Grouping & Summarizing

## Why Learn Grouping and Summarization in Exploratory Data Analysis?

Summary metrics for an entire column (like the average price of all transactions) are helpful, but they don't reveal comparative structures.

Imagine you are analyzing credit card defaults across different age brackets. 
* If you calculate the average default rate across the entire table, you get a single number.
* To discover risk profiles, you need to group the data by age bracket, and then summarize the default rate for each bracket.

In `dplyr`, we perform this "split-apply-combine" pattern using the **`group_by()`** and **`summarize()`** verbs. Let's learn how to compute statistics across subgroups, count categories, and apply calculations to multiple columns at once using the `across()` helper.

---

## 1. Dimensional Tracking: `nrow()` vs. `dim()`

Before summarizing data, we must be able to track table dimensions. To check table sizes quickly and efficiently, especially inside pipelines, R provides two lightweight commands:
* **`nrow(df)`**: Returns a single integer representing the total row count.
* **`dim(df)`**: Returns a vector of length 2 showing `c(rows, columns)`.

Let's use our familiar `mpg` dataset from the previous chapters to verify these dimensions:

```r
library(tidyverse)

# Check row count
mpg |> nrow() # Output: 234

# Check row and column count
dim(mpg) # Output: 234  11
```

---

## 2. Summarizing Columns: `summarize()`

**What is the overall performance of all vehicles in our dataset, expressed as the average highway mileage, maximum highway mileage, and total vehicle count?**

The primary tool for collapsing rows in R is the **`summarize()`** (or `summarise()`) verb. 

`summarize()` takes an input table, applies one or more reduction functions to selected column vectors, and returns a single row containing the computed metrics:

```r
# Calculate summary stats for the whole mpg dataset
mpg |>
  summarize(
    avg_hwy = mean(hwy),
    max_hwy = max(hwy),
    total_cars = n() # Counts the number of rows
  )
```

### Core Aggregation Functions
* **`mean(x)`** / **`median(x)`**: Central tendencies.
* **`sd(x)`** / **`var(x)`**: Standard deviation and variance.
* **`min(x)`** / **`max(x)`**: Range limits.
* **`n()`**: Returns the count of rows/elements.
* **`n_distinct(x)`**: Returns the count of unique values.

> [!CALLOUT] Always handle Missing Values in Summaries
> If a column contains `NA` (missing) values, standard statistical functions like `mean()` will automatically return `NA`. To compute the statistic while ignoring missing values, always pass the argument **`na.rm = TRUE`** (e.g. `mean(column_name, na.rm = TRUE)`).

---

## 3. Scaling Up: Introducing the NYC Flights Dataset

While the `mpg` dataset is excellent for learning basic mechanics, real-world data science demands managing high-volume, multi-layered data. 

To explore complex grouping structures, logical summarization gates, and grouped mutations, we will introduce the **`nycflights13`** package. This dataset logs every single flight (336,776 records) that departed from New York City (JFK, LGA, and EWR) in 2013:

```r
# install.packages("nycflights13")
library(nycflights13)

# Glimpse the flights tibble
glimpse(flights)
```

---

## 4. Advanced Summaries: Logical Gates on Flights

Now that we have introduced the flights dataset, let's explore how `summarize()` can evaluate boolean or logical criteria across hundreds of thousands of records simultaneously.

R allows you to pass logical evaluations inside summaries:
* **`any(logical_vector)`**: Returns `TRUE` if **at least one** element in the vector is `TRUE`.
* **`all(logical_vector)`**: Returns `TRUE` if **every single** element is `TRUE`.
* **`sum(logical_vector)`**: Counts how many rows returned `TRUE` (coercing `TRUE` to `1` and `FALSE` to `0`).

Let's use these logical gates to analyze flight delay characteristics, taking care to filter out flights where departure delay data is missing:

```r
# Check delay characteristics across NYC departures
flights |>
  filter(!is.na(dep_delay)) |>
  summarize(
    any_extreme_delay = any(dep_delay > 180), # Was any flight delayed > 3 hours?
    all_delayed = all(dep_delay > 0),          # Were all flights delayed?
    total_delayed = sum(dep_delay > 0),         # Total count of delayed flights
    proportion_delayed = sum(dep_delay > 0) / n() # Delay proportion
  )
```

---

## 5. Grouped Aggregations: `group_by()`

**What is the fuel efficiency, expressed as average highway mileage and vehicle count, across different vehicle classes (compact, SUV, pickup, etc.)?**

To answer this, we must segment our calculations by category. In `dplyr`, we achieve this using the **`group_by()`** verb. When combined with `summarize()`, `group_by()` performs calculations within each group/category instead of the entire table:

```r
# Group by car class, then calculate the average highway mileage for each class
mpg |>
  group_by(class) |>
  summarize(
    avg_hwy = mean(hwy),
    count = n()
  )
```

### Inspecting Grouped Data
When you group a table, R does not modify the values or rearrange the rows of your dataset. It simply attaches "grouping metadata" to the table. We can verify this with dimensional and structural checks:

```r
# Group flights by carrier
carrier_grp <- group_by(flights, carrier)

# Verify that the dimensions remain completely unchanged!
nrow(flights) == nrow(carrier_grp) # Output: TRUE
dim(flights) == dim(carrier_grp)   # Output: TRUE TRUE

# Identify active grouping variables
group_vars(carrier_grp) # Output: "carrier"
```

### Multi-Variable Grouping & Dropping Groups
You can group by multiple variables, which creates a multi-layered classification hierarchy:

```r
# Group by origin and destination
flights |>
  group_by(origin, dest) |>
  group_vars() # Output: "origin" "dest"
```

>[!CAUTION] The Group Dropping Rule of `summarize()`
> When you apply `summarize()` on a table grouped by $K$ variables, the summary operation collapses rows and **automatically drops the rightmost grouping variable**, leaving the output table grouped by the remaining $K-1$ variables.

```r
# 1. Group by two variables (origin and dest)
grouped_data <- flights |> group_by(origin, dest)

# 2. First summarize() collapses dest, leaving the table grouped ONLY by origin!
first_summary <- grouped_data |> summarize(n = n())
group_vars(first_summary) # Output: "origin"

# 3. Second summarize() collapses origin, leaving the table completely ungrouped!
second_summary <- first_summary |> summarize(n = n())
group_vars(second_summary) # Output: character(0) (ungrouped)
```

---

## 6. Counting & Visual Projections: Bar Charts vs. Col Charts

In EDA, counting category frequencies is so common that R provides multiple pathways to compute and plot them:

### A. The Direct Bar Chart (Implicit Counting)
`geom_bar()` automatically counts the occurrences of categories under the hood. You only map the $x$-axis:

**How are departing flights distributed across the three New York City airports (EWR, JFK, and LGA)?**
```r
# Counts flights departing each NYC airport automatically
flights |> 
  ggplot(aes(x = origin, fill = origin)) + 
  geom_bar()
```

### B. Pre-counted Col Chart (Explicit Counting)
If you count category frequencies using the `count()` helper first, you must use `geom_col()` and map **both** $x$ and $y$:

**What are the exact volume counts of departing flights across each of the three NYC airports?**
```r
# Identical visualization, but counted explicitly
flights |> 
  count(origin) |> 
  ggplot(aes(x = origin, y = n, fill = origin)) + 
  geom_col()
```

*Note*: You can also achieve this with `geom_bar(stat = "identity")`, but `geom_col()` is cleaner and preferred.

### C. Relative Frequency Stacked Charts
To compare distributions across subgroups, use `position = "fill"`. This scales each bar to 100% (proportion 1.0) and reveals relative frequencies. Let's isolate the top 3 flight destinations and view where they depart from:

**What is the proportional share of departures to the top three destinations across each of the NYC airports?**
```r
# 1. Isolate the top 3 destinations
flights |> 
  count(dest) |> 
  slice_max(n = 3, order_by = n) -> top_3

# 2. Filter flights and plot relative frequencies of departures
flights |> 
  filter(dest %in% top_3$dest) |> 
  ggplot(aes(x = origin, fill = dest)) + 
  geom_bar(position = "fill") +
  labs(y = "Relative Frequency (Proportion)")
```

---

## 7. The Golden Rule: Always `ungroup()`
When you use `group_by()`, the resulting data frame remains "grouped" in memory. If you perform subsequent modifications or filtering steps, they will continue to evaluate within groups rather than across the whole table, leading to hard-to-detect bugs.

**Always** add **`ungroup()`** at the end of your pipeline once you are done with grouped calculations:

```r
# Correct Practice: Add ungroup() to release the group constraints
class_summary <- mpg |>
  group_by(class) |>
  summarize(avg_hwy = mean(hwy)) |>
  ungroup() # Releases groups
```

### Shortcut for Categorical Counting: `count()`
If you only need to count the frequency of categories, you can bypass `group_by()` and `summarize(n())` by using the shortcut verb **`count()`**:

```r
# Count the number of cars per class, sorted with the most common class first
mpg |>
  count(class, sort = TRUE)
```

---

## 8. Grouped Mutations & The Rank Trap

While `summarize()` collapses rows to compute a single statistic, **`mutate()`** can also be used with `group_by()`. When you run a grouped mutation:
1. The aggregate functions (like `mean()`) are evaluated *inside each group subgroup*.
2. The outputs are mapped back to every row, maintaining the table's original height.

Let's explore this using Ann Arbor, MI daily temperature data (`aatemp`):

### A. Centering Temperatures: Global vs. Seasonal
If we want to understand temperature anomalies, we can "center" temperatures by subtracting the average:

* **Globally Centered**: `TMAX - mean(TMAX)` (how warm is today compared to the historical year-round average?).
* **Quarterly Centered**: Subtracting each quarter's average to see if a day is unusually warm *for that season*:

**How do daily temperature anomalies deviate when comparing different quarters of the year?**
```r
# Center temperatures within each quarter of the year
aatemp_centered <- aatemp |>
  group_by(quarter = quarter(DATE)) |>
  mutate(TMAX_centered = TMAX - mean(TMAX, na.rm = TRUE)) |>
  ungroup()

# Plot seasonal deviations
aatemp_centered |>
  ggplot(aes(y = TMAX_centered, x = factor(quarter), fill = factor(quarter))) +
  geom_violin() +
  labs(title = "Daily Temperature Anomalies by Quarter")
```

---

### B. The Rank Trap inside Groups
Suppose we want to find the most unusual days in the dataset by ranking them. We normalize daily highs against monthly normals:

```r
# Normalizing by monthly averages
aat_month_centered <- aatemp |>
  group_by(month = month(DATE)) |>
  mutate(TMAX_centered = TMAX - mean(TMAX, na.rm = TRUE))
```

Now, let's rank these anomalies using the **`rank()`** function.

> [!CAUTION] The Mutation Grouping Trap
> If you run a mutation like `rank()` on `aat_month_centered` while it is **still grouped by month**, the ranks will be calculated **locally within each month**. The maximum rank in January will match the maximum rank in July, making it impossible to rank the whole dataset!

```r
# DANGER: Ranks are calculated within months (rank ranges from 1 to ~1300 per month group)
aat_month_centered |>
  mutate(r = rank(TMAX_centered)) |> 
  summarize(min_rank = min(r), max_rank = max(r)) |>
  head(3)
```

#### The Fix: Explicit `ungroup()`
To rank all days globally across the entire dataset, you must explicitly drop the grouping layer first using `ungroup()`:

```r
# CORRECT: Ungroup first, then rank globally (ranks will span from 1 to the total number of rows)
global_ranks <- aat_month_centered |> 
  ungroup() |> 
  mutate(r = rank(TMAX_centered))

global_ranks |>
  summarize(min_rank = min(r), max_rank = max(r))
```

---

### C. Calculating Yearly Temperature Anomalies
Now that we have ranked all days globally, we can aggregate these ranks within years to find which year had the highest average ranks (the warmest anomalies relative to historical monthly normals):

```r
global_ranks |>
  group_by(year = year(DATE)) |>
  summarize(mean_anomaly_rank = mean(r)) |>
  arrange(desc(mean_anomaly_rank)) |>
  head(5)
```

---

## 9. Binding Tables: `rbind()` and `cbind()`

Sometimes you have separate, raw tables that you want to stack together:
* **`rbind(table1, table2)`**: "Row bind". Stacks tables on top of each other. The columns and names **must** match exactly.
* **`cbind(table1, table2)`**: "Column bind". Glues tables side-by-side. The row counts **must** match exactly.

```r
t1 <- tibble(x = 1, y = 2)
t2 <- tibble(x = 2, y = 4)

# Stack vertically (Row Bind)
t_stacked <- rbind(t1, t2) # Output: 2x2 table

# Glue horizontally (Column Bind)
t_glued <- cbind(t_stacked, letter = c("A", "B"))
```

---

## 10. Operations Across Columns: `across()`

If you want to apply the same calculation (like `mean()`) to several columns at once, instead of copying and pasting, use the **`across()`** helper function inside `summarize()` or `mutate()`.

### A. Basic and Wildcard Selection
```r
# Calculate the mean of city and highway mileage columns at the same time
mpg |>
  group_by(class) |>
  summarize(across(c(cty, hwy), mean)) |>
  ungroup()

# Apply mean() to all numeric columns in the dataset
mpg |>
  group_by(class) |>
  summarize(across(where(is.numeric), ~ mean(.x, na.rm = TRUE))) |>
  ungroup()
```

### B. Custom Functions & Dynamic Column Renaming
You can pass custom user-defined functions into `across()` and use the `.names` argument to control how R names the newly created columns:

```r
# Define a custom string length counting function
get_length <- function(column_vector) {
  str_length(column_vector)
}

# Apply get_length to all character columns, prefixing new columns with 'length_'
storms |>
  mutate(across(where(is.character), get_length, .names = "length_{col}")) |>
  select(name, status, length_name, length_status) |>
  head(3)
```

---

## 11. Practical Case Studies: nycflights13

Let's study four robust data analytics case studies on our flight logs using these techniques:

### Case Study A: Finding the Most Delayed Flight of Each Day
We want to extract the single record representing the absolute highest departure delay for every individual day of the year:

```r
# Extract highest departure delay per day
flights |>
  group_by(year, month, day) |>
  slice_max(order_by = dep_delay, n = 1) |>
  ungroup() |>
  select(year, month, day, carrier, flight, dep_delay)
```

---

### Case Study B: Extracting the 2nd Most Delayed Flight
To extract the exact Nth-most delayed flight, we can calculate a rank column within each day group using the **`min_rank()`** helper (which ranks numeric values, ascending by default):

```r
# Isolate the 2nd highest delay per day
flights |>
  group_by(year, month, day) |>
  mutate(delay_rank = min_rank(-dep_delay)) |> # Negative sign reverses to descending rank
  filter(delay_rank == 2) |>
  ungroup() |>
  select(year, month, day, carrier, flight, dep_delay)
```

---

### Case Study C: Most Frequently Delayed Carriers (Top 10 Daily Lists)
If we generate a list of the 10 most delayed flights for every single day of the year, which airline carrier appears most frequently across all these daily top-10 lists?

```r
flights |>
  group_by(year, month, day) |>
  slice_max(order_by = dep_delay, n = 10) |> # Extract top 10 per day
  ungroup() |>                                # Drop groups to count globally
  count(carrier, sort = TRUE)                 # Count how many times each carrier appears
```

---

### Case Study D: Calculating the Proportion of Delayed Flights
We will define a flight as "delayed" if the departure delay exceeds 10 minutes. Let's calculate the total flights, count of delayed flights, and mathematical proportion of delayed flights for each carrier:

```r
flights |>
  filter(!is.na(dep_delay)) |>
  group_by(carrier) |>
  summarize(
    total_flights = n(),
    delayed_flights = sum(dep_delay > 10),
    proportion_delayed = delayed_flights / total_flights
  ) |>
  arrange(desc(proportion_delayed))
```

---

## Hands-on Exercises

### Exercise 1: Fuel Performance by Engine Size
**How do physical engine size and average highway fuel efficiency scale as the number of cylinders in a vehicle's engine increases, and how many models fall into each category?**

*Analytical Guidance*:
Analyze the performance characteristics of passenger vehicles grouped by their cylinder classification (`cyl`) in the `mpg` dataset. Your analysis should:
1. Aggregate the dataset by cylinder count.
2. Calculate the average engine displacement and average highway mileage for each cylinder group.
3. Track the total sample size (car count) representing each group to evaluate sample representation.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

mpg |>
  group_by(cyl) |>
  summarize(
    avg_displ = mean(displ),
    avg_hwy = mean(hwy),
    car_count = n()
  ) |>
  ungroup()
```
</details>

---

### Exercise 2: Multi-Column Summary
**What are the peak city and highway fuel efficiency boundaries achieved by any single vehicle model within each automotive manufacturer's lineup?**

*Analytical Guidance*:
Investigate the highest possible performance bounds for both city and highway fuel efficiency separately across all manufacturers in the `mpg` dataset. Your analysis should:
1. Partition the observations by manufacturer.
2. Simultaneously evaluate and extract the maximum achieved city and highway mileage for each brand.
3. Present the first 6 records of the resulting ranking.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

mpg |>
  group_by(manufacturer) |>
  summarize(across(c(cty, hwy), max)) |>
  ungroup() |>
  head()
```
</details>

---

### Exercise 3: Highest Highway Efficiency Manufacturer
**Which vehicle manufacturer achieves the highest average highway fuel efficiency across their entire fleet, and how do all brands rank relative to one another?**

*Analytical Guidance*:
Rank all automotive manufacturers in the `mpg` dataset based on the overall highway fuel performance of their vehicle offerings. Your analysis should:
1. Group all records by manufacturer.
2. Calculate the average highway mileage for each brand's fleet.
3. Sort the resulting brands in descending order of their average efficiency to immediately surface the top-performing fleet.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

mpg |>
  group_by(manufacturer) |>
  summarize(mean_hwy = mean(hwy)) |>
  arrange(desc(mean_hwy))
```
</details>
