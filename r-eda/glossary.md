# Glossary

Below is a reference guide for all core terms, libraries, and functions used in R Exploratory Data Analysis.

---

### Tidyverse
A curated collection of R packages designed for data science that share an underlying philosophy, grammar, and data structure. Key packages include `ggplot2`, `dplyr`, `tidyr`, `readr`, `stringr`, `forcats`, `lubridate`, and `purrr`.

### ggplot2
The standard data visualization package in R, built on the **Grammar of Graphics** framework. It constructs plots by adding layers (geoms, aesthetics, scales, coordinates, and themes) to a blank data canvas.

### Aesthetic Mapping (`aes`)
An expression that connects a data column in a table to a visual property of a geometric shape on the plot (such as its x-axis position, y-axis position, color, fill, shape, or size).

### Geom
Short for geometric object. It defines the visual representation of data points on the plot canvas (e.g. `geom_point` draws scatter points, `geom_line` draws lines, `geom_bar` draws rectangles, `geom_boxplot` draws box plots).

### Stat
Short for statistical transformation. It performs computations or aggregates data points before rendering a geom (e.g., `stat_count` counts categories for `geom_bar`, `stat_smooth` computes regression equations for trend lines).

### Facet
A technique to split a single chart canvas into a grid of multiple subplots based on distinct categories of a variable, sharing the same scale for comparison.

### coord_flip()
A coordinate system function that swaps the horizontal (x) and vertical (y) axes. It is commonly used to render vertical boxplots horizontally or display long categorical labels legibly.

### coord_polar()
A coordinate system function that maps Cartesian coordinates $(x, y)$ to polar coordinates (angle and distance from the center), wrapping charts radially.

### ggsave()
The standard function in `ggplot2` to save the active or last rendered plot to a file on disk (in formats like PNG, PDF, JPG, SVG).

### dplyr
The standard R package containing a grammar of data transformation verbs. It provides functions to manipulate, filter, summarize, and combine data frames.

### Tibble
A modern, enhanced version of R's native data frame structure (`data.frame`), optimized to print cleanly in the console and avoid silent data conversions.

### filter()
A `dplyr` verb that returns a subset of rows satisfying one or more logical conditions.

### select()
A `dplyr` verb that extracts specific columns from a dataset by name, index, or string helper (like `starts_with()`).

### mutate()
A `dplyr` verb that creates new columns by applying calculations to existing variables or modifies current columns in-place.

### group_by()
A `dplyr` verb that segments a dataset into groups based on categories in one or more columns. Subsequent summaries or mutations execute within each group.

### ungroup()
A `dplyr` verb that removes grouping constraints from a data frame. It is a critical best practice to add `ungroup()` to the end of grouping pipelines to avoid unexpected downstream results.

### summarize()
A `dplyr` verb that collapses a table containing many rows into a single row of computed statistics (such as `mean`, `median`, `sd`, `n()`).

### across()
A helper function inside `summarize()` or `mutate()` to apply the same function or calculation to multiple selected columns simultaneously.

### Window Function
A function that operates on elements relative to their positions, taking $N$ vector values as input and returning $N$ output values (e.g. ranks, lags, cumulative sums), preserving the row count.

### min_rank()
A ranking function that orders values, assigning identical rank numbers to duplicates (ties) and leaving gaps for succeeding positions (e.g. 1st, 1st, 3rd).

### dense_rank()
A ranking function that orders values, assigning identical rank numbers to ties without leaving gaps for succeeding positions (e.g. 1st, 1st, 2nd).

### lead() and lag()
Window functions that shift a vector's elements offset-up or offset-down. They are commonly used to calculate differences between successive observations (e.g. day-to-day stock changes).

### tidyr
A tidyverse package designed to clean and reshape datasets to ensure they conform to tidy data specifications.

### pivot_longer()
A `tidyr` function that reshapes a wide dataset into a long dataset, melting column headers into rows.

### pivot_wider()
A `tidyr` function that reshapes a long dataset into a wide dataset, splitting rows into multiple columns.

### separate_wider_delim()
A `tidyr` function that splits a single text column into multiple distinct columns based on a delimiter character.

### Mutating Join
A database operation (such as `left_join`, `inner_join`, `full_join`) that merges columns from a secondary table into a primary table using matching keys.

### Filtering Join
A database operation (such as `semi_join`, `anti_join`) that filters the rows of a primary table based on whether matching keys exist in a secondary table, without adding columns.

### dbplyr
A database driver package that translates standard `dplyr` pipelines into SQL queries automatically, running calculations on the database server directly (lazy evaluation).

### Shiny
An R package that enables developers to build interactive web applications and dashboards directly in R code, linking inputs (widgets) and outputs (plots/tables) reactively.

### Reactivity
The programming model behind Shiny apps. It automatically re-runs R code blocks and updates visual outputs on a webpage whenever a user alters input values.
