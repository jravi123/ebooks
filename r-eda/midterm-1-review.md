# Midterm Review
## Practice Questions & Solutions

---

# Exam Reference Guide

Here are some functions you may be using in this exam:

### 1. Data Type Inspection & Testing
* `is.character()`, `is.numeric()`, `is.factor()`, `is.logical()`, `is.double()`, `is.integer()`
* `starts_with()` (tidyselect helper)

### 2. Type Conversion & Coercion
* `as.numeric()`, `as.logical()`, `as.factor()`, `as.character()`, `as.integer()`

### 3. Grouping, Summarizing & Pivoting
* `group_by()`, `summarize()`, `summarise()`
* `pivot_wider(names_from, values_from, id_cols, names_sep, ...)`
* `pivot_longer(cols, names_to, values_to, names_prefix, names_sep, ...)`

### 4. Data Transformation & Slicing
* `filter()`, `select()`, `mutate()`, `arrange(col)`, `slice_max(n, ...)`

### 5. Visualization (`ggplot2`)
* `ggplot(aes(x = ..., y = ...))`
* `geom_point()`, `geom_line()`, `geom_bar()`

---

# Question 1: Discrete vs. Continuous Color Aesthetics

In the below diagram, I would like to have every unique value of the cylinder (`cyl`) to have a different color. Why is the color shown in a blue gradient currently? How will you fix the code to get different colors for each distinct `cyl` value?

```r
mpg |> ggplot() + geom_point(aes(x = displ, y = hwy, color = cyl))
```

### Explanation & Diagnosis
* **Why it's a gradient**: In the `mpg` dataset, `cyl` is stored as an integer/numeric variable (`<int>`). By default, `ggplot2` maps continuous numeric variables to a continuous color gradient (light to dark blue).
* **How to fix it**: Convert `cyl` into a discrete factor or character variable using `as.factor(cyl)` or `factor(cyl)`.

### Solution Code

```r
# Fix: Coerce cyl to a factor to obtain discrete categorical colors
mpg |> 
  ggplot() + 
  geom_point(aes(x = displ, y = hwy, color = as.factor(cyl)))
```

---

# Question 2: Type Coercion & Missing Values in Vectors

What is the output of the below expression?

```r
sum(c(4, 5, NA, T, F, T))
```

### Explanation & Diagnosis
* `c(4, 5, NA, T, F, T)` creates a vector containing numbers, boolean logicals (`T` = 1, `F` = 0), and an `NA` (missing value).
* When calculating `sum()` on a vector that contains `NA` without `na.rm = TRUE`, the calculation propagates the missingness and returns `NA`.

### Output

```r
[1] NA
```

*(Note: If `na.rm = TRUE` were passed, `T` would be coerced to 1 and `F` to 0, producing $4 + 5 + 1 + 0 + 1 = 11$.)*

---

# Question 3: Column Selection with Tidyselect Helpers

Write a statement that displays only those columns that start with the letter `'m'` in the `'mpg'` dataset.

```r
mpg |> glimpse()
```

### Solution Code

```r
mpg |> select(starts_with('m'))
```

---

# Question 4: Aggregating & Visualizing Trends Over Time

```r
storms |> glimpse()
```

You see the glimpse of the `storms` dataset as shown above.

Write code to display the total number of storms for each year as shown in the diagram below:

```r
storms |> count(year) |> ggplot(aes(x = year, y = n)) + geom_line() + geom_point()
```

Enter your code as your solution.

### Solution Code

```r
storms |> 
  count(year) |> 
  ggplot(aes(x = year, y = n)) + 
  geom_line() + 
  geom_point()
```

---

# Question 5: Multi-Level Grouping & Summary Rollups

What is the output of the below statement? Describe the answer in words and sentences.

```r
storms |> group_by(year, category) |> summarise(n = n()) |> summarize(n = n())
```

### Explanation & Output Description
1. `group_by(year, category)` groups the dataset by two levels: `year` and storm `category`.
2. The first `summarise(n = n())` counts the number of observations for each `(year, category)` pair. By default, `summarise()` strips off the innermost grouping level (`category`), leaving the data grouped by `year`.
3. The second `summarize(n = n())` counts the number of rows remaining in each `year` group, which represents the **number of distinct storm categories observed in each year**.
4. The final result is a tibble with columns `year` and `n`, showing for each year how many distinct storm categories were recorded.

---

# Question 6: Filtering by Top Slices & Visualizing Subsets

Using the `nycflights13` database, I find the top 5 destinations and then I want to plot the top 5 destinations as a bar chart. However, my code is not working as shown below. Please fix the error.

```r
# Broken Code:
top_5 <- flights |> count(dest) |> slice_max(n = 5, n)

flights |> select(dest %in% top_5$dest) |> ggplot(aes(x = dest)) + geom_bar(aes(fill = carrier))
```

### Explanation & Diagnosis
* `select()` is used to pick column variables, not filter rows.
* To filter rows matching a condition (`dest %in% top_5$dest`), use `filter()` instead of `select()`.

### Solution Code

```r
top_5 <- flights |> count(dest) |> slice_max(n = 5, n)

flights |> 
  filter(dest %in% top_5$dest) |> 
  ggplot(aes(x = dest)) + 
  geom_bar(aes(fill = carrier))
```

---

# Question 7: Filtering via Relational Joins

Write the above expression as a join instead.

```r
flights |> count(dest) |> slice_max(n = 5, n) |> left_join(flights)
```

### Solution Code

```r
flights |> 
  count(dest) |> 
  slice_max(n = 5, n) |> 
  left_join(flights, by = "dest")
```

---

# Question 8: Custom Function for Outlier Detection (IQR Rule)

Write a function to compute the outliers of a given vector. Return the outliers from the function. An outlier is defined as any data point that falls more than 1.5 times the interquartile range beyond the first or third quartiles.

*Hint: you can derive the first and third quartiles using `quantile(v, 0.25)` and `quantile(v, 0.75)`.*

```r
get_outliers <- function(v){
  
}
```

### Solution Code

```r
get_outliers <- function(v){
  q1 <- quantile(v, 0.25, na.rm = TRUE)
  q3 <- quantile(v, 0.75, na.rm = TRUE)
  iqr <- q3 - q1
  c(v[v < q1 - 1.5 * iqr], v[v > q3 + 1.5 * iqr])
}

# Example test:
v <- c(1:10, 100)
get_outliers(v)
```

---

# Question 9: Multi-Condition Filtering with `filter()`

Write a query to get all records in `'mpg'` dataset that have `hwy` value greater than 30 and `cty` value greater than 25.

### Solution Code

```r
mpg |> filter(cty > 25, hwy > 30)
```

---

# Question 10: Reshaping Aggregated Summaries with `pivot_wider()`

```r
flights |> glimpse()
```

Show all the carriers and the total number of unique destinations they fly to as shown below:

```r
flights |> group_by(carrier) |> summarize(total_dest = n_distinct(dest)) |> pivot_wider(names_from = carrier, values_from = total_dest)
```

### Solution Code

```r
# Approach 1: Using group_by and n_distinct
flights |> 
  group_by(carrier) |> 
  summarize(total_dest = n_distinct(dest)) |> 
  pivot_wider(names_from = carrier, values_from = total_dest)

# Approach 2: Using chained count calls
flights |> 
  count(carrier, dest) |> 
  count(carrier) |> 
  pivot_wider(names_from = carrier, values_from = n)
```

---

# Question 11: Feature Mutation with Timezone Adjustments

Add a new column to show `sched_dep_time` in PST. Assume the given time is in EST (3 hours / 300 units behind).

### Solution Code

```r
flights |> 
  mutate(sched_dep_time_pst = sched_dep_time - 300)
```
