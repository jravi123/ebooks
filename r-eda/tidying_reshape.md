# Data Tidying & Reshaping: Pivots

## Why Learn Reshaping in Exploratory Data Analysis?

In real-world data collection, tables are often designed for human eyes to read easily, not for computers to process. 

Imagine you are analyzing monthly company profits:
* **The Wide Layout (Human-Friendly)**: Your table has columns named `Company`, `Jan_Profit`, `Feb_Profit`, `Mar_Profit`, and so on.
* **The Downstream Problem**: If you want to plot a line chart of profit over time, `ggplot2` requires a single column for the $x$-axis variable (`Month`) and a single column for the $y$-axis variable (`Profit`). In this wide format, you cannot easily map these columns to your visual variables because the data is spread across dozen different columns!

To plot, model, or analyze this data, you must reshape the table. You need to pivot the headers (`Jan_Profit`, `Feb_Profit`) down into a single `Month` column and collect their values into a single `Profit` column.

In this chapter, we will master the **`tidyr`** package (part of the `tidyverse`), which provides a clean, unified grammar for pivoting tables between wide and long shapes, splitting cell values, and handling missing data.

---

## 1. The Rules & Philosophy of Tidy Data

Hadley Wickham established three core rules that define a dataset as **tidy**:

1. **Each variable** must have its own column.
2. **Each observation** must have its own row.
3. **Each value** must get its own individual cell.

Any dataset that fails to meet these criteria is classified as **messy**.

```
    Tidy Data Structure:
    
       Column = Variable
          ↓
     ┌──────────┬──────────┬──────────┐
     │ Country  │   Year   │  Cases   │
     ├──────────┼──────────┼──────────┤
 Row │   USA    │   1999   │   745    │  ← Row = A Single Observation
     │   USA    │   2000   │   2348   │
     └──────────┴──────────┴──────────┘
                            ▲
                        Cell = One Value
```

### The Tidyverse Contract
Why do we care so much about tidiness? Tidy data acts as a **structural contract** that all packages inside the `tidyverse` respect. Because every tool (`dplyr`, `ggplot2`, `tidyr`) expects to receive tidy data and guarantees to output tidy data, you can chain dozens of operations together using the pipe operator (`|>`) without worrying about mismatched structures.

Let's look at four representations of the same epidemiological data provided in the Tidyverse package to understand tidy vs. messy formats:

#### A. Tidy Format (`table1`)
```r
library(tidyverse)

print(table1)
```
* **Why it is Tidy**: Each column is a clean, distinct variable (`country`, `year`, `cases`, `population`). Each row is a single country-year observation, and every cell contains a single value.

#### B. Messy Format: Variables as Row Values (`table2`)
```r
print(table2)
```
* **Why it is Messy**: The `type` column contains names of variables (`cases` and `population`) stored as text values, and their actual numeric counts are combined in a single `count` column. This violates Rule 1 (variables must have their own columns).

#### C. Messy Format: Combined Cell Values (`table3`)
```r
print(table3)
```
* **Why it is Messy**: The `rate` column contains two distinct variables (`cases` and `population`) merged together inside a single character string cell separated by a slash (e.g., `"745/19987071"`). This violates Rule 3 (each cell must contain a single value).

#### D. Messy Format: Variables Spread Across Headers (`table4a` and `table4b`)
```r
print(table4a) # contains case counts
print(table4b) # contains population counts
```
* **Why it is Messy**: The temporal variable `year` is split across column headers (`1999` and `2000`). This violates Rule 1 and splits a single dataset across two separate tables.

---

## 2. The Analytical Advantages of Tidiness

When data is tidy, executing complex mathematical transformations and rendering advanced charts becomes incredibly straightforward.

### A. Direct Mathematical Pipelines
Calculating epidemiological case rates per 10,000 people is direct and intuitive with tidy data:

```r
# Rate calculation on tidy table1
table1 |>
  mutate(rate = (cases / population) * 10000)
```

If we tried to compute this exact same metric on the messy `table2`, we would have to write highly convoluted logic to split, align, and divide cases and population rows.

### B. Instant Data Visualizations
`ggplot2` maps visual aesthetics directly to columns. If your data is tidy, you can render a multi-series line chart in just a few lines of code:

```r
# Visualize case count trends over time across countries
table1 |>
  ggplot(aes(x = year, y = cases, color = country)) +
  geom_line() +
  geom_point() +
  scale_x_continuous(breaks = c(1999, 2000)) +
  labs(x = "Calendar Year", y = "Documented TB Cases", color = "Country")
```

---

## 3. Making Data Longer: `pivot_longer()`

When a variable is spread across multiple column headers (as in `table4a`), we need to "melt" those columns into a narrower, taller table. We achieve this using **`pivot_longer()`**:

```
     Wide Format (table4a):             Pivoted Long Format:
     ┌─────────┬────────┬────────┐      ┌─────────┬────────┬──────────┐
     │ Country │  1999  │  2000  │  ⇒   │ Country │  Year  │ TB_Cases │
     ├─────────┼────────┼────────┤      ├─────────┼────────┼──────────┤
     │   USA   │  745   │  2348  │      │   USA   │  1999  │   745    │
     └─────────┴────────┴────────┘      │   USA   │  2000  │   2348   │
                                        └─────────┴────────┴──────────┘
```

### Key Parameters:
* **`cols`**: The columns you want to collapse (specified by name, index, or selection helpers).
* **`names_to`**: A character string defining the name of the new column that will store the collapsed column *headers*.
* **`values_to`**: A character string defining the name of the new column that will store the cell *values* nested under those headers.

```r
# Pivot table4a using column names
table4a |>
  pivot_longer(
    cols = c("1999", "2000"),
    names_to = "year",
    values_to = "tb_cases"
  )

# Equivalent pivot using column index positions
table4a |>
  pivot_longer(
    cols = c(2, 3),
    names_to = "year",
    values_to = "tb_cases"
  )
```

---

## 4. Making Data Wider: `pivot_wider()`

When a single observation is scattered across multiple rows (as in `table2`), we need to flatten the rows out into distinct columns. We achieve this using **`pivot_wider()`**:

```
     Long Format (table2):               Pivoted Wide Format:
     ┌─────────┬──────┬────────────┐     ┌─────────┬──────┬───────┬────────────┐
     │ Country │ Year │    Type    │  ⇒  │ Country │ Year │ Cases │ Population │
     ├─────────┼──────┼────────────┤     ├─────────┼──────┼───────┼────────────┤
     │   USA   │ 1999 │   cases    │     │   USA   │ 1999 │  745  │  19987071  │
     │   USA   │ 1999 │ population │     └─────────┴──────┴───────┴────────────┘
     └─────────┴──────┴────────────┘
```

### Key Parameters:
* **`names_from`**: The column containing the categorical values that will become our new column *headers*.
* **`values_from`**: The column containing the cell *values* that will populate those new columns.

```r
# Tidy table2 by widening cases and population rows
table2 |>
  pivot_wider(
    names_from = type,
    values_from = count
  )
```

### Intentionally Untidying for Human Readability
While tidy data is mandatory for analysis and modeling, humans often prefer non-tidy, wide matrices for quick tabular review.

For example, the socioeconomic package `gapminder` contains tidy metrics. If we want to present a clean table comparing Cap GDPs over time for countries in the Americas, we can untidy the data by widening the years:

```r
library(gapminder)

# Transform tidy Gapminder data into a wide matrix for executive review
gapminder |>
  filter(continent == "Americas") |>
  pivot_wider(
    id_cols = country,
    names_from = year,
    values_from = gdpPercap
  )
```

---

## 5. Advanced Pivoting Operations

The `tidyr` package provides robust tools to handle highly complex restructuring scenarios.

### A. Widening Multiple Metric Columns Simultaneously
Suppose we have a student grades database recording scores across multiple questions (`q1`, `q2`, `q3`) and exams (`mt1`, `mt2`). We can pass multiple columns to `values_from` to generate a combined matrix:

```r
grades <- tribble(
  ~person, ~exam, ~q1, ~q2, ~q3,
  "alice", "mt1", 1,   2,   3.5,
  "alice", "mt2", 0.5, 2.5, 1.5,
  "bob",   "mt1", 0.0, 1.0, 1.5,
  "bob",   "mt2", 1.5, 2.5, 2.0
)

# Expand multiple questions and exams into unique column names
grades |>
  pivot_wider(
    names_from = exam,
    values_from = c(q1, q2, q3)
  )
```
This produces headers like `q1_mt1`, `q1_mt2`, `q2_mt1`, etc., organizing multi-variable questions beautifully in a single row per student!

### B. Filling Missing Values: `values_fill`
When pivoting long data into a wide matrix, missing combinations result in `NA` cells. You can replace these missing values with a default constant (such as `0`) during the pivot using **`values_fill`**:

```r
# Pivot wide, substituting any missing year/month storm record with 0
storms |>
  filter(year > 2010) |>
  count(year, month) |>
  pivot_wider(
    names_from = month,
    values_from = n,
    values_fill = 0
  )
```

---

## 6. Splitting and Merging Columns: `separate_wider_*`

When a single cell bundles multiple values together (like Rule 3 violations in `table3`), we can split them apart.

### Splitting Columns by Delimiters: `separate_wider_delim()`
`separate_wider_delim(cols, delim, names)` splits a column into multiple columns using a specific delimiter (e.g. a slash, comma, or dash):

```r
# Tidy up table3 by splitting cases and population rates
table3 |>
  separate_wider_delim(
    cols = rate,
    delim = "/",
    names = c("cases", "population")
  )
```

### Expanding Cell Lists to Rows: `separate_longer_delim()`
If a cell contains a delimited list of values (like tags associated with an article), you can expand the table vertically, creating a dedicated row for each list item:

```r
tags_data <- tibble(
  Article = "Intro to R", 
  Tags = "DataWrangling,ggplot2,Tidyverse"
)

# Expand comma-separated tags into individual rows
tags_data |>
  separate_longer_delim(cols = Tags, delim = ",")
```

---

## 7. Handling Scattered Missing Values

Beyond pivots, standard database calculations often introduce or expose missing values (`NA`). `tidyr` offers clean helpers to manage them:

* **`drop_na(..., cols)`**: Removes any row containing `NA` inside the specified columns.
* **`replace_na(replace = list(col = value))`**: Substitutes `NA` values with a constant default:

```r
messy_table <- tibble(
  ID = 1:3,
  Sales = c(100, NA, 300),
  Region = c("East", "West", NA)
)

# 1. Reassign missing sales to 0 and missing regions to "Unknown"
messy_table |>
  replace_na(list(
    Sales = 0,
    Region = "Unknown"
  ))
```

---

## Hands-on Exercises

### Exercise 1: Standardizing Epidemiological Observations
**How can we restructure our raw tuberculosis tracking log so that country cases and population counts are stored in separate, clean variable columns instead of stacked row values?**

*Analytical Guidance*:
Tidy up the messy `table2` dataset using the appropriate pivoting function. Your analysis should:
1. Identify which column contains the variable names (`type`) and which column contains the numeric measurements (`count`).
2. Flatten these rows out into two dedicated variable columns named `cases` and `population`.
3. Print the tidy table and calculate a new column `case_rate` representing cases per 10,000 people.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

table2 |>
  pivot_wider(
    names_from = type,
    values_from = count
  ) |>
  mutate(case_rate = (cases / population) * 10000)
```
</details>

---

### Exercise 2: Airport Passenger Traffic Timelines
**How do monthly flight departure volumes compare across the three major NYC airports, and how can we present this as a clean, wide timeline matrix for executive review?**

*Analytical Guidance*:
Re-create a wide monthly departure matrix using the `flights` dataset from the `nycflights13` library. Your analysis should:
1. Summarize and count the number of departures grouped by airport origin (`origin`) and calendar month (`month`).
2. Pivot the resulting summary wider so that each calendar month (1 through 12) becomes its own column header, with the cells populated by departure counts.
3. Print the final comparative timeline.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(nycflights13)

flights |>
  count(origin, month) |>
  pivot_wider(
    names_from = month,
    values_from = n
  )
```
</details>

---

### Exercise 3: Tracking Historical Weather Patterns
**How have monthly storm frequency distributions behaved across years since 2011, and how can we generate a zero-filled frequency matrix to visualize seasonal occurrences?**

*Analytical Guidance*:
Analyze storm occurrences in the built-in `storms` dataset. Your analysis should:
1. Filter the dataset to keep only records where the calendar year is strictly greater than 2010.
2. Group the data and calculate the total count of storms for each unique year and month combination.
3. Pivot the months wider into column headers so that we can easily compare seasonal patterns horizontally.
4. Ensure that any year/month combinations with zero recorded storms are filled with `0` instead of returning missing `NA` cells.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

storms |>
  filter(year > 2010) |>
  count(year, month) |>
  pivot_wider(
    names_from = month,
    values_from = n,
    values_fill = 0
  )
```
</details>
