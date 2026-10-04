# Relational Data & Joins

## Why Learn Joins in Exploratory Data Analysis?

In real-world data science, databases rarely store all information inside a single giant table. Storing everything in one massive spreadsheet results in enormous duplicate records, data entry errors, and slow performance. 

To prevent duplication and optimize storage, database architects design **Relational Databases**, where data is split across multiple smaller tables, each focusing on a single entity (e.g., flights, airlines, weather, or planes).

Imagine you are analyzing commercial airline flight delays:
* **The Flights Table**: Contains raw logs for 336,776 departures, listing details like flight number, carrier code (e.g., `"UA"`), and departure delay.
* **The Airlines Table**: A simple lookup directory mapping two-letter carrier codes to full corporate names (e.g., `"UA"` maps to `"United Airlines"`).

To present a readable report for executives, you cannot simply print the code `"UA"`. You need to pull the full name from the airlines directory and align it next to the flight record. 

In `dplyr`, we combine tables using **Joins**. Joins use matching values in shared columns (known as **Keys**) to merge datasets on the fly. Let's learn how to inspect keys, execute mutating joins, leverage filtering joins for debugging, and perform set operations.

---

## 1. Relational Database Schemas

To see how tables relate to one another, we use the `nycflights13` package. Beyond the central `flights` table, it contains four related tables:

1. **`airlines`**: Maps carrier codes to corporate names.
2. **`airports`**: Maps three-letter airport FAA codes to names, locations, and timezones.
3. **`weather`**: Records hourly meteorological observations at each airport.
4. **`planes`**: Logs construction specs (seats, manufacturer, model) for each unique aircraft.

```
                  ┌─────────────────┐
                  │    airlines     │
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

These connections form the **relationships** in our database:
* `flights` connects to `planes` via `tailnum`.
* `flights` connects to `airlines` via `carrier`.
* `flights` connects to `airports` twice: via `origin` and `dest` (destination).
* `flights` connects to `weather` via a compound key: `origin` (the location) combined with `year`, `month`, `day`, and `hour`.

---

## 2. Keys: Primary vs. Foreign

The foundation of relational databases is understanding keys:

### Primary Key
A **Primary Key** is a column (or set of columns) that uniquely identifies an observation in its own table. In a valid primary key, **no duplicate values are allowed**.
* **Simple Key**: A single column uniquely identifies rows (e.g., `tailnum` in the `planes` table, where each airplane has a single, unique tail number).
* **Compound Key**: A combination of multiple columns is required to uniquely identify rows (e.g., `origin`, `year`, `month`, `day`, and `hour` in the `weather` table).

#### Verifying Primary Keys Programmatically
Never assume a column is a primary key without testing it! We can verify uniqueness in two ways:

1. **The Distinct Count Check**: Check if the count of distinct values matches the total row count:
```r
library(tidyverse)
library(nycflights13)

# Verify if tailnum is a primary key in the planes table
planes |>
  summarize(
    total_rows = n(),
    unique_keys = n_distinct(tailnum)
  )
```

2. **The Duplicate Filter Check**: Group by the key and search for any count greater than 1:
```r
# Find if any tailnum appears more than once in planes
planes |>
  count(tailnum) |>
  filter(n > 1)
```
If this returns an empty table, the key is 100% unique!

#### The Danger of Data Entry Errors in Compound Keys
If we check the `flights` table, we might guess that combining `year`, `month`, `day`, `hour`, `minute`, and `tailnum` would form a composite primary key. Let's test this assumption:

```r
# Check if flights can be uniquely identified by scheduled departure time and tailnum
flights |>
  count(year, month, day, hour, minute, tailnum) |>
  filter(n > 1)
```
Surprisingly, this returns rows where the count is greater than 1! This means the same airplane was recorded as departing on two different flights at the exact same minute. This indicates data entry anomalies or dual listings in the raw log, proving that `flights` has no natural primary key.

### Foreign Key
A **Foreign Key** is a column in one table that corresponds to a primary key in another table:
* `flights$tailnum` is a foreign key referencing the primary key `planes$tailnum`.
* `flights$carrier` is a foreign key referencing the primary key `airlines$carrier`.

---

## 3. Cardinality of Relationships

Relationships between primary and foreign keys fall into three categories of cardinality:

1. **One-to-Many (Most Common)**: Each flight has exactly one airplane, but each airplane is flown on many flights over the year.
2. **Many-to-Many**: Each airline flies to many different airports, and each airport hosts many different airlines.
3. **One-to-One (Rare)**: Each row in one table corresponds uniquely to a row in another table. (Usually, these are merged into a single table).

---

## 4. Mutating Joins: Combining Columns

A **Mutating Join** combines columns from a secondary table `y` into a primary table `x` by matching their shared keys. 

To demonstrate how these joins behave, we will use two simple test tables:
```r
# Table x: active customers
x <- tribble(
  ~key, ~val_x,
     1, "x1",
     2, "x2",
     3, "x3"
)

# Table y: customer credit status
y <- tribble(
  ~key, ~val_y,
     1, "y1",
     2, "y2",
     4, "y3"
)
```

---

### A. Left Join: `left_join()`
A Left Join keeps **all** observations in the left table `x`, adding matching values from the right table `y`. If there is no match, it fills the columns with `NA`:

```r
# Join credit status into our active customers table
x |> left_join(y, by = join_by(key))
```
*Note*: Customer `3` is preserved, and their credit status is filled with `NA`. This is the most common join in data science because it prevents you from losing your core dataset during lookup.

---

### B. Inner Join: `inner_join()`
An Inner Join keeps **only** rows that have matching keys in **both** tables. Rows without matching keys on either side are dropped entirely:

```r
# Keep only customers who exist in both tables
x |> inner_join(y, by = join_by(key))
```
*Note*: Customer `3` and customer `4` are completely dropped. Inner joins are rarely used for initial exploratory data analysis because they silently delete unmatched rows, introducing missing observation bias.

---

### C. Full Join: `full_join()`
A Full Join keeps **all** observations from **both** tables. It combines matches and fills mismatches on either side with `NA`:

```r
# Preserve every record from both active and credit directories
x |> full_join(y, by = join_by(key))
```

---

### D. Right Join: `right_join()`
A Right Join keeps all observations in the right table `y`. It behaves identically to a left join with the tables reversed (`right_join(x, y)` is identical to `left_join(y, x)`).

---

## 5. Controlling Key Mapping: `by` vs `join_by()`

By default, if you do not specify a key parameter, `dplyr` performs a **Natural Join**, automatically matching all columns that share identical names across both tables:

```r
# Automatically joins flights and planes on the shared column 'tailnum'
left_join(flights, planes)
```

However, if keys have different names across tables, a natural join will throw a compilation error. We must explicitly map them using **`join_by()`** (the modern standard in `dplyr` 1.1.0+):

* **Identical column names**: `join_by(key)`
* **Different column names**: `join_by(origin == faa)` or `join_by(dest == faa)`

```r
# Map the airport faa code to flight destination code
flights |>
  left_join(airports, by = join_by(dest == faa))
```

---

## 6. Filtering Joins: Auditing Relationships

Filtering joins compare keys between tables but **never add columns** from the secondary table. Instead, they act as programmatic filters for the primary table.

### Semi Join: `semi_join()`
`semi_join(x, y)` keeps all observations in `x` that have a match in `y`:

```r
# Find the top 6 most visited airports
top_dest <- flights |>
  count(dest) |>
  slice_max(n, n = 6)

# Keep only flight logs bound to these top 6 destinations
flights |>
  semi_join(top_dest, by = join_by(dest))
```

---

### Anti Join: `anti_join()`
`anti_join(x, y)` drops all observations in `x` that have a match in `y`. It keeps only rows in `x` that **do not exist** in `y`:

```r
# Find flights that have a registered tailnum but are missing from the planes specs table
mismatched_planes <- flights |>
  anti_join(planes, by = join_by(tailnum)) |>
  filter(!is.na(tailnum)) |>
  distinct(tailnum)

print(mismatched_planes)
```
*Diagnostic Value*: This is an extremely powerful tool for finding database anomalies. For example, looking up these missing tail numbers (such as `N539AA`) in flight tracking databases reveals they represent private jets, which explains why they are missing from commercial passenger aircraft registries!

---

## 7. Multi-Match Landmines

Wrangling relational databases requires caution. Let's study how R handles key duplicates.

### Duplicate Keys on One Side (One-to-Many)
This is normal and expected. If the left table contains duplicate values of a key (e.g., a plane flying multiple times in `flights`), and the right table contains a single unique key (`planes`), R replicates the right table's values across all matching rows on the left.

### Duplicate Keys on Both Sides (Many-to-Many Join Error)
If keys are duplicated on both sides, R generates the **Cartesian product** of all possible matches:

```
     Table x: Key 'A' (2 rows)            Table y: Key 'A' (2 rows)
          ┌─────┬───────┐                      ┌─────┬───────┐
          │ Key │ Val_X │                      │ Key │ Val_Y │
          ├─────┼───────┤                      ├─────┼───────┤
          │  A  │  x1   │                      │  A  │  y1   │
          │  A  │  x2   │                      │  A  │  y2   │
          └─────┴───────┘                      └─────┴───────┘
                                 ▼
                     Resulting Join (2 × 2 = 4 rows):
                     ┌─────┬───────┬───────┐
                     │ Key │ Val_X │ Val_Y │
                     ├─────┼───────┼───────┤
                     │  A  │  x1   │  y1   │
                     │  A  │  x1   │  y2   │
                     │  A  │  x2   │  y1   │
                     │  A  │  x2   │  y2   │
                     └─────┴───────┴───────┘
```

> [!CAUTION] Memory Exhaustion Risk
> Joining tables with millions of duplicate keys on both sides will cause an exponential row explosion. This can exhaust your system's RAM and instantly crash your R session. Always audit your keys for duplicates using `count()` before performing a join!

---

## 8. Set Operations

Set operations compare rows of two tables. Both tables must have the **exact same columns**:

* **`intersect(x, y)`**: Returns only rows that appear in **both** tables.
* **`union(x, y)`**: Returns all unique rows from both tables, removing duplicate rows.
* **`setdiff(x, y)`**: Returns rows that are present in `x` but **not** in `y`.

```r
t1 <- tibble(Name = c("Alice", "Bob"), Age = c(25, 30))
t2 <- tibble(Name = c("Bob", "Charlie"), Age = c(30, 22))

print(intersect(t1, t2)) # Returns Bob (30)
print(union(t1, t2))     # Returns Alice, Bob, Charlie
print(setdiff(t1, t2))   # Returns Alice
```

---

## Hands-on Exercises

### Exercise 1: Brand Market Penetration
**Which commercial airlines operate the highest volume of scheduled flights in our dataset, and how can we map their raw carrier codes to their full corporate names to generate a clear leaderboard?**

*Analytical Guidance*:
Join the flights log with the airline lookup table to analyze brand volumes. Your analysis should:
1. Aggregate and count the number of flights grouped by two-letter `carrier` codes.
2. Join this summary with the `airlines` table to bring in the full airline names.
3. Select only the full carrier name and flight volume columns, and arrange the results to show the busiest brands at the top.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(nycflights13)

flights |>
  count(carrier) |>
  left_join(airlines, by = join_by(carrier)) |>
  select(name, n) |>
  arrange(desc(n))
```
</details>

---

### Exercise 2: Airport Regional Market Share
**How many departures from LaGuardia Airport (LGA) are operated specifically by JetBlue Airways, and how can we filter these records programmatically?**

*Analytical Guidance*:
Combine flight filtering with lookup joins. Your analysis should:
1. Filter the central `flights` table to keep only departures originating from `"LGA"`.
2. Perform a `left_join()` with the `airlines` lookup directory to pull in full corporate names.
3. Filter the resulting joined table to isolate records where the airline's name is `"JetBlue Airways"`.
4. Calculate and return the total count of matching departures.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(nycflights13)

flights |>
  filter(origin == "LGA") |>
  left_join(airlines, by = join_by(carrier)) |>
  filter(name == "JetBlue Airways") |>
  nrow()
```
</details>

---

### Exercise 3: Fleet Deployment Patterns
**What is the most frequently flown aircraft model for each unique commercial carrier in our flight database?**

*Analytical Guidance*:
Match flight records to aircraft manufacturing specs to analyze fleet deployment. Your analysis should:
1. Perform an `inner_join()` between `flights` and the `planes` spec sheet based on their shared `tailnum` key.
2. Group the combined table by `carrier` code and aircraft `model`, ensuring missing values are filtered out.
3. Calculate the count of flights operated by each carrier-model pairing.
4. Extract the single top-performing aircraft model (`slice_max()`) for each carrier.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(nycflights13)

flights |>
  inner_join(planes, by = join_by(tailnum)) |>
  group_by(carrier, model) |>
  filter(!is.na(model)) |>
  summarize(flight_count = n(), .groups = "drop_last") |>
  slice_max(flight_count, n = 1)
```
</details>

---

### Exercise 4: Pacific Time Zone Gateways
**How many scheduled departures in our dataset were bound for destinations located in the Pacific/Honolulu (Hawaii) time zone?**

*Analytical Guidance*:
Map destinations to airport geographic attributes. Your analysis should:
1. Merge the flights log with the `airports` dataset. (Hint: Since the destination code is called `dest` in flights but `faa` in airports, specify the mapping explicitly using `join_by()`).
2. Filter the table to isolate destinations located in the `"Pacific/Honolulu"` time zone (`tzone`).
3. Return the total count of departures bound for Hawaii.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(nycflights13)

flights |>
  left_join(airports, by = join_by(dest == faa)) |>
  filter(tzone == "Pacific/Honolulu") |>
  nrow()
```
</details>

---

### Exercise 5: Busiest Travel Days under Peak Capacity
**Assuming every single scheduled flight was completely full, which calendar day ranks as the busiest of the year in terms of total scheduled passenger seats departing NYC?**

*Analytical Guidance*:
Compute composite capacity statistics using aircraft metrics. Your analysis should:
1. Left-join the core `flights` log with the `planes` specifications table based on `tailnum`.
2. Group the combined records by departure date (calendar `month` and `day`).
3. Calculate the sum of aircraft seats (`seats`) scheduled to depart on each date. (Remember to use `na.rm = TRUE` to handle flights operated by planes missing seat specs).
4. Sort the daily totals in descending order to identify the calendar day with the absolute highest scheduled seating capacity.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(nycflights13)

flights |>
  left_join(planes, by = join_by(tailnum)) |>
  group_by(month, day) |>
  summarize(total_scheduled_seats = sum(seats, na.rm = TRUE), .groups = "drop") |>
  arrange(desc(total_scheduled_seats)) |>
  head(1)
```
</details>
