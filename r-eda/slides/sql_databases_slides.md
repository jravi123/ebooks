# Statistical Tests & SQL Databases
## Hypothesis Testing, Relational Databases, and Querying Data in R

### Lecture Agenda
1. **Part 1: Statistical Tests in R**
   * Hypothesis testing, $H_0$, $H_1$, and interpreting the `p-value`
   * Comparing two group means with the **T-test** (`t.test()`)
   * Testing categorical independence with the **Chi-squared Test** (`chisq.test()`)
   * Choosing the right test: **ANOVA** (`aov()`) and **Correlation** (`cor.test()`)
2. **Part 2: SQL (Structured Query Language) & Databases**
   * Connecting R to databases with `DBI`, `RSQLite`, and `dbplyr`
   * Managing tables (`dbWriteTable`, `dbRemoveTable`, `dbListFields`, `dbReadTable`)
   * Core SQL clauses: `SELECT`, `FROM`, `LIMIT`, `WHERE`, `IS NOT NULL`, `GROUP BY`, `HAVING`, `DISTINCT`
   * Advanced SQL: `LEFT JOIN`, `RANK() OVER (PARTITION BY ...)`, and **Subqueries**

---

# Part 1: Statistical Tests
## From Exploratory Visuals to Formal Inference

In Exploratory Data Analysis (EDA), visualizations often reveal interesting differences or patterns across groups. **Statistical tests** allow us to formally evaluate whether those observed patterns reflect a true underlying effect or could simply be due to random chance.

* **Null Hypothesis ($H_0$):** The default assumption that there is **no effect**, **no difference**, or **no association** between variables.
* **Alternative Hypothesis ($H_1$ or $H_a$):** The claim that there **is** a statistically meaningful difference or association.
* **The `p-value`:** A key output of any statistical test. It measures the probability of observing our sample data (or something more extreme) **assuming the null hypothesis ($H_0$) is true**.

> **Decision Rule:** A small p-value (typically **$p < 0.05$**) indicates that the observed data would be very unlikely under $H_0$, providing strong statistical evidence **against** the null hypothesis.

---

# 1. The Two-Sample T-test (`t.test()`)
## Comparing Means of a Continuous Variable Across Two Groups

### When to Use It
Use a **T-test** when you want to determine whether there is a statistically significant difference between the **means of a continuous variable** across **two groups**.

### Case Study: Diamond Prices by Cut
Suppose we want to test whether the mean price of `'Ideal'` cut diamonds is significantly different from the mean price of `'Premium'` cut diamonds in `ggplot2::diamonds`:

* **$H_0$ (Null Hypothesis):** $\mu_{\text{Ideal}} = \mu_{\text{Premium}}$ (The true mean price is equal across both cuts).
* **$H_1$ (Alternative Hypothesis):** $\mu_{\text{Ideal}} \neq \mu_{\text{Premium}}$ (The true mean prices differ).

---

# Running a T-test in R
## Comparing `'Ideal'` vs. `'Premium'` Diamond Prices

We filter the `diamonds` dataset into two subsets and pass their `price` vectors to `t.test()`:

```r
library(tidyverse)

# Subset the diamonds data for two cut categories
ideal_diamonds <- diamonds |> filter(cut == "Ideal")
premium_diamonds <- diamonds |> filter(cut == "Premium")

# Perform a two-sample Welch's t-test on their prices
t.test(ideal_diamonds$price, premium_diamonds$price)
```

### Interpreting the Output
* **Sample Means:** Mean of `'Ideal'` (`mean of x` $\approx \$3,457.54$) vs. Mean of `'Premium'` (`mean of y` $\approx \$4,584.26$).
* **P-value:** `p-value < 2.2e-16` (far below the $0.05$ threshold).
* **Conclusion:** We **reject the null hypothesis ($H_0$)**. There is strong statistical evidence that the true mean prices of Ideal and Premium cut diamonds are significantly different.

---

# 2. The Chi-squared Test (`chisq.test()`)
## Testing Association Between Two Categorical Variables

### When to Use It
A **Chi-squared test of independence** ($\chi^2$) evaluates whether there is a significant association between **two categorical variables**.

### How Does It Work?
It works by comparing two sets of counts in a contingency table:
1. **Observed Frequencies ($O$):** The actual counts we observe in our collected sample data.
2. **Expected Frequencies ($E$):** The counts we would *expect* to see in each category combination if the two variables were **completely independent** (i.e., if $H_0$ were true).

### Survey Example ($N = 200$ People)
Suppose we survey **200 people** on two categorical questions:
* **Favorite Movie Genre:** `Comedy` or `Sci-Fi`
* **Favorite Ice Cream Flavor:** `Chocolate` or `Vanilla`

* **$H_0$:** Movie preference and ice cream preference are **independent** (unrelated).

---

# Chi-squared Step 1: Observed Frequencies
## Organizing Categorical Counts into a Contingency Table

Suppose we tally the 200 survey responses and observe the following actual counts:

| | Prefers Chocolate | Prefers Vanilla | **Row Total** |
| :--- | :---: | :---: | :---: |
| **Likes Comedy** | 70 | 30 | **100** |
| **Likes Sci-Fi** | 20 | 80 | **100** |
| **Column Total** | **90** | **110** | **200 (Grand Total)** |

### Key Terminology
* **Cell:** Each individual box in the interior of the table representing a specific combination of categories (for example, the **"Likes Comedy & Prefers Chocolate"** box with a count of `70`).
* **Marginal Totals:** The row totals (`100`, `100`) and column totals (`90`, `110`) along the edges of the table.
* **Grand Total ($N$):** The total sample size across all cells (`200`).

---

# Chi-squared Step 2: Deriving Expected Frequencies
## What Would Counts Look Like Under Independence ($H_0$)?

In probability theory, two events $A$ and $B$ are **statistically independent** if and only if:
$$P(A \text{ and } B) = P(A) \times P(B)$$

Let's apply this rule to the **"Likes Comedy" and "Prefers Chocolate"** cell:

1. **Step 1: Find the individual marginal probabilities from the totals**
   * $P(\text{Likes Comedy}) = \frac{\text{Total who like Comedy}}{\text{Grand Total}} = \frac{100}{200} = 0.50$
   * $P(\text{Prefers Chocolate}) = \frac{\text{Total who prefer Chocolate}}{\text{Grand Total}} = \frac{90}{200} = 0.45$
2. **Step 2: Calculate the combined probability assuming independence**
   * $P(\text{Comedy and Chocolate}) = 0.50 \times 0.45 = 0.225$
3. **Step 3: Convert the probability back into an Expected Count**
   * $\text{Expected Count} = 0.225 \times 200 = \mathbf{45}$

$$\text{Expected Count} = \left(\frac{\text{Row Total}}{\text{Grand Total}}\right) \times \left(\frac{\text{Column Total}}{\text{Grand Total}}\right) \times \text{Grand Total} = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total}}$$

---

# Chi-squared Step 2 (Cont.): Expected Frequencies Table
## Calculating Every Expected Cell

Using the formula $\text{Expected Count} = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total}}$, we compute all 4 cells:

* **Comedy & Chocolate:** $(100 \times 90) / 200 = \mathbf{45}$
* **Comedy & Vanilla:** $(100 \times 110) / 200 = \mathbf{55}$
* **Sci-Fi & Chocolate:** $(100 \times 90) / 200 = \mathbf{45}$
* **Sci-Fi & Vanilla:** $(100 \times 110) / 200 = \mathbf{55}$

### Expected Frequencies Table (Under $H_0$ Independence)

| | Prefers Chocolate | Prefers Vanilla | **Row Total** |
| :--- | :---: | :---: | :---: |
| **Likes Comedy** | 45 *(Observed: 70)* | 55 *(Observed: 30)* | **100** |
| **Likes Sci-Fi** | 45 *(Observed: 20)* | 55 *(Observed: 80)* | **100** |
| **Column Total** | **90** | **110** | **200** |

---

# Chi-squared Step 3: The Comparison in R
## Running `chisq.test()` on Contingency Tables

The Chi-squared statistic measures the overall discrepancy between Observed ($O$) and Expected ($E$) counts across all cells:
$$\chi^2 = \sum \frac{(O - E)^2}{E}$$

If the observed counts (`70, 30, 20, 80`) are far from the expected counts (`45, 55, 45, 55`), $\chi^2$ will be **large** and the `p-value` will be **small**:

```r
# 1. Movie vs. Ice Cream Survey Example
survey_table <- matrix(c(70, 30, 20, 80), nrow = 2, byrow = TRUE,
                       dimnames = list(Genre = c("Comedy", "Sci-Fi"),
                                       Flavor = c("Chocolate", "Vanilla")))
chisq.test(survey_table, correct = FALSE)

# 2. Diamonds Example: Are 'cut' and 'color' independent?
chisq.test(table(diamonds$cut, diamonds$color))
```

---

# Choosing Between T-test and Chi-squared
## Matching the Test to Your Variable Types

Before running a test, always identify whether your variables are **continuous (numeric)** or **categorical (factors/strings)**:

| Feature | Two-Sample T-test (`t.test()`) | Chi-squared Test (`chisq.test()`) |
| :--- | :--- | :--- |
| **Variable 1** | **Continuous** (e.g., `price`, `carat`, `hwy`) | **Categorical** (e.g., `cut`, `Genre`) |
| **Variable 2** | **Categorical with 2 groups** (e.g., `'Ideal'` vs `'Premium'`) | **Categorical** (e.g., `color`, `Flavor`) |
| **What It Compares** | Group **means** ($\mu_1$ vs. $\mu_2$) | **Observed** vs. **Expected** cell counts |
| **Null Hypothesis ($H_0$)** | The two group means are equal | The two categorical variables are independent |

> **What if we have more than 2 groups, or two continuous variables?** Let's look at **ANOVA** and the **Correlation Test**.

---

# 3. ANOVA (Analysis of Variance)
## Comparing Means Across Three or More Groups (`aov()`)

* **When to use it:** You have a **continuous outcome variable** and a **categorical grouping variable with 3 or more levels**.
* **Why not multiple T-tests?** Running separate t-tests on every pair of groups inflates the false-positive (Type I error) rate. ANOVA tests all group means simultaneously under $H_0: \mu_1 = \mu_2 = \dots = \mu_k$.
* **Example:** Comparing the mean `price` of diamonds across **all five** `cut` categories (`Fair`, `Good`, `Very Good`, `Premium`, and `Ideal`).

```r
library(tidyverse)

# Fit an Analysis of Variance model: continuous ~ categorical (3+ levels)
anova_model <- aov(price ~ cut, data = diamonds)

# View the ANOVA F-statistic and p-value table
summary(anova_model)
```

---

# 4. Correlation Test (`cor.test()`)
## Testing Linear Association Between Two Continuous Variables

* **When to use it:** You want to measure the strength, direction, and statistical significance of a **linear relationship between two continuous variables**.
* **Example:** Testing whether there is a significant linear correlation between a diamond's weight (`carat`) and its `price`.

```r
library(tidyverse)

# Test the linear correlation between carat and price
cor.test(diamonds$carat, diamonds$price)
```

### Complete Statistical Tests Reference

| Scenario / Variable Types | Statistical Test | R Function |
| :--- | :--- | :--- |
| **1 Continuous + 1 Categorical (2 groups)** | Two-Sample T-test | `t.test(y1, y2)` or `t.test(y ~ grp)` |
| **1 Continuous + 1 Categorical (3+ groups)** | ANOVA | `summary(aov(y ~ grp, data = df))` |
| **2 Categorical Variables** | Chi-squared Test | `chisq.test(table(df$cat1, df$cat2))` |
| **2 Continuous Variables** | Correlation Test | `cor.test(df$x, df$y)` |

---

# Part 2: SQL — Structured Query Language
## Why Learn SQL Alongside R?

* **The Industry Standard:** **SQL (Structured Query Language)** is the universal language used to interact with Relational Database Management Systems (RDBMS) such as PostgreSQL, MySQL, SQLite, Oracle, BigQuery, and Snowflake.
* **Beyond In-Memory Data Frames:** Standard R data frames and `tidyverse` tibbles live entirely in your computer's **RAM**. Production datasets often contain billions of rows stored on disk or remote servers—you use SQL to filter, join, and aggregate data *inside the database* before pulling results into R.
* **Textbook Reference:** This lecture follows **Chapter 21 (Databases)** of *R for Data Science (2e)*:  
  [https://r4ds.hadley.nz/databases.html](https://r4ds.hadley.nz/databases.html)

---

# Database Connection Architecture in R
## `DBI` + A DBMS-Specific Driver Package

To connect to any database from R, you always use a **pair of packages**:

1. **`DBI` (Database Interface):** Provides a unified set of generic R functions (`dbConnect()`, `dbListTables()`, `dbWriteTable()`, `dbGetQuery()`, `dbDisconnect()`) that work the same way regardless of which database engine you use.
2. **A DBMS-Specific Backend Package:** Translates `DBI` commands into the specific protocol of your target database:
   * **`RSQLite`** for **SQLite** (lightweight, serverless, file-based or in-memory databases)
   * **`RPostgres`** for **PostgreSQL**
   * **`RMariaDB`** for **MySQL / MariaDB**

> If you don't have these packages installed locally in RStudio, install them once with `install.packages(c("DBI", "RSQLite", "dbplyr"))`.

---

# Creating a Database Connection (`dbConnect`)
## Spinning Up an Ephemeral In-Memory SQLite Database

Using `":memory:"` tells `RSQLite` to create a fast, temporary database in RAM that automatically cleans itself up when disconnected:

```r
library(tidyverse)
library(DBI)
library(RSQLite)

# Create an ephemeral in-memory SQLite database connection
con <- dbConnect(RSQLite::SQLite(), ":memory:")

# List tables currently in the database (empty right now!)
dbListTables(con)
```

* **`con`** is our active database connection object—every subsequent database command will take `con` as its first argument.
* Because we just created the database, `dbListTables(con)` returns `character(0)` (zero tables).

---

# `dbplyr` and Writing Tables (`dbWriteTable`)
## Populating Our Database with R Data Frames

* **What is `dbplyr`?** `dbplyr` is a `dplyr` backend for databases. It allows you to write standard `dplyr` pipelines (`filter()`, `select()`, `group_by()`, `summarize()`) and automatically translates them into SQL queries behind the scenes!
* **Direct `DBI` Operations:** In this lecture, we will also interact with the database directly using `DBI` functions and raw SQL strings so you master SQL syntax directly.
* Let's copy `ggplot2::mpg` into our SQLite database as a table named `"mpg"` using `dbWriteTable()`:

```r
# Write the mpg dataframe into our SQLite database as a table named "mpg"
dbWriteTable(con, "mpg", ggplot2::mpg, overwrite = TRUE)

# Verify that the "mpg" table now exists in the database
dbListTables(con)
```

---

# Removing a Table (`dbRemoveTable`)
## Dropping Tables When No Longer Needed

If you need to delete (drop) a table from the database, use `dbRemoveTable(con, "<table_name>")`:

```r
# Remove the 'mpg' table from the database
dbRemoveTable(con, "mpg")

# Check tables — 'mpg' is now gone!
print(dbListTables(con))

# Let's write 'mpg' back so we can query it in the following slides
dbWriteTable(con, "mpg", ggplot2::mpg, overwrite = TRUE)
dbListTables(con)
```

> **Note:** Setting `overwrite = TRUE` in `dbWriteTable()` automatically replaces an existing table of the same name without requiring a manual `dbRemoveTable()` call first.

---

# Inspecting Schema & Reading Tables
## `dbListFields()` and `dbReadTable()`

Before writing SQL queries, you often want to inspect a table's column names or pull a small table into R:

* **`dbListFields(con, "mpg")`:** Returns a character vector of column names in the `"mpg"` database table (similar to `colnames(mpg)` in R).
* **`dbReadTable(con, "mpg")`:** Reads the entire database table into R as a standard `data.frame`.

```r
# 1. List all column names (fields) of the "mpg" table
dbListFields(con, "mpg")

# 2. Read the entire "mpg" table from the database into R (previewing first 6 rows)
dbReadTable(con, "mpg") |> head()
```

---

# Selecting Data from a Table (`SELECT ... FROM`)
## Using `dbSendQuery()`, `dbFetch()`, and `dbClearResult()`

To select specific columns from a table, SQL uses `SELECT` and `FROM`:
* **SQL:** `SELECT <col1>, <col2>, ..., <coln> FROM <table>`
* **R (`dplyr`):** `select(<table>, <col1>, <col2>, ..., <coln>)`
* **The `*` Keyword:** In SQL, `*` means *"select all columns"* (equivalent to `everything()` in `dplyr`).

When using the three-step `dbSendQuery()` workflow:
1. `res <- dbSendQuery(con, "<SQL>")` sends the query to the database and returns a result set handle.
2. `dbFetch(res)` retrieves the rows from the result set.
3. `dbClearResult(res)` frees the memory/resources associated with the result set.

```r
res <- dbSendQuery(con, "SELECT * FROM mpg")
dbFetch(res) |> head()
dbClearResult(res)
```

---

# Limiting Results (`LIMIT`)
## Fetching Only a Subset of Rows

When working with large database tables, fetching millions of rows into R can overwhelm memory. In SQL, the **`LIMIT <n>`** clause restricts the output to at most `<n>` rows (similar to `head(df, n)` or `slice_head(n = ...)` in R):

```r
# Send a query that only requests the first 2 rows of mpg
res <- dbSendQuery(con, "SELECT * FROM mpg LIMIT 2")

# Fetch the 2 rows into R
dbFetch(res)

# Always clear the result handle when finished
dbClearResult(res)
```

---

# Filtering Rows (`WHERE`)
## SQL `WHERE` vs. `dplyr::filter()`

To filter rows that satisfy a condition, SQL uses the **`WHERE`** clause after `FROM`:

* **SQL:** `SELECT * FROM <table> WHERE dest = 'IAH'`
* **R (`dplyr`):** `filter(<table>, dest == "IAH")`

> **Critical Syntax Difference:** Notice that SQL uses a **single equals sign (`=`)** for equality comparisons inside `WHERE`, whereas R uses a **double equals sign (`==`)**!

```r
res <- dbSendQuery(con, "SELECT * FROM mpg WHERE cyl = 4")
dbFetch(res) |> head()
dbClearResult(res)
```

---

# Loading `nycflights13` Tables & Helper `q()`
## Setting Up a Multi-Table Relational Database

Let's populate our SQLite database with all five relational tables from `nycflights13` (`flights`, `airports`, `airlines`, `planes`, and `weather`) and define a convenient one-line query helper function `q()`:

```r
library(nycflights13)

dbWriteTable(con, "flights",  flights,  overwrite = TRUE)
dbWriteTable(con, "airports", airports, overwrite = TRUE)
dbWriteTable(con, "airlines", airlines, overwrite = TRUE)
dbWriteTable(con, "planes",   planes,   overwrite = TRUE)
dbWriteTable(con, "weather",  weather,  overwrite = TRUE)

# Shortcut helper function using dbGetQuery() (which sends, fetches, and clears automatically!)
q <- function(...) dbGetQuery(con, ...)
print(q)
dbListTables(con)
```

---

# How Does `q()` Work? Understanding Ellipsis (`...`)
## Unpacking `q <- function(...) dbGetQuery(con, ...)`

Why are there **two** sets of three dots (`...`) in `q <- function(...) dbGetQuery(con, ...)`?

1. **The first `...` in `function(...)`:**
   * Defines `q` as a wrapper function that can accept **any number of arguments** (such as the SQL query string, `params`, `n`, etc.) without needing to list every parameter name explicitly.
2. **The second `...` in `dbGetQuery(con, ...)`:**
   * Forwards **all arguments** passed into `q()` directly into `dbGetQuery()`, right after the pre-filled connection object `con`.

### Why `dbGetQuery()` Instead of `dbSendQuery()`?
* `dbGetQuery(con, sql)` automatically performs `dbSendQuery()` + `dbFetch()` + `dbClearResult()` in a single step and returns a data frame!

---

# Filtering Missing Data (`NULL` vs. `NA`)
## Using `IS NOT NULL` and `IS NULL` in SQL

In R, missing values are represented as **`NA`**, and we test for them using `is.na(x)` or `!is.na(x)`.
In SQL, missing values are called **`NULL`**, and we test for them using **`IS NULL`** or **`IS NOT NULL`**:

* **SQL:** `SELECT * FROM flights WHERE dep_delay IS NOT NULL`
* **R (`dplyr`):** `filter(flights, !is.na(dep_delay))`

> **Common Pitfall:** In SQL, writing `WHERE dep_delay = NULL` or `WHERE dep_delay != NULL` **never works** because `NULL` represents an unknown value. Always write `IS NULL` or `IS NOT NULL`.

```r
# Query non-missing departure delays using SQL (limiting to 10 rows for display)
q("SELECT * FROM flights WHERE dep_delay IS NOT NULL LIMIT 10") |>
  as_tibble() |>
  print()

# Equivalent dplyr filter on the R tibble
filter(flights, !is.na(dep_delay)) |> head(10)
```

---

# Summarizing Data (`GROUP BY`)
## SQL Aggregations vs. `group_by() |> summarize()`

To compute summary statistics per group, SQL pairs aggregate functions (`AVG()`, `COUNT()`, `MIN()`, `MAX()`, `SUM()`) in `SELECT` with a **`GROUP BY`** clause:

* **SQL:** `SELECT AVG(<col>) AS avg_col FROM <table> GROUP BY <group cols>`
* **R (`dplyr`):** `<table> |> group_by(<group cols>) |> summarize(avg_col = mean(<col>))`

```r
# 1. SQL: Average distance and flight count grouped by year, month, day
q("SELECT year, month, day, AVG(distance) AS avg_dist, COUNT(*) AS n
   FROM flights
   GROUP BY year, month, day
   LIMIT 10")

# 2. Equivalent R (dplyr) pipeline
flights |>
  group_by(year, month, day) |>
  summarize(avg_dist = mean(distance, na.rm = TRUE), n = n(), .groups = "drop") |>
  head(10)
```

---

# Joining Tables (`LEFT JOIN ... ON`)
## Combining Relational Tables Across Keys

A **`LEFT JOIN`** keeps all rows from the left table (`flights`) and matches rows from the right table (`planes`) using the **`ON`** condition:

* **SQL:** `SELECT * FROM <table> LEFT JOIN <other_table> ON <left_key_col> = <right_key_col>`
* **R (`dplyr`):** `left_join(<table>, <other_table>, by = c("<left_key_col>" = "<right_key_col>"))`

> **Disambiguating Shared Column Names:** Both `flights` and `planes` have a column named `year` (`flights.year` is the flight year `2013`; `planes.year` is the year the aircraft was manufactured). We use `table.column AS alias` to avoid ambiguity!

```r
q("SELECT flights.year AS flight_yr, planes.tailnum, *
   FROM flights
   LEFT JOIN planes
   ON flights.tailnum = planes.tailnum
   LIMIT 10") |> as_tibble()
```

---

# Window Ranking (`RANK() OVER (...)`)
## Ranking Rows Within Groups Without Collapsing Them

Unlike `GROUP BY` (which collapses each group into a single summary row), SQL **window functions** compute a rank or aggregate for every row within a partition:

```sql
SELECT RANK() OVER (
  PARTITION BY <group1>, <group2>, ..., <groupn>
  ORDER BY <expr1>, <expr2>, ... [ASC|DESC]
) FROM <table>
```

* **`PARTITION BY month, day`:** Divides the flights into daily groups (just like `group_by(month, day)`).
* **`ORDER BY dep_delay DESC`:** Ranks the largest departure delay as `r = 1` within each day.

```r
# 1. SQL Window Function: Rank flights by longest departure delay each day
q("SELECT month, day, dep_delay,
   RANK() OVER (
     PARTITION BY month, day
     ORDER BY dep_delay DESC
   ) r
   FROM flights
   LIMIT 15")

# 2. Equivalent R (dplyr) pipeline
flights |>
  group_by(month, day) |>
  mutate(r = min_rank(-dep_delay)) |>
  select(month, day, dep_delay, r) |>
  arrange(month, day, r) |>
  head(15)
```

---

# Subqueries: Filtering on Window Functions
## Why `WHERE r = 1` Fails Directly — And How Subqueries Solve It

Suppose we want **only the single most delayed flight (`r = 1`) for each day**. What happens if we try to add `WHERE r = 1` directly to our `RANK() OVER (...)` query?

* **Why It Fails:** In SQL's logical order of execution, the `WHERE` clause is evaluated **before** `SELECT` window functions (`RANK() OVER (...)`) are computed! Therefore, the column alias `r` does not exist yet when `WHERE` runs (`Error: no such column: r`).
* **The Solution — A Subquery:** We wrap the inner ranking query in parentheses inside `FROM (...)` and apply `WHERE r = 1` in the **outer query**!

```r
# Wrapping the window ranking query inside a subquery allows outer WHERE filtering!
q("SELECT month, day, dep_delay, r FROM (
     SELECT month, day, dep_delay,
       RANK() OVER (
         PARTITION BY month, day
         ORDER BY dep_delay DESC
       ) r
     FROM flights
   )
   WHERE r = 1
   LIMIT 15")
```

---

# Exercise 1: Max Highway MPG by Manufacturer
## Practice with `SELECT`, `MAX()`, and `GROUP BY`

**Prompt:** Write a SQL query using `q("...")` on the `mpg` table to find the **maximum highway miles per gallon (`MAX(hwy)`) for each `manufacturer`**.

* *Hint:* Select `manufacturer` and `MAX(hwy)` from `mpg`, and group by `manufacturer`.

```r
# replace .... with your query
q("....")
```

```r block=answer
q("SELECT manufacturer, MAX(hwy) FROM mpg GROUP BY manufacturer")
```

---

# Exercise 2: Counting 4-Cylinder Models
## Practice with `COUNT(*)` and `WHERE`

**Prompt:** Write a SQL query using `q("...")` to find **how many 4-cylinder (`cyl = 4`) rows/models** are present in the `mpg` database table.

* *Hint:* Use `SELECT COUNT(*) FROM mpg` combined with a `WHERE` filter on `cyl`.

```r
# replace .... with your query
q("....")
```

```r block=answer
q("SELECT COUNT(*) FROM mpg WHERE cyl = 4")
```

---

# Exercise 3: Minimum Highway MPG by Manufacturer & Model
## Grouping by Multiple Columns (`GROUP BY col1, col2`)

**Prompt:** Extend the grouping concept from Exercise 1 to retrieve the **minimum `hwy` value (`MIN(hwy)`) grouped by both `manufacturer` and `model`** in the `mpg` table.

* *Hint:* Include both `manufacturer` and `model` in your `SELECT` clause and your `GROUP BY` clause.

```r
# replace .... with your query
q("....")
```

```r block=answer
q("SELECT manufacturer, model, MIN(hwy) FROM mpg GROUP BY manufacturer, model")
```

---

# Filtering Groups with the `HAVING` Clause
## `WHERE` (Rows Before Grouping) vs. `HAVING` (Groups After Aggregation)

In SQL, you **cannot** use `WHERE` to filter on an aggregate function like `COUNT(*)` or `AVG(distance)` because `WHERE` filters individual rows *before* `GROUP BY` happens.

Instead, SQL provides the **`HAVING`** clause to filter groups **after** `GROUP BY` aggregation:

| Clause | When It Runs | What It Filters | Can Use Aggregate Functions (`COUNT`, `AVG`)? |
| :--- | :--- | :--- | :--- |
| **`WHERE`** | **Before** `GROUP BY` | Individual table rows | ❌ No |
| **`HAVING`** | **After** `GROUP BY` | Aggregated groups | ✅ Yes |

```r
# Find all destination airports (dest) that received MORE than 10,000 flights
q("SELECT dest, COUNT(*) AS total
   FROM flights
   GROUP BY dest
   HAVING total > 10000")
```

---

# Exercise 4: Manufacturers with 4+ Compact Cars
## Combining `WHERE`, `GROUP BY`, and `HAVING` in One Query

**Prompt:** Write a SQL query on the `mpg` table to get all `manufacturer`s that have a **total of 4 or more `'compact'` cars** (`class = 'compact'`).

* *Hint:*
  1. Filter to `WHERE class = 'compact'` first.
  2. Group by `manufacturer` (`GROUP BY manufacturer`).
  3. Filter the grouped counts using `HAVING COUNT(*) >= 4`.

```r
# replace .... with your query
q("....")
```

```r block=answer
q("SELECT manufacturer, class, COUNT(*) FROM mpg WHERE class = 'compact' GROUP BY manufacturer HAVING COUNT(*) >= 4")
```

---

# Exercise 5: Distinct Car Manufacturers (`SELECT DISTINCT`)
## Removing Duplicate Rows in SQL

In `dplyr`, we use `distinct(mpg, manufacturer)` to retrieve unique values. In SQL, we place the **`DISTINCT`** keyword immediately after `SELECT`:

* **SQL:** `SELECT DISTINCT <column> FROM <table>`
* **R (`dplyr`):** `distinct(<table>, <column>)`

**Prompt:** Write a SQL query using `q("...")` to get the **distinct `manufacturer`s** in the `mpg` dataset.

```r
# replace .... with your query
q("....")
```

```r block=answer
q("SELECT DISTINCT manufacturer FROM mpg")
```

---

# Disconnecting & Additional SQL Resources
## Closing the Database Connection & Continuing Your Practice

When you are finished working with a database, it is best practice to close the connection using `dbDisconnect(con)` to release memory and file locks:

```r
# Disconnect from our SQLite database
dbDisconnect(con)
```

### SQL to `dplyr` Quick Reference

| Operation | SQL Syntax | R `dplyr` Equivalent |
| :--- | :--- | :--- |
| **Select columns** | `SELECT col1, col2 FROM tbl` | `select(tbl, col1, col2)` |
| **Unique values** | `SELECT DISTINCT col1 FROM tbl` | `distinct(tbl, col1)` |
| **Filter rows** | `WHERE col1 = 4 AND col2 IS NOT NULL` | `filter(tbl, col1 == 4, !is.na(col2))` |
| **Group & summarize** | `GROUP BY grp` + `AVG(x), COUNT(*)` | `group_by(grp) |> summarize(mean(x), n())` |
| **Filter groups** | `HAVING COUNT(*) >= 4` | `group_by(grp) |> filter(n() >= 4)` |
| **Left join** | `LEFT JOIN tbl2 ON tbl1.id = tbl2.id` | `left_join(tbl1, tbl2, by = "id")` |
| **Window rank** | `RANK() OVER (PARTITION BY g ORDER BY x DESC)` | `group_by(g) |> mutate(min_rank(-x))` |

### Other Resources from Lecture 12
* **W3Schools SQL Tutorial:** [https://www.w3schools.com/sql/default.asp](https://www.w3schools.com/sql/default.asp)
* **SQL Murder Mystery (Interactive Game):** [https://mystery.knightlab.com/](https://mystery.knightlab.com/)
* **R for Data Science (2e) — Chapter 21 (Databases):** [https://r4ds.hadley.nz/databases.html](https://r4ds.hadley.nz/databases.html)
