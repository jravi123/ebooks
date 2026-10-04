# Databases & SQL Queries
## Interfacing R with Relational Databases, SQL Queries, and DBI

---
# Lecture Agenda & Topics

Enterprise datasets typically reside in relational databases queried via SQL (Structured Query Language). In this module, we learn how R interfaces with SQL databases.

Today we will cover:
* **Relational Database Systems**: RDBMS concepts, SQLite, and the `DBI` interface.
* **Connecting to Databases**: Establishing in-memory and file-based connections.
* **Loading Tables**: Writing data frames to database tables with `dbWriteTable()`.
* **Core SQL Clauses**: `SELECT`, `FROM`, `WHERE`, and `LIMIT`.
* **Aggregations & Grouping**: `COUNT(*)`, `AVG()`, `SUM()`, and `GROUP BY`.
* **SQL Joins**: Joining relational tables with `INNER JOIN` and `LEFT JOIN`.
* **Comparing SQL with dplyr**: How `dplyr` verbs map directly to SQL syntax.

---
# Connecting to a Database with DBI and RSQLite

The **`DBI`** package defines a common database interface for R, while **`RSQLite`** embeds a lightweight, serverless SQLite database engine:

```r
library(tidyverse)
library(DBI)
library(RSQLite)

# Establish an in-memory SQLite database connection
con <- dbConnect(RSQLite::SQLite(), ":memory:")

# Populate with sample tables from tidyverse and nycflights13
dbWriteTable(con, "mpg", mpg, overwrite = TRUE)
dbWriteTable(con, "diamonds", diamonds |> head(1000), overwrite = TRUE)

# Verify tables exist in the database
dbListTables(con)
```

---
# Running Queries: `dbGetQuery()`

To execute a SQL query string and retrieve the results as an R data frame, use **`dbGetQuery()`**:

```r
library(tidyverse)
library(DBI)
library(RSQLite)

con <- dbConnect(RSQLite::SQLite(), ":memory:")
dbWriteTable(con, "mpg", mpg, overwrite = TRUE)

# Select columns from mpg table
dbGetQuery(con, "SELECT manufacturer, model, hwy FROM mpg LIMIT 5")
```

### Writing a Helper Function for Cleaner Queries:
```r
library(tidyverse)
library(DBI)
library(RSQLite)

con <- dbConnect(RSQLite::SQLite(), ":memory:")
dbWriteTable(con, "mpg", mpg, overwrite = TRUE)

# Convenience wrapper
q <- function(...) dbGetQuery(con, ...)

q("SELECT manufacturer, model, hwy FROM mpg WHERE cyl = 4 LIMIT 3")
```

---
# Filtering in SQL: The WHERE Clause

In SQL, row filtering is performed using the `WHERE` clause:

```r
library(tidyverse)
library(DBI)
library(RSQLite)

con <- dbConnect(RSQLite::SQLite(), ":memory:")
dbWriteTable(con, "mpg", mpg, overwrite = TRUE)

# Filter for Audi vehicles with highway mileage > 25
dbGetQuery(con, "
  SELECT manufacturer, model, year, hwy 
  FROM mpg 
  WHERE manufacturer = 'audi' AND hwy > 25
")
```

> [!NOTE] Equality Syntax
> SQL uses a single `=` for equality comparison (`WHERE manufacturer = 'audi'`), whereas R uses `==`.

---
# Aggregation in SQL: GROUP BY

Aggregate functions like `COUNT(*)`, `AVG()`, `SUM()`, `MIN()`, and `MAX()` combine with `GROUP BY`:

```r
library(tidyverse)
library(DBI)
library(RSQLite)

con <- dbConnect(RSQLite::SQLite(), ":memory:")
dbWriteTable(con, "mpg", mpg, overwrite = TRUE)

# Average highway mileage and vehicle count by class
dbGetQuery(con, "
  SELECT class, COUNT(*) AS n, ROUND(AVG(hwy), 1) AS avg_hwy
  FROM mpg
  GROUP BY class
  ORDER BY avg_hwy DESC
")
```

---
# SQL Table Joins: LEFT JOIN

Relational tables are combined in SQL using `LEFT JOIN ... ON`:

```r
library(tidyverse)
library(DBI)
library(RSQLite)

con <- dbConnect(RSQLite::SQLite(), ":memory:")

# Create two related tables
students <- tibble(id = 1:4, name = c("Alice", "Bob", "Charlie", "David"))
scores <- tibble(student_id = c(1, 2, 2, 3), subject = c("Math", "Math", "English", "Math"), score = c(95, 88, 92, 79))

dbWriteTable(con, "students", students, overwrite = TRUE)
dbWriteTable(con, "scores", scores, overwrite = TRUE)

# Left join students with their scores
dbGetQuery(con, "
  SELECT students.name, scores.subject, scores.score
  FROM students
  LEFT JOIN scores ON students.id = scores.student_id
")
```

---
# The dplyr to SQL Translation Matrix

`dplyr` verbs translate directly into standard SQL clauses:

| `dplyr` Operation | SQL Equivalent Clause |
| :--- | :--- |
| `select(col1, col2)` | `SELECT col1, col2` |
| `filter(condition)` | `WHERE condition` |
| `arrange(col)` | `ORDER BY col` |
| `arrange(desc(col))` | `ORDER BY col DESC` |
| `mutate(new = expr)` | `SELECT expr AS new` |
| `group_by(grp) \|> summarize(...)` | `GROUP BY grp` |
| `head(n)` | `LIMIT n` |
| `left_join(y, join_by(id))` | `LEFT JOIN y ON x.id = y.id` |

---
# Closing Database Connections

Always close active database connections when analysis is complete to release system locks and resources:

```r
library(DBI)
library(RSQLite)

con <- dbConnect(RSQLite::SQLite(), ":memory:")

# Disconnect
dbDisconnect(con)
```

---
# Module Summary & Key Takeaways

1. **`DBI` & `RSQLite`**: Provide a unified interface for executing SQL queries and managing database connections in R.
2. **Declarative Queries**: SQL clauses follow a strict order: `SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ... LIMIT`.
3. **Database Joins**: `LEFT JOIN ... ON` connects tables via primary and foreign key columns.
4. **`dbDisconnect()`**: Always close open database connections at the end of scripts.
