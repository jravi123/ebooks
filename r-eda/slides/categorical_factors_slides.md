# Loading Data, Categories & Factors
## Importing Delimited Files (`readr`), Real-World Data Wrangling & Categorical Factors (`forcats`)

---

# Lecture Agenda & Topics

In this two-part lecture, we first master **Loading and Saving Data** from plain-text and real-world files, and then explore **Categorical Data & Factors** using `forcats`.

* **Part 1: Loading & Saving Data (`readr`)**
  * **Data Sharing Formats**: Plain text (`CSV`, `TSV`, `XML`, `HTML`, `JSON`), binary formats, and databases.
  * **Delimited Text Files**: `read_csv()` vs. base R `read.csv()`, headers (`col_names`), skipping metadata (`skip`), comments (`comment`), and missing value tokens (`na`).
  * **Saving Data**: `write_csv()`, `write_delim()`, `write_rds()`, and `save()`.
  * **Column Parsing & Type Specification**: Automatic type guessing, `problems()`, `col_types`, and `parse_number()`.
  * **Real-World Case Study**: Analyzing China's Population & Fertility Trends from raw World Bank CSV files.
* **Part 2: Categorical Data & Factors (`forcats`)**
  * **Strings vs. Factors**: Integer level mapping, custom ordering, and catching typos.
  * **Reordering Factor Levels**: `fct_reorder()`, `fct_reorder2()`, `fct_infreq()`, and `fct_rev()`.
  * **Modifying & Lumping Levels**: `fct_recode()`, `fct_collapse()`, `fct_lump_lowfreq()`, `fct_lump_n()`, and `fct_lump_min()`.
  * **Sociological Case Study**: Analyzing Generational Shifts in the General Social Survey (`gss18` / `gss_cat`).

---

# Part 1: Data Files — How Do We Share Data?

In data science, data is stored and shared across three primary categories of formats:

1. **Plain Text Formats** — Both humans and computers can read and inspect them directly in any text editor!
   * Common types: **CSV** (Comma-Separated Values), **TSV** (Tab-Separated Values), **XML**, **HTML**, and **JSON**.
2. **Binary Formats** — Only computers (and specialized software) can read them directly.
   * Examples: Excel workbooks (`.xlsx`), R data files (`.rds`, `.RData`), Parquet, Feather.
   * Compact and fast, but not human-readable in a plain text editor.
3. **Database Applications** — Use **SQL** or **NoSQL** query languages to perform **CRUD** (*Create, Read, Update, Delete*) operations.
   * Under the hood, database engines store their tables in optimized binary formats.

---

# Other Plain Text Formats: XML, HTML & JSON

Before focusing on tabular delimited files, let's compare how hierarchical plain-text formats represent the exact same two-book dataset:

### 1. XML (eXtensible Markup Language)
```xml
<books>
  <book>
    <title>The Lord of the Rings</title>
    <author>J.R.R. Tolkien</author>
  </book>
  <book>
    <title>Pride and Prejudice</title>
    <author>Jane Austen</author>
  </book>
</books>
```

---

# Other Plain Text Formats: HTML & JSON

### 2. HTML (HyperText Markup Language)
```html
<table>
  <tr><th>Title</th><th>Author</th></tr>
  <tr><td>The Lord of the Rings</td><td>J.R.R. Tolkien</td></tr>
  <tr><td>Pride and Prejudice</td><td>Jane Austen</td></tr>
</table>
```

### 3. JSON (JavaScript Object Notation)
```json
{
  "books": [
    { "title": "The Lord of the Rings", "author": "J.R.R. Tolkien" },
    { "title": "Pride and Prejudice", "author": "Jane Austen" }
  ]
}
```

---

# Plain Text Delimited Formats

When working with rectangular (tabular) datasets, **plain text delimited files** are the most universal format:

* **Universal Compatibility**: Plain text files are the easiest format to share across different operating systems, programming languages, and software packages.
* **File Size & Compression**: Plain text is somewhat less space-efficient than binary formats, so we often **compress** files using `.zip` or `.gz` (gzip) — `readr` can read compressed `.csv.gz` files directly without manual decompression!
* **Organizing Tabular Data**:
  * Each **line** of the file represents a **row** of the table.
  * Columns within a row are separated using a **delimiter** character:
    * **CSV**: Comma-separated (`,`)
    * **TSV**: Tab-separated (`\t`)
    * **Delimited**: Pipe (`|`), semicolon (`;`), or whitespace.

---

# Anatomy of a Comma-Separated Values (CSV) Row

Consider this raw line from a Detroit traffic incident CSV file:

```r-norun
-82.9,42.4,3043540,1703280231,Gratiot Ave & Mapleridge St,"ACCIDENT, HIT & RUN",OUIL,5422,54001,"ACCIDENT, HIT & RUN",2017/03/28 22:00:00+00
```

### Key Observations
* **Delimiter**: Columns are separated by commas (`,`).
* **Numeric Values**: Numbers like `-82.9`, `42.4`, and `3043540` are written directly without quotes.
* **Unescaped vs. Escaped Strings**:
  * Simple strings without commas (`Gratiot Ave & Mapleridge St`) do not require quotes.
  * Strings that **contain a comma inside the value** (`"ACCIDENT, HIT & RUN"`) **must** be wrapped in quotes so the parser does not split them into two columns!
* **Dates & Times**: Values like `2017/03/28 22:00:00+00` are stored as text strings in the raw file and must be parsed into date-time objects.
* **Header Rows**: Most CSV files include a **header row** at line 1 giving column names, though some lack headers or include instructional metadata text at the top that must be trimmed.

---

# Loading Delimited Files in the Tidyverse (`readr`)

* The Tidyverse (`readr` package, loaded automatically with `library(tidyverse)`) provides a family of `read_EXTENSION` functions:
  * `read_csv()` for comma-separated files
  * `read_tsv()` for tab-separated files
  * `read_delim()` for arbitrary delimiters
* Unlike base R's `read.csv()`, you should strongly prefer **`read_csv()`** because:
  1. **Speed**: It is significantly faster (powered by the `vroom` C++ engine).
  2. **Tibbles**: It returns a clean **`tibble`** rather than a legacy base `data.frame`.
  3. **Reproducibility**: It does not mangle column names or silently convert strings in unexpected ways.

```r-norun

#  first two lines of a sample file
1st Quarter Sales,Total Cost ($),Employee-ID
1000,500,EMP-01

# Base R
df_base <- read.csv("employees.csv")
colnames(df_base)
#> [1] "X1st.Quarter.Sales" "Total.Cost......."  "Employee.ID"      
# Result: Numbers prefixed with 'X', spaces/symbols converted to '.', multiple '.' stacked.

# readr
library(readr)
df_readr <- read_csv("employees.csv")
colnames(df_readr)
#> [1] "1st Quarter Sales" "Total Cost ($)"    "Employee-ID"     
# Result: Column names are completely preserved as written.

```

```r
heights <- read_csv("https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/heights.csv") |> print()
```

Notice that `read_csv()` reports what columns it found and what **data types** (`<dbl>`, `<chr>`) it guessed for each column!

---

# Handling Files Without Header Rows (`col_names`)

What happens when a CSV file does **not** have a header row (`heights_no_hdr.csv`)?

```r
# Problem: read_csv() assumes the first row of data is the header!
read_csv("https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/heights_no_hdr.csv") |> print()
```

### Two Ways to Fix Missing Headers
1. **Disable automatic headers (`col_names = FALSE`)** — R generates default column names (`X1`, `X2`, ...):
```r
read_csv("https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/heights_no_hdr.csv", col_names = FALSE) |> print()
```

2. **Supply a character vector of column names (`col_names = c(...)`)**:
```r
read_csv(
  "https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/heights_no_hdr.csv",
  col_names = c("earn", "height", "sex", "ed", "age", "race")
) |> print()
```

---

# Common Import Issues: `skip`, `na`, and `comment`

Real-world files often contain instructional header lines, non-standard missing value codes, or comment lines:

* **`skip = NUMBER`**: Skips the first `NUMBER` lines at the top of the file before reading.
* **`na = c(...)`**: Specifies custom strings (such as `"."` or `"0"`) that should be converted to `NA`.
* **`comment = "#"`**: Ignores any lines (or trailing text) starting with the comment character.

### Example 1

```r
# Skipping 3 metadata lines and treating '0' as NA
read_csv(
"# First row to skip
// Second row to skip
% Third row to skip
1, 0 , 3
4, 0, 6
7, 8, 0
", skip = 3, na = c("0"), col_names = c("a", "b", "c"))

```

### Example 2

```r
# Skipping comment lines prefaced by '#' anywhere in the file
read_csv("
# First comment line
a, b, c
# This separates the header from the data
1, 2, 3
4, 5, 6
# Another comment line
", comment = "#")
```

---

# Exercise 1: Customizing `read_csv()`

Read in the inline `csv` string below using `read_csv()`.
1. Do **not** read the first row as the header (`col_names = FALSE`).
2. Make any `"NONE"` and `"EMPTY"` values become missing (`NA`) in R.

```r
csv <- '
1,hello, NONE, EMPTY
0,goodbye,-3, 100
1,NONE,1.111111, EMPTY
'

# Read csv with col_names = FALSE and na = c("NONE", "EMPTY"):

```

```r block=answer
csv <- '
1,hello, NONE, EMPTY
0,goodbye,-3, 100
1,NONE,1.111111, EMPTY
'
read_csv(csv, na = c("NONE", "EMPTY"), col_names = FALSE)
```

---

# Saving Data: `write_csv()` and `write_rds()`

Just as `readr` provides `read_*()` functions, it provides complementary **`write_*()`** functions:

* **`write_csv(x, file)`** & **`write_delim(x, file)`**: Writes a data frame/tibble out to a plain-text CSV or delimited file.
* **`write_rds(x, file)`** / **`read_rds(file)`**: Saves a single R object in R's binary **RDS** format — preserving exact R data types (such as factor levels and dates) without re-parsing!
* **`save(var1, var2, file = "data.RData")`**: Saves multiple R variables into a single binary workspace file.

```r-norun
# Create a sample dataframe
my_data <- data.frame(
  name = c("Alice", "Bob", "Charlie"),
  age  = c(25, 30, 35),
  city = c("New York", "London", "Paris")
)

# Save as a plain-text CSV file and as a binary RDS file
write_csv(my_data, "my_data.csv")
write_rds(my_data, "my_data.rds")

# Verify by reading back the RDS file
read_rds("my_data.rds")
```

---

# How Does Automatic Column Parsing Work?

When `read_csv()` imports a file, its automatic parser scans the **first 1,000 rows** of each column to guess the column's data type.

What happens when a mostly numeric column contains a single unexpected string (`'b'`)?

```r
tbl <- read_csv(
"a, b
1, 3
2, 4
'b', 6
", col_names = TRUE
)

tbl |> print()
```

### Why is column `a` parsed as `<chr>`?
Because atomic vectors in R must have a **single homogeneous type**, the presence of `'b'` in row 3 forces `read_csv()` to fall back to the most general type — **character (`<chr>`)** — for the entire column `a`!

---

# Specifying Column Data Types Explicitly (`col_types`)

If you already know the exact data types each column should have, don't rely on automatic guessing — specify them explicitly with **`col_types`**:

* `col_character()`, `col_double()`, `col_integer()`, `col_logical()`, `col_factor()`, `col_date()`

```r
read_csv(
"a, b
1, 3
2, 4
1, 2
",
  col_types = list(
    a = col_character(),
    b = col_character()
  )
) |> print()
```

Explicit `col_types` guarantees consistent schemas across production data pipelines and immediately flags unexpected values via `problems()`.

---

# Real-World Case Study: World Bank Population & Fertility Data

Recently in global news, the population of China began shrinking after decades of growth, carrying major demographic and economic implications.

Let's study this phenomenon directly from two raw [World Bank](https://data.worldbank.org/) CSV files:
1. **Total Population (`SP.POP.TOTL`)**: `https://github.com/jravi123/datasets/raw/refs/heads/main/datasets/population_2026.csv`
2. **Fertility Rate (`SP.DYN.TFRT.IN`, births per woman)**: `https://github.com/jravi123/datasets/raw/refs/heads/main/datasets/latest_2026-fertility.csv`

Let's see what happens when we try to import the raw World Bank Population CSV directly without inspecting it first:

```r
world_pop_bad <- read_csv("https://github.com/jravi123/datasets/raw/refs/heads/main/datasets/population_2026.csv")
problems(world_pop_bad)
```

`problems()` reports parsing issues starting at row 3! Why?

---

# Analyzing the Raw File & Fixing with `skip = 3`

Let's inspect the first 5 raw lines of the World Bank CSV file:

```r
readLines("https://github.com/jravi123/datasets/raw/refs/heads/main/datasets/population_2026.csv", n = 5)
```

The first **three lines** contain World Bank metadata (`"Data Source"`, blank line, `"Last Updated Date"`), and the actual column headers appear on line 4!
By passing **`skip = 3`**, `read_csv()` skips the metadata lines and reads the header properly:

```r
world_pop <- read_csv("https://github.com/jravi123/datasets/raw/refs/heads/main/datasets/population_2026.csv", skip = 3)
problems(world_pop)
```

Zero parsing problems!

---

# Inspecting `world_pop` with `glimpse()` and `head()`

Let's inspect the imported `world_pop` tibble:

```r
glimpse(world_pop)
head(world_pop)
```

> [!WARNING] Why is there an extra `...69` column at the end?
> Notice that `world_pop` has a 69th column named **`...69`** filled with `NA`! This happens because every line in the World Bank's raw CSV export ends with a **trailing comma** (`,`), which `read_csv()` interprets as an empty final column.

---

# Importing World Bank Fertility Data (`world_fert`)

Now let's load the World Bank Fertility Rate dataset (`births per woman`) using `skip = 3`:

```r
world_fert <- read_csv("https://github.com/jravi123/datasets/raw/refs/heads/main/datasets/latest_2026-fertility.csv", skip = 3)
head(world_fert)
```

Let's check whether the `2023` column is `NA` across all rows in the fertility file:

```r
world_fert$`2023` |> is.na() |> unique()
```

Since `2023` is entirely `NA` (and `...69` is a trailing-comma artifact), we should drop both columns when reshaping!

---

# Reshaping China's Fertility Data with `pivot_longer()`

In `world_fert`, each year (`1960` through `2022`) is stored as its own column. To plot a time series in `ggplot2`, we filter for `'China'`, pivot the year columns into a tidy `(year, fert)` format, and drop `2023` and `...69`:

```r
wb_fert_longer <- world_fert |>
  filter(`Country Name` == "China") |>
  pivot_longer(
    cols = c(`1960`:`2022`),
    names_to = "year",
    values_to = "fert"
  ) |>
  select(-`2023`, -`...69`) 

wb_fert_longer |> head()
```

---

# Plotting China's Fertility Rate: Why Did the X-Axis Break?

Let's try plotting `wb_fert_longer` with `geom_point()` and `geom_line()`:

```r
wb_fert_longer |>
  ggplot(aes(x = year, y = fert)) +
  geom_point() +
  geom_line()
```

Look closely at two problems in this plot:
1. The x-axis labels (`1960`..`2022`) are completely **overlapping** and unreadable.
2. `geom_line()` didn't draw a line!

Let's check the column types with `glimpse(wb_fert_longer)`:
```r
glimpse(wb_fert_longer)
```
Because `year` came from column names, it is stored as a **character string (`<chr>`)** rather than a number!

---

# Fixing the `year` Data Type with `parse_number()`

Converting `year` from `<chr>` to `<dbl>` using **`parse_number(year)`** fixes both the x-axis scale and `geom_line()`!

```r
wb_fert_longer |>
  mutate(year = parse_number(year)) |>
  ggplot(aes(x = year, y = fert)) +
  geom_point(color = "firebrick") +
  geom_line(color = "firebrick", linewidth = 0.8) +
  labs(
    title = "China's Total Fertility Rate (1960–2022)",
    x = "Year",
    y = "Births per Woman"
  ) +
  theme_minimal()
```

Notice the dramatic drop in China's fertility rate during the 1970s and 1990s, falling well below the replacement rate of 2.1 births per woman.

---

# Comparing China's Population and Fertility Trends Together

How does China's total population trajectory compare to its fertility rate? Let's reshape `world_pop`, join it with `wb_fert_longer`, pivot both metrics into a long table, and plot with `facet_grid()`:

```r
wb_pop_longer <- world_pop |>
  filter(`Country Name` == "China") |>
  pivot_longer(cols = c(`1960`:`2022`), names_to = "year", values_to = "pop") |>
  select(-`2023`, -`...69`)

wb_pop_fert <- wb_pop_longer |>
  left_join(wb_fert_longer, join_by(`Country Name`, year)) |>
  select(`Country Name`, fert, pop, year) |>
  mutate(year = parse_number(year))

wb_pop_fert |>
  pivot_longer(cols = c(fert, pop), names_to = "criteria", values_to = "value") |>
  ggplot() +
  facet_grid(rows = vars(criteria), scales = "free_y") +
  geom_line(aes(x = year, y = value, color = criteria), linewidth = 1) +
  theme_minimal()
```

---

# Exercise 2: Exploring World Bank Trends Across Countries

Use `world_fert` to compare the fertility rate trajectories (`1960` to `2022`) of **`"China"`**, **`"India"`**, and **`"United States"`** on the same line chart (`color = \`Country Name\``). Don't forget `parse_number(year)`!

```r
# Filter world_fert for China, India, and United States, pivot_longer, parse_number(year), and plot:

```

```r block=answer
world_fert |>
  filter(`Country Name` %in% c("China", "India", "United States")) |>
  pivot_longer(cols = c(`1960`:`2022`), names_to = "year", values_to = "fert") |>
  mutate(year = parse_number(year)) |>
  ggplot(aes(x = year, y = fert, color = `Country Name`)) +
  geom_line(linewidth = 1) +
  labs(title = "Fertility Rate Comparison (1960–2022)", x = "Year", y = "Births per Woman") +
  theme_minimal()
```

---

# Part 2: Strings and Factors (`Lecture 14`)

R has two distinct data types for representing categorical or text variables:

* **Strings (`character`)**: Unstructured text data. Best when you want to search, split, or combine text, or sort lexicographically (alphabetically).
* **Factors (`factor`)**: Integers representing categories paired with a lookup table of character labels called **`levels`**.

```r
example_str <- c("you", "say", "goodbye", "i", "say", "hello", "hello", "hello")
example_str

example_fct <- factor(example_str)
example_fct
```

* Use **factors** for categorical variables with a fixed, known set of possible values, or whenever you want to display/sort categories in a **non-alphabetical order**.
* The **`forcats`** package (part of `tidyverse`) provides functions prefixed with **`fct_`** for working with factors.

---

# Why Factors? Values vs. `levels` & Catching Typos

Consider a categorical vector of birth months:
* The **observed values** are the entries in `birth_months`.
* The **possible values** (in calendar order) are the **`levels`** (`month.abb`: `"Jan"`, `"Feb"`, ..., `"Dec"`).

```r
birth_months <- c("Jan", "Feb", "Sep", "Sep", "Dec", "Jan", "Jul", "Aug")

# Alphabetical string sorting vs. chronological factor sorting
sort(birth_months)

birth_months_fac <- factor(birth_months, levels = month.abb)
sort(birth_months_fac)
levels(birth_months_fac)
```

Explicit `levels` also catch **typos** automatically by converting invalid entries (`"Ser"`) to `<NA>`:
```r
bad <- c("Jan", "Feb", "Sep", "Ser", "Dec", "Jan", "Jul", "Aug")
factor(bad, levels = month.abb)
```

---

# General Social Survey Dataset (`gss18` & `gss_cat`)

The [General Social Survey (GSS)](https://gss.norc.org/) is a long-running US sociological survey conducted by NORC at the University of Chicago. Let's inspect `gss18` (and `forcats::gss_cat`):

```r
gss18 <- read_csv("https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/gss18.csv")

gss18 |> glimpse()

# View unique categorical values and their frequencies with count()
gss18 |> count(race)
```

The two main operations when working with factors are:
1. **Changing the order of the levels** (`fct_reorder`, `fct_reorder2`, `fct_infreq`, `fct_rev`)
2. **Changing the values of the levels** (`fct_recode`, `fct_collapse`, `fct_lump_*`)

---

# Modifying Factor Order: `fct_reorder()`

Suppose we want to explore average daily TV hours watched across religious traditions:

```r
relig_summary <- gss18 |>
  filter(!is.na(relig)) |>
  group_by(relig) |>
  summarize(tvhours = mean(tvhours, na.rm = TRUE))

# Hard to read without ordering!
# ggplot(relig_summary, aes(x = tvhours, y = relig)) + geom_point()

# Reorder relig (.f) by tvhours (.x) using fct_reorder():
relig_summary |>
  mutate(relig = fct_reorder(relig, tvhours)) |>
  ggplot(aes(x = tvhours, y = relig)) +
  geom_point(size = 3, color = "steelblue") +
  theme_minimal()
```

`fct_reorder(.f, .x)` reorders the factor `.f` according to the numeric values in `.x`, making patterns immediately visible!

---

# Exercise 3: Ordering a Bar Chart with `fct_reorder()`

Fix the bar chart below so that the income bars are arranged in ascending/descending order of count (`n`), making the chart much easier to interpret:

```r
# Reorder income by n using fct_reorder():
gss18 |> filter(!is.na(income)) |>
  count(income) |>
  ggplot(aes(y = income, x = n)) +
  geom_col(fill = "steelblue") +
  theme_minimal()
```

```r block=answer
gss18 |> filter(!is.na(income)) |>
  count(income) |>
  ggplot(aes(y = fct_reorder(income, n), x = n)) +
  geom_col(fill = "steelblue") +
  theme_minimal()
```

---

# Reordering on Two Variables (`fct_reorder2`) & Frequency (`fct_infreq`)

* **`fct_reorder2(.f, .x, .y)`**: Reorders factor `.f` by the `.y` values associated with the largest `.x` values — aligning multi-line plot colors at the far right with the legend order!
* **`fct_infreq(.f)`** & **`fct_rev(.f)`**: Orders factor levels by decreasing (or increasing) frequency count.

```r
by_age <- gss_cat |>
  filter(!is.na(age)) |>
  count(age, marital) |>
  group_by(age) |>
  mutate(prop = n / sum(n))

ggplot(by_age, aes(x = age, y = prop, color = fct_reorder2(marital, age, prop))) +
  geom_line(linewidth = 1) +
  scale_color_brewer(palette = "Set1") +
  labs(color = "marital", title = "Marital Status by Age (Legend Aligned via fct_reorder2)") +
  theme_minimal()
```

```r
# Order marital status bars in increasing frequency using fct_rev(fct_infreq()):
gss_cat |>
  mutate(marital = fct_rev(fct_infreq(marital))) |>
  ggplot(aes(y = marital)) +
  geom_bar(fill = "darkcyan") +
  theme_minimal()
```

---

# Modifying Factor Levels: `fct_recode()` & `fct_collapse()`

* **`fct_recode(.f, new_name = "old_name")`**: Rename specific factor levels by hand.
* **`fct_collapse(.f, new_name = c("old1", "old2"))`**: Collapse multiple old levels into broader groups.

```r
x <- factor(c("apple", "bear", "banana", "dear"))
fct_recode(x, fruit = "apple", fruit = "banana")

# Collapse detailed partyid responses into "rep", "ind", and "dem"
gss18 |>
  mutate(
    partyid = fct_collapse(partyid,
      "rep" = c("strong republican", "not str republican"),
      "ind" = c("ind,near rep", "independent", "ind,near dem"),
      "dem" = c("not str democrat", "strong democrat")
    )
  ) |>
  count(partyid)
```

---

# Lumping Small Groups: `fct_lump_*()`

When a categorical variable has many small groups, the **`fct_lump_*()`** family combines rare categories into `"Other"`:

* **`fct_lump_lowfreq()`**: Progressively lumps the smallest categories into `"Other"` while keeping `"Other"` smaller than the remaining groups.
* **`fct_lump_n(f, n = 10)`**: Keeps the top `n` most frequent categories and lumps the rest into `"Other"`.
* **Visual Compromise**: Put `fct_lump(relig)` on the x-axis (one bar for `"Other"`) while mapping `fill = relig` to still show the breakdown in the legend!

```r
gss18 |>
  mutate(relig = fct_lump_n(relig, n = 10)) |>
  count(relig, sort = TRUE)

# Lumped x-axis bars, while still showing full religious variation in fill:
gss18 |>
  ggplot(aes(x = fct_lump(relig), fill = relig)) +
  geom_bar() +
  theme_minimal()
```

---

# Sociological Case Study: Defining Generations in `gss18`

Let's examine the age distribution of survey respondents and define sociological generations using **`cut()`**:
* **Silent Generation**: 1929–1945 | **Baby Boomers**: 1946–1964 | **Gen X**: 1964–1981 | **Millennial**: 1982–1996 | **Gen Z**: 1997–2014

```r
gss18_gen <- mutate(
  gss18,
  birth_year = 2018 - age,
  generation = cut(
    birth_year,
    breaks = c(1929, 1946, 1964, 1982, 1997, 2014),
    labels = c("silent", "boomer", "x", "millennial", "z")
  ),
  fct_lump_relig = fct_lump(relig)
)

ggplot(gss18_gen) +
  geom_bar(aes(x = generation, fill = generation)) +
  theme_minimal()
```

---

# Exercise 4: Finding the Oldest Respondent's Birth Year

Using `gss18`, find the row with the maximum `age` using `slice_max(age, n = 1)` and calculate the year that person was born (`2018 - oldest_person$age`):

```r
# Find the birth year of the oldest person in gss18:

```

```r block=answer
gss18 |> slice_max(age, n = 1) |> head(1) -> oldest_person
2018 - oldest_person$age
```

---

# Conditional Distributions by Generation (`prop.table`)

Using `table()` and **`prop.table()`**, we can analyze joint and conditional distributions of religion and politics across generations:

* **`prop.table()`**: Joint distribution (entire table sums to `1`).
* **`prop.table(1)`**: Row-normalized conditional distribution — e.g., $P(\text{Religion} \mid \text{Generation})$ (each row sums to `1`).
* **`prop.table(2)`**: Column-normalized conditional distribution — e.g., $P(\text{Generation} \mid \text{Religion})$ (each column sums to `1`).

```r
# Row-normalized: Religious affiliation distribution GIVEN generation
gss18_gen |> select(generation, fct_lump_relig) |> table() |> prop.table(1) |> round(3)

# Column-normalized: Generational distribution GIVEN religious affiliation
gss18_gen |> select(generation, fct_lump_relig) |> table() |> prop.table(2) |> round(3)

# TV hours boxplot across generations, ordered by median TV hours:
gss18_gen |>
  filter(!is.na(generation), !is.na(tvhours)) |>
  ggplot(aes(x = fct_reorder(generation, tvhours), y = tvhours, fill = generation)) +
  geom_boxplot() +
  labs(title = "Daily TV Hours by Generation (Ordered by Median)", x = "Generation", y = "TV Hours") +
  theme_minimal()
```
