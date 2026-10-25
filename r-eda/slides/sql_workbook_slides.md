# SQL Workbook: Practical Queries in R

### Lecture Agenda
1. **Parameterized Queries & SQL Injection Defense**
   * Using `?` placeholders and `params = list(...)`
   * How **SQL Injection Attacks** (`' OR 'a'='a`) work and how parameterized queries prevent them
2. **Ten Analytical Questions About `flights`**
   * Multi-table `JOIN`s, aggregations, `COALESCE()` missing-value imputation, `CASE WHEN` conditional logic, SQLite `strftime()` & Unix epochs, `HAVING BETWEEN`, `DISTINCT` subqueries, `IS NULL`, and `NOT LIKE` pattern matching

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

# Shortcut helper function using dbGetQuery() (which sends, fetches, and clears automatically!)
q <- function(...) dbGetQuery(con, ...)
print(q)
dbListTables(con)
```

---

# Reading Database Tables into R Data Frames
## Querying `weather`, `airports`, and `airlines` with Helper `q()`

We can use our helper function **`q("...")`** (wrapping `dbGetQuery(con, ...)`) to execute a `SELECT` query against our SQLite connection and immediately return the result as an R `data.frame`:

```r
# Read tables from SQLite into R data frames using q() (previewing the first 5 rows of each)
weather_df <- q("SELECT * FROM weather LIMIT 5")
print(weather_df)

airports_df <- q("SELECT * FROM airports LIMIT 5")
print(airports_df)

airlines_df <- q("SELECT * FROM airlines LIMIT 5")
print(airlines_df)
```

---

# The `nycflights13` Entity-Relationship Diagram (ERD)
## How the Five Tables Connect via Primary & Foreign Keys

Reference: [R4DS Relational Data Solutions](https://jrnold.github.io/r4ds-exercise-solutions/relational-data.html)

<img src='images/relational-nycflights.png' width=500px />

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
  q(query)[[1]]
}

num_flights_in_month_naive(1)
```

> What if a parameter is a string supplied by an untrusted user in a web app or Shiny dashboard? String concatenation opens the door to bugs and **SQL Injection attacks**!

---

# Parameterized Queries with `?` Placeholders
## Letting the SQLite Engine Safely Substitute Parameters

Instead of pasting variables into the SQL string, we use the special **`?` placeholder** in our SQL query and pass the values via **`params = list(...)`**:

```r
num_flights_in_month <- function(month) {
  query <- "SELECT COUNT(*) FROM flights WHERE month = ?"
  print(query)
  q(query, params = list(month))[[1]]
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
  q(query, params = list(month, day))[[1]]
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
    ('John Doe',   40, 'p@ssw0rd123'),
    ('Jane Doe',   35, 'c0ff33_Mug88'),
    ('Alex Smith', 28, 'd@t@Sc13nc3!')
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
print(user_info("John Doe"))

# 2. Malicious input — SQL INJECTION ATTACK!
print(user_info("xxx' OR 'a'='a"))
```

### What Happened?
* Passing `"xxx' OR 'a'='a"` turns the query into:
  `SELECT * FROM users WHERE username = 'xxx' OR 'a'='a'`
* Because `'a'='a'` is **always `TRUE`** for every row, the `WHERE` filter is bypassed and **every user's password is leaked**!

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
print(safe_user_info("John Doe"))

# 2. Injection attempt safely returns 0 rows!
print(safe_user_info("abc' OR 'a'='a"))
```

---

# Ten Questions About `flights`
## Question 1: Comparing NYC Origin Airports (`JOIN` + Multi-Metric Aggregation)

We now use SQL queries on our `con` database (`flights`, `weather`, `airports`, `airlines`, `planes`) to answer 10 real-world analytical questions.

### Question 1: For each NYC origin airport, what is its full airport name, total departing flights, number of distinct destinations served, and average departure delay?
* **Strategy:** `JOIN` the `flights` and `airports` tables on `flights.origin = airports.faa`, group by `flights.origin` and `airports.name`, and compute `COUNT(*)`, `COUNT(DISTINCT flights.dest)`, and `ROUND(AVG(flights.dep_delay), 2)`:

```r
q("
  SELECT
    flights.origin,
    airports.name AS airport_name,
    COUNT(*) AS total_flights,
    COUNT(DISTINCT flights.dest) AS num_destinations,
    ROUND(AVG(flights.dep_delay), 2) AS avg_dep_delay
  FROM flights
  JOIN airports ON flights.origin = airports.faa
  GROUP BY flights.origin, airports.name
  ORDER BY total_flights DESC
")
```

* **Result:** **EWR (`Newark Liberty Intl`)** is the busiest (`120,835` flights across `86` destinations, `15.11` min avg delay), followed by **JFK (`John F Kennedy Intl`)** (`111,279` flights, `70` destinations, `12.11` min avg delay) and **LGA (`La Guardia`)** (`104,662` flights, `68` destinations, `10.35` min avg delay).

---

# Question 2: Which Month Was the Coldest?
## Aggregating `weather` by `month` and Ordering by `AVG(temp)`

### Question 2: Which month had the lowest average temperature across NYC airports?
* **Strategy:** Aggregate the `weather` table by `month`, compute `AVG(temp)`, and sort from coldest to warmest using `ORDER BY AVG(temp)` (ascending is the default in SQL):

```r
q("
  SELECT month, AVG(temp) AS avg_temp
  FROM weather
  GROUP BY month
  ORDER BY AVG(temp)
")
```

* **Result:** **January (`month = 1`)** (`35.6°F`) and **February (`month = 2`)** (`34.3°F`) were the coldest months of 2013, while **July (`month = 7`)** (`80.1°F`) was the warmest.

---

# Question 3: Imputing Missing Values with `COALESCE()`
## Falling Back When `arr_delay` Is `NULL` on Departed Flights

### Question 3: Among flights that actually departed (`dep_time IS NOT NULL`), how can we impute missing arrival delays (`arr_delay IS NULL`)?

* In `flights`, the rows with `dep_time IS NULL` (and `dep_delay IS NULL`) are **cancelled flights**—they never took off, so imputing `0` minutes of delay for them would be misleading!
* However, several flights have `dep_time IS NOT NULL` and `dep_delay IS NOT NULL`, but `arr_delay IS NULL` (e.g., diverted flights).
* **`COALESCE(arr_delay, dep_delay)`** returns the **first non-`NULL` value** from left to right: it uses `arr_delay` when available, and falls back to `dep_delay` when `arr_delay` is `NULL`!

```r
q("
  SELECT
    flight, origin, dest, dep_time, dep_delay, arr_delay,
    COALESCE(arr_delay, dep_delay) AS effective_delay
  FROM flights
  WHERE dep_time IS NOT NULL AND arr_delay IS NULL
  LIMIT 8
")
```

---

# Conditional Logic with `CASE WHEN`
## Categorizing Departed Flights with `CASE WHEN ... THEN ... ELSE ... END`

### How can we categorize departed flights (`dep_time IS NOT NULL`) into delay severity tiers?
* In SQL, **`CASE WHEN ... THEN ... ELSE ... END`** is the equivalent of `dplyr::case_when()` or `ifelse()`.
* Using `dep_delay` on departed flights (`WHERE dep_time IS NOT NULL`), we classify each flight into a delay tier:

```r
q("
  SELECT
    flight, origin, dest, dep_delay,
    CASE
      WHEN dep_delay <= 0  THEN '1. On Time or Early (<= 0 min)'
      WHEN dep_delay <= 30 THEN '2. Minor Delay (1-30 min)'
      ELSE '3. Major Delay (> 30 min)'
    END AS delay_category
  FROM flights
  WHERE dep_time IS NOT NULL
  LIMIT 10
")
```

---

# Question 4 (Part 1): Busiest Travel Weeks & `strftime()`
## Manipulating Dates and Times in SQLite

### Question 4: What are the 5 busiest travel weeks of the year?
To group flights by week of the year, we can use SQLite's built-in date/time formatting function **[`strftime()`](https://www.sqlite.org/lang_datefunc.html)**:

* `strftime('%W', ...)` extracts the **week of the year** (`00`–`53`).
* Passing `'now'` converts the current UTC date and time, and `datetime()` is an alias for `strftime('%Y-%m-%d %H:%M:%S', 'now')`:

```r
# 1. Get the current week number of the year using strftime('%W', 'now')
q("SELECT strftime('%W', 'now') AS current_week")

# 2. Get the current UTC timestamp using datetime()
q("SELECT datetime() AS current_utc_datetime")
```

---

# Question 4 (Part 2): Understanding the Unix Epoch
## Converting `flights.time_hour` Seconds into Dates and Weeks

How is the `time_hour` column stored inside SQLite when written from R? Let's inspect the first row:

* `1357034400` is the number of seconds elapsed since **midnight GMT on January 1, 1970**—known as the **[Unix epoch](https://en.wikipedia.org/wiki/Unix_time)**.
* Passing `'unixepoch'` as the second modifier to `datetime()` or `strftime()` tells SQLite to interpret the number as Unix epoch seconds!

```r
# 1. Inspect the raw numeric value of time_hour in SQLite
q("SELECT time_hour FROM flights LIMIT 1")

# 2. Convert Unix timestamp 1357034400 into a human-readable date/time string
q("SELECT datetime(1357034400, 'unixepoch') AS readable_time")

# 3. Extract the week of the year ('%W') for the first 5 flights
q("
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
q("
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
q("
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
q("
  SELECT year, month, day, ROUND(AVG(dep_delay), 2) AS avg_delay
  FROM flights
  GROUP BY year, month, day
  ORDER BY avg_delay
  LIMIT 10
")
```

* **Result:** On the best days (such as **September 24, 2013** and **October 2, 2013**), the average flight actually departed **more than 1 minute early** (`-1.33` minutes)!

---

# Question 7: Average Air Time by Destination Time Zone
## Joining `flights` and `airports` (`JOIN ... ON`)

### Question 7: What is the total flight count and average air time (in minutes) for each destination time zone (`tzone`)?
To link each flight's destination code (`flights.dest`) to its destination airport's time zone (`airports.tzone`), we **`JOIN`** `flights` with `airports` on `flights.dest = airports.faa` and group by `airports.tzone`:

```r
q("
  SELECT
    airports.tzone,
    COUNT(*) AS total_flights,
    ROUND(AVG(flights.air_time), 2) AS avg_air_time
  FROM flights
  JOIN airports ON flights.dest = airports.faa
  GROUP BY airports.tzone
  ORDER BY avg_air_time DESC
")
```

* **Result:** **`Pacific/Honolulu`** has the longest average air time (`617.45` min $\approx 10.3$ hours), followed by **`America/Anchorage`** (`413.13` min) and **`America/Los_Angeles`** (`330.00` min), while East Coast flights in **`America/New_York`** average `94.44` minutes.

---

# Question 8: Filtering Groups with `HAVING ... BETWEEN`
## Which Aircraft Engine Types Fly an Average Distance Between 1,000 and 1,500 Miles?

### Question 8: Joining `flights` and `planes`, which aircraft `engine` types have an average flight distance between 1,000 and 1,500 miles?
Because `avg_distance` is an **aggregate result** computed per engine type (`AVG(flights.distance)`), we filter after `GROUP BY` using **`HAVING avg_distance BETWEEN 1000 AND 1500`**:

```r
q("
  SELECT
    planes.engine,
    COUNT(*) AS total_flights,
    ROUND(AVG(flights.distance), 2) AS avg_distance
  FROM flights
  JOIN planes ON flights.tailnum = planes.tailnum
  GROUP BY planes.engine
  HAVING avg_distance BETWEEN 1000 AND 1500
")
```

* **Result:** **`Turbo-jet`** (`1,497.27` mi), **`Turbo-shaft`** (`1,362.50` mi), **`4 Cycle`** (`1,325.67` mi), and **`Reciprocating`** (`1,090.88` mi) engines fall in this range (whereas `Turbo-prop` averages `1,642.89` mi and `Turbo-fan` averages `994.92` mi).

---

# Question 9: Which Airplane Flew the Most Days?
## Using `SELECT DISTINCT` Inside a Subquery

### Question 9: Which individual airplane (identified by `tailnum`) flew on the greatest number of distinct calendar days in 2013?
* Why a subquery with `DISTINCT`? A single plane can fly multiple flights on the same day.
* First, the inner subquery `SELECT DISTINCT year, month, day, tailnum FROM flights` keeps **at most one record per plane per calendar day**.
* Then, the outer query filters out missing tail numbers (`WHERE tailnum IS NOT NULL AND tailnum != 'None'`), groups by `tailnum`, and counts the days:

```r
q("
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
q("SELECT COUNT(*) AS cancelled_flights FROM flights WHERE dep_time IS NULL")

# 2. Common mistake: '= NULL' ALWAYS evaluates to UNKNOWN and returns 0!
q("SELECT COUNT(*) AS wrong_null_check FROM flights WHERE dep_time = NULL")
```

* **Result:** **`8,255` flights** were cancelled (`dep_time IS NULL`), whereas `dep_time = NULL` erroneously returns `0`!

---

# Flights to Airports with a One-Word Name
## Step 1: Pattern Matching Strings with `LIKE` and `NOT LIKE`

### Question: How many flights were destined for airports whose `name` is a single word (contains no spaces)?
First, let's see an example of an airport with a one-word name (`'Packwood'`), and then find **all** airports in `airports` whose `name` does **not** contain a space character (`WHERE name NOT LIKE '% %'`):

* In SQL `LIKE` patterns, **`%`** is a wildcard matching **zero or more characters**.
* Therefore, `'% %'` matches any string containing at least one space, and **`NOT LIKE '% %'`** matches strings with **no spaces at all**!

```r
# 1. Example of an airport with a one-word name
q("SELECT faa, name FROM airports WHERE name = 'Packwood'")

# 2. Find all airports whose name contains no spaces
q("SELECT faa, name FROM airports WHERE name NOT LIKE '% %'")
```

---

# Counting Flights via `INNER JOIN`
## Two Equivalent Ways to Join `flights` and `airports`

Now we count how many rows in `flights` have a destination (`flights.dest`) matching one of those one-word airports (`airports.faa`). We can write this either with a **subquery join** or a **direct `INNER JOIN` + `WHERE`**:

```r
# Method 1: INNER JOIN against a filtered subquery of one-word airports
q("
  SELECT COUNT(*) AS flights_to_one_word_airports
  FROM flights
  INNER JOIN (
    SELECT faa FROM airports WHERE name NOT LIKE '% %'
  ) one_word
  ON one_word.faa = flights.dest
")

# Method 2: Direct INNER JOIN with a WHERE filter
q("
  SELECT COUNT(*) AS flights_to_one_word_airports
  FROM flights
  INNER JOIN airports
  ON flights.dest = airports.faa
  WHERE name NOT LIKE '% %'
")
```

---

# Practice Exercise 1: Top Aircraft Manufacturers at JFK
## Combining `JOIN`, `WHERE`, `GROUP BY`, and `ORDER BY`

**Prompt:** Write a SQL query using `q("...")` that joins `flights` and `planes` on `tailnum` to find the **top 5 aircraft `manufacturer`s** flying out of **JFK (`flights.origin = 'JFK'`)**, returning the `manufacturer`, total number of flights (`total_flights`), and average air time rounded to 1 decimal place (`ROUND(AVG(flights.air_time), 1) AS avg_air_time`), ordered from highest flight count to lowest.

```r
# Replace .... with your SQL query
q("....")
```

```r block=answer
q("
  SELECT
    planes.manufacturer,
    COUNT(*) AS total_flights,
    ROUND(AVG(flights.air_time), 1) AS avg_air_time
  FROM flights
  JOIN planes ON flights.tailnum = planes.tailnum
  WHERE flights.origin = 'JFK'
  GROUP BY planes.manufacturer
  ORDER BY total_flights DESC
  LIMIT 5
")
```

---

# Practice Exercise 2: Parameterized Tail Number Lookup
## Using `?` Placeholders Safely with `params = list(...)`

**Prompt:** Complete the function `plane_flight_count(tail_id)` below so that it uses a **`?` placeholder** and `params = list(tail_id)` with `q()` to return the total number of flights (`COUNT(*)`) flown by a given `tailnum` in `flights`. Test it on `"N328AA"`.

```r
plane_flight_count <- function(tail_id) {
  # Write a parameterized query using ? and params = list(tail_id)
  query <- "...."
  q(query, params = list(tail_id))
}

plane_flight_count("N328AA")
```

```r block=answer
plane_flight_count <- function(tail_id) {
  query <- "SELECT COUNT(*) AS total_flights FROM flights WHERE tailnum = ?"
  q(query, params = list(tail_id))
}

plane_flight_count("N328AA")
```

---

# Cleanup


```r
# Clean up our database connections when finished
dbDisconnect(con)
dbDisconnect(scon)
```

