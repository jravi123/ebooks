# Date & Time Handling
## Temporal Classes, Parsing, Timezones, Durations, and Periods with lubridate

```r block=setup
library(tidyverse)
library(lubridate)
library(nycflights13)

aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv", show_col_types = FALSE)
```

---
# Why Are Dates & Times Complicated?

Most of us have a pretty firm grasp of dates in daily life, but they are more complicated than you might think. Consider these three questions from *R for Data Science*:

* **Does every year have 365 days?**
  * *No — leap years have 366 days (with century rules!).*
* **Does every day have 24 hours?**
  * *No — Daylight Saving Time (DST) transitions create 23-hour and 25-hour days.*
* **Does every minute have 60 seconds?**
  * *No — leap seconds are occasionally inserted to account for slowing of Earth's rotation.*

The answer to all three is **"no."**

---
# Date & Time Classes in R

There are three different date/time classes in R:

1. **A date**, printed in a tibble as **`<date>`**, represents a full day on the calendar.
2. **A time** within a day, printed as **`<time>`**, represents a specific time within an (unspecified) day.
3. **A date-time** is a date plus a time (tibble: **`<dttm>`**). A date-time uniquely identifies an instant in time (up to a given precision, usually 1 second).

There are many different formats, timezones, and leap years to deal with. The **`lubridate`** package (part of the tidyverse) makes working with dates and times much easier:

```r
library(lubridate)
```

---
# Current Dates & Date-Times

Two useful functions retrieve the current date and date-time:

```r
today()
now()
```

We have already seen examples of `<dttm>` columns in the `nycflights13::flights` tibble:

```r
select(flights, time_hour) |> print()
```

---
# Parsing Dates: `mdy()`, `ymd()`, and `dmy()`

Converting strings in different formats into `<date>` objects is easy with `lubridate`'s format-order convenience functions:

```r
# Only date: specify the order of month (m), day (d), and year (y)
mdy("10/01/2022") # Oct. 1, 2022
ymd("2022-10-01")
dmy("01.10.2022")
dmy("31-Jan-2017")
dmy("31 1 2017")
```

Notice how `dmy()`, `mdy()`, and `ymd()` automatically handle slashes, hyphens, dots, spaces, and month abbreviations!

---
# Parsing Date-Times: `_hms` and `_hm`

To parse both date and time, append `_hms` (Hours:Minutes:Seconds) or `_hm` (Hours:Minutes):

```r
# Date and time
ymd_hms("2017-01-31 20:11:59")
mdy_hms("10/01/2022 12:01:37")
mdy_hm("01/31/2017 08:01")
```

* **`UTC`** stands for **Coordinated Universal Time** — the primary time standard by which the world regulates clocks and time (EST is `UTC-5`).
* AM/PM can be included; otherwise, a 24-hour clock is assumed.

---
# Setting & Converting Timezones

We can set a timezone when parsing using the nearest major city (`tz = "America/Detroit"`):

```r
# Notice EDT (Daylight Saving) in October vs. EST (Standard) in December!
mdy_hms("10/01/2022 12:01:37", tz = "America/Detroit")
mdy_hms("12/01/2022 12:01:37", tz = "America/Detroit")
```

To convert an existing date-time to display in another timezone, use `with_tz()`:

```r
detroit_time <- mdy_hms("10/01/2022 12:01:37", tz = "America/Detroit")
with_tz(detroit_time, "Europe/London")
```

---
# Exercise: Parsing Dates and Date-Times

Parse `dt1` into a `<date>` and `dt2` into `<dttm>` objects using `lubridate` functions:

```r
dt1 <- "31/10/89"
dt2 <- c("2022-07-01 3:10am",
         "1852-01-15 7:00pm")

# Parse dt1 and dt2 below:

```

```r block=answer
dt1 <- "31/10/89"
dt2 <- c("2022-07-01 3:10am",
         "1852-01-15 7:00pm")

dmy(dt1)
ymd_hm(dt2)
```

---
# Using `as_datetime()` & Its Limitations

Sometimes you can get away with calling `as_datetime()` on standard ISO-formatted strings:

```r
my_date <- as_datetime("2017-01-02 20:11:59")
print(my_date)
month(my_date, label = TRUE, abbr = FALSE)
```

But not always! When given non-ISO orders, `as_datetime()` fails or produces `NA`:

```r
as_datetime("01-02-2017 20:11:59")
```

---
# Flexible Parsing with `parse_date_time()`

A much better function for irregularly formatted date strings is `parse_date_time()`:

```r
parse_date_time("22/10/1, 10:01:00", orders = "ymd HMS")
```

Common format specification codes in `orders`:
* **Year**: four-digit `"Y"`, two-digit `"y"`
* **Month**: number `"m"`, abbreviation `"b"`, full name `"B"`
* **Day**: number in month `"d"`
* **Time**: Hours:Minutes:Seconds `"HMS"`

---
# More `parse_date_time()` Examples

`parse_date_time()` can parse abbreviated month names and even vectors with mixed formats:

```r
# Parsing a string with 4-digit year and abbreviated month name
parse_date_time("2023 Jan 01, 12:00:00", "Y b d, H:M:S")

# Parsing heterogeneous date formats in a single vector
mixed_dates <- c("2023-01-01", "02/15/2023", "March 30, 2023")
parse_date_time(mixed_dates, orders = c("ymd", "mdy", "B d, Y"))
```

---
# Constructing Dates: `make_date()` & `make_datetime()`

When year, month, day, and time are stored in separate numerical columns, use `make_date()` and `make_datetime()` to construct dates from individual components:

```r
make_datetime(2024, 3, 5, 10, 00, 59, tz = "EST")

make_date(2024, 01, 10)
```

---
# The UNIX Epoch (`1970-01-01`)

UNIX systems represent time as *"the number of seconds that have elapsed since January 1, 1970 (00:00:00 UTC)."* This reference point is known as **the epoch**.

You may occasionally come across date-times stored as large integers:

```r
# Seconds elapsed since 1970-01-01
now() |> as.integer()

# Convert seconds since the epoch back to a date-time
as_datetime(3600 * 24) # 24 hours after the epoch
```

---
# Extracting Date-Time Components

Once you have a `<date>` or `<dttm>` object, use accessor functions to extract individual components:

```r
right_now <- now()

day(right_now)    # day of month (has an alias: mday())
yday(right_now)   # day within year ("Julian date", 1-366)
wday(right_now)   # day within week, starting with Sunday (1-7)
month(right_now)  # month (1-12)
year(right_now)   # year
hour(right_now)   # hour (0-23)
minute(right_now) # minute (0-59)
second(right_now) # second (0-59)
```

---
# Time Math & Offsets

Subtracting two dates returns a **`difftime`** object representing the time difference:

```r
ymd("2023/01/04") - mdy("12/16/2022")
```

The `seconds()`, `minutes()`, `hours()`, `days()`, and `weeks()` functions can be used to add or subtract time offsets:

```r
right_now <- now()
right_now
right_now + minutes(10)
right_now + weeks(7)
```

---
# Time Spans & Converting Units

After doing date-time math, you often want to convert the resulting `difftime` into specific units using `as.duration()`:

```r
# Time difference between Dec 8, 2025 and now
semester_end <- dmy_hms("08122025 23:59:59") - now()
semester_end

# Convert difftime to a lubridate duration object
sed <- as.duration(semester_end)

as.integer(sed, "days")
as.numeric(sed, "minutes")
```

Any number of seconds can also be converted directly to a duration:

```r
as.duration(1234)
```

---
# Constructing Durations (`d*` Functions)

Durations always record time spans in **exact physical seconds**. There are `d*` functions (`dseconds()`, `dminutes()`, `dhours()`, `ddays()`, `dweeks()`, `dyears()`) for constructing durations directly:

```r
dseconds(10)
dweeks(3)
```

---
# Arithmetic with Durations

Arithmetic with durations works just as you would expect:

```r
2 * dyears(1)

dyears(1) + dweeks(12) + dhours(15)
```

---
# The Daylight Saving Time Trap with Durations

You have to be careful when adding **durations** (`ddays()`) to date-times! What is one day after **March 8, 2025, at 1:00 p.m.** in Detroit?

```r
# What happened to this addition?
march8 <- mdy_hm("March. 8, 2025 13:00PM", tz = "America/Detroit")
march8 + ddays(1)

# Whereas starting on March 9 works as expected:
march9 <- mdy_hm("March. 9, 2025 13:00PM", tz = "America/Detroit")
march9 + ddays(1)
```

Why did `march8 + ddays(1)` land at **2:00 p.m. (`14:00:00 EDT`)**?
* Because Daylight Saving Time started on March 9, so March 8 only had **23 hours**, while `ddays(1)` always adds **86,400 physical seconds** (24 hours)!

---
# Solving DST Arithmetic with Periods (`days()`)

To work in **human calendar/clock time** instead of physical seconds, use **Periods** (`days()`, `hours()`, `months()`, `years()`):

```r
march8 <- mdy_hm("March. 8, 2025 13:00PM", tz = "America/Detroit")

# Period addition respects human clock time across DST transitions!
march8 + days(1)
```

| Class | Functions | Definition |
| :--- | :--- | :--- |
| **Durations** | `dseconds()`, `ddays()`, `dyears()` | Exact physical elapsed seconds ($1\text{ day} = 86,400\text{ s}$) |
| **Periods** | `seconds()`, `days()`, `months()`, `years()` | Human clock units (respects leap years & DST) |

---
# Exercise: Date Summaries & Anniversary Reminders

Given the date strings `ds` below:
1. Parse `ds` into dates. What is the **range**, **mean**, and **median** date?
2. Suppose you want reminders for the anniversary of these dates in the **coming year, one month in advance**. Find the reminder dates!

```r
ds <- c("1981-09-25", "1982-03-06", "2010-12-14", "2012-10-18", "2019-04-03")

# Parse ds, find range/mean/median, and compute upcoming reminder dates:

```

```r block=answer
ds <- c("1981-09-25", "1982-03-06", "2010-12-14", "2012-10-18", "2019-04-03")

# Parse as year-month-day format
ds_parsed <- ymd(ds)

# Range, mean, and median
range(ds_parsed)
mean(ds_parsed)
median(ds_parsed)

# Setting reminders 1 month in advance for the coming year
ds_rem <- ds_parsed - months(1)
year(ds_rem) <- year(today())
if_else(ds_rem < today(), ds_rem + years(1), ds_rem)
```

---
# Common Operations on Date Columns (`aatemp`)

Let's revisit common `dplyr` operations on date columns using the Ann Arbor weather dataset (`aatemp`):

```r
aatemp |> select(DATE, TMAX) |> head(3)

# Finding the maximum TMAX per year-month:
aatemp |>
  group_by(year(DATE), month(DATE)) |>
  summarize(m = max(TMAX, na.rm = TRUE), .groups = "drop") |>
  arrange(desc(m)) |>
  head(5)
```

---
# Filtering Date Ranges

We can filter a `<date>` column using ISO date strings (`"YYYY-MM-DD"`) or `ymd()`:

```r
# Limiting to a specific date range (Jan 1 to Mar 31, 2018):
aatemp |>
  filter(DATE >= "2018-01-01", DATE <= "2018-03-31") |>
  nrow() # 31 + 28 + 31 = 90 days
```

---
# Exercise: NYC Airport Temperatures

Using the `weather` table in the `nycflights13` package, compute the average temperature (`temp`) at each airport (`origin`) between **9:00 a.m. and 5:00 p.m.** on **September 1, 2013** (using the `time_hour` column).

```r
# Filter weather on time_hour and compute mean(temp) by origin:

```

```r block=answer
filter(weather, time_hour >= "2013-09-01 09:00:00", time_hour <= "2013-09-01 17:00:00") |>
  group_by(origin) |>
  summarize(mean(temp))
```

---
# Inspecting Flight Times in `nycflights13`

The `nycflights13::flights` table has scheduled and actual departure and arrival times, but look at how `dep_time` and `arr_time` are formatted:

```r
flights |>
  select(dep_time, sched_dep_time, arr_time, sched_arr_time, year, month, day) |>
  head()
```

* `517` means **5:17 AM** (`517 %/% 100` = `5` hours, `517 %% 100` = `17` minutes).

---
# Exercise: Converting Flight Times to `<dttm>`

Use `mutate(across(...))` and `make_datetime()` with integer division (`%/% 100`) and remainder (`%% 100`) to convert `dep_time`, `sched_dep_time`, `arr_time`, and `sched_arr_time` into `<dttm>` columns in `flights_dt`:

```r
# Create flights_dt with dttm columns:

```

```r block=answer
flights_dt <- flights |>
  mutate(across(
    c(dep_time, sched_dep_time, arr_time, sched_arr_time),
    ~ make_datetime(year, month, day, . %/% 100, . %% 100)
  ))

flights_dt |> select(dep_time, sched_dep_time, arr_time, sched_arr_time) |> head(4)
```

---
# Visualizing Departure Times: Density Plot

Now we can query and plot `flights_dt` directly based on actual departure date-times:

```r
flights_dt <- flights |>
  mutate(across(
    c(dep_time, sched_dep_time, arr_time, sched_arr_time),
    ~ make_datetime(year, month, day, . %/% 100, . %% 100)
  ))

flights_dt |>
  filter(dep_time < ymd(20130130), dep_time >= ymd(20130120)) |>
  ggplot(aes(x = dep_time)) +
  geom_density(bw = 3 * 3600) # bw is bandwidth, here 3 hours (in seconds)
```

---
# Visualizing Departure Times: Histogram

Let's also plot a histogram of departures between January 20 and January 30, 2013:

```r
flights_dt <- flights |>
  mutate(across(
    c(dep_time, sched_dep_time, arr_time, sched_arr_time),
    ~ make_datetime(year, month, day, . %/% 100, . %% 100)
  ))

flights_dt |>
  filter(dep_time < ymd(20130130), dep_time >= ymd(20130120)) |>
  ggplot(aes(x = dep_time)) +
  geom_histogram(bins = 30)
```

Why using date-time classes makes analysis cleaner:
* Filtering `dep_time < ymd(20130130)` is much more natural than filtering `year`, `month`, and `day` separately.
* In a numeric context (like histogram binwidths or density bandwidths), **1 unit = 1 second** for `<dttm>` and **1 unit = 1 day** for `<date>`.
* `ggplot2` automatically formats readable date labels on the x-axis.

---
# Average Delay by Actual Departure Minute

By extracting the `minute()` component of actual departure time (`dep_time`), we uncover a surprising "sawtooth" pattern:

```r
flights_dt <- flights |>
  mutate(across(
    c(dep_time, sched_dep_time, arr_time, sched_arr_time),
    ~ make_datetime(year, month, day, . %/% 100, . %% 100)
  ))

flights_dt |>
  mutate(minute = minute(dep_time)) |>
  group_by(minute) |>
  summarise(avg_delay = mean(dep_delay, na.rm = TRUE)) |>
  ggplot(aes(minute, avg_delay)) +
  geom_line() +
  labs(x = "minute(dep_time)", y = "Average Departure Delay (min)")
```

Flights departing at minutes 20–30 and 50–60 appear to have much lower average delays!

---
# Average Delay by Scheduled Departure Minute

What happens when we group by **scheduled** departure minute (`minute(sched_dep_time)`) instead?

```r
flights_dt <- flights |>
  mutate(across(
    c(dep_time, sched_dep_time, arr_time, sched_arr_time),
    ~ make_datetime(year, month, day, . %/% 100, . %% 100)
  ))

sched_dep <- flights_dt |>
  mutate(minute = minute(sched_dep_time)) |>
  group_by(minute) |>
  summarise(
    avg_delay = mean(dep_delay, na.rm = TRUE),
    n = n()
  )

ggplot(sched_dep, aes(minute, avg_delay)) +
  geom_line() +
  labs(x = "minute(sched_dep_time)", y = "Average Departure Delay (min)")
```

When grouped by scheduled departure minute, there is no strong sawtooth pattern — human schedulers simply prefer scheduling flights on nice "round" minutes (0, 15, 30, 45)!

---
# Exercise: Subscription Lifespan Analysis

1. Parse a customer signup string `"03-Mar-2026"` and cancellation string `"28-Apr-2026"` into `<date>` objects using `dmy()`.
2. Calculate the active lifespan in **days** (using `-`) and in **weeks** (using `difftime(..., units = "weeks")`).

```r
signup_str <- "03-Mar-2026"
cancel_str <- "28-Apr-2026"

# Parse and calculate lifespan in days and weeks:

```

```r block=answer
signup <- dmy("03-Mar-2026")
cancel <- dmy("28-Apr-2026")

days_active  <- cancel - signup
weeks_active <- difftime(cancel, signup, units = "weeks")

print(days_active)
print(weeks_active)
```

---
# Lecture Summary & Key Takeaways

In this lecture, we covered the essentials of working with dates and times in R using **`lubridate`**:

* **`today()`, `now()`**: Retrieve the current system `<date>` and `<dttm>`.
* **`ymd()`, `mdy()`, `dmy()`** (and `_hms` / `_hm` variants): Parse strings into dates and date-times; use `parse_date_time()` for custom orders and `make_date()` / `make_datetime()` for numeric columns.
* **`year()`, `month()`, `day()`, `wday()`, `yday()`, `hour()`, `minute()`, `second()`**: Extract components from dates and times.
* **Durations vs. Periods**: Use durations (`ddays()`, `dyears()`) for exact physical seconds and periods (`days()`, `months()`, `years()`) for human calendar arithmetic across DST and leap years.
