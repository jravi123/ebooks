# Aesthetic Mappings & Geoms

## Why Learn Data Visualization in Exploratory Data Analysis?

Before running statistical tests or building machine learning models, you must look at your data. 

Imagine you are analyzing a dataset of used cars. You want to understand if larger engines (larger displacement) always result in poorer fuel efficiency (lower highway miles per gallon). If you look at a spreadsheet of 10,000 rows, your brain cannot identify the trend. 

If you construct a scatter plot placing engine size on the x-axis and miles per gallon on the y-axis, the relationship becomes instantly clear: as engine size increases, fuel efficiency decreases. 

In R, data visualization is built on the **Grammar of Graphics**, implemented in the **`ggplot2`** package (part of the `tidyverse`). In this lesson, we will explore how to map data columns to visual attributes and create core geometric charts.

---

## 1. The Grammar of Graphics

The Grammar of Graphics is a systematic way of building charts layer-by-layer. A `ggplot2` chart consists of:
1. **Data**: The data frame/tibble containing the variables.
2. **Aesthetic Mapping (`aes`)**: Connecting columns to visual variables (x position, y position, color, shape, size).
3. **Geometric Layers (`geom_*`)**: The actual marks drawn on the screen (points, lines, bars, boxes).
4. **Statistical Transformations (`stat_*`)**: Calculations performed on the data before plotting (e.g. counting rows for bars, calculating quartiles for boxplots).
5. **Coordinate Systems**: How points are arranged spatially (e.g. Cartesian, Polar).
6. **Facets**: Breaking a single plot into multiple side-by-side subplots.
7. **Themes**: Text, labels, background colors, and style properties.

---

## 2. Creating Your First ggplot: Scatter Plots

To create a plot, call `ggplot(data, mapping = aes(x, y))` to initialize the canvas, then add a geometric layer using the `+` operator.

> [!IMPORTANT] Use the Plus `+` Operator
> In R-EDA visualization, we use the **`+`** operator to add layers to a ggplot object, **not** the pipe operator `|>`.

**How does highway fuel efficiency behave as vehicle engine size increases?**
```r
library(tidyverse)

# Initialize canvas with mpg dataset (bundled with ggplot2)
# and add a scatter plot layer of engine size (displ) vs highway mileage (hwy)
ggplot(data = mpg, mapping = aes(x = displ, y = hwy)) +
  geom_point()
```

### Alternative Syntax Options
R developers often write the data first or pipe it directly into `ggplot()`:

```r
# Positional arguments: data is first, aes mapping is second
ggplot(mpg, aes(x = displ, y = hwy)) + geom_point()

# Piping data frame into ggplot
mpg |> 
  ggplot(aes(x = displ, y = hwy)) + 
  geom_point()
```

### Understanding the Pipe Operators: `|>` vs. `%>%`

When you see `mpg |> ggplot(...)`, you are seeing the **pipe operator** in action. A pipe takes the output of the expression on its left and passes it as the *first argument* to the function on its right. 

In R, there are two main pipe operators you will encounter in data science code:

1. **The Native Pipe (`|>`)**:
   * Introduced in R 4.1 (released in 2021).
   * Built directly into the base R language, meaning it requires no extra packages to run.
   * Extremely fast, lightweight, and modern.
   
2. **The Magrittr Pipe (`%>%`)**:
   * Part of the `magrittr` package (and automatically loaded with `library(tidyverse)`).
   * The historical standard used in R for nearly a decade before the native pipe was created.
   * Still heavily present in older tutorials, stack overflow answers, and legacy codebases.

#### Key Differences Between `|>` and `%>%`

| Feature | Native Pipe (`\|>`) | Magrittr Pipe (`%>%`) |
| :--- | :--- | :--- |
| **Origin** | Base R (Built-in) | `magrittr` package (`tidyverse`) |
| **Syntax** | `\|>` | `%>%` |
| **Requirements** | R version 4.1 or higher | Must load `library(tidyverse)` |
| **Placeholders** | Uses `_` (e.g., `x \|> f(y, _)` in R 4.2+) | Uses `.` (e.g., `x %>% f(y, .)` ) |
| **Performance** | Faster (evaluated at compile-time) | Slightly slower (evaluated at runtime) |

#### Piping to Other Argument Positions (Placeholders)

By default, both pipe operators pass the left-hand side as the **first** argument of the function on the right. For example, `mpg |> ggplot()` is equivalent to `ggplot(mpg)`.

But what if you want to pass the data as the **second** or **third** argument? This is extremely common in statistical functions (like fitting models with `lm(formula, data)`), where the dataset is the *second* parameter.

To handle this, both pipes offer a **placeholder variable** to specify exactly where the left-hand data should go:

##### 1. The Magrittr Placeholder (`.`)
The `magrittr` pipe (`%>%`) uses a single dot **`.`** as its placeholder. This dot can be placed anywhere, even multiple times, inside positional arguments:
```r
# Fits a linear model: hwy predicted by engine size (displ)
# The '.' placeholder passes the 'mpg' dataset as the second argument (data)
mpg %>% lm(hwy ~ displ, data = .)
```

##### 2. The Native Placeholder (`_`)
The native R pipe (`|>`) uses an underscore **`_`** as its placeholder (introduced in R 4.2). 
* **Important Rule**: To prevent syntax errors, the native placeholder `_` **must be passed as a named argument**. You cannot use it as a raw positional placeholder.
```r
# Correct: The argument is explicitly named 'data = _'
mpg |> lm(hwy ~ displ, data = _)

# Incorrect: Will trigger a syntax error!
# mpg |> lm(hwy ~ displ, _)
```

#### Best Practice Rule
In modern R programming, **prefer the native pipe (`|>`)** for all new projects because it is standard, faster, and does not depend on any third-party library. However, you should easily recognize `%>%` when reading other people's data science code, as they perform the exact same core task of chaining code sequentially.

---

## 3. Aesthetic Mappings: Color, Shape, and Size

Aesthetic mappings are placed inside `aes()`. They instruct R to vary the color, shape, or size of points based on values in a specific column.

**How does vehicle class explain the relationship between engine size and highway fuel efficiency?**
```r
ggplot(mpg, aes(x = displ, y = hwy, color = class)) +
  geom_point()
```

**How do engine displacement, cylinder counts, and vehicle classes interactively affect highway fuel efficiency?**
```r
ggplot(mpg, aes(x = displ, y = hwy, color = class, size = cyl)) +
  geom_point()
```

### The Categorical Factor Level Rule
By default, R treats numbers (like `cyl` which has values 4, 6, 8) as continuous and displays them on a gradient scale. To treat a numerical column as distinct categorical classes, convert it to a factor using `factor()`:

**What are the distinct highway fuel efficiency profiles for vehicles grouped by their exact number of engine cylinders?**
```r
# Treat cylinders (cyl) as discrete categories rather than a numeric scale
ggplot(mpg, aes(x = displ, y = hwy, color = factor(cyl))) +
  geom_point()
```

### Global Aesthetics vs. Constant Overrides
If you want to apply a style to **all** points (e.g., making all dots green and larger), pass these style parameters **outside** of the `aes()` parentheses directly inside the `geom` function:

**What is the general distribution of engine size and highway fuel efficiency across all vehicles when displayed with uniform, high-contrast markers?**
```r
# Correct: Constant overrides belong outside aes()
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(color = "darkgreen", size = 3, alpha = 0.5)

# Incorrect: Do not place constants inside aes()
# ggplot(mpg, aes(x = displ, y = hwy, color = "blue")) + geom_point()
# (This creates a dummy category named "blue" rather than coloring points blue!)
```

---

## 4. Jittering: Handling Overplotting

When plotting datasets with integer values or overlapping coordinates (e.g., engine sizes rounded to decimals), points often stack directly on top of each other. This is called **overplotting**.

To reveal overlapping data points, add random noise using `position = "jitter"` or the **`geom_jitter()`** geom:

**Where are the dense coordinates and clusters of vehicles concentrated across different combinations of engine size and highway mileage?**
```r
# Jittered scatter plot
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.6)
```

---

## 5. Core Geometries: Line Charts, Boxplots, and Bar Charts

Choosing the correct geometric layer depends heavily on whether your variables are categorical or continuous, and whether your data has a sequential structure:

### Line Charts (`geom_line`)
Line charts are designed for **ordered, sequential data** (typically time series where there is a single $y$ value for each sequential $x$ coordinate):

**How has the personal savings rate in the United States fluctuated over time?**
```r
# Correct: Personal savings rate over time (using the built-in economics dataset)
ggplot(economics, aes(x = date, y = psavert)) +
  geom_line(color = "darkgreen") +
  labs(x = "Date", y = "Personal Savings Rate (%)")
```

### Box Plots (`geom_boxplot`)
Perfect for comparing the distribution (median, quartiles, and range) of a continuous variable across different categorical levels:

**How does the distribution of highway mileage vary across different vehicle classes?**
```r
# Highway mileage distribution by car class
ggplot(mpg, aes(x = class, y = hwy)) +
  geom_boxplot(fill = "lightblue")
```

### Bar Charts (`geom_bar` vs. `geom_col`)

Bar charts represent the magnitude of categorical data using vertical or horizontal rectangular bars. In `ggplot2`, there are two separate geometries for drawing bars depending on how your input data is structured:

#### 1. Counting Raw Frequencies (`geom_bar`)
If your dataset contains individual rows of observations, and you want R to **automatically count** how many times each category occurs, use `geom_bar()`. Do *not* specify a `y` aesthetic because the y-axis is calculated automatically on-the-fly:
**How many car models of each vehicle class are represented in our dataset?**
```r
# Count how many cars are in each category class
ggplot(mpg, aes(x = class)) +
  geom_bar(fill = "steelblue")
```

#### 2. Plotting Pre-calculated Values (`geom_col`)
If your dataset already contains a column with the pre-calculated heights/values you want to plot, use `geom_col()`. This **requires both** an `x` aesthetic (the categories) and a `y` aesthetic (the bar heights):
**What is the cumulative highway mileage of all vehicles within each class when summed together?**
```r
# Plotting pre-calculated values
ggplot(mpg, aes(x = class, y = hwy, fill = class)) +
  geom_col() +
  labs(y = "Sum of Highway Mileage")
```

#### 3. Overriding the Default Stat (`stat = "summary"`)
If you want to plot a bar chart representing a group average (like the *mean* highway mileage of each class) but your dataset contains individual rows instead of pre-calculated means, you don't need to summarize the table manually. 

Instead, you can use `geom_bar()` and override its default stat from `"count"` to `"summary"`, specifying your summarizing function using `fun`:
**What is the average highway mileage for each vehicle class computed dynamically?**
```r
# Calculate and plot the mean mileage of each category dynamically on-the-fly:
ggplot(mpg, aes(x = class, y = hwy)) +
  geom_bar(stat = "summary", fun = "mean", fill = "steelblue") +
  labs(title = "Mean Highway Mileage per Class", y = "Mean Mileage")
```

### Heatmaps (`geom_tile`)

Heatmaps represent 3-dimensional data in a 2-dimensional grid coordinate space, where the color of each grid cell (tile) varies dynamically based on the value of a continuous variable mapped to the `fill` aesthetic.

A standard heatmap uses `geom_tile()`, mapping categorical or binned continuous coordinates to `x` and `y`, and a numeric score to `fill`:

**What is the 2D joint density distribution of eruption duration and waiting time for the Old Faithful geyser?**
```r
# Old Faithful density heatmap
# 'eruptions' -> X axis, 'waiting' -> Y axis, 'density' -> cell fill color
ggplot(faithfuld, aes(x = eruptions, y = waiting, fill = density)) +
  geom_tile() +
  scale_fill_viridis_c() +  # Adds a beautiful modern color scale
  labs(title = "Old Faithful Geyser Eruption Density",
       x = "Eruption Duration (minutes)",
       y = "Waiting Time to Next Eruption (minutes)")
```

---

## 6. On-the-fly Statistical Summaries

`ggplot2` allows you to overlay computed statistics directly onto the chart to summarize noisy raw values.

### Trend Lines: `geom_smooth()`
To draw a fitted trend line (regression line or smoothed local regression line) over your raw scatter points:

**What is the overall smoothed trend of highway mileage relative to engine size?**
```r
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.3) +
  geom_smooth() # Adds an adaptive smooth trend line with confidence intervals
```

#### Understanding `method = "lm"` vs. Default Smoothing

If you omit the `method` argument or explicitly add `method = "lm"`, you will notice that the resulting trend lines look completely different:

1. **Default (No `method` specified)**:
   * **The Algorithm**: For smaller datasets (fewer than 1,000 points), `ggplot2` defaults to **`method = "loess"`** (Locally Estimated Scatterplot Smoothing). For larger datasets, it defaults to **`method = "gam"`** (Generalized Additive Models).
   * **The Behavior**: This produces a **flexible, wavy, non-linear curve** that bends and twists to follow local clusters of data points.
   * **When to Use**: Best for exploratory analysis to identify non-linear relationships, curves, or sudden changes in trends.

2. **Linear Model (`method = "lm"`)**:
   * **The Algorithm**: Fits a standard **ordinary least squares linear regression model** ($y = \beta_0 + \beta_1 x$).
   * **The Behavior**: This produces a **perfectly straight line** representing a constant global slope.
   * **When to Use**: Best when you want to model a constant global linear relationship, test linear modeling assumptions, or show simplified directions.

**What is the direct linear trend line between engine size and highway mileage?**
```r
# Perfect Straight Line (OLS Linear Regression):
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.3) +
  geom_smooth(method = "lm", color = "red")
```

#### Controlling the Confidence Interval Band: the `se` Parameter

By default, `geom_smooth()` calculates and displays a translucent grey ribbon surrounding the trend line. This is the **Standard Error (SE)** confidence interval (typically representing a 95% confidence interval).

* **`se = TRUE` (Default)**: Displays the standard error ribbon. The width of the ribbon indicates statistical uncertainty: in regions of the x-axis where data points are sparse, the band becomes noticeably wider, signaling that the estimated trend line is less certain.
* **`se = FALSE`**: Hides the grey ribbon, displaying **only** the trend line itself. This is highly recommended when you are plotting multiple trend lines on the same coordinate plane, as overlaying multiple grey ribbons would quickly clutter the plot and make it unreadable.

**What is the direct linear scaling relationship between engine size and highway mileage?**
```r
# Perfect Straight Line with the Standard Error ribbon HIDDEN:
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.3) +
  geom_smooth(method = "lm", se = FALSE, color = "red")
```

### Custom Summaries: `stat_summary()`
Instead of using default geoms, you can use `stat_summary()` to compute and plot custom mathematical summaries dynamically on-the-fly.

#### 1. Point Summaries
To plot a single graphical mark representing a statistical function of your categorical groups (such as adding a large red point representing the group mean over a boxplot):

**How do the exact mean values of highway mileage compare to the median and quartile ranges within each vehicle class?**
```r
ggplot(mpg, aes(x = class, y = hwy)) +
  geom_boxplot() +
  # Add mean points computed dynamically on the fly
  stat_summary(fun = mean, size = 3, color = "red", geom = "point")
```

#### 2. Replacing Numerical Summary Tables with Visual Intervals
We often include summary tables in academic reports to show the range (minimum, maximum) and center (median or mean) of our data groups. You can easily replace these bulky tables with a clean, elegant visual interval plot.

By defining `fun.min`, `fun.max`, and `fun` inside `stat_summary()`, R will calculate these group-level metrics dynamically and draw them as vertical point-range bars:

**What are the median, minimum, and maximum highway mileage bounds for each vehicle class?**
```r
# Visual replacement for a summary table (showing min, max, and median):
ggplot(mpg, aes(x = class, y = hwy)) +
  stat_summary(
    fun.min = min,
    fun.max = max,
    fun = median,
    color = "darkblue",
    size = 0.8
  ) +
  labs(title = "Median and Range (Min to Max) of Highway Mileage by Class")
```

---

## 7. Multi-layered Mappings and Line Styles (`lty`)

In standard plots, you map a single variable to `y` globally. However, you can overlay **multiple different continuous y-variables** on a single $x$-axis by defining separate `y` aesthetics inside individual geometry layers rather than inside the global `ggplot()` function.

To distinguish different trend lines visually, you can also customize the **line type** parameter (**`lty`** or `linetype`, where `1` represents a solid line, and `2` represents a dashed line):

**How do city and highway fuel efficiency compare across different engine sizes?**
```r
# Plot both highway (hwy) and city (cty) trends on the same engine size (displ) axis:
ggplot(mpg, aes(x = displ)) +
  # 1. Plot raw points for both mileage variables with distinct colors
  geom_point(aes(y = hwy), color = "orange", alpha = 0.4, position = "jitter") +
  geom_point(aes(y = cty), color = "blue", alpha = 0.4, position = "jitter") +
  
  # 2. Add smoothed trend lines with distinct colors and line-types
  geom_smooth(aes(y = hwy), lty = 1, color = "black", se = FALSE) + # Solid line
  geom_smooth(aes(y = cty), lty = 2, color = "red", se = FALSE)     # Dashed line
```

---

## 8. Chart Selection & Diagram Diagnostics (Thinking Like a Data Scientist)

As a data scientist, you must not only know the syntax to build a chart, but also how to choose the right representation and identify when a diagram is conceptually wrong or misleading.

### A. Identifying a Wrong Diagram: The Jagged Line and Looping Spaghetti Traps
A common beginner mistake is using line geometries (`geom_line()` or `geom_path()`) on unordered continuous variables:

**Analyst Question (The Jagged Line Trap): What happens when we use geom_line on a dataset with multiple y-values for each x-value?**
```r
# 1. THE JAGGED LINE TRAP: geom_line()
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_line()
```

**Analyst Question (The Spaghetti Trap): What happens when we use geom_path on a dataset that is not sorted by the x-variable?**
```r
# 2. THE LOOPING SPAGHETTI TRAP: geom_path()
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_path()
```

* **The `geom_line()` Trap**: Even though `geom_line()` automatically sorts your data from left to right along the x-axis, there are **multiple overlapping y-values** for a single x-coordinate (e.g., several cars have `2.0`L engine size). This forces R to draw rapid vertical segments up and down between all overlapping points before moving to the next step, resulting in a wildly jagged vertical **"cage"** of lines.
* **The `geom_path()` Trap**: Unlike `geom_line()`, `geom_path()` **does not sort** your data along the x-axis at all. Instead, it connects the points in their exact **row order of appearance** in the dataset. Because the `mpg` dataset is not sorted by engine size, `geom_path()` draws lines that jump forward, backward, up, and down, criss-crossing the plot space to create a chaotic, unreadable **"spaghetti loop"** pattern.
* **The Fix**: Use a scatter plot (`geom_point()`) with random jittering to handle overplotting, and overlay an adaptive trend curve (`geom_smooth()`):
  ```r
  **Analyst Question (The Fix): How do we correctly visualize the trend of engine size vs. highway mileage while resolving overplotting and jagged lines?**
  ```r
  # CORRECT DIAGRAM: Scatter plot + smoothed trend line
  ggplot(mpg, aes(x = displ, y = hwy)) +
    geom_point(position = "jitter", alpha = 0.5) +
    geom_smooth()
  ```

### B. Uncovering Simpson's Paradox: Confounding Variables
**Simpson's Paradox** is a classic statistical phenomenon where a trend observed in an aggregated dataset **reverses** or disappears when the data is split into sub-groups. This is caused by omitting a critical confounding variable from your mapping.

* **The Misleading Diagram (Ignoring the Confounder)**:
  If we plot sepal width vs sepal length in R's built-in `iris` dataset, the aggregate trend line appears flat or slightly downward:
  ```r
  **What does the overall aggregate relationship look like between sepal width and length across all iris flowers?**
  ```r
  # Misleading: Suggests sepal width and length have no relation or are negatively related
  ggplot(iris, aes(x = Sepal.Width, y = Sepal.Length)) +
    geom_point() +
    geom_smooth(method = "lm", se = FALSE)
  ```
* **The Correct Diagram (Revealing the Truth)**:
  If we map `Species` to color, we uncover a stunning truth: within *every single species* (Setosa, Versicolor, and Virginica), there is actually a strong **positive** linear relationship!
  ```r
  **How does the relationship between sepal width and length change when analyzed within each distinct iris species?**
  ```r
  # Honest: Mapping the confounding variable (Species) reveals the true positive slopes
  ggplot(iris, aes(x = Sepal.Width, y = Sepal.Length, color = Species)) +
    geom_point() +
    geom_smooth(method = "lm", se = FALSE)
  ```

### C. Diagnosing Heteroscedasticity (Spread & Variances)
**Heteroscedasticity** refers to non-constant variance (spread) of a continuous variable across different levels of a categorical variable. This is a critical diagnostic because standard parametric tests (like ANOVA or linear regression) assume constant variance (**homoscedasticity**).

Box plots are the gold standard for diagnosing heteroscedasticity visually:
**How do the median, spread, and overall distribution shape of highway mileage compare across different drivetrains?**
```r
# Visual check for unequal variance (heteroscedasticity)
ggplot(mpg, aes(x = drv, y = hwy, fill = drv)) +
  geom_boxplot()
```
* **What to observe**: Compare both the heights of the boxes (the IQRs) and the total vertical spreads (whiskers + outliers). While the front-wheel drive (`f`) box is relatively compact (IQR is 5, spanning 26 to 31 mpg), its overall range (including whiskers and high-mileage outliers) is massive, spanning from 17 to 44 mpg. In contrast, rear-wheel drive (`r`) has a much narrower total range (15 to 26 mpg) but a taller box (IQR is 7, spanning 17 to 24 mpg).
* **Takeaway**: Because both the box heights (IQRs) and the overall whisker-outlier spans differ significantly across the drive categories, the variance is unequal (heteroscedastic). This warns us that standard ANOVA or regression assumptions are violated.
* **How to Address This**: When heteroscedasticity is diagnosed, standard statistical tools can yield misleading p-values and confidence intervals. Data scientists solve this by:
  1. **Mathematical Transformations**: Applying a variance-stabilizing transform to the dependent variable, such as a natural logarithm (`log(y)`) or square root (`sqrt(y)`).
  2. **Robust Statistical Tests**: Using tests designed for unequal variance, like **Welch's ANOVA** (using R's `oneway.test(..., var.equal = FALSE)`) instead of classical ANOVA.
  3. **Robust Modeling**: Using heteroscedasticity-robust standard errors or **Weighted Least Squares (WLS)** in regression modeling.

### D. Logarithmic Transformations for Power-Law Scaling
When continuous variables span multiple orders of magnitude (e.g., animal body sizes ranging from a few grams to several tons), a standard linear scale compresses 99% of your data into a tiny, unreadable cluster in the bottom-left corner of the chart, dominated by a few giant outliers.

Let's analyze R's built-in `msleep` (mammalian sleep) dataset comparing body weight (`bodywt` in kg) vs. brain weight (`brainwt` in kg):

* **The Unreadable Diagram (Linear Scale Compression)**:
  
  **What is the relationship between raw mammalian body weight and brain weight on a standard linear scale?**
  ```r
  # Unreadable: Elephants skew the axes, compressing all other mammals into a single dot
  ggplot(msleep, aes(x = bodywt, y = brainwt)) +
    geom_point() +
    geom_smooth(method = "lm")
  ```
* **The Correct Diagram (Log-Log Scale)**:
  By transforming the coordinates using `log()` (logarithm base $e$), we transform the axes into exponential orders of magnitude. This linearizes the scaling relationship and makes every species clearly readable:
  
  **What is the constant-ratio scaling relationship between mammalian body weight and brain weight across species?**
  ```r
  # Correct: Log-log scale linearizes the power-law relationship
  ggplot(msleep, aes(x = log(bodywt), y = log(brainwt))) +
    geom_point() +
    geom_smooth(method = "lm") +
    labs(x = "Log of Body Weight (kg)", y = "Log of Brain Weight (kg)", 
         title = "Mammalian Brain-to-Body Scaling")
  ```
  > [!IMPORTANT]
  > **How to confirm the Power-Law relationship**:
  > The moment we put `method = "lm"`, R will *always* draw a straight line no matter what. Therefore, a straight line itself does not prove our relationship is linear.
  > Instead, we must **add the `geom_point()` layer to show the points around the line** to make sure we understand that the Power-law relationship is indeed getting us a straight line (the points should be evenly distributed around the line, unlike the previous charts where you see heteroscedasticity). If they are evenly distributed, our linearization is successful!


---

## 9. Saving and Exporting Plots: `ggsave()`

Once you have designed a beautiful, premium visual graphic in R, you will want to save it to disk for use in reports, presentations, or publications.

The standard, professional tool for exporting plots is **`ggsave()`**. By default, `ggsave()` automatically saves the *last plot you created* to a designated file path:

**What is the overall relationship between engine displacement and highway fuel efficiency when styled for publication?**
```r
# 1. Build and display a plot:
ggplot(mpg, aes(x = displ, y = hwy, color = factor(cyl))) +
  geom_point(size = 3, alpha = 0.7) +
  labs(title = "Engine Size vs. Highway Mileage")
```
# 2. Save the plot to a high-resolution file:
ggsave("engine_vs_mileage.png")

### Advanced Export Parameters
To ensure your plots are printed flawlessly without clipping or pixelation, you should specify the dimensions and resolution explicitly:

* **File Formats**: `ggsave()` automatically detects the desired format from your file extension (`.png`, `.pdf`, `.jpeg`, `.svg`).
* **Dimensions**: Control size using `width` and `height`, and specify units using `units = "in"` (inches), `"cm"`, or `"mm"`.
* **Resolution (DPI)**: Set print-ready pixel resolution using the `dpi` parameter (use `300` for publication-grade print quality, and `72` or `150` for web display).

```r
# Export a precise 8x6 inch publication-grade PDF plot:
ggsave(
  filename = "mileage_report.pdf",
  width = 8,
  height = 6,
  units = "in",
  dpi = 300
)
```


---

## Hands-on Exercises

### Exercise 1: Fuel Economy Exploration
**How do city and highway fuel efficiency behave relative to each other, and how does drivetrain configuration (front-wheel, rear-wheel, 4WD) explain any visible clusters?**

*Analytical Guidance*:
Investigate the joint relationship between city and highway mileage across all vehicle models in the `mpg` dataset. Your analysis should:
1. Examine if there is a linear or non-linear correlation between the two mileage types.
2. Determine how the three primary drivetrain configurations distribute across the efficiency spectrum.
3. Use a high-visibility marker size with moderate transparency to ensure overlapping coordinates remain clearly readable.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = cty, y = hwy, color = drv)) +
  geom_point(size = 3, alpha = 0.7)
```
</details>

---

### Exercise 2: Comparing Distributions
**What are the differences in highway mileage distributions across the three drivetrain categories, and where do their respective median values lie relative to their spreads?**

*Analytical Guidance*:
Compare the central tendencies, ranges, and outlier profiles of highway mileage across the front-wheel, rear-wheel, and 4WD configurations in the `mpg` dataset. Your analysis should:
1. Compare the full distribution spreads of each drivetrain side-by-side using boxplots filled by drivetrain type.
2. Overlay an explicit mark indicating the exact median value for each category directly on the visual spreads to facilitate rapid comparison.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = drv, y = hwy, fill = drv)) +
  geom_boxplot() +
  stat_summary(fun = median, color = "red", size = 2, geom = "point")
```
</details>

---

### Exercise 3: Untangling the Jagged Line
**What is the true underlying trend between engine size and highway mileage, and how can we represent it cleanly without chronological sequencing noise?**

*Analytical Guidance*:
Evaluate the general relationship between engine size and highway mileage. An analyst mistakenly tried to connect all raw coordinates in their chronological row order, resulting in a chaotic "jagged cage" line plot. Your analysis should:
1. Expose the actual density of observations across the 2D coordinate space using jittered points.
2. Overlay an adaptive trend line that tracks the average mileage across different engine sizes.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.5) +
  geom_smooth()
```
</details>

---

### Exercise 4: Uncovering Simpson's Paradox
**What is the true relationship between sepal width and sepal length in the iris dataset, and why does aggregating all species together lead to a misleading conclusion?**

*Analytical Guidance*:
Analyze sepal width and sepal length in the `iris` dataset. An aggregate analysis suggests a downward-sloping correlation. Your analysis should:
1. Partition the data by flower species to test if the aggregate trend holds true within subgroups.
2. Overlay linear trend lines for each individual species to see if the direction of the relationship reverses.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(iris, aes(x = Sepal.Width, y = Sepal.Length, color = Species)) +
  geom_point() +
  geom_smooth(method = "lm", se = FALSE)
```
</details>

---

### Exercise 5: Plotting Logarithmic Brain Scaling
**What is the constant-ratio scaling relationship between mammalian body weight and brain weight, and how can we linearize data that spans multiple orders of magnitude?**

*Analytical Guidance*:
Examine mammalian body weights and brain weights in the `msleep` dataset. Because species sizes vary from tiny rodents to massive elephants, a standard linear representation compresses almost all data into an unreadable corner. Your analysis should:
1. Apply logarithmic transformations to both weight variables to reveal the power-law relationship on a proportional scale.
2. Overlay a straight linear regression trend line to verify if the scaling relationship follows a constant proportional ratio across species.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(msleep, aes(x = log(bodywt), y = log(brainwt))) +
  geom_point() +
  geom_smooth(method = "lm")
```
</details>
