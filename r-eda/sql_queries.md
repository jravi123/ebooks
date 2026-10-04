# Statistical Foundations & Relational Databases (SQL)

## Why Master Statistics and Database Queries?

In professional enterprise environments, datasets are almost never stored in flat CSV files on your local machine. Instead, they are stored in secure, centralized **Relational Databases** containing hundreds of millions of rows. 

Attempting to download a 500-million-row database to your local computer's memory will instantly freeze your R session or crash your machine. Instead, a professional data scientist uses **SQL (Structured Query Language)** to filter, aggregate, and join tables directly inside the database server, returning only the compact, final summary table back to R for visualization and diagnostic modeling.

Additionally, to verify whether the patterns we discover in these databases are real or simply due to random chance, we must master the statistical testing framework that underpins data-driven decision making.

In this chapter, we will master the foundations of hypothesis testing (including t-tests, chi-squared tests, ANOVA, and correlations) and learn how to connect to databases, execute SQL queries inside R, and write advanced SQL joins, subqueries, and window partition ranks.

---

## Part 1: Statistical Foundations of Data Diagnostics

Before we dive into relational databases, let's learn how to perform formal statistical tests to determine whether our observations are statistically significant.

### The Hypothesis Testing Framework
* **Null Hypothesis ($H_0$)**: A statement that there is no difference, effect, or association in the population. It represents the "status quo."
* **Alternative Hypothesis ($H_1$)**: A statement that there is a significant difference, effect, or association.
* **P-value**: The probability of observing our sample data (or something more extreme) assuming the null hypothesis is true. 
  * A **small p-value (typically $p < 0.05$)** provides strong evidence against the null hypothesis, allowing us to reject the null in favor of the alternative.

---

### A. Comparing Two Means: The T-test
A t-test is used when you are comparing the means of a **continuous variable** across **two discrete groups** (e.g., comparing prices between two specific diamond cuts).

```r
library(tidyverse)

# Filter for Ideal and Premium cut diamonds
ideal_diamonds <- diamonds |> filter(cut == "Ideal")
premium_diamonds <- diamonds |> filter(cut == "Premium")

# Perform a two-sample t-test comparing price
t_test_result <- t.test(ideal_diamonds$price, premium_diamonds$price)
print(t_test_result)
```
* **Interpretation**: If the computed p-value is extremely small ($p < 0.05$), we reject the null hypothesis of equal means and conclude that there is a statistically significant difference in prices between Ideal and Premium diamonds.

---

### B. Testing Categorical Association: The Chi-Squared Test
The Chi-squared ($ \chi^2 $) test of independence is used when you are looking for an association between **two categorical variables** (e.g., testing if a customer's choice of movie genre is associated with their choice of ice cream flavor).

The test compares the frequencies you **observe** in your sample with the frequencies you would **expect** to see if the variables were completely independent.

#### Step 1: Gather Observed Frequencies
Our raw survey results from 200 people:

| Category | Prefers Chocolate | Prefers Vanilla | Row Totals |
| :--- | :---: | :---: | :---: |
| **Likes Comedy** | 70 | 30 | **100** |
| **Likes Sci-Fi** | 20 | 80 | **100** |
| **Column Totals**| **90** | **110** | **200 (Grand Total)** |

#### Step 2: Calculate Expected Frequencies
If two events ($A$ and $B$) are statistically independent, the joint probability is the product of their individual probabilities:
$$P(A \text{ and } B) = P(A) \times P(B)$$

Applying this logic to the Comedy and Chocolate cell:
1. $P(\text{Likes Comedy}) = 100 / 200 = 0.50$
2. $P(\text{Prefers Chocolate}) = 90 / 200 = 0.45$
3. Joint Probability: $0.50 \times 0.45 = 0.225$
4. Expected Count: $0.225 \times 200 = 45$

This simplifies to the expected count formula:
$$\text{Expected Count} = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total}}$$

Using this formula, we get the table of expected counts:

| Category | Prefers Chocolate | Prefers Vanilla |
| :--- | :---: | :---: |
| **Likes Comedy** | 45 | 55 |
| **Likes Sci-Fi** | 45 | 55 |

#### Step 3: Statistical Comparison
If the difference between our observed and expected tables is large, the Chi-squared test returns a tiny p-value, indicating a statistically significant association between the two variables.

---

### C. Comparing Multiple Means: ANOVA (Analysis of Variance)
When you need to compare continuous means across **three or more categories** (e.g., comparing prices across all five diamond cut grades), a t-test is no longer sufficient. Instead, use an **ANOVA**:

```r
# Perform ANOVA to compare diamond prices across all cut qualities
anova_model <- aov(price ~ cut, data = diamonds)
summary(anova_model)
```

### D. Testing Continuous Relationships: Correlation Tests
To test if there is a linear relationship between **two continuous variables** (e.g., diamond carat weight and price), use a correlation test:

```r
# Test correlation between carat and price
cor.test(diamonds$carat, diamonds$price)
```

---

## Part 2: Relational Databases & SQL Connection

Relational Database Management Systems (DBMS) organize data into structured tables linked by keys. To work with a database from R, you use a combination of two packages:
1. **`DBI` (Database Interface)**: Provides a set of generic functions to connect to databases, send queries, and manage transactions.
2. **A DBMS Driver Package**: Tailored to translate DBI commands into database-specific instructions (e.g., `RSQLite` for SQLite, `RPostgres` for PostgreSQL, or `RMariaDB` for MySQL).

```
        ┌───────────────────────────────────────────────────────────┐
        │                        R Environment                      │
        │                                                           │
        │  [DBI Package] ──► Translates standard generic commands   │
        └──────────────────────────────┬────────────────────────────┘
                                       │
                                       ▼
        ┌───────────────────────────────────────────────────────────┐
        │                    Database Drivers                       │
        │                                                           │
        │  • RSQLite Driver  ──► Sends commands to local SQLite db  │
        │  • RPostgres Driver ──► Sends commands to Postgres server │
        └──────────────────────────────┬────────────────────────────┘
                                       │
                                       ▼
        ┌───────────────────────────────────────────────────────────┐
        │                  Target Database Engines                  │
        └───────────────────────────────────────────────────────────┘
```

Let's establish a connection to an in-memory SQLite database and write tables to it:

```r
library(DBI)
library(nycflights13)

# Connect to an ephemeral, in-memory SQLite database
con <- dbConnect(RSQLite::SQLite(), ":memory:")

# Write tables from our R packages to the database
dbWriteTable(con, "mpg", mpg, overwrite = TRUE)
dbWriteTable(con, "flights", flights, overwrite = TRUE)
dbWriteTable(con, "planes", planes, overwrite = TRUE)

# List all tables inside the database
dbListTables(con)

# List the column fields in the mpg table
dbListFields(con, "mpg")
```

---

### Creating a Custom Query Runner
To make our code cleaner, we can write a simple helper function `q` to handle running queries and returning them as standard data frames:

```r
# Define convenience function to run queries
q <- function(...) dbGetQuery(con, ...)
```
* **The Ellipsis (`...`)**: This argument accepts any number of inputs and passes them directly to `dbGetQuery(con, ...)`, making our code much faster to write!

---

## Part 3: SQL Syntax Translating to `dplyr`

Let's look at how SQL commands map directly to standard Tidyverse transformations.

### 1. Selecting Columns
In SQL, we list our target columns after the `SELECT` keyword, and specify the source table after the `FROM` keyword. To select all columns, use the asterisk (`*`):

```r
# SQL Syntax: Select all columns, limited to 5 rows
q("SELECT * FROM mpg LIMIT 5")

# Equivalent dplyr:
# mpg |> head(5)
```

---

### 2. Filtering Rows (`WHERE` & `NULL` checks)
We use the `WHERE` clause to filter rows. Note that SQL uses a single equals sign (`=`) for equality checks, and handles missing values using `IS NULL` or `IS NOT NULL` (similar to R's `is.na()`):

```r
# SQL Syntax: Filter for 4-cylinder cars with known departure delays
q("
  SELECT year, month, day, dep_delay 
  FROM flights 
  WHERE dep_delay IS NOT NULL 
  LIMIT 5
")

# Equivalent dplyr:
# flights |> 
#   filter(!is.na(dep_delay)) |> 
#   select(year, month, day, dep_delay) |> 
#   head(5)
```

---

### 3. Summarizing and Grouping (`GROUP BY`)
To calculate aggregates across categories, we combine aggregate functions (like `AVG`, `SUM`, `COUNT(*)`, `MIN`, `MAX`) with the `GROUP BY` clause:

```r
# SQL Syntax: Get average flight distance and flight count for each day
q("
  SELECT year, month, day, AVG(distance) AS avg_dist, COUNT(*) AS n 
  FROM flights 
  GROUP BY year, month, day
  LIMIT 5
")

# Equivalent dplyr:
# flights |> 
#   group_by(year, month, day) |> 
#   summarize(avg_dist = mean(distance), n = n()) |> 
#   head(5)
```

---

### 4. Mutating Joins (`LEFT JOIN`)
SQL joins tables using the `LEFT JOIN` and `ON` clauses, which is similar to dplyr's `left_join()`:

```r
# SQL Syntax: Join flights table with planes table on tail number
q("
  SELECT flights.year AS flight_yr, planes.tailnum, planes.model 
  FROM flights
  LEFT JOIN planes ON flights.tailnum = planes.tailnum
  LIMIT 5
")

# Equivalent dplyr:
# left_join(flights, planes, by = "tailnum")
```

---

### 5. Window Functions & Ranking (`OVER PARTITION BY`)
Ranking values within groups is done using window functions in SQL, combining the `RANK()` function with `OVER (PARTITION BY ... ORDER BY ...)`:

```r
# SQL Syntax: Rank departure delays within each day
q("
  SELECT year, month, day, dep_delay, 
         RANK() OVER (PARTITION BY month, day ORDER BY dep_delay DESC) AS r 
  FROM flights
  LIMIT 5
")

# Equivalent dplyr:
# flights |> 
#   group_by(month, day) |> 
#   mutate(r = min_rank(-dep_delay)) |> 
#   select(year, month, day, dep_delay, r)
```

---

### 6. Nested Subqueries
In SQL, you cannot filter a table based on a window function rank (`WHERE r = 1`) within the same query. You must wrap your rank query inside a nested subquery:

```r
# SQL Syntax: Isolate the single flight with the highest delay for each day
q("
  SELECT year, month, day, dep_delay, r 
  FROM (
    SELECT year, month, day, dep_delay, 
           RANK() OVER (PARTITION BY month, day ORDER BY dep_delay DESC) AS r 
    FROM flights
  )
  WHERE r = 1
  LIMIT 5
")
```

---

### 7. Filtering Aggregated Groups: `WHERE` vs. `HAVING`
This is a critical SQL concept that often trips up beginners:
* **`WHERE`**: Filters individual rows **before** they are aggregated.
* **`HAVING`**: Filters grouped summaries **after** they have been aggregated using `GROUP BY`.

```r
# SQL Syntax: Find destinations that have more than 10,000 total flights
q("
  SELECT dest, COUNT(*) AS total 
  FROM flights 
  GROUP BY dest 
  HAVING total > 10000
")
```

---

## Hands-on Exercises

### Exercise 1: Diamond Quality T-Tests
**Is there a statistically significant difference in retail pricing between Ideal cut and Premium cut diamonds, or are the observed differences simply due to random chance?**

*Analytical Guidance*:
Perform a formal continuous diagnostic check on diamond prices across cuts. Your analysis should:
1. Load the `diamonds` dataset into your R session.
2. Filter and isolate two vectors of diamond prices: one for `"Ideal"` cut diamonds and another for `"Premium"` cut diamonds.
3. Run a two-sample t-test using **`t.test()`** comparing these prices, and evaluate the p-value against the $0.05$ threshold to make your decision.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ideal_prices <- diamonds |> filter(cut == "Ideal") |> pull(price)
premium_prices <- diamonds |> filter(cut == "Premium") |> pull(price)

t_test_result <- t.test(ideal_prices, premium_prices)
print(t_test_result)
```
</details>

---

### Exercise 2: Association Checks with Chi-Squared
**Is there a statistically significant association between a diamond's cut quality and its color grade, or are these two categories independent?**

*Analytical Guidance*:
Evaluate the potential association between diamond cut and color. Your analysis should:
1. Build a contingency table of counts across cut and color using base R's **`table()`** function.
2. Pass this contingency table into the Chi-squared test function **`chisq.test()`**.
3. Evaluate the p-value to determine if cut quality and color grade are independent.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Create contingency table
diamond_table <- table(diamonds$cut, diamonds$color)

# Run Chi-squared test
chi_result <- chisq.test(diamond_table)
print(chi_result)
```
</details>

---

### Exercise 3: Maximizing Mileage Across Manufacturers
**What is the highest highway fuel efficiency achieved by any vehicle manufactured by each individual car brand represented in our database?**

*Analytical Guidance*:
Query our relational SQLite database to calculate grouped maximums. Your analysis should:
1. Connect to an in-memory SQLite database named `con` and load the `mpg` table.
2. Write a SQL query selecting the `manufacturer` column and the maximum value of the `hwy` column.
3. Group the query results by `manufacturer`.
4. Run the query using your custom `q()` helper function.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(DBI)

con <- dbConnect(RSQLite::SQLite(), ":memory:")
dbWriteTable(con, "mpg", mpg, overwrite = TRUE)

q <- function(...) dbGetQuery(con, ...)

# Query max highway MPG grouped by manufacturer
result <- q("
  SELECT manufacturer, MAX(hwy) AS max_hwy 
  FROM mpg 
  GROUP BY manufacturer
")
print(result)

dbDisconnect(con)
```
</details>

---

### Exercise 4: Identifying Volume Spikes with HAVING
**Which vehicle manufacturers produce 4 or more 'compact' car models within our database, and how can we filter these groups after they have been aggregated?**

*Analytical Guidance*:
Write a query using SQL group filters. Your analysis should:
1. Connect to an in-memory SQLite database and load the `mpg` table.
2. Select the `manufacturer` column and a count of records (`COUNT(*)`).
3. Filter the raw rows **before** aggregation for vehicles with a class of `'compact'`.
4. Group the results by `manufacturer`.
5. Filter the final groups **after** aggregation using the `HAVING` clause to keep only those with a count of `4` or more.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(DBI)

con <- dbConnect(RSQLite::SQLite(), ":memory:")
dbWriteTable(con, "mpg", mpg, overwrite = TRUE)

q <- function(...) dbGetQuery(con, ...)

# Query using WHERE (before grouping) and HAVING (after grouping)
result <- q("
  SELECT manufacturer, COUNT(*) AS count 
  FROM mpg 
  WHERE class = 'compact' 
  GROUP BY manufacturer 
  HAVING COUNT(*) >= 4
")
print(result)

dbDisconnect(con)
```
</details>

---

### Exercise 5: Advanced Window Ranking Subqueries
**How can we identify the single flight that experienced the longest departure delay for each calendar day, using SQL window partitioning ranks inside a subquery?**

*Analytical Guidance*:
Evaluate daily extreme flight delays using SQL window functions. Your analysis should:
1. Connect to an in-memory SQLite database and load the `flights` table from `nycflights13`.
2. Write a subquery that selects `year`, `month`, `day`, `dep_delay`, and calculates a window rank: `RANK() OVER (PARTITION BY month, day ORDER BY dep_delay DESC) AS r`.
3. Wrap this subquery in an outer `SELECT` query that filters for only those rows where the rank is equal to `1` (`WHERE r = 1`).
4. Execute the query and print the top 5 results.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(DBI)
library(nycflights13)

con <- dbConnect(RSQLite::SQLite(), ":memory:")
dbWriteTable(con, "flights", flights, overwrite = TRUE)

q <- function(...) dbGetQuery(con, ...)

# Query using window ranking inside a subquery
result <- q("
  SELECT year, month, day, dep_delay, r 
  FROM (
    SELECT year, month, day, dep_delay, 
           RANK() OVER (PARTITION BY month, day ORDER BY dep_delay DESC) AS r 
    FROM flights
  ) 
  WHERE r = 1 
  LIMIT 5
")
print(result)

dbDisconnect(con)
```
</details>
