# Grouping & Sub-group Summaries/Functions

Grouping allow you to group rows based on categories and summarize help collapse, groups of data into a single summary row, extracting trends across categories, and evaluate metrics within subgroups.

---
# Today we will cover

* **Review**: Checking table size with `nrow()` vs. `dim()`.
* **Review**: The `mutate()` verb 
* **Grouping rows**: The `group_by()` fundamentals.
* **NYC Flights Dataset**: Continue using `flights` log from `nycflights13`.
* **Grouped Summaries & Slices**: Computing group metrics and verifying slices.
* **Counting Shortcuts**: `count()` vs. `group_by() |> summarize(n = n())`.
* **Bar Charts & Geometry**: `geom_bar()` vs. `geom_col()` vs. `geom_bar(stat = 'identity')`.
* **Relative Frequencies & Slicing**: Finding top categories with `slice_max()` and plotting filled proportions.
* **The Group Dropping Rule**: How `summarize()` automatically drops grouping variables, and using `.groups`.
* **Summary Functions & Logical Gates**: `mean()`, `median()`, `sd()`, `IQR()`, `n_distinct()`, and boolean aggregations with `any()`, `all()`, and `sum()`.
* **Grouped Mutations & Centering**: Working with the Ann Arbor weather dataset (`aatemp`), quarterly centering, and the **Rank Mutation Caveats**.
* **Table Binding**: Combining tables with `rbind()` and `cbind()`.
* **Applying Custom Functions with `across()`**: Multi-column transformations and predicate helpers.
* **More Practice**: Finding daily extrema, ordinal rankings with `min_rank()`, and carrier delay proportions.


---
# Checking Dimensions: `nrow()` vs. `dim()`

Before running aggregations on unfamiliar datasets, verify the scale and dimensions of your tables:

* **`nrow(df)`**: Returns a single integer representing the total number of rows.
* **`dim(df)`**: Returns a length-2 integer vector: `c(rows, columns)`.

```r
library(tidyverse)

# Row count check
mpg |> nrow() # Output: 234

# Row and column dimensions
dim(mpg)      # Output: 234  11
```

`nrow()` is especially convenient at the end of a pipe chain (`|> nrow()`) to quickly check how many records passed a filter.
---

# Review: The `mutate()` Verb & Understand Basic Grouping

Before diving into advanced grouping, let's review the role of `mutate()` and then understand `group_by()`:

* **`mutate()`**: Takes an input table and returns a new table with columns added, modified, or removed:
```r
library(tidyverse)

# Create a sample table
df <- tibble(x = c(10, 20, 30, 40), old_col = c(1, 1, 1, 1))

# Adding and removing columns
mutate(df, new_col = x * 2, new_col2 = new_col + 1, old_col = NULL)
```

* **Summary Functions in `mutate()`**: You can compute deviations against overall column statistics:

```r
library(tidyverse)

df <- tibble(x = c(10, 20, 30, 40))

# Centering a variable
mutate(df, x_centered = x - mean(x, na.rm = TRUE))

```

---

# The `summarize` applied to the entire dataset

We can use `summarize` to compute summaries. Let us apply some functions for the entire dataset

```r
library(tidyverse)

mpg |> 
  summarize(
    average_hwy = mean(hwy),
    highest_hwy = max(hwy),
    min_hwy = min(hwy)
  )

```
---

# Grouping rows using 'group_by' 

* **`group_by()`**: Groups the rows based on a category so that downstream verbs operate within each group independently:
```r
library(tidyverse)

mpg |>
  group_by(manufacturer) |>
  summarize(hwy_mean = mean(hwy))
```


---
# The NYC Flights Dataset (`nycflights13`)

We already know that **`nycflights13`** package contains data on all 336,776 commercial flights departing New York City (JFK, LGA, EWR) in 2013:

```r
library(tidyverse)
library(nycflights13)

# Glimpse the flights log structure
glimpse(flights)
```

Notice the scale: with over 336k records, manual loops in R would be very slow. `dplyr` operations execute in compiled C++ to aggregate this volume in milliseconds.

---
# More Grouping Examples

Let's calculate the average departure delay and total flight volume for every airline carrier:

```r
library(tidyverse)
library(nycflights13)

flights |>
  group_by(carrier) |>
  summarize(
    avg_dep_delay = mean(dep_delay, na.rm = TRUE),
    total_flights = n()
  )
```

### Verifying a Specific Group
You can verify any single group's summary by filtering for that carrier directly:

```r
library(tidyverse)
library(nycflights13)

flights |>
  filter(carrier == "9E") |>
  summarize(
    mean_delay = mean(dep_delay, na.rm = TRUE),
    n = n()
  )
```

---
# Using `count()` as a Shorthand

Counting row occurrences per category is so common that `dplyr` provides the **`count()`** shortcut:

```r
library(tidyverse)
library(nycflights13)

# Standard verbose way:
flights |>
  group_by(carrier) |>
  summarize(n = n())

# Clean, identical shortcut:
flights |>
  count(carrier)
```

> [!TIP] Auto-Sorting Counts
> Adding `sort = TRUE` automatically orders the output from most frequent to least frequent:
> ```r
> library(tidyverse)
> library(nycflights13)
> flights |> count(carrier, sort = TRUE)
> ```

---
# Other ways of sorting

Sort in ascending order

```r
library(tidyverse)
library(nycflights13)
flights |> count(carrier) |> arrange(n)
```

Sort in descending order

```r
flights |> count(carrier) |> arrange(-n)
```

---
# Bar Charts & Geometries: `geom_bar()` vs. `geom_col()`

When plotting category distributions, ggplot provides two main ways to render bars:

### 1. Implicit Counting (`geom_bar()`)
Let ggplot calculate the counts automatically. Map only the $x$-axis:
```r
library(tidyverse)
library(nycflights13)

flights |>
  ggplot(aes(x = origin, fill = origin)) +
  geom_bar()
```

### 2. Explicit Pre-counted Values (`geom_col()`)
If your pipeline already counted the frequencies, map both $x$ and $y$:
```r
library(tidyverse)
library(nycflights13)

flights |>
  count(origin) |>
  ggplot(aes(x = origin, y = n, fill = origin)) +
  geom_col()
```

*(Note: `geom_bar(stat = "identity")` is equivalent to `geom_col()`.)*

---
# Inspecting Group Metadata: `group_vars()`

Calling `group_by()` does not rearrange rows or create separate tables in memory. It simply attaches grouping metadata:

```r
library(tidyverse)
library(nycflights13)

carrier_grp <- group_by(flights, carrier)

# Dimensions and column counts remain identical:
nrow(flights) == nrow(carrier_grp)       # Output: TRUE
length(colnames(flights)) == length(colnames(carrier_grp)) # Output: TRUE

# Inspect active grouping variables:
group_vars(carrier_grp) # Output: "carrier"
```

---
# Grouping by Multiple Variables

You can group by multiple columns simultaneously to analyze multi-level categories:

```r
library(tidyverse)
library(nycflights13)

# Group by origin airport and destination airport
flights |>
  group_by(origin, dest) |>
  group_vars() # Output: "origin" "dest"

# Count flights on every specific origin-to-destination route
flights |>
  group_by(origin, dest) |>
  summarize(n = n())
```

---
# Relative Frequency Charts

To compare proportions across origins, we can find the top destinations and visualize their relative shares:

```r
library(tidyverse)
library(nycflights13)

# 1. Identify the top 3 flight destinations overall:
top_3 <- flights |>
  count(dest) |>
  slice_max(n, n = 3, with_ties = FALSE)

top_3
```

```r
library(tidyverse)
library(nycflights13)

top_3 <- flights |>
  count(dest) |>
  slice_max(n, n = 3, with_ties = FALSE)

# 2. Render a 100% relative frequency stacked bar chart:
flights |>
  filter(dest %in% top_3$dest) |>
  ggplot(aes(x = origin, fill = dest)) +
  geom_bar(position = "fill") +
  labs(title = "Top 3 Destination Shares by NYC Origin", y = "Proportion")
```

`position = "fill"` scales each bar to a uniform 1.0 (100%), allowing clear comparison of relative proportions across airports.

---
# Slicing Extremes: `slice_max()` and The Ties Rule

To isolate the highest or lowest $N$ rows by a specific metric, use **`slice_max()`** or **`slice_min()`**:

```r
library(tidyverse)

# Top 5 most fuel-efficient cars:
mpg |>
  slice_max(hwy, n = 5, with_ties = FALSE) |>
  select(manufacturer, model, year, hwy)
```

> [!IMPORTANT] The `with_ties` Parameter
> By default, `slice_max()` uses `with_ties = TRUE`. If there is a tie at the $N$-th cutoff, it will return **more than $N$ rows**. Set `with_ties = FALSE` to guarantee an exact row count.

---
# The Group Dropping Rule

When summarizing multi-level groupings, `dplyr` follows a specific convention:

> [!IMPORTANT] The Default Peeling Rule
> After each `summarize()` step, the **rightmost grouping variable is automatically dropped**, leaving the output grouped by the remaining variables.

```r
library(tidyverse)
library(nycflights13)

# 1. Grouped by both 'origin' and 'dest':
gp_data <- flights |> group_by(origin, dest)
group_vars(gp_data) # Output: "origin" "dest"

# 2. First summarize drops 'dest', leaving the table grouped by 'origin':
s1 <- gp_data |> summarize(n = n())
group_vars(s1)      # Output: "origin"

# 3. Second summarize drops 'origin', leaving the table completely ungrouped:
s2 <- s1 |> summarize(total = sum(n))
group_vars(s2)      # Output: character(0)
```

To avoid subtle bugs from retained grouping, explicitly supply `.groups = "drop"` inside `summarize()`.

---
# Useful Functions for Summaries

Common scalar reduction functions used inside `summarize()`:

* **Location & Center**: `mean(x)`, `median(x)`.
* **Spread & Variability**: `sd(x)`, `IQR(x)`, `var(x)`.
* **Extrema & Quantiles**: `min(x)`, `max(x)`, `quantile(x, probs)`.
* **Counts & Distinct Values**: `n()` (group row count), `n_distinct(x)` (unique count).
* **Positional Values**: `first(x)`, `last(x)`, `nth(x, n)`.

```r
library(tidyverse)
library(nycflights13)

# Number of flights and unique destinations per carrier:
flights |>
  group_by(carrier) |>
  summarize(
    total_flights = n(),
    unique_destinations = n_distinct(dest),
    first_flight_time = first(dep_time),
    .groups = "drop"
  )
```

---
# Boolean Gates & Condition Aggregations

Evaluating logical conditions across vectors inside `summarize()` is a powerful diagnostic tool:

* **`any(condition)`**: Returns `TRUE` if **at least one** row meets the condition.
* **`all(condition)`**: Returns `TRUE` if **every single** row meets the condition.
* **`sum(condition)`**: Counts the number of rows returning `TRUE` (coerces `TRUE` to `1`, `FALSE` to `0`).
* **`mean(condition)`**: Computes the **proportion** (from `0.0` to `1.0`) of rows satisfying the condition.

```r
library(tidyverse)
library(nycflights13)

flights |>
  filter(!is.na(dep_delay)) |>
  group_by(origin) |>
  summarize(
    has_severe_delay = any(dep_delay >= 180),
    all_delayed = all(dep_delay > 0),
    count_delayed_10m = sum(dep_delay > 10),
    pct_delayed_10m = round(mean(dep_delay > 10) * 100, 2),
    .groups = "drop"
  )
```

---
# Dynamic Filtering: `pull()` with `%in%`

To isolate top categories and filter your raw data by those entities:

```r
library(tidyverse)

# 1. Identify the top 2 vehicle classes by volume:
top_classes <- mpg |>
  count(class) |>
  slice_max(n, n = 2, with_ties = FALSE) |>
  pull(class) # Returns a character vector: c("suv", "compact")

# 2. Filter raw dataset using %in%:
mpg |>
  filter(class %in% top_classes) |>
  head(3)
```

`pull()` extracts a single column into a bare R vector, making it clean to use inside `%in%` filter criteria.

---
# Ann Arbor Weather Data (`aatemp`)

To study grouped transformations, centering, and ranking, we load daily weather observations for Ann Arbor, MI:

```r
library(tidyverse)
library(lubridate)

# Load Ann Arbor weather dataset
aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

# Filter for the year 2025 (365 days):
aatemp_2025 <- aatemp |>
  filter(year(DATE) == 2025)

aatemp_2025 |> select(DATE, TMAX, TMIN, PRCP) |> head(4)
```

### Adding Derived Columns with `mutate()`:
```r
library(tidyverse)
library(lubridate)

aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

aatemp_2025 <- aatemp |>
  filter(year(DATE) == 2025)

# Calculate daily temperature range (TMAX - TMIN in Fahrenheit)
aatemp_range <- aatemp_2025 |>
  mutate(TRANGE = TMAX - TMIN) |>
  select(DATE, TMAX, TMIN, TRANGE)

head(aatemp_range, 3)
```

---
# Centering Variables & Grouped `mutate()`

Subtracting an overall mean centers the data around zero.

### Overall Centering:
```r
library(tidyverse)
library(lubridate)

aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

aatemp_2025 <- aatemp |>
  filter(year(DATE) == 2025)

aatemp_2025 |>
  mutate(TMAX_centered = TMAX - mean(TMAX, na.rm = TRUE)) |>
  ggplot(aes(y = TMAX_centered, x = factor(quarter(DATE)))) +
  geom_violin() +
  labs(title = "Overall Centered Temperature by Quarter (2025)", x = "Quarter")
```

### Within-Group Quarterly Centering:
When combined with grouping, `mutate()` calculates how much data points differ from the column average **within each category**:

```r
library(tidyverse)
library(lubridate)

aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

aatemp_2025 <- aatemp |>
  filter(year(DATE) == 2025)

aatemp_2025 |>
  group_by(quarter = quarter(DATE)) |>
  mutate(TMAX_centered = TMAX - mean(TMAX, na.rm = TRUE)) |>
  ggplot(aes(y = TMAX_centered, x = factor(quarter))) +
  geom_violin() +
  labs(title = "Quarter-Mean Centered Temperatures (2025)", x = "Quarter")
```

Notice how `mutate()` on a grouped table keeps all individual rows, but computes `mean(TMAX)` separately per quarter.

---
# Ranking Data: The `rank()` Function

In R, **`rank()`** assigns an ordering position to each element in a vector from smallest ($1$) to largest ($N$):

* **Robustness**: Ranks replace raw numeric values with ordinal positions ($1, 2, \dots, N$), making analyses less susceptible to extreme outliers.
* **Ties handling**: By default (`ties.method = "average"`), tied values receive the average rank.

```r
# Simple numeric vector:
x <- c(45, 12, 88, 30, 88)

# Calculate ranks (by default, ties receive average rank):
rank(x)
```

### Ranking Inside a Data Frame with `mutate()`:
You can use `rank()` inside `mutate()` to create a column showing where each value stands:

```r
library(tidyverse)

df <- tibble(
  student = c("Alice", "Bob", "Charlie", "David"),
  score = c(92, 78, 95, 88)
)

# Rank students by score (smallest to largest):
df |>
  mutate(score_rank = rank(score))
```

> [!TIP] Ascending vs. Descending Ranks
> To rank highest-to-lowest (e.g., 1st place for top score), rank the negative values:
> `mutate(rank_desc = rank(-score))` or use dplyr's `min_rank(desc(score))`.

---
# The Rank Mutation

### Why Rank Monthly Centered Temperatures?
* **Raw Temperature vs. Seasonality**: An 80°F day in July is normal, but an 80°F day in **April** is an extreme heat anomaly.
* **Centering (`TMAX - mean_month`)**: Measures how many degrees above or below the seasonal norm a specific day was.
* **Ranking Anomaly (`rank(TMAX_centered)`)**: Rank 1 is the most unusually cold day relative to its season; Rank 365 is the most unusually warm day.

Suppose we center daily temperatures by monthly averages to find the most unusual days in 2025:

```r
library(tidyverse)
library(lubridate)

aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

aatemp_2025 <- aatemp |>
  filter(year(DATE) == 2025)

# Group by month and center daily maximum temperature
aat_month_centered <- aatemp_2025 |>
  group_by(month = month(DATE)) |>
  mutate(TMAX_centered = TMAX - mean(TMAX, na.rm = TRUE))

# View first few rows of centered temperatures:
aat_month_centered |> select(DATE, month, TMAX, TMAX_centered) |> head(4)
```

> [!CAUTION] The Rank Mutation Gone Wrong
> If you call `mutate(r = rank(TMAX_centered))` while the data is **still grouped by month**, R ranks values **locally within each month**. Ranks will cycle from 1 to ~31 for each month rather than ranking across the whole year!

```r
library(tidyverse)
library(lubridate)

aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

aatemp_2025 <- aatemp |>
  filter(year(DATE) == 2025)

aat_month_centered <- aatemp_2025 |>
  group_by(month = month(DATE)) |>
  mutate(TMAX_centered = TMAX - mean(TMAX, na.rm = TRUE))

# Local ranking within each month group (min is 1 in EVERY month):
aat_month_centered |>
  mutate(r = rank(TMAX_centered)) |>
  summarize(min_rank = min(r), max_rank = max(r)) |>
  head(3)
```

---
# Fixing with `ungroup()`

We need to drop the grouping values with **`ungroup()`** so that we can rank across all 365 days of 2025:

```r
library(tidyverse)
library(lubridate)

aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

aatemp_2025 <- aatemp |>
  filter(year(DATE) == 2025)

aat_month_centered <- aatemp_2025 |>
  group_by(month = month(DATE)) |>
  mutate(TMAX_centered = TMAX - mean(TMAX, na.rm = TRUE)) |> ungroup()

# Correct: Ungroup first, then rank across all 365 days
aat_month_centered |>
  mutate(r = rank(TMAX_centered)) |>
  summarize(min_rank = min(r), max_rank = max(r))
```

### Finding the Top Anomalous Days:
Now we can easily find the days in 2025 with the highest temperature anomaly relative to their monthly average:

```r
library(tidyverse)
library(lubridate)

aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

aatemp_2025 <- aatemp |>
  filter(year(DATE) == 2025)

aatemp_2025 |>
  group_by(month = month(DATE)) |>
  mutate(TMAX_centered = TMAX - mean(TMAX, na.rm = TRUE)) |>
  ungroup() |>
  mutate(r = rank(TMAX_centered)) |>
  slice_max(r, n = 5) |>
  select(DATE, month, TMAX, TMAX_centered, r)
```

---
# Table Binding: `rbind()` & `cbind()`

When you need to combine separate tables:

* **`rbind(table1, table2)`**: "Row bind" — stacks tables vertically. Column names and types must match.
* **`cbind(table1, table2)`**: "Column bind" — glues tables horizontally side-by-side. Row counts must match.

```r
library(tidyverse)

t1 <- tibble(x = 1, y = 2)
t2 <- tibble(x = 2, y = 4)
print(t1)
print(t2)
# Stack rows vertically
t_stacked <- rbind(t1, t2)
print(t_stacked)

# Add columns horizontally
cbind(t_stacked, label = c("alpha", "beta"))
```

---
# Applying Custom Functions with `across()`

Use **`across()`** inside `mutate()` or `summarize()` to apply custom or built-in functions across multiple columns:

```r
library(tidyverse)
library(stringr)

# Define a custom string length function
get_length <- function(x) {
  str_length(x)
}

# Apply get_length to all character columns in storms:
storms |>
  mutate(across(where(is.character), get_length, .names = "length_{col}")) |>
  head(3)
```

### Multi-Column Summaries:
```r
library(tidyverse)

# Summarize both cty and hwy across vehicle drive types:
mpg |>
  group_by(drv) |>
  summarize(across(c(cty, hwy), list(mean = mean, max = max)))
```

---
# Datetime Grouping & Day-of-Week Trends

The `lubridate` package provides functions to extract components from timestamps:

* **`wday(time_col, label = TRUE)`**: Labeled day of week (`Sun`, `Mon`, ..., `Sat`).
* **`month(time_col, label = TRUE)`**: Labeled month (`Jan`, `Feb`, ...).

```r
library(tidyverse)
library(nycflights13)
library(lubridate)

# Analyze average departure delay by day of the week:
flights |>
  mutate(day_of_week = wday(time_hour, label = TRUE)) |>
  group_by(day_of_week) |>
  summarize(
    total_flights = n(),
    avg_delay = round(mean(dep_delay, na.rm = TRUE), 2)
  )
```

---
# Practice: Flight Extrema & Ordinal Ranks

### Most Delayed Flight per Day
```r
library(tidyverse)
library(nycflights13)

flights |>
  group_by(year, month, day) |>
  slice_max(dep_delay)
```

### The 2nd Most Delayed Flight per Day using `min_rank()`
```r
library(tidyverse)
library(nycflights13)

flights |>
  group_by(year, month, day) |>
  mutate(rank = min_rank(-dep_delay), .before = "year") |>
  filter(rank == 2)
```

---
# Practice: Proportions & Rankings

### Most Commonly Delayed Carrier in Daily Top 10
Which carrier appears most frequently among the 10 most delayed flights of each day?

```r
library(tidyverse)
library(nycflights13)

flights |>
  group_by(year, month, day) |>
  slice_max(dep_delay, n = 10, with_ties = FALSE) |>
  ungroup() |>
  count(carrier, sort = TRUE) |>
  head(5)
```

### Proportion of Delayed Flights by Airline
```r
library(tidyverse)
library(nycflights13)

flights |>
  filter(!is.na(dep_delay)) |>
  group_by(carrier) |>
  summarize(
    total = n(),
    delayed = sum(dep_delay > 10),
    prop_delayed = round(delayed / total, 3),
    .groups = "drop"
  ) |>
  arrange(desc(prop_delayed)) |>
  head(5)
```

---
# Module Summary & Key Takeaways

1. **`summarize()` vs. `mutate()`**: `summarize()` collapses rows into group-level scalars; grouped `mutate()` preserves all rows to compute relative deviations or within-group proportions.
2. **Handle Missing Values Explicitly**: Always specify `na.rm = TRUE` or filter missing values with `!is.na()` before computing reductions.
3. **Control Slicing Ties**: Use `with_ties = FALSE` in `slice_max()` when an exact number of rows is required.
4. **The Group Dropping Rule**: `summarize()` sheds the last grouping variable by default. Use `.groups = "drop"` to prevent accidental group persistence.
5. **Remember to `ungroup()`**: Drop group metadata with `ungroup()` before computing global ranks, slices, or overall counts.
