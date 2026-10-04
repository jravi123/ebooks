# Categorical Data & Factors

## Why Master Categorical Factors in Data Science?

Imagine you are analyzing response profiles from a national sociological survey. You receive the following respondent data:
* **Birth Months**: `"Jan"`, `"Sep"`, `"Feb"`, `"Sep"`, `"Dec"`, `"Jan"`
* **Income Tiers**: `"High"`, `"Low"`, `"Medium"`, `"High"`, `"Low"`

If you leave these columns as standard character strings, R will treat them as arbitrary text and sort them alphabetically:
* Birth months will be plotted or sorted as: `"Dec"`, `"Feb"`, `"Jan"`, `"Sep"`, which completely destroys the logical chronological flow of a year.
* Income tiers will be sorted as: `"High"`, `"Low"`, `"Medium"`, completely reversing the economic ladder.

Furthermore, raw text vectors are highly prone to data-entry errors. A single typo like `"Ser"` instead of `"Sep"` will be treated as an entirely separate category, skewing your metrics.

To solve this, R uses a specialized, highly optimized data type for categorical variables called **Factors**. Factors store your category labels as a lookup table mapped to underlying integers, allowing you to establish custom sorting orders, catch typos instantly, group rare responses, and prepare datasets for rigorous statistical modeling.

In this chapter, we will master categorical variables inside R, understand the mechanics of string vs. factor storage, explore the power of the Tidyverse **`forcats`** package, learn to reorder and collapse labels, and conduct a detailed case study on sociological generational shifts.

---

## Part 1: String vs. Factor Architecture

It is critical to distinguish between raw strings and structured factors.

### The Storage Paradigm
* **Character Strings (`character`)**: Raw text representations. Ideal for unique, high-cardinality values with no repeating categories (such as email addresses, home addresses, or customer names).
* **Factors (`factor`)**: Categorical representations. R stores factors internally as integer vectors (e.g., `1, 2, 3`) and maps them to a character lookup table called **`levels`**. This is highly efficient for repeating values (such as survey options, blood types, or regions) and is required for regression modeling.

```
                      Categorical Factor Storage:
                      
        Raw Vector:    c("High", "Low", "Medium", "High")
                             │      │       │        │
                             ▼      ▼       ▼        ▼
        Stored Integers:     3      1       2        3
                             │      │       │        │
                             └──────┴───────┴────────┘
                                        │
                                        ▼ (Lookup Table)
                              Levels Map:
                              1 ──► "Low"
                              2 ──► "Medium"
                              3 ──► "High"
```

---

### Basic Factor Creation & Level Enforcement
To construct a factor, we pass a vector to the **`factor()`** function. By default, R will infer the levels alphabetically:

```r
library(tidyverse)

# Raw months vector
birth_months <- c("Jan", "Feb", "Sep", "Sep", "Dec", "Jan", "Jul", "Aug")

# Convert to factor with alphabet-sorted levels
birth_months_fac_default <- factor(birth_months)
print(levels(birth_months_fac_default))
# Returns: "Aug" "Dec" "Feb" "Jan" "Jul" "Sep" (Incorrect chronological order)
```

To establish correct chronological or logical ordering, we must explicitly specify the **`levels`** parameter using R's built-in month abbreviations vector **`month.abb`**:

```r
# Convert to factor with explicit chronological levels
birth_months_fac <- factor(birth_months, levels = month.abb)
print(levels(birth_months_fac))
# Returns: "Jan" "Feb" "Mar" "Apr" "May" "Jun" "Jul" "Aug" "Sep" "Oct" "Nov" "Dec"
```

---

### Catching Data-Entry Typos Programmatically
When we define explicit valid levels, R acts as a diagnostic gatekeeper. Any values in the raw data that do not match our predefined levels are instantly converted to missing values (`NA`), making errors obvious:

```r
# Raw survey data containing a data-entry typo ("Ser" instead of "Sep")
corrupted_months <- c("Jan", "Feb", "Sep", "Ser", "Dec", "Jan")

# Attempt conversion with rigid levels
checked_factor <- factor(corrupted_months, levels = month.abb)
print(checked_factor)
# Output: [1] Jan  Feb  Sep  <NA> Dec  Jan 
# Note that "Ser" was safely flagged and isolated as <NA>!
```

---

### Custom Level Sorting
Because factors carry integer-mapped orders, sorting operations respect our custom levels instead of alphabetical sorting:

```r
# Sorting raw character strings (alphabetical sorting)
sort(birth_months)
# Returns: "Aug" "Dec" "Feb" "Jan" "Jan" "Jul" "Sep" "Sep"

# Sorting explicit factors (chronological sorting)
sort(birth_months_fac)
# Returns: Jan Jan Feb Jul Aug Sep Sep Dec
```

---

## Part 2: Advanced Factor Wrangling with `forcats`

The Tidyverse includes **`forcats`** (specifically designed for categorical data). All functions in `forcats` start with the **`fct_`** prefix.

We will illustrate these tools using the **`gss18`** dataset, which contains records from the **General Social Survey (GSS)**—a long-running sociological tracking study of the American public:

```r
# Load the General Social Survey 2018 dataset
gss18 <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/gss18.csv")
glimpse(gss18)
```

---

### A. Reordering Categorical Levels based on a Numeric Variable: `fct_reorder()`
By default, plotting categorical counts or values results in alphabetical vertical layouts, making it difficult to spot trends. 

Suppose we want to examine:
**What is the average number of daily television hours watched across different religious groups?**

If we plot this directly, the religious groups on the y-axis are sorted alphabetically, which obscures any trend:

```r
# Calculate television averages grouped by religion
relig_summary <- gss18 |>
  filter(!is.na(relig)) |>
  group_by(relig) |>
  summarize(tvhours = mean(tvhours, na.rm = TRUE))

# Cramped, alphabetical plot
ggplot(relig_summary, aes(x = tvhours, y = relig)) + 
  geom_point()
```

To reveal the underlying pattern, we use **`fct_reorder(.f, .x, .fun = mean)`**, which reorders our categorical factor `.f` based on the values of the continuous numeric variable `.x`:

```r
# Sort religious groups from lowest to highest average television hours
relig_summary |>
  mutate(relig = fct_reorder(relig, tvhours)) |>
  ggplot(aes(x = tvhours, y = relig)) +
  geom_point() +
  labs(title = "Television Consumption by Religion", x = "Mean Daily TV Hours", y = "Religion")
```

---

### B. Reordering Based on Two Variables: `fct_reorder2()`
When plotting multiple continuous lines over time colored by a categorical variable, the legend categories usually sort alphabetically. This mismatch between line heights and the legend order makes the chart hard to read.

We can use **`fct_reorder2(.f, .x, .y)`**, which reorders the categorical levels of factor `.f` based on the `.y` values associated with the *largest* `.x` values (the rightmost point of the lines):

```r
# Reorder legend categories to match line order at the far right of the timeline
ggplot(by_age, aes(x = age, y = prop, color = fct_reorder2(marital, age, prop))) +
  geom_line(linewidth = 1) +
  labs(color = "Marital Status", x = "Age", y = "Proportion")
```

---

### C. Frequency-Based Ordering: `fct_infreq()` and `fct_rev()`
To sort categories based on how frequently they appear in your dataset (rather than sorting alphabetically or by a separate variable), use:
* **`fct_infreq()`**: Sorts levels in decreasing order of frequency (most common category first).
* **`fct_rev()`**: Reverses any existing level order.

```r
# Sort marital status from the most common category to the least common
gss18 |>
  mutate(marital = fct_infreq(marital)) |>
  ggplot(aes(y = marital)) +
  geom_bar()

# Sort from least common to most common category
gss18 |>
  mutate(marital = fct_rev(fct_infreq(marital))) |>
  ggplot(aes(y = marital)) +
  geom_bar()
```

---

### D. Manual Level Recoding: `fct_recode()`
To rename individual level names by hand, use **`fct_recode(factor, new_name = "old_name")`**:

```r
# Recode raw fruit levels
fruit_factor <- factor(c("apple", "bear", "banana", "dear"))

cleaned_fruit <- fct_recode(fruit_factor, 
  "fruit" = "apple", 
  "fruit" = "banana"
)
print(levels(cleaned_fruit)) # "fruit" "bear" "dear"
```

---

### E. Bulk Category Collapsing: `fct_collapse()`
When a categorical column contains too many fine-grained categories, it can clutter your charts. You can collapse many levels into a few broader groups using **`fct_collapse()`**:

```r
# Group fine-grained political affiliations into three broad coalitions
gss_grouped <- gss18 |>
  mutate(
    party_coalition = fct_collapse(partyid,
      "Republican" = c("strong republican", "not str republican"),
      "Independent" = c("ind,near rep", "independent", "ind,near dem"),
      "Democrat"    = c("not str democrat", "strong democrat")
    )
  )

gss_grouped |> count(party_coalition)
```

---

### F. Intelligent Group Lumping: `fct_lump_*()`
Rather than manually collapsing levels, you can automatically lump rare categories together into an `"Other"` category:
* **`fct_lump_lowfreq(f)`**: Progressively lumps the smallest categories into `"Other"`, keeping `"Other"` as the smallest category.
* **`fct_lump_n(f, n)`**: Retains only the `n` most common categories and lumps everything else.

```r
# Retain only the top 10 most common religious groups, lumping the rest
gss18 |>
  mutate(relig_lumped = fct_lump_n(relig, n = 10)) |>
  count(relig_lumped, sort = TRUE)
```

> [!TIP] Visualizing Lumped Variables
> To keep your charts clean without losing detail, you can plot lumped categories on your main axis, but use the full, unlumped categories for your legend fill colors:
> ```r
> gss18 |> 
>   ggplot(aes(x = fct_lump(relig, n = 3), fill = relig)) +
>   geom_bar() +
>   labs(x = "Primary Religious Groups (Lumped)", fill = "Detailed Religion")
> ```

---

## Part 3: Sociological Generational Case Study

Let's apply our factor-wrangling skills to a sociological case study of generational shifts in the 2018 General Social Survey.

### A. Defining Generational Cohorts
We will map survey respondents' ages to their corresponding generations. Since the survey was conducted in 2018, we can calculate each respondent's birth year ($2018 - \text{age}$) and use the **`cut()`** function to group them into generational bins:

* **Silent Generation**: Born 1929–1945
* **Baby Boomers**: Born 1946–1964
* **Generation X**: Born 1965–1981
* **Millennials**: Born 1982–1996
* **Generation Z**: Born 1997–2014

```r
# Construct birth year and segment into generational factor levels
gss_generations <- gss18 |>
  mutate(
    birth_year = 2018 - age,
    generation = cut(birth_year,
      breaks = c(1929, 1946, 1964, 1982, 1997, 2014),
      labels = c("Silent", "Boomer", "Gen X", "Millennial", "Gen Z")
    )
  )

# Plot generation counts
ggplot(gss_generations, aes(x = generation, fill = generation)) +
  geom_bar() +
  labs(title = "Respondent Generational Profile", x = "Generation", y = "Count")
```

---

### B. Analyzing Conditional Distributions of Religion
To study how religious affiliation varies across generations, we can build contingency tables and normalize them.

#### Step 1: Create a Contingency Table
First, let's lump religious affiliations to keep the table readable:

```r
# Construct a lumped religion category
gss_generations <- gss_generations |>
  mutate(relig_lumped = fct_lump(relig, n = 3))

# Create a frequency table
raw_table <- table(gss_generations$generation, gss_generations$relig_lumped)
print(raw_table)
```

#### Step 2: Convert to Joint Proportions
To see what proportion of the entire sample falls into each cell, use **`prop.table()`**:

```r
# Joint proportions (cells sum to 1.0)
prop.table(raw_table)
```

#### Step 3: Analyze Conditional Distributions
To study religious affiliation *given* generational status, we normalize our table row-wise by setting the margin parameter to `1`. This scales each row to sum to `1.0` ($100\%$):

```r
# Row-normalized conditional distribution (rows sum to 1.0)
prop.table(raw_table, margin = 1)
```
* **Analytical Pattern**: By comparing these row-normalized proportions across rows, we can examine how religious distributions shift from older generations to younger cohorts (such as the rise of non-religious affiliations among younger generations).

To study generational distributions *given* religious affiliation, we normalize column-wise by setting the margin parameter to `2`:

```r
# Column-normalized conditional distribution (columns sum to 1.0)
prop.table(raw_table, margin = 2)
```

---

### C. Visualizing Grouped Medians with Boxplots
To examine differences in television consumption across generations, we can visualize the distributions using boxplots:

```r
# Basic boxplot of TV hours by generation
ggplot(gss_generations, aes(x = generation, y = tvhours)) + 
  geom_boxplot()
```

To make the trends clearer, we can sort the generations along the axis based on their median television consumption using `fct_reorder()`:

```r
# Reorder generational categories by median TV hours
ggplot(gss_generations, aes(x = fct_reorder(generation, tvhours, .fun = median, na.rm = TRUE), y = tvhours)) + 
  geom_boxplot() +
  labs(title = "Daily Television Consumption across Generations", x = "Generation (Ordered by Median TV Hours)", y = "TV Hours")
```

---

## Hands-on Exercises

### Exercise 1: Structural Categorization of Risk
**How can we convert raw patient health screening logs into structured, logically ordered categories to ensure that clinical risk assessments are sorted correctly during medical audits?**

*Analytical Guidance*:
Construct a structured categorical ordinal factor. Your analysis should:
1. Initialize a character vector of screening records: `c("Medium", "High", "Low", "Medium", "High")`.
2. Convert this vector into an **ordered factor** using the correct parameter arguments to enforce a logical risk ladder: `"Low" < "Medium" < "High"`.
3. Print your factor variable to verify that its levels display as `Low < Medium < High`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Raw risk data
raw_risk <- c("Medium", "High", "Low", "Medium", "High")

# Convert to ordered factor
ordered_risk <- factor(raw_risk, 
  levels = c("Low", "Medium", "High"), 
  ordered = TRUE
)

print(ordered_risk)
# Expected Levels output: Low < Medium < High
```
</details>

---

### Exercise 2: Auditing Server Infrastructure Records
**What is the most efficient way to clean, group, and summarize irregular, unstructured server operating system labels in our database to prepare a clear systems infrastructure inventory?**

*Analytical Guidance*:
Clean and collapse server category profiles. Your analysis should:
1. Initialize a vector of server operating system names:
   `servers <- factor(c("Ubuntu Linux", "Ubuntu Linux", "CentOS Linux", "RedHat Linux", "Windows Server 2022", "Windows Server 2019", "FreeBSD"))`.
2. Load the `forcats` package.
3. Programmatically convert all level names to lowercase using **`fct_relabel()`** and the built-in R function **`tolower`**.
4. Group individual distributions into broader categories using **`fct_collapse()`**:
   * Combine `"ubuntu linux"`, `"centos linux"`, and `"redhat linux"` into `"linux"`.
   * Combine `"windows server 2022"` and `"windows server 2019"` into `"windows"`.
   * Leave `"freebsd"` as is.
5. Identify rare categories and lump any levels appearing fewer than 2 times into an `"other"` category using **`fct_lump_min()`**.
6. Print the final level names of your factor variable to verify that they are: `"linux"`, `"windows"`, and `"other"`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(forcats)

# Raw server factor
servers <- factor(c("Ubuntu Linux", "Ubuntu Linux", "CentOS Linux", "RedHat Linux", "Windows Server 2022", "Windows Server 2019", "FreeBSD"))

# 1. Standardize string characters to lowercase
servers_clean <- fct_relabel(servers, tolower)

# 2. Collapse fine-grained distributions into primary categories
servers_collapsed <- fct_collapse(servers_clean,
  "linux"   = c("ubuntu linux", "centos linux", "redhat linux"),
  "windows" = c("windows server 2022", "windows server 2019")
)

# 3. Lump low frequency levels
servers_lumped <- fct_lump_min(servers_collapsed, min = 2)

# Print final standardized levels
print(levels(servers_lumped))
# Expected output: "linux" "windows" "other"
```
</details>
