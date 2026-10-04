# Data Tidying & Reshaping with tidyr
## Tidy Data, Lengthening, Widening, and Reshaping

---

# Lecture Agenda & Topics

Real-world datasets arrive in countless inconsistent formats, but tidyverse in R expect tables structured according to a strict, standardized format.

Today we will methodically cover:
* **The Foundations of Tidy Data**: The three core rules and why they matter.
* **The WHO Tuberculosis Case Studies**: A detailed inspection of `table1`, `table2`, `table3`, `table4a`, and `table4b`.
* **Why Tidiness Matters**: The tidy contract, pipeline fluidity (`|>`), arithmetic mutations, and seamless `ggplot2` integration.
* **The Pain of Messy Data**: Why basic calculations become difficult or impossible on untidy tables.
* **Summaries and Tidiness**: How `summarize()` and weighted `count()` preserve tidy structure.
* **Making Data Longer with `pivot_longer()`**:
  * Conceptual need: variables scattered across column headers.
  * Core arguments: `cols`, `names_to`, and `values_to`.
  * Destination columns: understanding the creation of new variable names.
* **Making Data Wider with `pivot_wider()`**:
  * Conceptual need: single observations scattered across multiple rows.
  * Core arguments: `names_from` and `values_from`.
  * Inverting transformations: `pivot_longer` and `pivot_wider` as mathematical inverses.
* **Human-Readable Presentation vs. Machine Analysis**: When and why to untidy tables for executive reports.

---

# Conceptual Foundations: What is Tidy Data?

There are many ways to organize tabular data, but some structures facilitate computation while others introduce severe friction.

A dataset is formally defined as **tidy** if and only if it satisfies three interlocking criteria:

1. **Each variable must have its own column.**
2. **Each observation must have its own row.**
3. **Each value must have its own cell.**
4. *(Corollary)* **Each different type of observational unit gets its own table.**

![Tidy Data Structure: Variables in Columns, Observations in Rows, Values in Cells](/assets/ebooks/r-eda/tidy_data.png)

Data tables that violate any of these rules are called **messy** (or untidy).

---

# Visual Architecture of Tidy Data

The following diagram illustrates the geometric relationship between variables, observations, and values in a tidy table:

```
        Columns = Variables
          |        |        |
          v        v        v
      +---------+------+---------+
      | Country | Year |  Cases  |  
      +---------+------+---------+
Row 1 |   AFG   | 1999 |   745   |  <--- Row = Observation
      +---------+------+---------+
Row 2 |   AFG   | 2000 |  2666   |
      +---------+------+---------+
Row 3 |   BRA   | 1999 |  37737  |
      +---------+------+---------+
```

### Why this specific geometry?
* **Consistent Vector Alignment**: Because all columns are vectors of identical length, vector operations execute with maximum performance.
* **Universal Grammar**: Every tidyverse function knows exactly where to look for data: columns are variables, rows are independent observations.

---

# The WHO Case Study: `table1` (The Tidy Archetype)

The `tidyverse` package includes several representations of the exact same World Health Organization (WHO) Tuberculosis records.

Let's inspect **`table1`**:

```r
library(tidyverse)

print(table1)
```

```
# A tibble: 6 × 4
  country      year  cases population
  <chr>       <dbl>  <dbl>      <dbl>
1 Afghanistan  1999    745   19987071
2 Afghanistan  2000   2666   20595360
3 Brazil       1999  37737  172006362
4 Brazil       2000  80488  174504898
5 China        1999 212258 1272915272
6 China        2000 213766 1280428583
```

### Why `table1` is perfectly tidy:
1. Every column (`country`, `year`, `cases`, `population`) represents one distinct variable.
2. Every row represents a unique Country-Year observation.
3. Every cell contains exactly one single value.

---

# Recognizing Messy Data: Type I — Variables in Rows (`table2`)

Let's examine **`table2`**:

```r
library(tidyverse)

print(table2)
```

```
# A tibble: 12 × 4
   country      year type            count
   <chr>       <dbl> <chr>           <dbl>
 1 Afghanistan  1999 cases             745
 2 Afghanistan  1999 population   19987071
 3 Afghanistan  2000 cases            2666
 4 Afghanistan  2000 population   20595360
 5 Brazil       1999 cases           37737
 6 Brazil       1999 population  172006362
 7 Brazil       2000 cases           80488
 8 Brazil       2000 population  174504898
 9 China        1999 cases          212258
10 China        1999 population 1272915272
11 China        2000 cases          213766
12 China        2000 population 1280428583
```

### The Structural Flaw:
* In the `type` column, two distinct variables (`cases` and `population`) are stacked into a single column.
* A single Country-Year observation is now split across two separate rows.
* This is **messy** because column names should describe variables, not row values.

---

# Recognizing Messy Data: Type II — Multiple Values in a Cell (`table3`)

Let's examine **`table3`**:

```r
library(tidyverse)

table3 |> print()
```

```
# A tibble: 6 × 3
  country      year rate             
  <chr>       <dbl> <chr>            
1 Afghanistan  1999 745/19987071     
2 Afghanistan  2000 2666/20595360    
3 Brazil       1999 37737/172006362  
4 Brazil       2000 80488/174504898  
5 China        1999 212258/1272915272
6 China        2000 213766/1280428583
```

### The Structural Flaw:
* The `rate` column packs two independent measurements (`cases` and `population`) into a single text string separated by `/`.
* Cell values are no longer atomic numbers; R cannot perform mathematical operations on `"745/19987071"` without parsing the string first.

---

# Recognizing Messy Data: Type III — Values as Column Headers (`table4a`)

Let's inspect **`table4a`** (recording case counts):

```r
library(tidyverse)

print(table4a)
```

```
# A tibble: 3 × 3
  country     `1999` `2000`
  <chr>        <dbl>  <dbl>
1 Afghanistan    745   2666
2 Brazil       37737  80488
3 China       212258 213766
```

### The Structural Flaw:
* The column headers `1999` and `2000` are **values** of the `year` variable, not variable names.
* The actual variable name (`year`) is completely absent from the column headers.
* The measurements (TB cases) are scattered across multiple columns rather than residing in a dedicated `cases` column.

---

# Recognizing Messy Data: Type IV — Split Tables (`table4b`)

Let's inspect **`table4b`** (recording population counts):

```r
library(tidyverse)

print(table4b)
```

```
# A tibble: 3 × 3
  country         `1999`     `2000`
  <chr>            <dbl>      <dbl>
1 Afghanistan   19987071   20595360
2 Brazil       172006362  174504898
3 China       1272915272 1280428583
```

### The Structural Flaw:
* Like `table4a`, years are positioned as column headers.
* Even worse: `cases` and `population` are isolated in two completely separate tables (`table4a` and `table4b`), making cross-variable arithmetic impossible without joining them first.

---

# Takeaway:
The same underlying information can be organized in many ways. But only `table1` works seamlessly with R's modern data science toolchain.

---


# The Tidy Contract:
* The tidyverse is an integrated ecosystem of tools designed around this shared data structure.
* Every tool expects to **receive** tidy data as input.
* Every tool guarantees to **return** tidy data as output.
* Because every function respects this contract, you can chain dozens of operations together with the native pipe `|>` without worrying about structural mismatches.

---

# Why Tidiness Matters: Pipeline Fluidity with `mutate()`

When data is tidy, computing derived statistics across variables is straightforward and vectorized:

```r
library(tidyverse)

# Calculate tuberculosis case rate per 10,000 people
mutate(table1, rate = cases / population * 10000)
```

```
# A tibble: 6 × 5
  country      year  cases population   rate
  <chr>       <dbl>  <dbl>      <dbl>  <dbl>
1 Afghanistan  1999    745   19987071  0.373
2 Afghanistan  2000   2666   20595360  1.29 
3 Brazil       1999  37737  172006362  2.19 
4 Brazil       2000  80488  174504898  4.61 
5 China        1999 212258 1272915272  1.67 
6 China        2000 213766 1280428583  1.67 
```

Because `cases` and `population` are aligned side-by-side in each row vector, R performs element-wise division instantly.

---

# Why Tidiness Matters: Direct Integration with `ggplot2`

`ggplot2` maps visual aesthetics (`x`, `y`, `color`, `size`) directly to **columns** in your dataset.

When data is tidy, generating complex visualizations requires minimal code:

```r
library(tidyverse)

# Visualize case count trends for all three countries
table1 |> 
  ggplot(aes(x = year, y = cases, color = country)) + 
  geom_line(linewidth = 1) +
  geom_point(size = 3) +
  scale_x_continuous(breaks = c(1999, 2000)) +
  labs(
    title = "Tuberculosis Cases by Country (1999 - 2000)",
    x = "Year",
    y = "Number of Documented Cases",
    color = "Country"
  )
```

Because `year` and `cases` are isolated columns, `ggplot()` effortlessly groups lines by the `country` column.

---

# The Pain of Messy Data: Calculating Rate on `table2`

How would you compute the infection `rate` using **`table2`**?

```r
print(table2)
```

```
# A tibble: 12 × 4
   country      year type            count
   <chr>       <dbl> <chr>           <dbl>
 1 Afghanistan  1999 cases             745
 2 Afghanistan  1999 population   19987071
 3 Afghanistan  2000 cases            2666
...
```

### The Difficulty:
* `cases` (745) and `population` (19987071) reside on **different rows**.
* Standard `mutate(rate = cases / population)` fails immediately because neither `cases` nor `population` exists as a column name.
* To perform this calculation without tidying, you would have to filter out cases, filter out population, extract their vectors, ensure identical sorting, divide them, and re-bind the table.
* **Conclusion**: Working with messy data requires fragile, tedious code. Tidying your data first saves hours of effort.

---

# Summaries and Counts Preserve Tidiness

Aggregation commands like `summarize()` and `count()` maintain the tidy data structure:

```r
library(tidyverse)

# Compute the total number of cases documented globally for each year
count(table1, year, wt = cases)
```

```
# A tibble: 2 × 2
   year      n
  <dbl>  <dbl>
1  1999 250740
2  2000 296920
```

### Key Observation:
* `count()` outputs a tidy tibble where `year` is a variable and `n` (the weighted sum) is a variable.
* This output can immediately be piped into `mutate()`, `filter()`, or `ggplot()`.

---

# Tools for Reshaping Data

When raw data arrives in an untidy structure, we use the **`tidyr`** package (built into `tidyverse`) to reshape it.

```
                  +--------------------------------+
                  |         Raw Messy Data         |
                  +--------------------------------+
                                  |
                +-----------------+-----------------+
                |                                   |
                v                                   v
       [ Columns are Values ]              [ Rows are Variables ]
                |                                   |
                v                                   v
         pivot_longer()                       pivot_wider()
                |                                   |
                +-----------------+-----------------+
                                  |
                                  v
                  +--------------------------------+
                  |        Clean Tidy Data         |
                  +--------------------------------+
```

`tidyr` provides two primary reshaping verbs:
* **`pivot_longer()`**: Makes wide datasets narrower and longer.
* **`pivot_wider()`**: Makes long datasets shorter and wider.

---

# Making Data Longer: Understanding `pivot_longer()`

A very common problem is when variable values are spread across multiple column headers.

Consider **`table4a`**:
```
  country     `1999` `2000`
  Afghanistan    745   2666
  Brazil       37737  80488
  China       212258 213766
```

Here, the variable `year` is spread across two column names (`1999` and `2000`).

To make this data tidy:
1. We must gather the columns `1999` and `2000` into a new column named `year`.
2. We must place the cell values into a new column named `cases`.
3. This process collapses multiple columns into multiple rows, making the dataset **longer**.

---

# Visual Diagram: The `pivot_longer()` Transformation

The diagram below illustrates how column headers collapse into rows:

```
BEFORE: table4a (Wide / Messy)
+-------------+--------+--------+
|   country   |  1999  |  2000  |
+-------------+--------+--------+
| Afghanistan |    745 |   2666 |
| Brazil      |  37737 |  80488 |
| China       | 212258 | 213766 |
+-------------+--------+--------+
                  |
                  | pivot_longer(cols = c(`1999`, `2000`),
                  |              names_to = "year",
                  |              values_to = "cases")
                  v
AFTER: Tidy Table (Long)
+-------------+--------+--------+
|   country   |  year  | cases  |
+-------------+--------+--------+
| Afghanistan |  1999  |    745 |
| Afghanistan |  2000  |   2666 |
| Brazil      |  1999  |  37737 |
| Brazil      |  2000  |  80488 |
| China       |  1999  | 212258 |
| China       |  2000  | 213766 |
+-------------+--------+--------+
```

---

# The Three Core Arguments of `pivot_longer()`

To execute `pivot_longer()`, you specify three parameters:

1. **`cols`** *(Mandatory)*: Which existing columns should have their names converted into values?
2. **`names_to`** *(Optional)*: What name should be given to the new destination column that stores the former column headers?
3. **`values_to`** *(Optional)*: What name should be given to the new destination column that stores the values currently in the cells?

<pre>
pivot_longer(
  data,
  cols = <columns to pivot>,
  names_to = "<new name column>",
  values_to = "<new value column>"
)
</pre>

> **Important Concept**: The strings supplied to `names_to` and `values_to` do **not** exist in your input dataset! They are the newly created "destination" columns in the output table.

---

# `pivot_longer()` with Default Arguments

If you omit `names_to` and `values_to`, R automatically assigns the default column names `"name"` and `"value"`:

```r
library(tidyverse)

# Pivot table4a using default arguments
pivot_longer(table4a, cols = c("1999", "2000"))
```

```
# A tibble: 6 × 3
  country     name   value
  <chr>       <chr>  <dbl>
1 Afghanistan 1999     745
2 Afghanistan 2000    2666
3 Brazil      1999   37737
4 Brazil      2000   80488
5 China       1999  212258
6 China       2000  213766
```

Notice that R successfully pivoted the data, but the column headers `name` and `value` are generic.

---

# `pivot_longer()` with Column Indices

Instead of typing column names as quoted strings or backticks, you can refer to columns by their numeric index position:

```r
library(tidyverse)

# Pivot columns 2 and 3 using the native pipe
table4a |> 
  pivot_longer(cols = c(2, 3))
```

```
# A tibble: 6 × 3
  country     name   value
  <chr>       <chr>  <dbl>
1 Afghanistan 1999     745
2 Afghanistan 2000    2666
3 Brazil      1999   37737
4 Brazil      2000   80488
5 China       1999  212258
6 China       2000  213766
```

You can also use tidyselect helpers like `cols = starts_with("19")` or `cols = -country` (everything except country).

---

# Setting Informative Names in `pivot_longer()`

We can supply custom labels to `names_to` and `values_to` to produce a meaningful column names:

```r
library(tidyverse)

# Pivot table4a with informative column names
tidy_tb <- pivot_longer(
  table4a, 
  cols = c("1999", "2000"),
  names_to = "year",
  values_to = "tb_cases"
)

print(tidy_tb)
```

```
# A tibble: 6 × 3
  country     year  tb_cases
  <chr>       <chr>    <dbl>
1 Afghanistan 1999       745
2 Afghanistan 2000      2666
3 Brazil      1999     37737
4 Brazil      2000     80488
5 China       1999    212258
6 China       2000    213766
```

Now `year` and `tb_cases` are clean, explicit variable names!

---

# Making Data Wider: Understanding `pivot_wider()`

The inverse problem occurs when an observation is scattered across multiple rows.

Consider **`table2`**:
```
   country      year type            count
 1 Afghanistan  1999 cases             745
 2 Afghanistan  1999 population   19987071
 3 Afghanistan  2000 cases            2666
 4 Afghanistan  2000 population   20595360
```

Here, an observation is a Country-Year pair, but its data is split across two rows because the `type` column holds variable names (`cases` and `population`).

To make this data tidy:
1. We must take the unique values from `type` and make each one its own **column header**.
2. We must place the corresponding values from `count` into those new columns.
3. This process reduces the number of rows and adds columns, making the dataset **wider**.

---

# Visual Diagram: The `pivot_wider()` Transformation

The diagram below illustrates how key-value row pairs expand into dedicated columns:

```
BEFORE: table2 (Long / Messy)
+-------------+------+------------+-----------+
|   country   | year |    type    |   count   |
+-------------+------+------------+-----------+
| Afghanistan | 1999 | cases      |       745 |
| Afghanistan | 1999 | population |  19987071 |
| Afghanistan | 2000 | cases      |      2666 |
| Afghanistan | 2000 | population |  20595360 |
+-------------+------+------------+-----------+
                      |
                      | pivot_wider(names_from = type,
                      |             values_from = count)
                      v
AFTER: Tidy Table (Wide)
+-------------+------+--------+------------+
|   country   | year | cases  | population |
+-------------+------+--------+------------+
| Afghanistan | 1999 |    745 |   19987071 |
| Afghanistan | 2000 |   2666 |   20595360 |
+-------------+------+--------+------------+
```

---

# The Core Arguments of `pivot_wider()`

To execute `pivot_wider()`, you specify two primary arguments:

1. **`names_from`**: Which existing column contains the values that should become the **new column names**?
2. **`values_from`**: Which existing column contains the cell values to populate the new columns?

<pre>
pivot_wider(
  data,
  names_from = <column with variable names>,
  values_from = <column with measurement values>
)
</pre>

> **Key Distinction**:
> * In `pivot_longer()`, `names_to` and `values_to` are strings defining *new* columns that don't exist yet.
> * In `pivot_wider()`, `names_from` and `values_from` reference *existing* columns already in the dataset.

---

# Tidying `table2` with `pivot_wider()`

### Problem:
Convert `table2` into tidy format by separating `cases` and `population` into their own dedicated columns.

```r
library(tidyverse)

# Tidy table2 using pivot_wider()
tidy_table2 <- pivot_wider(
  table2, 
  names_from = "type", 
  values_from = "count"
)

print(tidy_table2)
```

```
# A tibble: 6 × 4
  country      year  cases population
  <chr>       <dbl>  <dbl>      <dbl>
1 Afghanistan  1999    745   19987071
2 Afghanistan  2000   2666   20595360
3 Brazil       1999  37737  172006362
4 Brazil       2000  80488  174504898
5 China        1999 212258 1272915272
6 China        2000 213766 1280428583
```

Notice that `tidy_table2` is now completely identical to `table1`!



---

# When to Untidy Data

## Presentation vs. Analysis

Although tidy data is strictly required for analysis, data transformations, and ggplotting, wide cross-tabulation matrices are often much easier for human stakeholders to read.

```
                    +------------------------------------+
                    |        Data Pipeline Goal          |
                    +------------------------------------+
                                      |
                    +-----------------+-----------------+
                    |                                   |
                    v                                   v
        [ Computation / Modeling ]            [ Human Presentation ]
                    |                                   |
                    v                                   v
            Tidy Long Format                     Wide Matrix Table
            (1 var per col)                     (e.g., Months as Cols)


```

### When to Untidy:
* Executive summaries and dashboard reports.
* Correlation matrices and multi-year time-series financial statements.
* Heatmap-style tables where rows represent entities and columns represent time steps.

---

# Exercise: NYC Airport Monthly Departures Matrix

### Problem:
Re-create the following cross-tabulation table showing total monthly flight departures from the three NYC airports (`EWR`, `JFK`, `LGA`) across months 1 through 12:

```
origin    1    2    3     4     5     6     7     8     9    10    11   12  
1 EWR    9893 9107 10420 10531 10592 10175 10475 10359 9550 10104 9707 9922
2 JFK    9161 8421  9697  9218  9397  9472 10023  9983 8908  9143 8710 9146
3 LGA    7950 7423  8717  8581  8807  8596  8927  8985 9116  9642 8851 9067
```

### Strategy:
1. Count the number of flights grouped by `origin` and `month`.
2. Spread the `month` column horizontally using `pivot_wider()`.

---

# Solution: NYC Airport Monthly Departures

```r
library(tidyverse)
library(nycflights13)

# Spread nycflights out to show departures by month for each airport
flights |>
  count(origin, month) |>
  pivot_wider(
    names_from = "month",
    values_from = "n"
  )
```

```
# A tibble: 3 × 13
  origin   `1`   `2`   `3`   `4`   `5`   `6`   `7`   `8`   `9`  `10`  `11`  `12`
  <chr>  <int> <int> <int> <int> <int> <int> <int> <int> <int> <int> <int> <int>
1 EWR     9893  9107 10420 10531 10592 10175 10475 10359  9550 10104  9707  9922
2 JFK     9161  8421  9697  9218  9397  9472 10023  9983  8908  9143  8710  9146
3 LGA     7950  7423  8717  8581  8807  8596  8927  8985  9116  9642  8851  9067


```

* `count(origin, month)` creates a tidy summary table with columns `origin`, `month`, and `n`.
* `pivot_wider()` spreads the 12 month values into horizontal column headers.

---

# Another Case for Untidying: The `gapminder` Dataset

The `gapminder` dataset tracks global socioeconomic indicators across countries over time:

```r
library(tidyverse)
library(gapminder)

gapminder |> print()
```

```
# A tibble: 1,704 × 6
   country     continent  year lifeExp      pop gdpPercap
   <fct>       <fct>     <int>   <dbl>    <int>     <dbl>
 1 Afghanistan Asia       1952    28.8  8425333      779.
 2 Afghanistan Asia       1957    30.3  9240934      821.
 3 Afghanistan Asia       1962    32.0 10267083      853.
 4 Afghanistan Asia       1967    34.0 11537966      836.
 5 Afghanistan Asia       1972    36.1 13079460      740.
 6 Afghanistan Asia       1977    38.4 14880372      786.
# ℹ 1,698 more rows


```

These raw data are stored in a perfectly tidy format, allowing instant filtering, aggregation, and plotting.

---

# Visualizing `gapminder` Trends with `ggplot2`

Because `gapminder` is tidy, plotting GDP per capita across the Americas requires only a few lines:

```r
library(tidyverse)
library(gapminder)

gapminder |>
  filter(continent == "Americas") |>
  ggplot(aes(x = year, y = gdpPercap, color = country)) +
  geom_line(linewidth = 0.8) +
  theme_minimal() +
  labs(
    title = "GDP Per Capita Over Time (Americas)",
    x = "Year",
    y = "GDP Per Capita (USD)"
  )

```

However, with dozens of overlapping country lines, reading exact figures from the plot is difficult. A wide presentation table makes direct number lookups much easier!

---

# Cross-Tabulating `gapminder` with `id_cols`

To transform the Americas data into a country-by-year lookup table, we widen the table using `id_cols`:

```r
library(tidyverse)
library(gapminder)

# Make gapminder wider for Americas countries
gapminder |>
  filter(continent == "Americas") |>
  pivot_wider(
    id_cols = country, 
    names_from = year, 
    values_from = gdpPercap
  ) |>
  print()
```

```
# A tibble: 25 × 13
   country   `1952` `1957` `1962` `1967` `1972` `1977` `1982` `1987` `1992` `1997` `2002` `2007`
   <fct>      <dbl>  <dbl>  <dbl>  <dbl>  <dbl>  <dbl>  <dbl>  <dbl>  <dbl>  <dbl>  <dbl>  <dbl>
 1 Argentina  5911.  6857.  7133.  8053.  9443. 10079.  8998.  9140.  9308. 10967.  8798. 12779.
 2 Bolivia    2677.  2128.  2181.  2587.  2980.  3548.  3157.  2754.  2962.  3326.  3413.  3822.
 3 Brazil     2109.  2487.  3337.  3430.  4986.  6660.  7031.  7807.  6950.  7958.  8131.  9066.
 4 Canada    11367. 12490. 13462. 16077. 18971. 22091. 22899. 26627. 26343. 28955. 33307. 36319.
# ℹ 21 more rows


```

### The Role of `id_cols`:
* `id_cols = country` specifies that `country` should uniquely define each row.
* All other unselected columns (`pop`, `lifeExp`, `continent`) are omitted from the output.

---

# Multi-Column Widening: The `grades` Case Study

Sometimes a single dataset contains multiple measurement columns that all need to be widened simultaneously.

Consider the following synthetic exam scores dataset:

```r
library(tidyverse)

grades <- tribble(
  ~person, ~exam, ~q1, ~q2, ~q3,
  "alice", "mt1", 1.0, 2.0, 3.5,
  "alice", "mt2", 0.5, 2.5, 1.5,
  "bob",   "mt1", 0.0, 1.0, 1.5,
  "bob",   "mt2", 1.5, 2.5, 2.0
)

print(grades)
```

```
# A tibble: 4 × 5
  person exam     q1    q2    q3
  <chr>  <chr> <dbl> <dbl> <dbl>
1 alice  mt1     1     2     3.5
2 alice  mt2     0.5   2.5   1.5
3 bob    mt1     0     1     1.5
4 bob    mt2     1.5   2.5   2  


```

We want to expand this table so each student has a single row with columns `q1_mt1`, `q1_mt2`, `q2_mt1`, `q2_mt2`, `q3_mt1`, `q3_mt2`.

---

# Multi-Column Widening: Syntax & Mechanics

To pivot multiple measurement columns, pass a vector of column names to `values_from`:

```r
library(tidyverse)

# Spread multiple score columns across exam types
grades |>
  pivot_wider(
    names_from = exam,
    values_from = c(q1, q2, q3)
  )
```

```
# A tibble: 2 × 7
  person q1_mt1 q1_mt2 q2_mt1 q2_mt2 q3_mt1 q3_mt2
  <chr>   <dbl>  <dbl>  <dbl>  <dbl>  <dbl>  <dbl>
1 alice       1    0.5      2    2.5    3.5    1.5
2 bob         0    1.5      1    2.5    1.5    2  


```

```
                     +----------------------------------+
                     |  values_from = c(q1, q2, q3)     |
                     |  names_from = exam ("mt1", "mt2")|
                     +----------------------------------+
                                       |
    +-------------+-------------+------+------+-------------+-------------+
    |   q1_mt1    |   q1_mt2    |   q2_mt1    |   q2_mt2    |   q3_mt1    |   q3_mt2    |
```

`pivot_wider()` automatically constructs combined column names formatted as `<value_column>_<name_column>`.

---

# Storms Count Matrix with `values_fill`

From the built-in `storms` dataset, generate a summary table showing the number of storm observations for all years greater than 2010. 
Each column must represent a month (6 through 11). Any combination with no recorded storms must display `0` instead of `NA`.

### Expected Target Output:
```
# A tibble: 12 × 7
    year   `6`   `7`   `8`   `9`  `10`  `11`
   <dbl> <int> <int> <int> <int> <int> <int>
 1  2011    12    57   158   222    80    28
 2  2012    54     0   212   181   159     0
 3  2013    37    50    41   120    56    26
 4  2014     9    66    69    66    90     0
 5  2015    22    15    55   140    59    20
 6  2016    63     0   126   194   103    38
 7  2017    29    22   126   292    93    21
 8  2018     0   102    57   278   130    15
 9  2019     0    30    73   227    99    34
10  2020    57   115   124   307   119   116
11  2021    41    42   181   217    65    29
12  2022    30    48     2   269    61    61


```

---

# Solution: Storms Count Matrix with `values_fill = 0`

```r
library(tidyverse)

# Count storms by year and month for years > 2010, filling missing cells with 0
storms |>
  filter(year > 2010) |>
  count(year, month) |>
  pivot_wider(
    names_from = month,
    values_from = n,
    values_fill = 0
  )
```

```
# A tibble: 12 × 7
    year   `6`   `7`   `8`   `9`  `10`  `11`
   <dbl> <int> <int> <int> <int> <int> <int>
 1  2011    12    57   158   222    80    28
 2  2012    54     0   212   181   159     0
 3  2013    37    50    41   120    56    26
...
```

### What does `values_fill = 0` do:
In 2012, no storms occurred in month 7. Without `values_fill = 0`, R would place an `NA` in row 2, column `7`. Setting `values_fill = 0` turns implicit missing counts into explicit zeros.

---

# Deep Dive: Implicit vs. Explicit Missing Values

Pivoting highlights the difference between two types of missing data:

* **Explicit Missing Values**: Present as literal `NA` values in existing table cells.
* **Implicit Missing Values**: Absence of a row altogether for a valid combination of variables.



### Managing Missing Values During Pivots:
* **In `pivot_wider()`**: Use `values_fill = 0` (or another default) to populate implicit missing cells.
* **In `pivot_longer()`**: Use `values_drop_na = TRUE` to eliminate rows containing explicit `NA`s during lengthening.

---

# Comprehensive `tidyr` Reshaping Reference

| Function & Option | Purpose | Typical Use Case |
| :--- | :--- | :--- |
| **`pivot_longer(cols = ...)`** | Lengthens table by turning columns into rows | Column headers contain variable values (e.g., years, dates) |
| **`names_to = "var"`** | Names the new key column in `pivot_longer()` | Assigning an informative variable name (e.g., `"year"`, `"metric"`) |
| **`values_to = "val"`** | Names the new measurement column in `pivot_longer()` | Assigning an informative value name (e.g., `"cases"`, `"gdp"`) |
| **`values_drop_na = TRUE`** | Drops rows where pivoted values are `NA` | Cleaning sparse tables during lengthening |
| **`pivot_wider(names_from = ...)`** | Widens table by turning rows into columns | Observations scattered across rows; cross-tabulation tables |
| **`values_from = ...`** | Selects value column(s) to populate cells | Can be a single column or vector `c(col1, col2)` |
| **`id_cols = ...`** | Defines unique row identifier(s) in `pivot_wider()` | Dropping unwanted metadata columns without prior `select()` |
| **`values_fill = 0`** | Replaces implicit `NA`s with a fixed value | Matrix counting tables, contingency tables, financial grids |

---

# Module Summary & Key Takeaways

1. **The Three Tidy Rules**:
   * Each variable has its own column.
   * Each observation has its own row.
   * Each value has its own cell.

2. **The Power of the Tidy Contract**:
   * Tidy data allows seamless chaining of `filter()`, `mutate()`, `summarize()`, and `ggplot()`.
   * Messy tables (like `table2`, `table3`, `table4a`) complicate simple calculations like infection rate.

3. **`pivot_longer()`**:
   * Fixes wide datasets where variable values appear as column headers.
   * Requires `cols`; accepts `names_to` and `values_to`.
   * Accepts column names, backticks, index vectors (`c(2, 3)`), or helpers (`starts_with()`).

4. **`pivot_wider()`**:
   * Fixes long datasets where single observations are split across multiple rows.
   * Requires `names_from` and `values_from`.
   * Supports multi-column values (`values_from = c(q1, q2, q3)`).

5. **Presentation & Reporting**:
   * While tidy format is required for computation, untidying data via `pivot_wider()` is ideal for human-readable reports, time matrices, and executive summaries.
   * Use `values_fill = 0` to replace structural missing values with clean zero counts.
