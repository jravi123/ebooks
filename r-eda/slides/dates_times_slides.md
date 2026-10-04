# Date & Time Handling
## Temporal Classes, Parsing, Timezones, Durations, and Periods with lubridate

---
# Lecture Agenda & Topics

Date and time data present unique challenges due to varying calendar months, leap years, daylight saving time (DST), and timezone offsets. The **`lubridate`** package simplifies date-time parsing and arithmetic.

Today we will cover:
* **Temporal Classes**: Differentiating between `<date>`, `<time>`, and `<dttm>`.
* **Intuitive Parsing**: Using `ymd()`, `mdy()`, `dmy()`, and `ymd_hms()`.
* **Extracting Components**: Fetching `year()`, `month()`, `day()`, `wday()`, and `hour()`.
* **Timezones**: Understanding UTC, setting local zones with `tz`, and converting with `with_tz()`.
* **Periods vs. Durations**: Clock time (`days()`, `hours()`) vs. exact physical time (`ddays()`, `dhours()`).
* **Intervals**: Defining and measuring spans between two date-times.

---
# The Three Temporal Data Types in R

In R tibbles, temporal data is represented by three primary classes:

1. **`<date>`**: Calendar date (e.g. `2026-01-15`).
2. **`<time>`**: Time within an unspecified day (e.g. `14:30:00`).
3. **`<dttm>`**: Date-Time (a specific, unique instant on the calendar clock, e.g. `2026-01-15 14:30:00 UTC`).

```r
library(tidyverse)
library(lubridate)

# Current calendar date and current date-time instant
today()
now()
```

---
# Parsing Dates from Text: `ymd()`, `mdy()`, `dmy()`

`lubridate` parses character dates by recognizing the relative order of Year, Month, and Day:

```r
library(tidyverse)
library(lubridate)

# Year-Month-Day
ymd("2026-03-15")

# Month-Day-Year
mdy("03/15/2026")

# Day-Month-Year (robust to varied delimiters)
dmy("15-Mar-2026")
dmy("15.03.2026")
```

---
# Parsing Date-Times: `ymd_hms()` & `parse_date_time()`

To parse timestamps including hours, minutes, and seconds:

```r
library(tidyverse)
library(lubridate)

# Parse standard datetime strings
ymd_hms("2026-03-15 18:30:00")
mdy_hm("03/15/2026 6:30pm")

# parse_date_time with multiple candidate formats
heterogeneous_dates <- c("2026-01-01", "02/15/2026", "March 30, 2026")
parse_date_time(heterogeneous_dates, orders = c("ymd", "mdy", "B d, Y"))
```

---
# Extracting Date-Time Components

Extract specific elements from date-time objects:

```r
library(tidyverse)
library(lubridate)

timestamp <- ymd_hms("2026-07-04 21:15:30")

year(timestamp)    # 2026
month(timestamp)   # 7
month(timestamp, label = TRUE, abbr = FALSE) # "July"
mday(timestamp)    # 4 (day of month)
wday(timestamp, label = TRUE)                # Sat (day of week)
hour(timestamp)    # 21
minute(timestamp)  # 15
```

---
# Timezones: `with_tz()` vs. `force_tz()`

* **`with_tz(dt, tzone)`**: Changes the **display timezone** without altering the underlying physical instant in time.
* **`force_tz(dt, tzone)`**: Corrects an improperly tagged instant by changing the timezone label without converting the clock numbers.

```r
library(tidyverse)
library(lubridate)

# Create a departure timestamp in New York time
flight_depart <- ymd_hm("2026-06-01 08:00", tz = "America/New_York")

# View the exact same moment in London time (UTC/BST)
with_tz(flight_depart, tzone = "Europe/London")
```

---
# Periods vs. Durations: The DST Arithmetic Trap

Time arithmetic can refer to human calendar time or exact physical elapsed seconds:

* **Durations (`ddays()`, `dhours()`, `dseconds()`)**: Measure exact physical seconds ($1\text{ day} = 86,400\text{ seconds}$).
* **Periods (`days()`, `hours()`, `months()`)**: Respect human clock adjustments (e.g. Daylight Saving Time).

```r
library(tidyverse)
library(lubridate)

# The night before Spring Forward (DST transition)
spring_eve <- ymd_hms("2026-03-07 12:00:00", tz = "America/Detroit")

# Period addition: lands at 12:00 PM next day (human clock time)
spring_eve + days(1)

# Duration addition: adds exactly 86,400 seconds (lands at 1:00 PM due to lost hour)
spring_eve + ddays(1)
```

> [!TIP] Choosing Duration vs. Period
> * Use **Periods** (`+ days(1)`, `+ months(1)`) for calendar scheduling and appointments.
> * Use **Durations** (`+ ddays(1)`, `+ dseconds(60)`) for physical science, machine timing, and physics measurements.

---
# Measuring Intervals

An **Interval** represents a span between two specific dates:

```r
library(tidyverse)
library(lubridate)

start_date <- ymd("2026-01-15")
end_date   <- ymd("2026-07-20")

span <- interval(start_date, end_date)

# Calculate duration in weeks and days
span / dweeks(1)
span / ddays(1)
```

---
# Module Summary & Key Takeaways

1. **Date Types**: `<date>` for calendar days, `<dttm>` for precise global timestamps.
2. **`ymd()`, `mdy()`, `dmy()`**: Robust parsers that adapt to any common delimiter.
3. **Component Accessors**: `year()`, `month()`, `wday()`, and `hour()` easily extract parts of a timestamp.
4. **Timezone Handling**: Use `with_tz()` to convert timestamps across global regions without altering the underlying moment.
5. **Periods vs. Durations**: Use `days()` for calendar consistency and `ddays()` for exact physical elapsed time.
