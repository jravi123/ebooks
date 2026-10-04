# Missing Value Handling & Diagnostics of Bad Visualizations

## Why Learn Diagnostics and Missing Value Handling?

In professional exploratory data analysis, you must master two separate domains of data quality control:
1. **Handling Missingness (Data Quality)**: How to spot, distinguish, and programmatically resolve gaps in your dataset before analysis or modeling.
2. **Designing Honest Visualizations (Presentation Quality)**: How to avoid critical plotting mistakes that distort trends, mislead audiences, or create cognitive overload.

In this chapter, we will learn how to diagnose and clean both explicit and implicit missing values, and study how to correct common visualization errors.

---

## Part 1: Advanced Missing Value Handling

Missing data is not always formatted as a simple, explicit blank cell. In the tidyverse, we classify missingness into two distinct categories:

* **Explicit Missingness**: A cell is explicitly populated with a missing marker (`NA`). This represents **the presence of an absence**.
* **Implicit Missingness**: A row of observation is completely omitted from the dataset. This represents **the absence of a presence**.

Let's look at a simple stock price dataset to understand this:

```r
library(tidyverse)

stocks <- tibble(
  year  = c(2020, 2020, 2020, 2020, 2021, 2021, 2021),
  qtr   = c(   1,    2,    3,    4,    2,    3,    4),
  price = c(1.88, 0.59, 0.35,   NA, 0.92, 0.17, 2.66)
)
print(stocks)
```

* **The Explicit Gap**: The stock price in `2020 Q4` is explicitly marked as `NA`.
* **The Implicit Gap**: The entire record for `2021 Q1` is completely missing from the table. It has no row.

---

### A. Dynamic Fill-Down: `tidyr::fill()`
When importing spreadsheets (like medical logs or ledger cards), cells are often left blank if they have the same value as the cell above them. We can fill these blank cells down using **`fill()`**:

```r
clinical_trials <- tribble(
  ~person,             ~treatment, ~response,
  "Derrick Whitmore",  1,          7,
  NA,                  2,          10,
  NA,                  3,          NA,
  "Katherine Burke",   1,          4,
  NA,                  2,          NA
)

# Fill in missing persons and responses using the last non-missing value
clinical_trials |>
  fill(person, response)
```

---

### B. Resolving Encoded Missing Values: `na_if()`
Legacy systems or raw space-separated text files often cannot represent blank `NA` values. Instead, they use a specific placeholder value (like `-99` or `-999`) to represent missing data. 

If you do not clean these, R will treat them as actual negative numbers, throwing off all your averages and standard deviations! We can replace them with true `NA` values using **`na_if()`**:

```r
raw_scores <- c(-99, 14, 18, -99, 15)

# Convert all -99 values to proper R NA markers
clean_scores <- na_if(raw_scores, -99)
print(clean_scores)
```

---

### C. Substituting Fixed Baselines: `coalesce()`
When an `NA` represents a known, baseline constant (like `0` sales on days with no transactions), you can replace all missing values with a default constant using **`coalesce()`**:

```r
daily_sales <- c(120, 150, NA, 180, NA)

# Replace all NA values with 0
filled_sales <- coalesce(daily_sales, 0)
print(filled_sales)
```

---

### Case Study: Titanic Passenger Missingness

On April 15, 1912, the RMS Titanic sank. Out of 2,224 passengers and crew, over 1,500 died due to a lack of lifeboats. Let's analyze a passenger log to study missing values:

```r
# Load the raw passenger log
titanic <- read.csv("https://storage.googleapis.com/mbcc/titanic.csv")
head(titanic)
```

#### Step 1: Audit Missing Passenger Ages
Let's find the total number of missing ages in our passenger log:
```r
# Calculate the sum of missing cells in the age column
sum(is.na(titanic$age))
```

#### Step 2: Calculate Average Age (Handling NAs)
If we try to calculate the average age directly using `mean(titanic$age)`, R will return `NA` because of the missing cells. We must tell R to ignore missing values using `na.rm = TRUE`:
```r
# Compute average passenger age, ignoring missing cells
mean_age <- mean(titanic$age, na.rm = TRUE)
print(mean_age)
```

#### Step 3: Mean Imputation
We can impute (fill in) the missing passenger ages by replacing their `NA` cells with the overall average passenger age:
```r
# Impute missing passenger ages using coalesce and the computed mean
titanic_clean <- titanic |>
  mutate(age = coalesce(age, mean(age, na.rm = TRUE)))

# Verify that there are no longer any NA values in the age column
sum(is.na(titanic_clean$age))
```

---

## Part 2: The Rules of Visual Excellence

When presenting data, you must design charts that are both **honest** (accurate representations of the values) and **readable** (easy for the human eye to interpret).

### The Seven Golden Rules:
1. **Label the axes clearly** and always include **measurement units**.
2. **Clarify all visual encodings** (color scales, point sizes, line styles).
3. **Use appropriate visual geometries** (e.g., don't use bar charts for continuous timelines).
4. **Use the simplest design possible** (minimize visual noise, maximize data-ink ratio).
5. **Always cite your data sources** and provide clear attributions.
6. **Maintain axis baselines** (bar charts must always start at 0).
7. **Limit discrete colors** (try to use under 5 colors to avoid overwhelming the reader).

---

## Part 3: Diagnosing Bad Visualizations & Redesigns

Let's study six common visualization errors and learn how to write correct `ggplot2` code to fix them.

---

### 1. Truncated Y-Axes on Bar Charts
#### The Mistake:
The height of a bar represents its magnitude. If you truncate the vertical axis (e.g., starting the y-axis at `4.4` instead of `0`), you exaggerate small differences, making a minor fluctuation look massive.

```r
# Create inflation data
inflation_data <- tibble(Year = 2021:2024, Value = c(5.51, 6.65, 4.38, 4.56))

# BAD: Exaggerates inflation changes by truncating the y-axis
ggplot(inflation_data, aes(x = factor(Year), y = Value)) + 
  geom_col(fill = "steelblue") +
  coord_cartesian(ylim = c(4.4, 7.0)) # BAD!
```

#### The Fix:
For bar charts, **always start the value axis at 0**. Alternatively, to show fine-grained temporal trends, switch to a **Line Chart**:

```r
# GOOD: Line charts show trends honestly, even on non-zero baselines
ggplot(inflation_data, aes(x = Year, y = Value)) + 
  geom_line(color = "darkblue", size = 1.2) +
  geom_point(size = 3) +
  scale_y_continuous(limits = c(0, 8)) +
  labs(title = "Annual Inflation Rates (2021-2024)", y = "Inflation Rate (%)", x = "Year")
```

---

### 2. Pie Chart Abuse (High Cardinality)
#### The Mistake:
Human eyes struggle to compare angles and areas accurately, especially when a pie chart is split into more than 3 or 4 slices. With many slices, the chart becomes impossible to read.

```r
# BAD: Trying to display 7 diamond colors on a polar coordinate system
diamonds |> 
  count(color) |>
  ggplot(aes(x = "", y = n, fill = color)) +
  geom_bar(stat = "identity", width = 1) +
  coord_polar("y") # BAD! Too many slices
```

#### The Fix:
Replace pie charts with a **Sorted Horizontal Bar Chart**. Bar charts align all categories along a shared baseline, allowing the eye to compare lengths instantly:

```r
# GOOD: Horizontal bar chart sorted by frequency
ggplot(diamonds, aes(x = color, fill = color)) +
  geom_bar() +
  labs(title = "Diamond Inventory by Color Grade", x = "Color Grade", y = "Count") +
  theme_minimal()
```

---

### 3. Legend Overload
#### The Mistake:
If you map a continuous numeric column to a discrete color factor, R is forced to create a separate color level for every unique decimal value. This creates a massive, unreadable legend.

```r
# BAD: Mapping a continuous variable (z) cast as a factor to color
diamonds |> 
  filter(carat > 2) |> 
  ggplot(aes(x = carat, y = price, color = factor(z))) + 
  geom_point() # BAD! Massive legend
```

#### The Fix:
Leave the variable as continuous and use a smooth, perceptually uniform color scale like **`scale_color_viridis_c()`**:

```r
# GOOD: Smooth continuous color gradient with a clean color ramp
diamonds |> 
  filter(carat > 2) |> 
  ggplot(aes(x = carat, y = price, color = z)) + 
  geom_point(alpha = 0.6) + 
  scale_color_viridis_c() +
  labs(title = "Large Diamond Prices by Depth Spec (z)", x = "Carat Weight", y = "Price (USD)", color = "Depth (z)")
```

---

### 4. 3D Distortion and Occlusion
#### The Mistake:
3D charts distort perspective and create occlusion (where data points in the front completely hide data points in the back), making it impossible to read values accurately.

```r
library(plot3D)

x <- y <- seq(-3, 3, length.out = 50)
z <- outer(x, y, function(x, y) x^2 + y^2)

# BAD: Distorts values and hides points in the back
persp3D(x, y, z, theta = 30, phi = 20)
```

#### The Fix:
Use 2D alternatives like **Contour Plots (`filled.contour()`)** or Heatmaps to show the same relationship cleanly:

```r
# GOOD: 2D contour plot maps values clearly without perspective distortion
filled.contour(x, y, z, color.palette = terrain.colors,
               xlab = "Dimension X", ylab = "Dimension Y", key.title = title("Z Value"))
```

---

### 5. Floating Baselines on Stacked Bar Charts
#### The Mistake:
Stacked bar charts stack segments on top of each other. Except for the very bottom segment, the baseline for the middle and top segments shifts constantly. This makes it impossible to compare their heights visually.

```r
# Create multi-platform user data
user_data <- tibble(
  Year = rep(2021:2023, each = 3),
  Platform = rep(c("Google", "Facebook", "Twitter"), 3),
  Users = c(250, 200, 150, 260, 240, 170, 310, 260, 200)
)

# BAD: Hard to compare Facebook and Twitter segments across years
ggplot(user_data, aes(x = factor(Year), y = Users, fill = Platform)) +
  geom_bar(stat = "identity") # BAD!
```

#### The Fix:
Switch to a **Line Chart** to compare categories on a shared baseline over time:

```r
# GOOD: Every platform starts from the same y-axis baseline
ggplot(user_data, aes(x = Year, y = Users, color = Platform)) +
  geom_line(size = 1.2) +
  geom_point(size = 3) +
  scale_x_continuous(breaks = 2021:2023) +
  labs(title = "User Growth Across Platforms (2021-2023)", y = "Users (Millions)", x = "Year") +
  theme_minimal()
```

---

### 6. Dodged Bar Clutter
#### The Mistake:
Using grouped ("dodged") bar charts to show time-series trends can create visual clutter, making it hard to follow the direction of changes.

```r
# BAD: Hard to follow temporal trends across dodged categories
ggplot(user_data, aes(x = factor(Year), y = Users, fill = Platform)) +
  geom_bar(stat = "identity", position = "dodge") # BAD!
```

#### The Fix:
Again, use a **Line Chart** to show temporal trends clearly and cleanly:

```r
# GOOD: Clear line paths are easy for the human eye to track
ggplot(user_data, aes(x = Year, y = Users, color = Platform)) +
  geom_line(size = 1.2) +
  labs(title = "Annual Platform User Volume Trends", y = "Users (Millions)", x = "Year") +
  theme_minimal() +
  scale_x_continuous(breaks = 2021:2023)
```

---

## Hands-on Exercises

### Exercise 1: Fixing a Gradient Legend
**How do different cylinder counts distribute across the joint relationship between engine displacement and highway fuel efficiency, and how can we prevent R from drawing a continuous gradient scale for distinct integer classes?**

*Analytical Guidance*:
Investigate the joint relationship between engine size and highway mileage across different cylinder counts in the `mpg` dataset. Your analysis should:
1. Create a scatter plot of displacement on the x-axis and highway mileage on the y-axis.
2. Color-code the points by the `cyl` column.
3. Fix the color scale: since cylinders are discrete integer groups (4, 5, 6, 8), wrap the column in **`factor()`** to force R to render discrete colors and a clean categorical legend instead of a continuous gradient.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = displ, y = hwy, color = factor(cyl))) +
  geom_point(size = 2.5, alpha = 0.8) +
  theme_minimal() +
  labs(
    title = "Fuel Efficiency vs. Displacement by Engine Cylinders",
    x = "Engine Displacement (Liters)",
    y = "Highway MPG",
    color = "Cylinder Count"
  )
```
</details>

---

### Exercise 2: Dodging Stacked Bars
**How did the volume of manufactured vehicles change between 1999 and 2008 across front-wheel, rear-wheel, and 4WD configurations, and how can we compare their volumes directly side-by-side?**

*Analytical Guidance*:
Evaluate the volume of manufactured vehicles across the different drivetrain configurations in both 1999 and 2008. Your analysis should:
1. Chart the count volume of vehicles in each year using distinct bars.
2. Group and position the drivetrain bars side-by-side within each year using **`position = "dodge"`** so that their absolute counts can be compared directly at a single glance, avoiding stacked bars that distort baseline comparisons.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = factor(year), fill = drv)) +
  geom_bar(position = "dodge") +
  theme_minimal() +
  labs(
    title = "Vehicle Volume Shift (1999 vs. 2008) by Drivetrain",
    x = "Calendar Year",
    y = "Total Vehicles",
    fill = "Drivetrain Configuration"
  )
```
</details>

---

### Exercise 3: Rescuing a Distorted Trend Line
**How does annual corporate product sales performance behave across years, and how can we present this honestly to avoid exaggerating small changes with a truncated vertical scale?**

*Analytical Guidance*:
Correct a distorted sales timeline. You are given this raw sales log:
`df <- tibble(Year = 2021:2023, Sales = c(120, 122, 125))`
Your analysis should:
1. Plot the sales timeline using a **Line Chart** to show the temporal trend honestly.
2. Ensure the vertical y-axis limits start at `0` (`scale_y_continuous(limits = c(0, 150))`) to provide an honest, accurate perspective of the growth trend over time, avoiding truncated scales that distort progress.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

df <- tibble(
  Year = 2021:2023,
  Sales = c(120, 122, 125)
)

ggplot(df, aes(x = Year, y = Sales)) +
  geom_line(color = "darkgreen", size = 1.2) +
  geom_point(size = 3, color = "darkgreen") +
  scale_y_continuous(limits = c(0, 150)) +
  scale_x_continuous(breaks = 2021:2023) +
  theme_minimal() +
  labs(
    title = "Honest Corporate Annual Product Sales Timeline",
    x = "Calendar Year",
    y = "Sales Units (Millions)"
  )
```
</details>
