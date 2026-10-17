# SQL Workbook: Practical Queries in R
## Result Iterators, Parameterized Queries, SQL Injection, and 10 Questions on `flights`

### Lecture Agenda
1. **Part 1: Setting Up `nycflights13` in SQLite & Result Set Iterators**
   * Creating an in-memory SQLite database from `library(nycflights13)` (`DBI` & `RSQLite`)
   * The `nycflights13` Entity-Relationship Diagram (ERD)
   * Result set objects (`dbSendQuery`), metadata (`dbColumnInfo`), and incremental fetching (`dbFetch(res, n = 1)` vs. `dbFetch(res)`)
2. **Part 2: Parameterized Queries & SQL Injection Defense**
   * Using `?` placeholders and `params = list(...)`
   * How **SQL Injection Attacks** (`' OR 'a'='a`) work and how parameterized queries prevent them
3. **Part 3: Ten Analytical Questions About `flights`**
   * Aggregations, nested subqueries, `RANK() OVER (...)`, SQLite `strftime()` & Unix epochs, `JOIN` + `HAVING BETWEEN`, `DISTINCT` subqueries, `IS NULL`, and `NOT LIKE` pattern matching

---

# Setting Up the `flights` SQLite Database
## Creating SQLite Tables from `library(nycflights13)` in R

In this workbook, we will practice performing SQL queries in R using the `DBI` and `RSQLite` packages and the five relational datasets from `library(nycflights13)`.

We start by creating an in-memory SQLite connection (`con`) and writing the `flights`, `weather`, `airports`, `airlines`, and `planes` tables into our database using `dbWriteTable()`:

```r
library(tidyverse)
library(DBI)
library(RSQLite)
library(nycflights13)

# Connect to an in-memory SQLite database and populate tables from nycflights13
con <- dbConnect(RSQLite::SQLite(), ":memory:")
dbWriteTable(con, "flights",  flights,  overwrite = TRUE)
dbWriteTable(con, "weather",  weather,  overwrite = TRUE)
dbWriteTable(con, "airports", airports, overwrite = TRUE)
dbWriteTable(con, "airlines", airlines, overwrite = TRUE)
dbWriteTable(con, "planes",   planes,   overwrite = TRUE)

dbListTables(con)
```

---

# Reading Database Tables into R Data Frames
## Querying `weather`, `airports`, and `airlines` with `dbGetQuery()`

We can use **`dbGetQuery(con, "<SQL>")`** to execute a `SELECT` query against our SQLite connection and immediately return the result as an R `data.frame`:

```r
# Read tables from SQLite into R data frames (previewing the first 5 rows of each)
weather_df <- dbGetQuery(con, "SELECT * FROM weather LIMIT 5")
print(weather_df)

airports_df <- dbGetQuery(con, "SELECT * FROM airports LIMIT 5")
print(airports_df)

airlines_df <- dbGetQuery(con, "SELECT * FROM airlines LIMIT 5")
print(airlines_df)
```

---

# The `nycflights13` Entity-Relationship Diagram (ERD)
## How the Five Tables Connect via Primary & Foreign Keys

Reference: [R4DS Relational Data Solutions](https://jrnold.github.io/r4ds-exercise-solutions/relational-data.html)

```
                  ┌─────────────────┐
                  │    airlines     │ (carrier -> name)
                  └─────────────────┘
                           │ (carrier)
                           ▼
 ┌─────────────┐  (tailnum) ┌─────────────┐ (origin, dest) ┌──────────────┐
 │   planes    │───────────►│   flights   │◄───────────────│   airports   │
 └─────────────┘            └─────────────┘                └──────────────┘
                                   │
                                   │ (origin, year, month, day, hour)
                                   ▼
                            ┌─────────────┐
                            │   weather   │
                            └─────────────┘
```

* **`flights` $\leftrightarrow$ `airlines`** joins on `carrier` (2-letter airline code).
* **`flights` $\leftrightarrow$ `airports`** joins on `origin = faa` or `dest = faa` (3-letter airport code).
* **`flights` $\leftrightarrow$ `planes`** joins on `tailnum` (aircraft tail number).
* **`flights` $\leftrightarrow$ `weather`** joins on `origin`, `year`, `month`, `day`, and `hour`.

---

# The Result Set Object (`dbSendQuery`)
## Executing Queries and Inspecting Result Metadata

When you want step-by-step control over query execution and row retrieval, use **`dbSendQuery()`**:

* `res <- dbSendQuery(con, query)` compiles and starts executing the SQL query on the database engine and returns a `SQLiteResult` handle without immediately pulling all rows into R memory.
* **`dbColumnInfo(res)`** inspects the column names and R/SQL data types of the result set:

```r
# Execute query and obtain a SQLiteResult object
res <- dbSendQuery(con, "SELECT year, month, day, carrier, flight, origin, dest FROM flights LIMIT 10")

# Print the result handle summary
print(res)

# Inspect column metadata (names and data types)
dbColumnInfo(res)
```

---

# Fetching Results Incrementally (`dbFetch`)
## Single-Row Fetch (`n = 1`) vs. Fetch All Remaining (`n = -1`)

`dbFetch(res, n = ...)` works like a **forward-only iterator** over the result set:

* **`dbFetch(res, n = 1)`:** Fetches **1 row** from the current result position.
* **`dbFetch(res, n = -1)` (or `dbFetch(res)`):** Fetches **all remaining rows** from the result set.
* Notice how `dbFetch()` advances the cursor: we `SELECT`ed 10 rows, fetched 1 row with `dbFetch(res, n = 1)`, and then fetched the remaining 9 rows with `dbFetch(res)`. If we call `dbFetch(res)` again, we get **0 rows** back because everything has already been fetched!

```r
# 1. Fetch just the first row
first_row <- dbFetch(res, n = 1)
print(first_row)

# 2. Fetch all remaining rows out of the 10 we selected (returns 9 rows!)
remaining_rows <- dbFetch(res)
cat("Number of remaining rows fetched:", nrow(remaining_rows), "\n")

# 3. Call dbFetch(res) again — returns 0 rows because the iterator is exhausted!
cat("Fetching again after completion:", nrow(dbFetch(res)), "rows\n")

# Always clear the result set when done
dbClearResult(res)
```

---

# Queries That Depend on User Input
## Approach 1: String Interpolation (And Why It's Risky)

Sometimes our SQL queries depend on a function argument or user input—for example, counting how many flights occurred in a given `month`.

A naive approach builds the SQL string directly using `sprintf()` or `paste0()`:

```r
num_flights_in_month_naive <- function(month) {
  query <- sprintf("SELECT COUNT(*) FROM flights WHERE month = %d", month)
  print(query)
  dbGetQuery(con, query)[[1]]
}

num_flights_in_month_naive(1)
```

> **Wait:** What if a parameter is a string supplied by an untrusted user in a web app or Shiny dashboard? String concatenation opens the door to bugs and **SQL Injection attacks**!

---

# Parameterized Queries with `?` Placeholders
## Letting the SQLite Engine Safely Substitute Parameters

Instead of pasting variables into the SQL string, we use the special **`?` placeholder** in our SQL query and pass the values via **`params = list(...)`**:

```r
num_flights_in_month <- function(month) {
  query <- "SELECT COUNT(*) FROM flights WHERE month = ?"
  print(query)
  dbGetQuery(con, query, params = list(month))[[1]]
}

# Count flights in February (month = 2)
num_flights_in_month(2)
```

* Notice that the SQL string itself (`SELECT COUNT(*) FROM flights WHERE month = ?`) never changes—SQLite binds the parameter value `2` safely at execution time!

---

# Using Multiple `?` Placeholders
## Passing Multiple Parameters in `params = list(...)`

You can include as many `?` placeholders as needed in a query. The values in `params = list(...)` are matched to the `?` placeholders in positional order:

```r
num_flights_on_day <- function(month, day) {
  query <- "SELECT COUNT(*) FROM flights WHERE month = ? AND day = ?"
  dbGetQuery(con, query, params = list(month, day))[[1]]
}

# How many flights departed on February 1st (month = 2, day = 1)?
num_flights_on_day(2, 1)
```

> **Important Rule:** Even when your query has only **one** `?` placeholder, you must always pass `params` as a **`list(...)`** (e.g., `params = list(month)`).

---

# Why Use Placeholders? Setting Up a `users` Table
## Creating and Populating a Table with `dbExecute()`

To see why `?` placeholders are critical for security, let's create an in-memory database `scon` containing a sensitive `users` table with usernames, ages, and passwords:

```r
# Create a separate in-memory SQLite connection for our security demo
scon <- dbConnect(RSQLite::SQLite(), ":memory:")

dbExecute(scon, "
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    age INT,
    password TEXT
  )
")

dbExecute(scon, "
  INSERT INTO users (username, age, password) VALUES
    ('John',   40, 'beeri$g00d'),
    ('Jane',   41, 'wat3rp0l0'),
    ('Julian', 20, 'il0vecr0ut0n3')
")

df <- dbGetQuery(scon, "SELECT * FROM users")
print(class(df))
print(df)
```

---

# Anatomy of a SQL Injection Attack
## How String Concatenation Leaks the Entire Database

Suppose we write a function `user_info(username)` that pastes the user-supplied `username` directly into the `WHERE` clause:

```r
user_info <- function(username) {
  q_str <- paste0("SELECT * FROM users WHERE username = '", username, "'")
  cat("Executed SQL:", q_str, "\n\n")
  dbGetQuery(scon, q_str)
}

# 1. Normal usage works as expected:
print(user_info("John"))

# 2. Malicious input — SQL INJECTION ATTACK!
print(user_info("xxx' OR 'a'='a"))
```

### What Happened?
* Passing `"xxx' OR 'a'='a"` turns the query into:
  `SELECT * FROM users WHERE username = 'xxx' OR 'a'='a'`
* Because `'a'='a'` is **always `TRUE`** for every row, the `WHERE` filter is bypassed and **every user's password is leaked**!

---

# Double Quotes vs. Single Quotes in SQL Injection
## Switching Quote Styles Does Not Stop Injection!

What if a developer wraps the string in double quotes (`"..."`) instead of single quotes? An attacker can simply inject double quotes (`abc" OR "a" = "a"`) instead:

```r
# Vulnerable query using double quotes:
q1 <- paste0('SELECT * FROM users WHERE username = "', 'abc" OR "a" = "a"')
cat("Query 1:", q1, "\n")
print(dbGetQuery(scon, q1))

# If the attacker guesses the wrong quote type, it treats it as part of the string:
q2 <- paste0('SELECT * FROM users WHERE username = "', "abc OR 'a' = 'a'\"")
cat("\nQuery 2:", q2, "\n")
print(dbGetQuery(scon, q2))
```

---

# Stopping SQL Injection with `?` Placeholders
## `safe_user_info()` Using `params = list(username)`

When we use a **`?` placeholder** and pass `params = list(username)`, the database engine compiles the SQL structure *before* inspecting the parameter value. Any quotes or `OR` keywords inside `username` are treated strictly as literal characters in a username search:

```r
safe_user_info <- function(username) {
  q_str <- "SELECT * FROM users WHERE username = ?"
  cat("Parameterized SQL:", q_str, "\n")
  dbGetQuery(scon, q_str, params = list(username))
}

# 1. Valid user lookup still works:
print(safe_user_info("John"))

# 2. Injection attempt safely returns 0 rows!
print(safe_user_info("abc' OR 'a'='a"))
```

---

# Ten Questions About `flights`
## Question 1: Which NYC Airport Is the Busiest?

We now use SQL queries on our `con` database (`flights`, `weather`, `airports`, `airlines`, `planes`) to answer 10 real-world analytical questions.

### Question 1: Which NYC airport (`origin`) had the most departing flights?
* **Strategy:** Aggregate `flights` by the `origin` column using `GROUP BY origin`, and count the number of rows in each group with `COUNT(*)`:

```r
dbGetQuery(con, "
  SELECT origin, COUNT(*) AS total_flights
  FROM flights
  GROUP BY origin
")
```

* **Result:** **EWR** (Newark Liberty, `120,835` flights) is the busiest, followed closely by **JFK** (`111,279`) and **LGA** (`104,662`).

---

# Question 2: Which Month Was the Coldest?
## Aggregating `weather` by `month` and Ordering by `AVG(temp)`

### Question 2: Which month had the lowest average temperature across NYC airports?
* **Strategy:** Aggregate the `weather` table by `month`, compute `AVG(temp)`, and sort from coldest to warmest using `ORDER BY AVG(temp)` (ascending is the default in SQL):

```r
dbGetQuery(con, "
  SELECT month, AVG(temp) AS avg_temp
  FROM weather
  GROUP BY month
  ORDER BY AVG(temp)
")
```

* **Result:** **January (`month = 1`)** (`35.6°F`) and **February (`month = 2`)** (`34.3°F`) were the coldest months of 2013, while **July (`month = 7`)** (`80.1°F`) was the warmest.

---

# Question 3 (Step 1): Most Popular Carrier at Each Airport
## Counting Flights for Every `(origin, carrier)` Pair

### Question 3: What is the most popular airline carrier at each of the three NYC airports?
This question is a bit trickier! We solve it in **three progressive steps**.

* **Step 1:** First, count the number of flights for each combination of `origin` and `carrier`, ordered by `origin` and `COUNT(*) DESC`:

```r
dbGetQuery(con, "
  SELECT origin, carrier, COUNT(*) AS n
  FROM flights
  GROUP BY origin, carrier
  ORDER BY origin, COUNT(*) DESC
") |> head(12)
```

---

# Question 3 (Step 2): Ranking Carriers Within Each Airport
## Combining a Subquery with `RANK() OVER (PARTITION BY origin ...)`

* **Step 2:** Next, we wrap our Step 1 aggregation inside a **subquery** `FROM (SELECT COUNT(*) AS n, origin, carrier FROM flights GROUP BY origin, carrier)` and apply the `RANK() OVER (...)` window function partitioned by `origin`:

```r
dbGetQuery(con, "
  SELECT
    RANK() OVER (
      PARTITION BY origin
      ORDER BY n DESC
    ) AS r,
    origin,
    carrier,
    n
  FROM (
    SELECT COUNT(*) AS n, origin, carrier
    FROM flights
    GROUP BY origin, carrier
  )
") |> head(12)
```

---

# Question 3 (Step 3): Filtering to `WHERE r = 1`
## Nested Subqueries to Extract the Top Carrier per Origin

* **Step 3:** Finally, to keep **only** the #1 most popular carrier (`r = 1`) at each airport, we wrap our Step 2 query in one more outer `SELECT * FROM (...) WHERE r = 1`:

```r
dbGetQuery(con, "
  SELECT * FROM (
    SELECT
      RANK() OVER (
        PARTITION BY origin
        ORDER BY n DESC
      ) AS r,
      carrier,
      origin,
      n
    FROM (
      SELECT COUNT(*) AS n, carrier, origin
      FROM flights
      GROUP BY carrier, origin
    )
  )
  WHERE r = 1
")
```

* **Result:**
  * **EWR:** `UA` (United Air Lines — `46,087` flights)
  * **JFK:** `B6` (JetBlue Airways — `42,076` flights)
  * **LGA:** `DL` (Delta Air Lines — `23,067` flights)

---

# Question 4 (Part 1): Busiest Travel Weeks & `strftime()`
## Manipulating Dates and Times in SQLite

### Question 4: What are the 5 busiest travel weeks of the year?
To group flights by week of the year, we can use SQLite's built-in date/time formatting function **[`strftime()`](https://www.sqlite.org/lang_datefunc.html)**:

* `strftime('%W', ...)` extracts the **week of the year** (`00`–`53`).
* Passing `'now'` converts the current UTC date and time, and `datetime()` is an alias for `strftime('%Y-%m-%d %H:%M:%S', 'now')`:

```r
# 1. Get the current week number of the year using strftime('%W', 'now')
dbGetQuery(con, "SELECT strftime('%W', 'now') AS current_week")

# 2. Get the current UTC timestamp using datetime()
dbGetQuery(con, "SELECT datetime() AS current_utc_datetime")
```

---

# Question 4 (Part 2): Understanding the Unix Epoch
## Converting `flights.time_hour` Seconds into Dates and Weeks

How is the `time_hour` column stored inside SQLite when written from R? Let's inspect the first row:

* `1357034400` is the number of seconds elapsed since **midnight GMT on January 1, 1970**—known as the **[Unix epoch](https://en.wikipedia.org/wiki/Unix_time)**.
* Passing `'unixepoch'` as the second modifier to `datetime()` or `strftime()` tells SQLite to interpret the number as Unix epoch seconds!

```r
# 1. Inspect the raw numeric value of time_hour in SQLite
dbGetQuery(con, "SELECT time_hour FROM flights LIMIT 1")

# 2. Convert Unix timestamp 1357034400 into a human-readable date/time string
dbGetQuery(con, "SELECT datetime(1357034400, 'unixepoch') AS readable_time")

# 3. Extract the week of the year ('%W') for the first 5 flights
dbGetQuery(con, "
  SELECT year, month, day, strftime('%W', time_hour, 'unixepoch') AS week
  FROM flights
  LIMIT 5
")
```

---

# Question 4 (Part 3): Top 5 Busiest Travel Weeks
## Grouping by `strftime('%W', time_hour, 'unixepoch')`

Now we can aggregate all flights by `week`, sort in descending order of flight count (`ORDER BY n DESC`), and take the top 5 (`LIMIT 5`):

```r
dbGetQuery(con, "
  SELECT
    COUNT(*) AS n,
    strftime('%W', time_hour, 'unixepoch') AS week
  FROM flights
  GROUP BY week
  ORDER BY n DESC
  LIMIT 5
")
```

---

# Question 5: Ten Worst Days for Departure Delay
## Using `ROUND(AVG(dep_delay), 2)` and `ORDER BY ... DESC`

### Question 5: What were the 10 worst days of the year for average departure delay?
* **Strategy:** Group `flights` by `year, month, day`, compute `ROUND(AVG(dep_delay), 2) AS avg_delay`, sort descending (`ORDER BY avg_delay DESC`), and `LIMIT 10`:

```r
dbGetQuery(con, "
  SELECT year, month, day, ROUND(AVG(dep_delay), 2) AS avg_delay
  FROM flights
  GROUP BY year, month, day
  ORDER BY avg_delay DESC
  LIMIT 10
")
```

* **Result:** **March 8, 2013 (`2013-03-08`)** had the worst average departure delay at **`83.54` minutes**, due to a major late-winter nor'easter snowstorm hitting the NYC area!

---

# Question 6: Ten Best Days for Departure Delay
## Sorting in Ascending Order (`ORDER BY avg_delay`)

### Question 6: What were the 10 best days of the year for average departure delay?
* **Strategy:** Use the same `GROUP BY year, month, day` query, but sort in **ascending** order (`ORDER BY avg_delay`) so the lowest (negative = early!) average delays appear first:

```r
dbGetQuery(con, "
  SELECT year, month, day, ROUND(AVG(dep_delay), 2) AS avg_delay
  FROM flights
  GROUP BY year, month, day
  ORDER BY avg_delay
  LIMIT 10
")
```

* **Result:** On the best days (such as **September 24, 2013** and **October 2, 2013**), the average flight actually departed **more than 1 minute early** (`-1.33` minutes)!

---

# Question 7: Which Airlines Have the Most Departure Delay?
## Joining `flights` and `airlines` (`JOIN ... ON`)

### Question 7: Which airlines have the highest average departure delay?
To display the full airline `name` alongside the two-letter `carrier` code, we **`JOIN`** `flights` with `airlines` on `flights.carrier = airlines.carrier` and group by `airlines.name`:

```r
dbGetQuery(con, "
  SELECT flights.carrier, name, ROUND(AVG(dep_delay), 2) AS avg_delay
  FROM flights
  JOIN airlines ON flights.carrier = airlines.carrier
  GROUP BY airlines.name
  ORDER BY avg_delay DESC
")
```

* **Result:** **Frontier Airlines (`F9`, `20.22` min)**, **ExpressJet Airlines (`EV`, `19.96` min)**, and **Mesa Airlines (`YV`, `19.00` min)** had the highest average departure delays, whereas **US Airways (`US`, `3.78` min)** and **Hawaiian Airlines (`HA`, `4.90` min)** had the lowest.

---

# Question 8: Filtering Groups with `HAVING ... BETWEEN`
## Which Airlines Have Average Departure Delays Between 5 and 10 Minutes?

### Question 8: Which airlines have an average departure delay between 5 and 10 minutes?
Because `avg_delay` is an **aggregate result** computed per airline (`AVG(dep_delay)`), we filter after `GROUP BY` using **`HAVING avg_delay BETWEEN 5 AND 10`**:

```r
dbGetQuery(con, "
  SELECT airlines.carrier, name, ROUND(AVG(dep_delay), 2) AS avg_delay
  FROM flights
  JOIN airlines ON airlines.carrier = flights.carrier
  GROUP BY airlines.name
  HAVING avg_delay BETWEEN 5 AND 10
")
```

---

# Question 9: Which Airplane Flew the Most Days?
## Using `SELECT DISTINCT` Inside a Subquery

### Question 9: Which individual airplane (identified by `tailnum`) flew on the greatest number of distinct calendar days in 2013?
* Why a subquery with `DISTINCT`? A single plane can fly multiple flights on the same day.
* First, the inner subquery `SELECT DISTINCT year, month, day, tailnum FROM flights` keeps **at most one record per plane per calendar day**.
* Then, the outer query filters out missing tail numbers (`WHERE tailnum IS NOT NULL AND tailnum != 'None'`), groups by `tailnum`, and counts the days:

```r
dbGetQuery(con, "
  SELECT tailnum, COUNT(*) AS days_flown
  FROM (
    SELECT DISTINCT year, month, day, tailnum
    FROM flights
  )
  WHERE tailnum IS NOT NULL AND tailnum != 'None'
  GROUP BY tailnum
  ORDER BY days_flown DESC
  LIMIT 5
")
```

> **Fun Fact:** You can look up real aircraft tail numbers online! The top aircraft, **[N328AA](https://www.planespotters.net/airframe/boeing-767-200-n328aa-american-airlines/enj523)** (a Boeing 767-200 operated by American Airlines), flew on **323 out of 365 days** in 2013!

---

# Question 10: How Many Flights Were Cancelled?
## `WHERE dep_time IS NULL` vs. Why `= NULL` Fails

### Question 10: How many flights in 2013 were cancelled?
In `nycflights13`, a flight that was scheduled but never departed has a missing departure time (`dep_time` is `NULL`).

Let's compare `WHERE dep_time IS NULL` (correct) against `WHERE dep_time = NULL` (a common bug):

```r
# 1. Correct way to check for missing values in SQL: IS NULL
dbGetQuery(con, "SELECT COUNT(*) AS cancelled_flights FROM flights WHERE dep_time IS NULL")

# 2. Common mistake: '= NULL' ALWAYS evaluates to UNKNOWN and returns 0!
dbGetQuery(con, "SELECT COUNT(*) AS wrong_null_check FROM flights WHERE dep_time = NULL")
```

* **Result:** **`8,255` flights** were cancelled (`dep_time IS NULL`), whereas `dep_time = NULL` erroneously returns `0`!

---

# Bonus Question: Flights to Airports with a One-Word Name
## Step 1: Pattern Matching Strings with `LIKE` and `NOT LIKE`

### Question: How many flights were destined for airports whose `name` is a single word (contains no spaces)?
First, let's see an example of an airport with a one-word name (`'Packwood'`), and then find **all** airports in `airports` whose `name` does **not** contain a space character (`WHERE name NOT LIKE '% %'`):

* In SQL `LIKE` patterns, **`%`** is a wildcard matching **zero or more characters**.
* Therefore, `'% %'` matches any string containing at least one space, and **`NOT LIKE '% %'`** matches strings with **no spaces at all**!

```r
# 1. Example of an airport with a one-word name
dbGetQuery(con, "SELECT faa, name FROM airports WHERE name = 'Packwood'")

# 2. Find all airports whose name contains no spaces
dbGetQuery(con, "SELECT faa, name FROM airports WHERE name NOT LIKE '% %'")
```

---

# Bonus Question (Step 2): Counting Flights via `INNER JOIN`
## Two Equivalent Ways to Join `flights` and `airports`

Now we count how many rows in `flights` have a destination (`flights.dest`) matching one of those one-word airports (`airports.faa`). We can write this either with a **subquery join** or a **direct `INNER JOIN` + `WHERE`**:

```r
# Method 1: INNER JOIN against a filtered subquery of one-word airports
dbGetQuery(con, "
  SELECT COUNT(*) AS flights_to_one_word_airports
  FROM flights
  INNER JOIN (
    SELECT faa FROM airports WHERE name NOT LIKE '% %'
  ) one_word
  ON one_word.faa = flights.dest
")

# Method 2: Direct INNER JOIN with a WHERE filter
dbGetQuery(con, "
  SELECT COUNT(*) AS flights_to_one_word_airports
  FROM flights
  INNER JOIN airports
  ON flights.dest = airports.faa
  WHERE name NOT LIKE '% %'
")
```

---

# Practice Exercise 1: Busiest Origin Airport for JetBlue (`B6`)
## Combining `WHERE`, `GROUP BY`, and `ORDER BY`

**Prompt:** Write a SQL query using `dbGetQuery(con, "...")` to find the number of flights operated by **JetBlue (`carrier = 'B6'`)** from each NYC `origin` airport, ordered from highest count to lowest.

```r
# Replace .... with your SQL query
dbGetQuery(con, "....")
```

```r block=answer
dbGetQuery(con, "
  SELECT origin, COUNT(*) AS n
  FROM flights
  WHERE carrier = 'B6'
  GROUP BY origin
  ORDER BY n DESC
")
```

---

# Practice Exercise 2: Parameterized Tail Number Lookup
## Using `?` Placeholders Safely with `params = list(...)`

**Prompt:** Complete the function `plane_flight_count(tail_id)` below so that it uses a **`?` placeholder** and `params = list(tail_id)` to return the total number of flights (`COUNT(*)`) flown by a given `tailnum` in `flights`. Test it on `"N328AA"`.

```r
plane_flight_count <- function(tail_id) {
  # Write a parameterized query using ? and params = list(tail_id)
  query <- "...."
  dbGetQuery(con, query, params = list(tail_id))
}

plane_flight_count("N328AA")
```

```r block=answer
plane_flight_count <- function(tail_id) {
  query <- "SELECT COUNT(*) AS total_flights FROM flights WHERE tailnum = ?"
  dbGetQuery(con, query, params = list(tail_id))
}

plane_flight_count("N328AA")
```

---

# Summary: R `DBI` & `RSQLite` Quick Reference
## Key Functions Used in This Workbook

```r
# Clean up our database connections when finished
dbDisconnect(con)
dbDisconnect(scon)
```

| Database Operation | R (`DBI` + `RSQLite`) Function | Purpose |
| :--- | :--- | :--- |
| **Connect In-Memory DB** | `con <- dbConnect(RSQLite::SQLite(), ":memory:")` | Create a fast temporary SQLite database in RAM |
| **Write R Table to SQL** | `dbWriteTable(con, "flights", flights, overwrite = TRUE)` | Populate SQLite tables from `nycflights13` data frames |
| **Query to Data Frame** | `dbGetQuery(con, "SELECT ...")` | Execute a `SELECT` query and return all results at once |
| **Send Query Handle** | `res <- dbSendQuery(con, "SELECT ...")` | Send a query for step-by-step cursor fetching |
| **Fetch 1 / Fetch All** | `dbFetch(res, n = 1)` / `dbFetch(res, n = -1)` | Retrieve the next `n` rows (or all remaining rows) |
| **Column Metadata** | `dbColumnInfo(res)` | Inspect result column names and data types |
| **Execute DDL / DML** | `dbExecute(scon, "CREATE / INSERT ...")` | Run statements that modify schema or rows |
| **Parameterized Query** | `dbGetQuery(con, q, params = list(x))` | Safely bind user parameters and prevent SQL injection |

