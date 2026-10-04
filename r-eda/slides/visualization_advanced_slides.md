# Advanced Visualization: Facets, Coordinate Systems, & Themes

---

#  Lecture Agenda & Topics

Advanced visualization requires breaking complex, multi-dimensional datasets into logical subplots or warping spatial layout coordinates. 

Today we will cover:
* **Revisit Factor**: Mapping continuous numeric values to geometries expecting categorical groupings.
* **Saturated Overplotting**: Managing 50,000+ points when jittering fails.
* **Faceting**: Partitioning data into multi-panel subplots (`facet_wrap`, `facet_grid`).
* **Coordinates**: Flipping Cartesian space and radial polar projections.
* **Seasonal Volatility Case Study**: Circular time data and daily difference vectors (`diff()`).
* **Polished Presenting**: Rotating tick labels, sorting categories (`forcats`), and exporting plots (`ggsave`).

---
Let us review!

<a href="/clicker/5481432610766849" target="_blank">Click me!</a>

---
#  Categorical vs. Quantitative Measurements

Data types govern visual representation

* **Quantitative (Numeric)**: Continuous scales (`c(1.0, 2.2, 3.14)`) mapped to lengths, positions, or color gradients.
* **Categorical (Factors)**: Discrete classes (`c("compact", "suv")`) mapped to distinct colors, shapes, or facets.



**Some columns store numeric codes (like cylinder count `cyl` of 4, 6, 8) but behave conceptually as categories.**

---
#  Numeric on both axis trap on Boxplots

**Continuous Variable Trap**

```r
# The Trap: Mapping cylinders (cyl) to the x-axis of a boxplot
library(tidyverse)
ggplot(data = mpg, aes(x = cyl, y = cty)) +
  geom_boxplot()
```

* **The Problem**: Instead of rendering 3 distinct boxplots for 4, 6, and 8 cylinders, R draws a single, massive box spanning the entire horizontal range (from 4 to 8).
* **Why It Happens**: Standard diagnostic geoms like `geom_boxplot()` or `geom_violin()` calculate statistics *by group*. Since `cyl` is continuous, R treats the entire dataset as one single group!

---

#  Fixing Boxplots with `factor()`

**Converting to Factors with `factor()`**

```r
library(ggplot2)

# Correction: Using 'factor' converts cylinder counts to 3 distinct categories
ggplot(data = mpg, aes(x = factor(cyl), y = cty)) +
  geom_boxplot(fill = "lightblue") +
  labs(x = "Cylinder Count", y = "City Mileage (MPG)",
       title = "City Mileage Distribution by Cylinder Count")
```

---
#  Saturated Overplotting

**Limits of Coordinate Jittering**
```r
# Saturated Plot: A massive black blob of overlapping points
ggplot(diamonds, aes(x = carat, y = price)) +
  geom_point(position='jitter')
```

* **The Jitter Failure**: For extremely large or dense datasets, adding minor coordinate noise (`geom_jitter()`)  or `position='jitter'` fails because the canvas remains completely saturated.


---
#  Solving Overplotting with `alpha`


```r
library(ggplot2)

# Extremely low alpha (1/100) reveals density gradients and patterns
ggplot(diamonds, aes(x = carat, y = price)) +
  geom_point(alpha = 1/100, color = "darkblue") +
  labs(title = "Diamond Carat vs. Price Density",
       subtitle = "High-density transparency reveals hidden pricing thresholds")
```

---
#  Faceting: Small Multiples

**Faceting** partitions your dataset into sub-groups and renders an individual subplot panel for each category, sharing the same x and y axes for comparison.

* **Avoids Visual Overload**: Instead of cramming dozens of groups on a single coordinate plane using separate colors, faceting spreads them into clean, separate panes.
* **`facet_wrap(~ variable)`**: Splits data by a category and arranges the subplots into a neat grid of rows and columns

---
#  Single-Variable wrapping: `facet_wrap()`

**Faceting by a Single Variable**
```r
library(ggplot2)

# Split engine displacement vs. highway mileage into separate class subplots
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.5) +
  facet_wrap(~ class)
```

---
#  Grid Constraints & Multi-Layers in Facets



```r
library(ggplot2)

# Force facets to render in a single horizontal row with custom trend lines
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.5) +
  # se = FALSE hides the grey translucent 95% standard error confidence interval band
  geom_smooth(method = "lm", se = FALSE, color = "red") +
  facet_wrap(~ class, nrow = 1)
```

* **The `se = FALSE` Parameter**: By default, `geom_smooth()` displays a translucent grey standard error confidence band around the trend line. Setting `se = FALSE` hides this band. 

Note: setting method = 'lm' will get you a straight line 

---
#  Faceting by Multiple Columns

**Faceting Across Multiple Variables**

```r
library(ggplot2)

# Facet by both car class and drive train (drv)
ggplot(mpg, aes(x = cty, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.5) +
  facet_wrap(~ class + drv)
```

---
#  Two-Way Matrix Facets (`facet_grid`)

For cross-tabulating two separate categorical dimensions, **`facet_grid()`** is the standard, placing one variable on the rows of the grid, and another on the columns.

* **Formula Syntax**: `facet_grid(row_variable ~ column_variable)`
* **Modern `vars()` Syntax**: `facet_grid(rows = vars(row_var), cols = vars(col_var))`

---
#  Code: Cross-tabulating with `facet_grid()`


```r
library(ggplot2)

# Row grid representing drive train (drv), Column grid representing cylinder count (cyl)
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.5) +
  facet_grid(rows = vars(drv), cols = vars(cyl)) +
  labs(title = "Engine Size vs. Highway Mileage Matrix Grid",
       x = "Engine Displacement (L)", y = "Highway MPG")
```

---
#  Coordinate Systems & Layouts

A **coordinate system** maps positions on the chart canvas to physical screen coordinates. R defaults to Cartesian coordinates, but provides multiple alternative projections:

* **Cartesian (`coord_cartesian`)**: Default grid system.
* **Coordinate Flip (`coord_flip`)**: Interchanges the x and y axes.
* **Polar Coordinates (`coord_polar`)**: Maps coordinates to angle and magnitude/radius.

---
#  Resolving Label Overlap with `coord_flip()`

**Flipping Axes with `coord_flip()`**

```r
library(ggplot2)

# Default categorical bar chart: Labels overlap on bottom
# Flipped bar chart: Categories are horizontal and easy to read
ggplot(mpg, aes(x = manufacturer, fill = class)) +
  geom_bar() 
  #coord_flip() 
```

---
#  Rotating Labels via `theme()`

**Rotating Axis Labels with `theme()`**
```r
library(ggplot2)

# Rotate horizontal labels by 45 degrees
ggplot(mpg, aes(x = class, fill = class)) +
  geom_bar() +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1, vjust = 1))
```

* **`angle`**: Degree rotation (45 or 90).
* **`hjust`**: Horizontal justification (`1` aligns right edge to the tick mark).
* **`vjust`**: Vertical justification (`1` aligns top edge).

---
#  Polar Coordinates & Radial Projections

**Radial Projections with `coord_polar()`**
```r
library(ggplot2)

# Warping a stacked bar chart into a radial pie layout
ggplot(mpg, aes(x = factor(1), fill = class)) +
  geom_bar(width = 1) +
  coord_polar(theta = "y") +
  theme_void() # Removes all background grids and axes
```

---
#  Seasonal Volatility & Radial Weather Clocks

In environmental and temporal data science, seasonal data is circular (e.g. Month 12 wraps around to Month 1). 

Using a daily weather dataset from Ann Arbor, MI (`aatemp` with dates `DATE` and max temperatures `TMAX` in Fahrenheit), we will analyze this dataset to see temparature patterns.


---
#  Loading & Monthly Violins

**Visualizing Monthly Distributions with `geom_violin()`**
```r
library(tidyverse)
library(lubridate)

# Load pre-filtered live weather data
aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

# Plot monthly violin distributions inline
aatemp %>%
  mutate(month_num = month(DATE)) %>%
  ggplot(aes(x = factor(month_num), y = TMAX, fill = factor(month_num))) +
  geom_violin(show.legend = FALSE) +
  theme_minimal() +
  labs(title = "Monthly Temperature Variability (Ann Arbor, MI)",
       x = "Month", y = "Max Temperature (F)")
```

---
#  Why a Violin Plot? (Distribution Charts)

When comparing a continuous variable (temperature) across groups (months), we have several options:

| Chart & Icon | How It Works | Why It Fits Our Weather Case | Best Scenario |
| :--- | :--- | :--- | :--- |
| 🎻 **Violin Plot** | Boxplot + density curve | **Perfect!** Shows tight curves in summer, and wide curves in transition months. | Comparing complete distribution shapes across groups. |
| 📦 **Box Plot** | 5-number summary box | **Good, but limited.** Hides bimodal shape clusters or secondary peaks. | Standardized center/spread/outlier comparisons. |
| 📊 **Histogram** | Equal-width bin counts | **Poor for comparisons.** Multi-group overlaps create extreme visual clutter. | Exploring a single continuous variable in detail. |
| 🏔️ **Ridgeline Plot** | Vertical stacked ridges | **Excellent alternative.** Shows monthly shifts with artistic stacked peaks. | Visualizing gradual distribution shifts over time. |

---
#  Code Comparison

**Boxplots for Summary Statistics**
```r
aatemp %>%
  mutate(month_num = month(DATE)) %>%
  ggplot(aes(x = factor(month_num), y = TMAX, fill = factor(month_num))) +
  geom_boxplot(show.legend = FALSE)
```

**Faceted Histograms for Frequency Distributions**
```r
aatemp %>%
  mutate(month_num = month(DATE)) %>%
  ggplot(aes(x = TMAX, fill = factor(month_num))) +
  geom_histogram(binwidth = 5, show.legend = FALSE) +
  facet_wrap(~ month_num, nrow = 3)
```

**Ridgeline Plots for Sequential Shifts**
```
library(ggridges)
aatemp %>%
  mutate(month_num = month(DATE)) %>%
  ggplot(aes(x = TMAX, y = factor(month_num), fill = factor(month_num))) +
  geom_density_ridges(show.legend = FALSE, alpha = 0.8)
```

---
#  Consecutive Differences & Padding

R's built-in `diff()` function computes the differences between consecutive elements in a vector:

```r
v <- c(2, 4, 6, 7)
print(diff(v)) # Output: 2 2 1
```

* **The Length Trap**: `diff(v)` returns a vector of length **$N - 1$**.
* **The Padding Solution**: To store this as a new column in our dataset of length $N$, we pad the front of the difference vector with an `NA`:

```r
# Compute consecutive differences and pad with NA
temp_diff <- diff(aatemp$TMAX)
aatemp$temp_diff <- abs(c(NA, temp_diff))
```

---
#  Radial Calendar of Weather Volatility

**Mapping Volatile Jumps to a Radial Calendar**
```r
library(ggplot2)
library(dplyr)
library(lubridate)

# Compute daily temp jumps, filter for changes >10°F, and plot radial calendar
aatemp %>%
  mutate(temp_diff = abs(c(NA, diff(TMAX)))) %>%
  filter(temp_diff > 10) %>%
  ggplot(aes(x = yday(DATE))) +
  geom_histogram(binwidth = 5, fill = "orange", color = "white") +
  coord_polar() +
  theme_minimal() +
  labs(title = "Radial Annual Calendar of Volatile Temperature Jumps (>10°F)",
       x = "Day of Year (Radial Calendar)", y = "Volatile Jumps Count")
```

---
#  Sorting and Lumping Categorical Axes

By default, R sorts categorical axes alphabetically. The `forcats` package allows us to arrange labels logically:

* **`fct_infreq(f)`**: Sorts categories by their count frequency (largest first).
* **`fct_reorder(f, x, .fun)`**: Sorts categories based on median or mean values of a numeric column `x`.
* **`fct_lump_n(f, n)`**: Lumps all small categories together into a single `"Other"` group, keeping only the top `n` groups.

---
#  Sorting Bar Charts and Boxplots

**Reordering Bars by Frequency with `fct_infreq()`**
```r
library(ggplot2)
library(forcats)

# 1. Bar Chart sorted by frequency:
ggplot(mpg, aes(y = fct_infreq(class))) +
  geom_bar(fill = "steelblue") +
  theme_minimal()
```

**Reordering Boxplots by Numeric Values with `fct_reorder()`**
```r
# 2. Boxplot sorted by median highway mileage:
ggplot(mpg, aes(x = hwy, y = fct_reorder(manufacturer, hwy, .fun = median))) +
  geom_boxplot(fill = "aquamarine") +
  theme_minimal()
```

---
#  Lumping Rare Groups

**Lumping Rare Categories with `fct_lump_n()`**
```r
library(ggplot2)
library(forcats)

# Keep the top 4 manufacturers, group all others into 'Other Brands'
ggplot(mpg, aes(y = fct_lump_n(manufacturer, n = 4, other_level = "Other Brands"))) +
  geom_bar(fill = "tomato") +
  theme_minimal() +
  labs(title = "Top Car Manufacturers by Volume")
```

---
#  Saving Plots with `ggsave()`

Once you've built a premium plot, export it to disk with **`ggsave()`**, which automatically saves the *last plot* drawn:

<pre>
# Export a standard PNG
ggsave("my_plot.png")

# Export a publication-grade PDF with customized physical dimensions
ggsave(
  filename = "final_plots/mileage_report.pdf",
  width = 8,
  height = 6,
  units = "in",
  dpi = 300
)
</pre>

---
Let's test our understanding

<a href="/clicker/6690988403720192" target="_blank">/clicker/6690988403720192</a>

---
#  Summary

Apply these advanced guidelines when plotting multi-dimensional diagnostic graphics:

* **The factor() Rule**: Wrap numeric codes in `factor()` when plotting on axes expecting discrete categories (e.g., `geom_boxplot`).
* **High-Density alpha**: Use extremely low opacities (e.g. `1/100`) to expose hidden density patterns on massive tables.
* **vars() Syntax**: Use the modern `vars()` syntax when configuring multi-dimensional `facet_grid()` layouts.
* **Consecutive diff() Padding**: Always pad your difference vectors with `NA` (`c(NA, diff(x))`) when storing differences as table columns.
* **forcats Ordering**: Never display long categorical axes alphabetically. Use `fct_infreq()`, `fct_reorder()`, and `fct_lump_n()`.
