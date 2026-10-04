# Facets & Coordinate Systems

## Why Learn Facets and Coordinates in Exploratory Data Analysis?

Imagine you are analyzing global shipping routes. You have a dataset of flight delays across dozens of airline carriers. You want to see the distribution of arrival delays for **each** carrier.

* If you try to overlay dozens of overlapping histograms on a single chart using different colors, the result is a messy "spaghetti plot" that is completely unreadable.
* If you use a single boxplot, you lose the detailed shapes of the distributions.

To solve this visual overload, you need **Facets** to split a single chart into multiple side-by-side subplots (one for each carrier). 

Additionally, if your carrier names are long text strings, they will overlap and smudge together on the horizontal axis. You need to rotate your layout using a **Coordinate Flip** to display the categories vertically and read them clearly. Let's learn how facets and coordinate modifications work.

---

## 1. Faceting: Splitting the Canvas

Faceting partitions your plot into a grid of subplots based on categorical columns, sharing the same x and y axes for easy comparison.

### Single Variable Facets: `facet_wrap()`
`facet_wrap(~ variable)` creates a 1D sequence of panels wrapped into a 2D grid. The tilde symbol `~` means "by".

**How does the relationship between engine size and fuel efficiency vary across different vehicle classes when viewed side-by-side?**
```r
library(tidyverse)

# Split scatter plot of displ vs hwy into separate panels for each car class
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point() +
  facet_wrap(~ class)
```

You can control the arrangement of subplots using `nrow` (number of rows) and `ncol` (number of columns):

**What is the horizontal distribution of engine size vs. fuel efficiency across vehicle classes when aligned in a single row?**
```r
# Force the panels to render in a single row
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point() +
  facet_wrap(~ class, nrow = 1)
```

### Independent Axis Scaling: `scales = "free"`
By default, all faceted panels share identical x and y scales. This is a critical design choice because it allows for fair, direct comparisons across all subplots.

However, if some of your categories have extremely large values (like a major airline carrier with 10,000 flights) and others are very small (a carrier with 10 flights), keeping the vertical y-axis identical forces the small category’s distribution to flatten into an unreadable line.

To let each panel set its own axis limits dynamically, use the `scales` argument:
*   `scales = "free_x"`: Allows the horizontal axis to vary independently.
*   `scales = "free_y"`: Allows the vertical axis to vary independently.
*   `scales = "free"`: Allows both axes to scale independently.

**How do we visualize the distribution of flight counts across highly unequal carriers without flattening smaller subgroups?**
```r
# Allow each carrier panel to set its own y-axis limits
ggplot(flights, aes(x = arr_delay)) +
  geom_density() +
  facet_wrap(~ carrier, scales = "free_y")
```

> [!CAUTION] The Analytical Danger of Free Scales
> While `scales = "free"` is excellent for zooming in on the local shape of each subgroup, it carries a major risk: **it can easily mislead stakeholders**. Because the axis boundaries differ across panels, a minor, insignificant trend in a compact subplot can look visually identical to a massive, critical trend in a wide subplot. Always add clear subtitle warnings when using free scales!

### Faceting by Multiple Columns
You can combine multiple categorical variables in `facet_wrap()` using the `+` operator:

**How do city and highway fuel efficiency interact across different combinations of vehicle class and drivetrain configuration?**
```r
# Facet by both car class and drive train (drv)
ggplot(mpg, aes(x = cty, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.5) +
  facet_wrap(~ class + drv)
```

### Two Variable Grid Facets: `facet_grid()`
`facet_grid(row_variable ~ column_variable)` creates a 2D matrix of subplots, cross-tabulating two categorical columns:

**How does engine size affect highway fuel efficiency across a 2D matrix of drivetrain types (rows) and cylinder counts (columns)?**
```r
# Rows represent drive train types (drv), columns represent cylinder counts (cyl)
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point() +
  facet_grid(drv ~ cyl)
```

#### Modern `vars()` Syntax inside `facet_grid()`
In modern R programming, you can also use the `vars()` helper to specify row and column groupings instead of formula notation:

**How do the individual data subsets compare when we use an alternative matrix representation for drivetrain and cylinder categories?**
```r
# Equivalent to drv ~ cyl but using modern vars() syntax
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point() +
  facet_grid(rows = vars(drv), cols = vars(cyl))
```

---

## 2. Advanced Diagnostic Geometry Rules

To build flawless diagnostic visualizations, you must master how R handles data types and overplotting on the canvas:

### A. Geometries Expecting Categorical Mappings (`factor()`)
When using geometries designed for discrete groupings (like `geom_boxplot()` or `geom_violin()`), R expects a categorical variable on the grouping axis. 

If you map a numeric variable like cylinders (`cyl` which has integer values 4, 6, 8) to the grouping axis, R treats it as a single continuous axis, rendering a single, wide, meaningless box spanning the entire horizontal range.

To force R to treat numeric categories as distinct groups, wrap the numeric column in **`factor()`**:

**What is the overall distribution of city mileage across the entire dataset when cylinder counts are not grouped into distinct categories?**
```r
# Incorrect: Treats cyl as continuous, rendering a single massive box plot
ggplot(mpg, aes(x = cyl, y = cty)) +
  geom_boxplot()
```

**What are the median, range, and outlier profiles of city mileage for each distinct cylinder count category?**
```r
# Correct: Treats cyl as 3 distinct discrete categories
ggplot(mpg, aes(x = factor(cyl), y = cty)) +
  geom_boxplot()
```

> [!NOTE] Tukey's Outlier Threshold & Boxplot Anatomy
> A boxplot summarizes continuous data into five critical points:
> 1. **Median (Q2 / 50th Percentile)**: The thick horizontal line dividing the box into two halves.
> 2. **Lower Quartile (Q1 / 25th Percentile)**: The bottom edge of the box.
> 3. **Upper Quartile (Q3 / 75th Percentile)**: The top edge of the box.
> 4. **Interquartile Range (IQR)**: The height of the box ($IQR = Q3 - Q1$), representing the middle 50% of the data.
> 5. **Whiskers**: Vertical lines extending from the box to the smallest and largest values that lie within the **outlier boundary**.
>
> R uses **John Tukey's 1.5 × IQR rule** to programmatically classify outliers:
> - **Lower Outlier Boundary** = $Q1 - 1.5 \times IQR$
> - **Upper Outlier Boundary** = $Q3 + 1.5 \times IQR$
> Any observation that lies beyond these boundaries is plotted individually as a discrete outlier dot.

### B. When Jittering Fails: High-Density Transparency (`alpha`)
When analyzing extremely large datasets (like `diamonds` which has 53,940 rows), scatter plots suffer from severe **overplotting** where points stack directly on top of each other, forming a single solid black blob.

While adding random noise using `geom_jitter()` works beautifully for small integer coordinates, it fails completely on dense datasets because the canvas remains completely saturated.

The ultimate solution for high-density overplotting is **extremely low opacity (`alpha`)**. By setting `alpha` to a fraction (like `1/100` or `0.01`), individual points become virtually invisible, and color only builds up where hundreds of points overlap, beautifully revealing dense clusters:

**What is the relationship between carat and price in a high-density dataset of over fifty thousand diamonds when standard scatter points overlap?**
```r
# 1. Jittering fails on 50,000+ points (remains a saturated black mass):
ggplot(diamonds, aes(carat, price)) +
  geom_jitter()
```

**Where are the dense pricing thresholds and clusters of diamonds concentrated across different carat ranges?**
```r
# 2. High-density alpha (1/100) perfectly reveals the density gradients:
ggplot(diamonds, aes(carat, price)) +
  geom_point(alpha = 1/100)
```

---

## 3. Coordinate Systems

A coordinate system maps positions on the chart canvas to physical screen locations. R defaults to standard Cartesian coordinates, but provides alternative systems.

### Axis Flipping: `coord_flip()`
Flipping the x and y axes is the easiest way to display horizontal bar charts or boxplots, especially when categorical labels are long:

**What is the volume of vehicles across different classes when displayed on a standard vertical category axis?**
```r
# Default: Labels overlap on the bottom
ggplot(mpg, aes(x = class)) +
  geom_bar()
```

**What is the volume of vehicles across different classes when presented on a horizontal category axis?**
```r
# Flipped: Labels are horizontal and easy to read
ggplot(mpg, aes(x = class)) +
  geom_bar() +
  coord_flip()
```

### Polar Coordinates: `coord_polar()`
Polar coordinates express data points in terms of an **angle** and a **distance (magnitude)** from the center. Applying `coord_polar()` to a bar chart or a violin plot wraps the layout radially:

**What is the proportional share of each vehicle class within the overall dataset when represented as angular slices of a whole?**
```r
# Simple stacked bar transformed into a polar chart
ggplot(mpg, aes(x = factor(1), fill = class)) +
  geom_bar(width = 1) +
  coord_polar(theta = "y")
```

---

## 4. Real-World Case Study: Seasonal Volatility in Polar Coordinates

In environmental data science, time and seasonal data are naturally circular. We can use polar coordinates to visualize seasonal temperature swings and find when massive daily weather jumps occur during the year.

We will use a daily weather dataset from the University of Michigan weather station in Ann Arbor, MI (`ANN ARBOR U OF MICH, MI US`), fetched from the live remote URL:
`https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv`

Since this dataset has been pre-filtered for the U of Mich station and arranged chronologically, we can load it directly and begin our analysis immediately:

```r
library(tidyverse)
library(lubridate)

# Load the cleaned daily weather dataset
aatemp <- read_csv("https://raw.githubusercontent.com/jravi123/datasets/refs/heads/main/datasets/aatemp.csv")

glimpse(aatemp)
```

### Step 1: Choosing a Distribution Chart & Plotting Monthly Seasonality
To see how temperature distributions behave seasonally, we use `lubridate`'s `month()` function to extract the month number (1 to 12) from our daily dates. Since month numbers are numeric, we must wrap them inside `factor()` to group our continuous temperature data by month.

But which distribution visualization should we choose? Let's compare the four primary types of continuous grouping charts:

| Chart Type & Icon | How It Works | Why It Fits (or Fails) Our Weather Dataset | Best Use Case Scenario |
| :--- | :--- | :--- | :--- |
| 🎻 **Violin Plot** (`geom_violin`) | Combines a box plot with a mirrored kernel density estimation curve, showing full distribution shape. | **Perfect Fit!** It highlights that summer months have a narrow, tight peak (predictable heat), while spring/fall are "fat" in the middle (highly variable transition periods). | Visualizing and comparing the complete distribution shape across multiple groups (e.g., months, categories). |
| 📦 **Box Plot** (`geom_boxplot`) | Shows a 5-number summary (Min, Q1, Median, Q3, Max) with box and whiskers, plotting outliers as dots. | **Good, but limited.** It shows median and range perfectly, but hides bimodal shapes or structural details (e.g., if a month has two typical temperature clusters). | Quick, standardized comparison of center, spread, and outlier detection across many groups. |
| 📊 **Histogram** (`geom_histogram`) | Divides values into equal-width intervals (bins) and counts how many values fall into each bin. | **Fails for comparisons.** To see 12 months, you would have to draw 12 overlapping histograms or facet 12 panels, which causes extreme visual clutter. | Exploring the detailed shape and frequency count of a single continuous variable. |
| 🏔️ **Ridgeline Plot** (`ggridges`) | Stacks overlapping density curves vertically (resembling mountain ridges). | **Excellent alternative.** It displays monthly distribution shifts vertically with a dramatic, artistic 3D-stacked appearance. | Visualizing gradual distribution shifts over a sequential variable (like years, days, or months). |

#### 🎻 Plotting Our Winner: The Violin Plot
Since the violin plot gives the most honest, high-fidelity view of monthly temperature fluctuations, we will plot it first. We use `mutate()` to calculate `month_num` inline so the block is completely self-contained:

**What does the shape and density of monthly maximum temperatures in Ann Arbor reveal about seasonal variability?**
```r
# Extract month and plot distributions inline
aatemp %>%
  mutate(month_num = month(DATE)) %>%
  ggplot(aes(x = factor(month_num), y = TMAX)) +
  geom_violin(aes(fill = factor(month_num)), show.legend = FALSE) +
  theme_minimal() +
  labs(title = "Monthly Temperature Distribution (Ann Arbor, MI Area)",
       x = "Month", y = "Max Temperature (F)")
```
* **Observation**: Notice the massive temperature swings (high variability) during the winter (Month 1, 12) and transitional spring/fall months, while summer temperatures are tightly clustered and predictable.

#### 📦 Alternative 1: Box Plot
If we wanted a simpler box plot instead of a violin, we would use the exact same aesthetic mapping but change the geom to `geom_boxplot()`:

**How do the median, quartiles, and range of monthly temperatures compare across the year?**
```r
aatemp %>%
  mutate(month_num = month(DATE)) %>%
  ggplot(aes(x = factor(month_num), y = TMAX, fill = factor(month_num))) +
  geom_boxplot(show.legend = FALSE) +
  theme_minimal() +
  labs(title = "Monthly Temperature Box Plots", x = "Month", y = "TMAX (F)")
```

#### 📊 Alternative 2: Faceted Histogram
If we wanted to see exact temperature counts using histograms, we would map `TMAX` to the x-axis and use `facet_wrap()` to split the data into 12 individual panels:

**What are the exact frequency counts of daily maximum temperatures within each of the twelve months?**
```r
aatemp %>%
  mutate(month_num = month(DATE)) %>%
  ggplot(aes(x = TMAX, fill = factor(month_num))) +
  geom_histogram(binwidth = 5, show.legend = FALSE, color = "white") +
  facet_wrap(~ month_num, nrow = 3) +
  theme_minimal() +
  labs(title = "Faceted Monthly Histograms", x = "TMAX (F)", y = "Count")
```

#### 🏔️ Alternative 3: Ridgeline Plot (Requires `ggridges` package - Desktop R only)
> [!CAUTION] webR / Browser Sandbox Limitation
> The `ggridges` package is an external, third-party package and is **not pre-compiled or available in sandboxed webR/browser-based interactive environments**.
> 
> To run ridgeline plots, you must use a **local desktop installation of RStudio** where you can run `install.packages("ggridges")` first.

**How do the monthly temperature peaks and distribution shapes transition across seasons from January to December?**
```
library(ggridges)

# Continuous TMAX on x-axis, grouping month factor on y-axis
aatemp %>%
  mutate(month_num = month(DATE)) %>%
  ggplot(aes(x = TMAX, y = factor(month_num), fill = factor(month_num))) +
  geom_density_ridges(show.legend = FALSE, alpha = 0.8) +
  theme_minimal() +
  labs(title = "Monthly Ridgeline Plots", x = "TMAX (F)", y = "Month")
```

### Step 2: Computing Consecutive Daily Differences (`diff()`)
R has a built-in `diff(x)` function that computes the difference between consecutive vector values:

```r
v <- c(2, 4, 6, 7)
print(diff(v)) # Output: 2 2 1
```

Note that `diff(v)` returns a vector of length **$N - 1$** (since there is no "previous value" for the first entry). To add this as a new column in our dataset of length $N$, we must **pad the beginning of our difference vector with an `NA`**:

```r
# Compute daily temperature differences and pad with NA
temp_diff <- diff(aatemp$TMAX)
aatemp$temp_diff <- abs(c(NA, temp_diff))
```

### Step 3: Visualizing Seasonal Volatility on a Radial Calendar
Let's define a "volatile weather jump" as when the maximum temperature changes by **more than 10 degrees** from one day to the next.

By filtering our dataset for these volatile jumps, plotting a histogram of their day of the year (`yday(DATE)`, which goes from 1 to 365), and applying `coord_polar()`, we create a beautiful **annual radial clock** showing exactly when weather is most volatile:

**On which days of the year does weather show the greatest daily volatility in temperature?**
```r
# Compute daily jumps, filter for changes >10°F, and plot radial calendar
aatemp %>%
  mutate(temp_diff = abs(c(NA, diff(TMAX)))) %>%
  filter(temp_diff > 10) %>%
  ggplot(aes(x = yday(DATE))) +
  geom_histogram(binwidth = 5, fill = "orange", color = "white") +
  coord_polar() +
  labs(title = "Annual Radial Clock of Volatile Weather Jumps (>10°F)",
       x = "Day of Year (Radial Calendar)", y = "Count")
```
* **Observation**: This stunning visualization proves that extreme weather volatility is heavily concentrated in the spring (roughly days 60 to 120) and autumn (roughly days 270 to 330), while winter and summer remain highly stable!

---

## Hands-on Exercises

### Exercise 1: Engine Class Breakdown
**How does the relationship between engine size and highway mileage differ across front-wheel, rear-wheel, and 4WD configurations, and which vehicle classes dominate each category?**

*Analytical Guidance*:
Investigate how engine displacement and highway fuel efficiency interact across different vehicle drivetrains. Your analysis should:
1. Examine the displacement vs. highway mileage coordinates.
2. Distinctly identify the vehicle class for each observation using color.
3. Partition the observations into side-by-side drivetrain panels in a single horizontal row to isolate and compare their respective performance patterns.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = displ, y = hwy, color = class)) +
  geom_point() +
  facet_wrap(~ drv, nrow = 1)
```
</details>

---

### Exercise 2: Flipped Sales Statistics
**How does highway mileage distribute across different vehicle classes, and how can we present these distributions side-by-side when category labels are long?**

*Analytical Guidance*:
Compare the central tendencies, ranges, and outlier profiles of highway mileage across all vehicle classes in the `mpg` dataset. Your analysis should:
1. Compare the distribution shapes side-by-side using boxes filled by vehicle class.
2. Present the categories on a horizontal layout where all class labels are fully horizontal and easily readable without overlap.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = class, y = hwy, fill = class)) +
  geom_boxplot() +
  coord_flip()
```
</details>
