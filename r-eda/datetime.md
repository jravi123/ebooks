# Date & Time Handling

## Why Learn Date and Time Handling in Data Analytics?

In business intelligence and scientific research, time is one of the most critical analytical dimensions. Imagine you are studying customer subscription churn, financial transactions, or aviation logs:
* **Signup Date**: `"2026-01-15"`
* **Cancellation Date**: `"2026-03-05"`

If you leave these values as raw text strings, you cannot subtract them! Trying to calculate `"2026-03-05" - "2026-01-15"` throws a syntax error. To calculate customer subscription lifetimes, analyze hourly server loads, or detect seasonal trends, you must parse unstructured text into official, mathematically operational date and time objects.

---

## Part 1: Real-World Time Complexities & Date Classes

Time seems simple, but its human representation is incredibly complex:
1. **Does every year have 365 days?** *No. Leap years contain 366 days.*
2. **Does every day have 24 hours?** *No. Daylight Saving Time (DST) transitions create days with 23 or 25 hours.*
3. **Does every minute have 60 seconds?** *No. System clocks occasionally insert leap seconds to adjust for Earth's rotation.*

### The Three Date/Time Classes in R
To handle these complexities, R provides three dedicated classes, which display as follows in tibble headers:
* **`<date>`**: A calendar date (e.g. `2026-01-15`).
* **`<time>`**: A specific time within an unspecified day (e.g., `14:30:00`).
* **`<dttm>`**: A date plus a specific time (e.g., `2026-01-15 14:30:00 UTC`), uniquely identifying an instant in time.

To work with these classes, R developers rely on the **`lubridate`** package:

```r
library(tidyverse)
library(lubridate)

# Retrieve current system date and time
today() # Returns <date>: "2026-07-17"
now()   # Returns <dttm>: "2026-07-17 14:30:12 EDT"
```

---

## Part 2: Parsing Unstructured Text to Dates

Unstructured datasets record dates in hundreds of different formats. `lubridate` provides highly flexible parsing functions.

### A. Format-Order Parsers
Use the functions `ymd()`, `mdy()`, and `dmy()` to parse dates based on the order of their year (`y`), month (`m`), and day (`d`) components:

```r
# Year-Month-Day
ymd("2026-01-15")

# Month-Day-Year
mdy("01/15/2026")

# Day-Month-Year (highly flexible with separators)
dmy("15.01.2026")
dmy("15-Jan-2026")
dmy("15 1 2026")
```

To parse datetimes containing hours, minutes, and seconds, append `_hms` or `_hm`:

```r
# Date with hour-minute-second
ymd_hms("2026-01-15 20:11:59")

# Date with hour-minute (assumes 24-hour clock unless AM/PM is specified)
mdy_hm("01/15/2026 08:01 PM")
```

---

### B. Setting Timezones
By default, parsed datetimes display in UTC (Coordinated Universal Time). You can specify local timezones using nearest-city identifiers:

```r
# Parse datetime with Detroit local time
detroit_time <- mdy_hms("01/15/2026 12:01:37", tz = "America/Detroit")
print(detroit_time)

# Convert Detroit time to London time
london_time <- with_tz(detroit_time, "Europe/London")
print(london_time)
```

---

### C. Coercion Limits and Flexible Parsing
While `as_datetime()` works on standard ISO strings like `"2026-01-15 20:11:59"`, it fails on regional formats like `"15-01-2026 20:11:59"`.

For irregular string formats, use the highly robust **`parse_date_time(x, orders)`** function:

```r
# Parse irregular text using explicit formatting orders
parse_date_time("22/10/1, 10:01:00", orders = "ymd HMS")
parse_date_time("2026 Jan 15, 12:00:00", orders = "Y b d, H:M:S")
```

*Formatting Codes:*
* **`Y`**: 4-digit year, **`y`**: 2-digit year.
* **`m`**: Numeric month, **`b`**: Abbreviated month name, **`B`**: Full month name.
* **`d`**: Day number.
* **`HMS`**: Hour-Minute-Second.

---

### D. Numerical Component Construction
If your dataset separates year, month, and day into individual numeric columns, combine them using `make_date()` or `make_datetime()`:

```r
# Combine numeric variables into a single date
make_date(2026, 1, 15)

# Combine numeric variables into a single datetime
make_datetime(2026, 1, 15, 14, 30, 0, tz = "EST")
```

---

### E. Converting from the UNIX Epoch
Unix systems store dates as the number of elapsed seconds since January 1, 1970 (known as the **UNIX Epoch**). You can convert raw epoch integers to datetimes using `as_datetime()`:

```r
# Get current time as an epoch integer
epoch_seconds <- as.integer(now())
print(epoch_seconds)

# Convert seconds back to datetime
as_datetime(3600 * 24) # 24 hours after the epoch
# Output: "1970-01-02 UTC"
```

---

## Part 3: Extracting Components & Time Mathematics

Once parsed, you can easily pull out sub-components of dates:

```r
right_now <- now()

year(right_now)   # Extract year (e.g. 2026)
month(right_now)  # Extract month number
day(right_now)    # Extract day number (alias: mday())
yday(right_now)   # Extract day of the year (Julian date: 1-366)
wday(right_now)   # Extract day of the week (1 = Sunday, 7 = Saturday)
hour(right_now)   # Extract hour
minute(right_now) # Extract minute
second(right_now) # Extract second
```

---

### Time Math & Spans
Subtracting two date objects returns a **`difftime`** object representing the raw elapsed time difference:

```r
# Simple date subtraction
ymd("2026-01-04") - mdy("12/16/2025")
# Output: Time difference of 19 days
```

To add exact periods or offsets, use `lubridate`'s offset functions:

```r
right_now <- now()

# Add exactly 10 minutes
right_now + minutes(10)

# Add exactly 7 weeks
right_now + weeks(7)
```

---

### Durations vs. Periods
`lubridate` provides two distinct classes for handling time spans:

1. **Durations (`dyears`, `ddays`, etc.)**: Represent exact elapsed seconds (where 1 day is always exactly $86,400$ seconds).
2. **Periods (`years`, `days`, etc.)**: Represent human calendar time, adjusting for leap years and Daylight Saving Time shifts.

#### The DST Pitfall
What happens if you add exactly one day to March 8, 2025, at 1:00 PM in Detroit (the day DST springs forward)?

```r
# 1. Adding a physical duration of 86400 seconds
march8 <- mdy_hm("March. 8, 2025 13:00 PM", tz = "America/Detroit")
march8 + ddays(1)
# Output: "2025-03-09 14:00:00 EDT" (Clock shows 2:00 PM because an hour was skipped!)

# 2. Adding a human period of 1 calendar day
march8 + days(1)
# Output: "2025-03-09 13:00:00 EDT" (Correctly adjusts clock to 1:00 PM!)
```

#### Duration Conversions
You can convert raw elapsed differences to exact durations and extract custom units:

```r
semester_end <- dmy_hms("08122025 23:59:59") - now()

# Convert to exact duration
duration_seconds <- as.duration(semester_end)

# Extract specific units
as.integer(duration_seconds, "days")
as.numeric(duration_seconds, "minutes")
```

---

## Part 4: Real-World Aviation Analysis

Let's apply our date-wrangling skills to analyze a real-world dataset. The **`flights`** table in the `nycflights13` package records actual departure and scheduled departure times, but they are stored in an unusual numeric format:

```r
library(nycflights13)

flights |> select(dep_time, sched_dep_time, year, month, day) |> head(3)
# # A tibble: 3 x 5
#   dep_time sched_dep_time  year month   day
#      <int>          <int> <int> <int> <int>
# 1      517            515  2013     1     1
# 2      533            529  2013     1     1
# 3      542            540  2013     1     1
```

Here, `517` represents `5:17 AM` and `1345` represents `1:45 PM`.

### A. Reconstructing Datetimes Programmatically
We can split the numeric time codes using integer division (`%/% 100` to extract hours) and modulo arithmetic (`%% 100` to extract minutes) and combine them using `make_datetime()`:

```r
# Reconstruct flight datetimes
flights_dt <- flights |>
  mutate(across(
    c(dep_time, sched_dep_time, arr_time, sched_arr_time),
    ~ make_datetime(year, month, day, . %/% 100, . %% 100)
  ))
```

---

### B. Filtering and Density Plotting
Now we can filter flights naturally using standard date-times and plot flight densities over a specific date range:

```r
# Filter and plot flight density
flights_dt |>
  filter(dep_time < ymd(20130130), dep_time >= ymd(20130120)) |>
  ggplot(aes(x = dep_time)) +
  geom_density(bw = 3 * 3600) + # Bandwidth of exactly 3 hours (3 * 3600 seconds)
  labs(title = "Flight Departure Densities", x = "Departure Time", y = "Density")
```

---

### C. Uncovering Flight Delay Patterns
By extracting the minute component of flight departures, we can examine if scheduled departure minutes influence average flight delays:

```r
# Analyze average delay by minute of the hour
flights_dt |>
  mutate(minute = minute(dep_time)) |>
  group_by(minute) |>
  summarize(avg_delay = mean(dep_delay, na.rm = TRUE)) |>
  ggplot(aes(x = minute, y = avg_delay)) +
  geom_line() +
  labs(title = "Average Delay by Actual Departure Minute", x = "Minute of Hour", y = "Average Delay")
```

This reveals a striking pattern: flights that depart near the end of the hour experience substantially higher average delays!

---

## Hands-on Exercises

### Exercise 1: Subscription Lifespan Analysis
**How can we calculate the exact active duration of subscriber accounts in both days and weeks from raw date-of-birth and cancellation strings?**

*Analytical Guidance*:
Calculate and format elapsed customer lifespans. Your analysis should:
1. Parse a customer signup string `"03-Mar-2026"` and cancellation string `"28-Apr-2026"` into `Date` objects. (Hint: `"03-Mar-2026"` uses `%b` for abbreviated month name, i.e., format = `"%d-%b-%Y"`).
2. Calculate the difference in **days** using simple subtraction.
3. Calculate the difference in **weeks** using **`difftime()`**.
4. Print both calculations on the console.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(lubridate)

# Parse raw dates
signup <- as.Date("03-Mar-2026", format = "%d-%b-%Y")
cancel <- as.Date("28-Apr-2026", format = "%d-%b-%Y")

# Calculate differences
days_active  <- cancel - signup
weeks_active <- difftime(cancel, signup, units = "weeks")

# Print outcomes
print(days_active)  # Time difference of 56 days
print(weeks_active) # Time difference of 8 weeks
```
</details>

---

### Exercise 2: Vectorized Project Deadline Calculations
**How can we parse a list of historical project milestones, calculate target anniversary reminders set exactly one month in advance, and adjust past reminders to the next year?**

*Analytical Guidance*:
Generate programmatic alerts. Your analysis should:
1. Isolate a vector of historical project milestones:
   `ds <- c("1981-09-25", "1982-03-06", "2010-12-14", "2012-10-18", "2019-04-03")`.
2. Parse this vector into valid dates using **`ymd()`**.
3. Calculate reminder dates set exactly one month prior using the period subtractor **`months(1)`**.
4. Align the year of the reminders to the current calendar year. Use `year() <-` and `if_else()` to shift any past reminders forward by one year to ensure they are set for the upcoming year.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(lubridate)

# Raw milestone dates
ds <- c("1981-09-25", "1982-03-06", "2010-12-14", "2012-10-18", "2019-04-03")

# Parse dates
ds_parsed <- ymd(ds)

# Calculate reminders 1 month in advance
ds_reminders <- ds_parsed - months(1)

# Align to current calendar year
year(ds_reminders) <- year(today())

# Shift past reminders to the upcoming year
upcoming_reminders <- if_else(
  ds_reminders < today(),
  ds_reminders + years(1),
  ds_reminders
)

print(upcoming_reminders)
```
</details>
