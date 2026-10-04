# Relational Data & Joins with dplyr
## Relational Architecture, Mutating and Filtering Joins

---

# Lecture Agenda & Topics

Real-world data analysis rarely happens within a single isolated spreadsheet or data frame. Instead, data is spread across multiple interconnected tables that must be combined using shared identifiers.

Today we will methodically cover:
* **The Relational Paradigm**: Exploring the multi-table architecture of `nycflights13` (`flights`, `airlines`, `airports`, `planes`, `weather`).
* **Keys**:
  * Primary Keys: definition, uniqueness property, single vs. compound keys.
  * Methods to verify primary keys: `summarize(n_distinct())` and `count() |> filter(n > 1)`.
  * The Search for Primary Keys in `flights` and discovering data entry anomalies.
  * Testing compound keys on `mpg`.
* **Foreign Keys & Cardinality**:
  * Definition of foreign keys.
  * One-to-one, one-to-many, and many-to-many relations.
* **Mutating Joins**:
  * `inner_join()`: exact matches only and the risk of dropped rows.
  * `left_join()`: preserving primary observations (the data analyst's default).
  * `right_join()` & `full_join()`: right preservation and full outer unions.
* **Join Syntax Evolution**:
  * Legacy `by = c(...)` vs. modern `join_by(...)`.
  * Handling mismatched column names (e.g., `dest == faa`).
  * Natural joins and the hidden risk of shared column names (`year`).
* **Duplicate Keys & Cartesian Products**:
  * One-to-many expansion mechanics.
  * Many-to-many Cartesian explosions and performance risks.
* **Filtering Joins**:
  * `semi_join()`: filtering rows without adding columns or duplicating records.
  * `anti_join()`: diagnostic filtering to isolate missing or orphaned records.

---

# The Multi-Table World of `nycflights13`

The `nycflights13` package contains five interconnected tables recording 336,776 flights departing New York City in 2013:

```r
library(tidyverse)
library(nycflights13)

glimpse(flights)
glimpse(airlines)
glimpse(airports)
glimpse(planes)
glimpse(weather)
```

```
Rows: 336,776  Columns: 19  (flights: flight operations)
Rows: 16       Columns: 2   (airlines: carrier abbreviation to full name)
Rows: 1,458    Columns: 8   (airports: FAA code, name, lat, lon, alt, tzone)
Rows: 3,322    Columns: 9   (planes: tailnum, year, type, manufacturer, model, seats)
Rows: 26,115   Columns: 15  (weather: hourly meteorological observations at NYC origins)
```

Rather than storing all information in one gargantuan, redundant table, data is normalized across specialized tables.

---

# Exploring Individual Tables

Let's query specific reference tables before connecting them:

### 1. Finding Detroit Metropolitan Airport (DTW):
```r
library(tidyverse)
library(nycflights13)

airports |> 
  filter(faa == "DTW")
```

```
# A tibble: 1 × 8
  faa   name                  lat   lon   alt    tz dst   tzone           
  <chr> <chr>               <dbl> <dbl> <dbl> <dbl> <chr> <chr>           
1 DTW   Detroit Metro Wayne  42.2 -83.4   645    -5 A     America/New_York
```

### 2. Checking NYC Weather Origin Stations:
```r
weather$origin |> unique()
# [1] "EWR" "JFK" "LGA"
```

Weather is measured specifically at the three New York departure hubs: Newark (`EWR`), John F. Kennedy (`JFK`), and LaGuardia (`LGA`).

---

# Visual Architecture: The Relational Network

The diagram below illustrates how all five tables in `nycflights13` connect with one another:

```
                   +------------------------+
                   |        airports        |
                   |------------------------|
                   | faa (PK)               |
                   | name, lat, lon, tzone  |
                   +------------------------+
                        ^              ^
          origin == faa |              | dest == faa
                        |              |
+-------------------+   |   +-----------------------+   tailnum   +----------------------+
|     airlines      |   |   |        flights        | ----------> |        planes        |
|-------------------|   |   |-----------------------|             |----------------------|
| carrier (PK)      | <-+-- | carrier (FK)          |             | tailnum (PK)         |
| name              |       | origin, dest (FK)     |             | model, seats, engine |
+-------------------+       | tailnum (FK)          |             +----------------------+
                            | year, month, day, hr  |
                            +-----------------------+
                                        |
               origin, year, month, day | hour
                                        v
                            +-----------------------+
                            |        weather        |
                            |-----------------------|
                            | origin, year ..(PK)  |
                            | temp, humid, wind_spd |
                            +-----------------------+
```

---

# Key Table Relationships in `nycflights13`

1. **`flights` $\leftrightarrow$ `planes`**:
   * Connected via `tailnum`.
   * Maps each flight to the physical aircraft that operated it.
2. **`flights` $\leftrightarrow$ `airlines`**:
   * Connected via `carrier`.
   * Maps 2-letter carrier codes (e.g., `"DL"`, `"UA"`, `"B6"`) to airline names.
3. **`flights` $\leftrightarrow$ `airports` (Dual Relationship)**:
   * Connected via `origin == faa` (departure airport).
   * Connected via `dest == faa` (arrival airport).
4. **`flights` $\leftrightarrow$ `weather`**:
   * Connected via origin airport + timestamp (`origin`, `year`, `month`, `day`, `hour` or `origin`, `time_hour`).
   * Gives exact weather conditions at the moment of departure.

---

# What is a Primary Key?

The foundational building block of any relational database is the **primary key**:

> **Definition**: A **Primary Key** is a variable (or set of variables) that uniquely identifies each observation in its own table.
> There is **at most one row** corresponding to that one value (or a combination of values) in the primary key.

### Characteristics of Primary Keys:
* **Uniqueness**: No duplicate keys are allowed.
* **Non-null**: A primary key cannot be `NA`.
* **Single vs. Compound**:
  * **Simple Key**: A single column is sufficient (e.g., `tailnum` in `planes`, `faa` in `airports`, `carrier` in `airlines`).
  * **Compound (Composite) Key**: Multiple columns combined are required to achieve uniqueness (e.g., `origin` + `time_hour` in `weather`).

---

# Primary Key Case Study: `planes$tailnum`

Every aircraft registered with civil aviation authorities has a unique FAA registration code called a **tail number** (e.g., `N10156`, `N539AA`):

```r
library(tidyverse)
library(nycflights13)

print(planes)
```

```
# A tibble: 3,322 × 9
  tailnum  year type                    manufacturer     model      engines seats speed engine   
  <chr>   <int> <chr>                   <chr>            <chr>        <int> <int> <int> <chr>    
1 N10156   2004 Fixed wing multi engine EMBRAER          EMB-145XR        2    55    NA Turbo-fan
2 N102UW   1998 Fixed wing multi engine AIRBUS INDUSTRIE A320-214         2   182    NA Turbo-fan
3 N103US   1999 Fixed wing multi engine AIRBUS INDUSTRIE A320-214         2   182    NA Turbo-fan
# ℹ 3,319 more rows
```

Because no two physical planes share the same registration, `tailnum` serves as the primary key of `planes`.

---

# Two Methods to Verify a Primary Key

How can you mathematically verify that a column is a primary key?

### Method 1: Compare Total Rows to Distinct Keys
```r
library(tidyverse)
library(nycflights13)

planes |> 
  summarize(total_rows = n(), unique_keys = n_distinct(tailnum))
```

```
# A tibble: 1 × 2
  total_rows unique_keys
       <int>       <int>
1       3322        3322
```
If `total_rows == unique_keys`, there are zero duplicate rows.

### Method 2: Count Key Frequencies and Filter for Duplicates ($n > 1$)
```r
planes |> 
  count(tailnum) |> 
  filter(n > 1)
```

```
# A tibble: 0 × 2
# ℹ 2 variables: tailnum <chr>, n <int>
```
An empty tibble confirms that every key appears at most once!

---

# Primary Key vs. Foreign Key: `tailnum` in `flights`

Let's test if `tailnum` is a primary key in `flights`:

```r
library(tidyverse)
library(nycflights13)

flights |> 
  count(tailnum) |> 
  filter(n > 1) |> 
  print()
```

```
# A tibble: 4,037 × 2
  tailnum     n
  <chr>   <int>
1 N055AA      1
2 N10156    153
3 N102UW     48
4 N103US     46
5 N10575    289
# ℹ 4,032 more rows
```

* `N10156` flew 153 flights in 2013!
* Therefore, `tailnum` is **not** a primary key in `flights`; it is a **foreign key** referencing `planes`.

---

# Hunting for the Primary Key in `flights`

What combination of variables uniquely identifies a row in `flights`?

### Attempt 1: Date + Scheduled Departure Time + Plane
```r
flights |> 
  count(year, month, day, dep_time, tailnum) |> 
  filter(n > 1)
```

### Attempt 2: Date + Tail Number
```r
flights |> 
  summarize(n = n(), nd = n_distinct(year, month, day, dep_time, tailnum))
# n = 336776, nd = 251727 (Duplicates exist!)
```

### Attempt 3: Tail Number + Exact Hour and Minute
```r
flights |> 
  summarize(n = n(), nd = n_distinct(tailnum, year, month, day, hour, minute))
# n = 336776, nd = 336367 (Still duplicates!)
```

---

# Inspecting Duplicate Anomalies in `flights`

Why does `(tailnum, year, month, day, hour, minute)` fail to be unique?

```r
library(tidyverse)
library(nycflights13)

count(flights, tailnum, year, month, day, hour, minute) |> 
  filter(n > 1) |> 
  print()
```

```


* Aircraft `N11119` has two departure records recorded at the exact same minute!
* A physical plane cannot depart twice at once. This is absurd. These are real-world **data entry errors**.
* Ideally you should remove these duplicates which do not make sense and then start your analysis.
* But in other situations, if a table lacks an organic primary key, you can create a synthetic **surrogate key** using `mutate(flight_id = row_number())`.

---

# Exercise: Testing a Compound Key in `mpg`

### Problem:
Do the columns `manufacturer`, `model`, `year`, `displ`, and `trans` together form a valid composite primary key in the `mpg` dataset?

```r
library(tidyverse)

mpg |> 
  count(manufacturer, model, year, displ, trans) |> 
  filter(n > 1)
```


### Conclusion:
**No!** Multiple vehicles share identical engine, year, model, and transmission specs.

---

# Foreign Keys & Relations

> **Definition**: A **Foreign Key** is a column (or set of columns) that references a primary key in another table.

```
       Table A: 'flights'                      Table B: 'planes'
    +-----------------------+              +-----------------------+
    | flight    |  tailnum  |              |  tailnum  |   model   |
    +-----------+-----------+              +-----------+-----------+
    |     1001  |  N10156   | -----------> |  N10156   | EMB-145XR |
    |     1002  |  N10156   |              |  N102UW   | A320-214  |
    +-----------------------+              +-----------------------+
           Foreign Key                            Primary Key
```

### The Three Relationship Cardinalities:
1. **One-to-Many ($1:M$)** *(Most Common)*: One plane operates many flights; one airport hosts many departures.
2. **Many-to-Many ($M:N$)**: One airline flies to many airports; one airport hosts many airlines.
3. **One-to-One ($1:1$)**: Rare in separate tables; usually combined into a single table.

---

# The Sample Setup: Tables `x` and `y`

To understand how joins work under the hood, let's create two sample tables:

```r
library(tidyverse)

x <- tribble(
  ~key, ~val_x,
     1, "x1",
     2, "x2",
     3, "x3"
)

y <- tribble(
  ~key, ~val_y,
     1, "y1",
     2, "y2",
     4, "y3"
)
```

```
      Table x                Table y
   +-----+-------+        +-----+-------+
   | key | val_x |        | key | val_y |
   +-----+-------+        +-----+-------+
   |  1  |  x1   |        |  1  |  y1   |
   |  2  |  x2   |        |  2  |  y2   |
   |  3  |  x3   |        |  4  |  y3   |
   +-----+-------+        +-----+-------+
```

Notice: `key = 3` exists only in `x`, while `key = 4` exists only in `y`.

---

# Inner Joins: `inner_join()`

An **inner join** matches pairs of observations whenever their keys are equal. Unmatched rows in either table are discarded.

```
           Table x               Table y
        +-----+-------+       +-----+-------+
        | key | val_x |       | key | val_y |
        +-----+-------+       +-----+-------+
        |  1  |  x1   | <---> |  1  |  y1   |
        |  2  |  x2   | <---> |  2  |  y2   |
        |  3  |  x3   |       |  4  |  y3   |
        +-----+-------+       +-----+-------+
                       |
                       v inner_join(x, y, join_by(key))
                 +-----+-------+-------+
                 | key | val_x | val_y |
                 +-----+-------+-------+
                 |  1  |  x1   |  y1   |
                 |  2  |  x2   |  y2   |
                 +-----+-------+-------+
```

```r
x |> inner_join(y, join_by(key))
```

> **Warning**: Rows with `key = 3` and `key = 4` disappear entirely. Inner joins should be used with caution because they can silently drop observations!

---

# Modern Syntax: `join_by()` vs. Legacy `by = c(...)`

In modern `dplyr` (version 1.1.0+), joins use the `join_by()` helper function:

| Legacy Syntax (`by`) | Modern Syntax (`join_by`) | Explanation |
| :--- | :--- | :--- |
| `by = "key"` | `join_by(key)` | Keys share identical column name |
| `by = c("key" = "key")` | `join_by(key == key)` | Explicit equality specification |
| `by = c("dest" = "faa")` | `join_by(dest == faa)` | Keys have different column names |
| `by = c("k1" = "k1", "k2" = "k2")` | `join_by(k1, k2)` | Compound multi-column keys |

```r
x |> inner_join(y, by = "key")
x |> inner_join(y, by = c("key" = "key"))

# Equivalent modern invocations:
x |> inner_join(y, join_by(key))
x |> inner_join(y, join_by(key == key))
```

`join_by()` is more readable, prevents subtle string quoting errors, and supports inequality joins (`join_by(date >= start_date)`).

---

# Outer Joins: Preserving Unmatched Rows

An **outer join** keeps observations that appear in at least one table, inserting `NA`s for missing matches.

```
                    +--------------------------------+
                    |          OUTER JOINS           |
                    +--------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
            v                       v                       v
      LEFT JOIN                RIGHT JOIN               FULL JOIN
  Keeps ALL rows in x      Keeps ALL rows in y     Keeps ALL rows in BOTH


```

### The Three Outer Join Flavors:
1. **`left_join(x, y)`**: Keeps every record in `x`.
2. **`right_join(x, y)`**: Keeps every record in `y`.
3. **`full_join(x, y)`**: Keeps every record in `x` AND `y`.

---

# Left Joins: `left_join()`

A **left join** preserves all observations in the left table (`x`), regardless of whether a match exists in `y`:

```
           Table x               Table y
        +-----+-------+       +-----+-------+
        | key | val_x |       | key | val_y |
        +-----+-------+       +-----+-------+
        |  1  |  x1   | <---> |  1  |  y1   |
        |  2  |  x2   | <---> |  2  |  y2   |
        |  3  |  x3   |       |  4  |  y3   |
        +-----+-------+       +-----+-------+
                       |
                       v left_join(x, y, join_by(key))
                 +-----+-------+-------+
                 | key | val_x | val_y |
                 +-----+-------+-------+
                 |  1  |  x1   |  y1   |
                 |  2  |  x2   |  y2   |
                 |  3  |  x3   |  NA   |  <-- Missing in y filled with NA
                 +-----+-------+-------+
```

```r
x |> left_join(y, join_by(key))
```

> **The Data Analyst's Default**: `left_join()` is the primary join used in data analysis because you never lose rows from your primary study dataset.

---

# Right Joins & Full Outer Joins

### Right Join: `right_join()`
Preserves all observations in the right table (`y`):

```r
x |> right_join(y, join_by(key))
```

```
# A tibble: 3 × 3
    key val_x val_y
  <dbl> <chr> <chr>
1     1 x1    y1   
2     2 x2    y2   
3     4 NA    y3   
```

### Full Outer Join: `full_join()`
Keeps all observations from both tables:

```r
x |> full_join(y, join_by(key))
```

```
# A tibble: 4 × 3
    key val_x val_y
  <dbl> <chr> <chr>
1     1 x1    y1   
2     2 x2    y2   
3     3 x3    NA   
4     4 NA    y3   
```

---

# Exercise: Flight Counts by Airline Full Name

### Problem:
The `flights` table contains a 2-letter `carrier` code. The `airlines` table maps codes to full corporate names. How many flights are there per carrier name in the dataset?

### Solution:
```r
library(tidyverse)
library(nycflights13)

flights |>
  count(carrier) |>
  left_join(airlines, join_by(carrier)) |>
  select(name, n) |>
  arrange(desc(n))
```



---

# Exercise: Counting JetBlue Flights from LGA

### Problem:
How many flights departing from LaGuardia Airport (`LGA`) were operated by **JetBlue Airways**?

### Solution:
```r
library(tidyverse)
library(nycflights13)

flights |> 
  filter(origin == "LGA") |>
  left_join(airlines, join_by(carrier)) |>
  filter(name == "JetBlue Airways") |>
  nrow()
```


### Pipeline Walkthrough:
1. `filter(origin == "LGA")`: Filters for LaGuardia departures.
2. `left_join(airlines, join_by(carrier))`: Appends the full `name` column to each record.
3. `filter(name == "JetBlue Airways")`: Selects only JetBlue flights.
4. `nrow()`: Counts the remaining rows.

---

# Duplicate Keys in One Table: One-to-Many ($1:M$)

When one table has unique keys (primary key) and the other table has duplicate keys (foreign key), R automatically duplicates the matched row:

```
        Table x (Flights - Many)            Table y (Planes - One)
        +---------+---------+               +---------+---------+
        | flight  | tailnum |               | tailnum | seats   |
        +---------+---------+               +---------+---------+
        |   101   | N10156  | ------------> | N10156  |   55    |
        |   102   | N10156  | ------------> | N102UW  |  182    |
        |   103   | N102UW  |               +---------+---------+
        +---------+---------+
```

```
# Result after left_join(flights, planes, join_by(tailnum)):
# Flight 101 -> N10156 -> 55 seats
# Flight 102 -> N10156 -> 55 seats
# Flight 103 -> N102UW  -> 182 seats
```



---

# Exercise: Most Common Airplane Model per Carrier

### Problem:
What is the most common aircraft model used by each airline carrier?

```r
library(tidyverse)
library(nycflights13)

flights |>
  inner_join(planes, join_by(tailnum)) |>
  group_by(carrier, model) |>
  filter(!is.na(model)) |>
  summarise(flight_count = n()) |>
  slice_max(flight_count, n = 1)
```

```
# A tibble: 17 × 3
# Groups:   carrier [14]
   carrier model             flight_count
   <chr>   <chr>                    <int>
 1 9E      CRJ-200ER                 3702
 2 AA      757-223                   3569
 3 AS      737-990ER                  714
 4 B6      A320-232                 30379
 5 DL      MD-88                     8164
 6 EV      EMB-145XR                11883
 7 UA      A320-232                  6566
# ℹ 10 more rows
```

`inner_join()` excludes flights where aircraft details are missing, allowing clean aggregation.

---

# Danger Zone: Duplicate Keys in Both Tables ($M:N$)

What happens when **both** tables contain duplicate keys?

```
           Table x               Table y
        +-----+-------+       +-----+-------+
        | key | val_x |       | key | val_y |
        +-----+-------+       +-----+-------+
        |  1  |  x1   |       |  1  |  y1   |
        |  1  |  x2   |       |  1  |  y2   |
        +-----+-------+       +-----+-------+
                       |
                       v left_join(x, y, join_by(key))
                 +-----+-------+-------+
                 | key | val_x | val_y |
                 +-----+-------+-------+
                 |  1  |  x1   |  y1   |
                 |  1  |  x1   |  y2   |
                 |  1  |  x2   |  y1   |
                 |  1  |  x2   |  y2   |
                 +-----+-------+-------+
```

Joining duplicate keys produces the **Cartesian Product** ($2 \times 2 = 4$ rows).

> **Warning**: If table $x$ has 10,000 duplicate keys and table $y$ has 10,000 duplicate keys, joining them produces **$100,000,000$ rows**, instantly consuming gigabytes of memory and crashing R!

---

# Natural Joins vs. Explicit Mappings

If you omit the `join_by()` argument, `dplyr` executes a **natural join**, matching on all columns with identical names across both tables:

```r
library(tidyverse)
library(nycflights13)

# Natural join between flights and planes:
left_join(flights, planes)
```

```
Joining with `by = join_by(year, tailnum)`
```

### The Silent Bug in Natural Joins:
* `flights$year` represents the **year the flight flew** (`2013`).
* `planes$year` represents the **year the plane was manufactured** (e.g. `1998`).
* Matching on `year` forces R to look for flights that flew in the exact same year the plane was built!
* **Rule**: Always explicitly specify key columns using `join_by(tailnum)`.

---

# Joining Columns with Different Names

When key columns have different names across datasets, define the mapping explicitly inside `join_by()`:

```r
library(tidyverse)
library(nycflights13)

# Mismatched key names: flights$dest corresponds to airports$faa
flights |> 
  left_join(airports, join_by(dest == faa))
```



* `left_join(flights, airports)` without `join_by` errors immediately because they share zero column names.
* Specifying `dest == faa` merges airport geographical metadata directly into each destination record.

---

# Exercise: Flights Bound for the Hawaii Timezone

### Problem:
How many flights departing NYC in 2013 were bound for airports located in the Hawaii timezone (`Pacific/Honolulu`)?

### Solution:
```r
library(tidyverse)
library(nycflights13)

flights |> 
  left_join(airports, join_by(dest == faa)) |>
  filter(tzone == "Pacific/Honolulu") |> 
  nrow()
```

```
[1] 709
```

### Explanation:
* Flights to Honolulu (`HNL`) and Kahului (`OGG`) are matched against `airports$faa`.
* Filtering on `tzone == "Pacific/Honolulu"` reveals exactly 707 scheduled flights.

---

# Exercise: Busiest Travel Day by Scheduled Seat Capacity

### Problem:
Assuming every flight was 100% full, what were the top 3 busiest travel days in 2013 in terms of total passenger seats scheduled to depart?

### Solution:
```r
library(tidyverse)
library(nycflights13)

flights |>
  left_join(planes, join_by(tailnum)) |>
  group_by(month, day) |>
  summarise(total_seats = sum(seats, na.rm = TRUE), .groups = "drop") |>
  arrange(desc(total_seats)) |>
  head(3)
```



November 27th (the Wednesday before Thanksgiving) and December 2nd (Thanksgiving Sunday return) represent peak passenger volume.

---

# Introduction to Filtering Joins

Mutating joins add new columns from $y$ to $x$. In contrast, **filtering joins** affect the **rows**, never modifying the columns of table $x$:

```
                      +--------------------------------+
                      |        FILTERING JOINS         |
                      +--------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
             SEMI JOIN                                ANTI JOIN
       semi_join(x, y)                          anti_join(x, y)
    Keeps rows in x that                     Drops rows in x that
    HAVE a match in y                        HAVE a match in y
```



---

# Semi Joins: `semi_join()`

`semi_join(x, y)` keeps all observations in $x$ that have a match in $y$:

```
           Table x               Table y
        +-----+-------+       +-----+-------+
        | key | val_x |       | key | val_y |
        +-----+-------+       +-----+-------+
        |  1  |  x1   | <---> |  1  |  y1   |
        |  2  |  x2   | <---> |  2  |  y2   |
        |  3  |  x3   |       |  4  |  y3   |
        +-----+-------+       +-----+-------+
                       |
                       v semi_join(x, y, join_by(key))
                 +-----+-------+
                 | key | val_x |
                 +-----+-------+
                 |  1  |  x1   |  <-- Matches key 1
                 |  2  |  x2   |  <-- Matches key 2
                 +-----+-------+
```

```r
x |> semi_join(y, join_by(key))
```

Notice that `val_y` is **not** added to the table. `semi_join` acts as a pure row filter.

---

# Filtering with `%in%` vs. `semi_join()`

You can achieve similar filtering using `%in%`, but `semi_join()` is cleaner for multi-variable criteria:

### Filtering with `%in%`:
```r
library(tidyverse)
library(nycflights13)

# 1. Find top 6 destinations
dest_top6 <- count(flights, dest) |> slice_max(n, n = 6)

# 2. Filter using %in%
filter(flights, dest %in% dest_top6$dest) |> nrow()
```

### Equivalent Filtering with `semi_join()`:
```r
flights |> 
  semi_join(dest_top6, join_by(dest)) |> 
  nrow()
```

`semi_join()` seamlessly handles compound keys across multiple columns (`join_by(year, month, day)`), which `%in%` cannot do without concatenating strings.

---

# Plotting Top Destinations Using `semi_join()`

`semi_join()` allows you to compute top categories in one pipeline and immediately plot their raw observations:

```r
library(tidyverse)
library(nycflights13)

# Plot frequency distribution for the top 6 flight destinations
flights |> 
  count(dest) |> 
  slice_max(n, n = 6) |> 
  semi_join(x = flights) |> 
  ggplot(aes(x = dest, fill = dest)) + 
  geom_bar() +
  labs(
    title = "Top 6 Flight Destinations from NYC (2013)",
    x = "Destination Code",
    y = "Total Number of Flights"
  ) +
  theme_minimal()
```

* `count()` and `slice_max()` find the top 6 destination codes.
* `semi_join(x = flights)` filters the original 336,776-row flights table down to only those 6 destinations.
* `geom_bar()` counts and plots the distribution.

---

# Anti Joins: `anti_join()`

`anti_join(x, y)` drops all observations in $x$ that find a match in $y$. It keeps only **unmatched** rows:

```
           Table x               Table y
        +-----+-------+       +-----+-------+
        | key | val_x |       | key | val_y |
        +-----+-------+       +-----+-------+
        |  1  |  x1   | <---> |  1  |  y1   |
        |  2  |  x2   | <---> |  2  |  y2   |
        |  3  |  x3   |       |  4  |  y3   |
        +-----+-------+       +-----+-------+
                       |
                       v anti_join(x, y, join_by(key))
                 +-----+-------+
                 | key | val_x |
                 +-----+-------+
                 |  3  |  x3   |  <-- Key 3 does NOT exist in y!
                 +-----+-------+
```

```r
x |> anti_join(y, join_by(key))
```

> **Use as a Diagnostic Tool**: Use `anti_join()` to find missing keys, orphaned records, or data discrepancies between systems.

---

# Diagnosing Missing Aircraft Records with `anti_join()`

Are there flights in `nycflights13` that operated without a registered record in `planes`?

```r
library(tidyverse)
library(nycflights13)

# Identify tail numbers in flights that are missing from planes
unmatched_planes <- flights |>
  anti_join(planes, join_by(tailnum)) |>
  filter(!is.na(tailnum)) |>
  distinct(tailnum)

print(unmatched_planes)
```

```
# A tibble: 721 × 1
  tailnum
  <chr>  
1 N3ALAA 
2 N3DUAA 
3 N539AA 
4 N542AA 
5 N548AA 
# ℹ 716 more rows
```

There are **721 tail numbers** in `flights` that have no metadata in `planes`!

---

# Investigating Missing Plane Anomalies

Why are 721 aircraft tail numbers missing from the FAA dataset?

```r
# Look at which airlines fly these unmatched planes:
flights |>
  anti_join(planes, join_by(tailnum)) |>
  filter(!is.na(tailnum)) |>
  count(carrier, sort = TRUE)
```

```
# A tibble: 10 × 2
  carrier     n
  <chr>   <int>
1 AA      22558
2 MQ      25397
3 UA       1664
4 9E       1044
5 B6        830
```

### Explaining the Mismatch:
1. **American Airlines (AA) & Envoy (MQ)** account for the vast majority of missing aircraft.
2. In 2013, AA operated older MD-80 fleets and regional jets registered under corporate leasing structures not tracked in the public FAA extract.
3. Tail number `N539AA` was a corporate/private executive jet not listed in standard commercial registries.

---

# Summary Comparison: All Six Join Types

| Join Function | Type | Resulting Rows | Resulting Columns | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`inner_join()`** | Mutating | Only rows with matching keys in BOTH | $Cols(x) + Cols(y)$ | Merging when only complete records matter |
| **`left_join()`** | Mutating | ALL rows in $x$, matched with $y$ | $Cols(x) + Cols(y)$ | Standard lookup / feature enrichment |
| **`right_join()`** | Mutating | ALL rows in $y$, matched with $x$ | $Cols(x) + Cols(y)$ | Preserving right reference table |
| **`full_join()`** | Mutating | ALL rows from BOTH $x$ and $y$ | $Cols(x) + Cols(y)$ | Complete outer union / cross-system reconciliations |
| **`semi_join()`** | Filtering | Rows in $x$ that HAVE a match in $y$ | $Cols(x)$ only | Filtering by a reference table without duplicating rows |
| **`anti_join()`** | Filtering | Rows in $x$ that LACK a match in $y$ | $Cols(x)$ only | Finding missing data, broken links, or orphans |

---

# Module Summary & Best Practices

1. **Keys are the Foundation**:
   * Always verify primary keys with `count(key) |> filter(n > 1)` before joining.
   * Understand whether a key is simple (`tailnum`) or compound (`origin`, `year`, `month`, `day`, `hour`).

2. **Always Use `join_by()`**:
   * Avoid natural joins (`left_join(x, y)`) because unintended column name overlaps (like `year`) introduce silent bugs.
   * Explicitly specify mappings: `join_by(tailnum)` or `join_by(dest == faa)`.

3. **Beware of Many-to-Many Duplication**:
   * If both tables contain duplicate keys, the join produces a Cartesian explosion that can crash R.

4. **Choose the Right Tool**:
   * **`left_join()`**: For adding descriptive columns to your main dataset.
   * **`semi_join()`**: For filtering rows based on complex multi-table subsets.
   * **`anti_join()`**: For QA testing, anomaly detection, and data reconciliation.
