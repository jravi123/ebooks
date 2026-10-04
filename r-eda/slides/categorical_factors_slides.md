# Categorical Data & Factors
## Factor Levels, Ordering, Recoding, and Collapsing with forcats

---
# Lecture Agenda & Topics

Categorical variables represent discrete groupings (such as education levels, survey responses, or medical statuses). The **`forcats`** package provides tools to manipulate and reorder factor levels.

Today we will cover:
* **The Factor Structure**: Integer encoding, level maps, and catching typos.
* **Ordinal Factors**: Constructing ordered scales (`Low < Medium < High`).
* **Visual Reordering**: `fct_reorder()` and `fct_reorder2()` in ggplot2.
* **Frequency Ordering**: Sorting by occurrence count using `fct_infreq()`.
* **Recoding Levels**: Renaming categories with `fct_recode()`.
* **Collapsing Rare Levels**: Grouping low-frequency categories with `fct_lump_min()` and `fct_collapse()`.
* **The GSS Survey Dataset**: Exploring social patterns using `forcats::gss_cat`.

---
# Why Factors Matter: The Problem with Strings

Plain character strings sort alphabetically by default, which destroys meaningful domain ordering:

```r
library(tidyverse)

# Character vector of months
birth_months <- c("Jan", "Feb", "Sep", "Dec", "Jan", "Jul", "Aug")

# Alphabetical sorting
sort(birth_months)
```

Alphabetical ordering places `"Aug"` first and `"Sep"` last, breaking calendar sequence.

---
# Enforcing Valid Factor Levels

A factor maps discrete character values to a predefined set of valid **levels**:

```r
library(tidyverse)

# Survey data with a typo ("Ser" instead of "Sep")
raw_data <- c("Jan", "Feb", "Sep", "Ser", "Dec", "Jan")

# Enforce valid 12-month calendar levels
month_factor <- factor(raw_data, levels = month.abb)

print(month_factor)
```

> [!NOTE] Automatic Gatekeeping
> Any input not found in `levels` is automatically converted to `NA`, preventing corrupted typos from entering downstream analyses.

---
# Ordered Ordinal Factors

When categories have an inherent hierarchy, create an **ordered factor**:

```r
library(tidyverse)

# Ordered ordinal satisfaction scale
satisfaction <- factor(
  c("High", "Low", "Medium", "High"),
  levels = c("Low", "Medium", "High"),
  ordered = TRUE
)

print(satisfaction)
```

Ordered factors allow logical inequality comparisons (e.g., `Low < High`).

---
# The General Social Survey Dataset (`gss_cat`)

The `forcats` package includes **`gss_cat`**, a sample of data from the General Social Survey:

```r
library(tidyverse)

# Glimpse the survey dataset
glimpse(gss_cat)
```

Columns like `marital`, `race`, `rincome`, `partyid`, and `relig` are stored as factors.

---
# Reordering Factor Levels by Numeric Values: `fct_reorder()`

To sort bar charts or boxplots by a summary statistic (rather than arbitrary level order), use **`fct_reorder()`**:

```r
library(tidyverse)

# Average TV watching hours by religion
relig_tv <- gss_cat |>
  group_by(relig) |>
  summarize(
    avg_tvhours = mean(tvhours, na.rm = TRUE),
    n = n(),
    .groups = "drop"
  )

# Reorder religion by average TV hours
ggplot(relig_tv, aes(x = avg_tvhours, y = fct_reorder(relig, avg_tvhours))) +
  geom_col(fill = "steelblue") +
  labs(title = "TV Hours by Religious Tradition", x = "Mean Daily TV Hours", y = "Religion")
```

---
# Sorting by Frequency: `fct_infreq()` & `fct_rev()`

To order a categorical distribution from most frequent to least frequent:

```r
library(tidyverse)

# Bar chart ordered by frequency count
gss_cat |>
  mutate(marital = fct_infreq(marital)) |>
  ggplot(aes(x = marital, fill = marital)) +
  geom_bar() +
  labs(title = "Marital Status Ordered by Frequency", x = "Marital Status", y = "Count")
```

Wrap with `fct_rev()` to reverse the order (least to most frequent).

---
# Recoding Factor Levels: `fct_recode()`

To rename category labels or standardize values, use **`fct_recode(factor, new_name = "old_name")`**:

```r
library(tidyverse)

# Standardize partyid levels into broader groups
party_cleaned <- gss_cat |>
  mutate(party_simple = fct_recode(partyid,
    "Republican" = "Strong republican",
    "Republican" = "Not str republican",
    "Independent" = "Ind,near rep",
    "Independent" = "Independent",
    "Independent" = "Ind,near dem",
    "Democrat"    = "Not str democrat",
    "Democrat"    = "Strong democrat",
    "Other"       = "Other party"
  ))

party_cleaned |> count(party_simple)
```

---
# Collapsing Rare Categories: `fct_lump_min()` & `fct_collapse()`

When a categorical variable has dozens of tiny groups, use `fct_lump_min()` or `fct_lump_n()` to combine rare categories into an `"Other"` bucket:

```r
library(tidyverse)

# Keep only religions with at least 1,000 respondents
gss_cat |>
  mutate(relig_lumped = fct_lump_min(relig, min = 1000, other_level = "Other / Smaller")) |>
  count(relig_lumped, sort = TRUE)
```

---
# Module Summary & Key Takeaways

1. **Factors vs. Strings**: Factors store categorical data as integer vectors with labeled levels, ensuring correct non-alphabetical sorting.
2. **`fct_reorder()`**: Orders a categorical axis according to a numerical metric (e.g. median income or mean TV hours).
3. **`fct_infreq()`**: Orders factor levels from highest to lowest frequency count.
4. **`fct_recode()`**: Renames specific levels using `new_label = "old_label"`.
5. **`fct_lump_min()` / `fct_lump_n()`**: Automatically lumps sparse, low-frequency categories into an `"Other"` group.
