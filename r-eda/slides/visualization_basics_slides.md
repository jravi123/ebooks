# Visual Semiotics & ggplot2 Basics

---

#  Pipe Operators

```r
# A pipe operator passes the output from its left side 
# as the first argument of the function on its right.

# Chaining syntax makes code extremely legible and sequential:
# Raw:       f(x)
# Piped:     x |> f()

# Raw:       g(f(x), y)
# Piped:     x |> f() |> g(y)

v = c(1:5, -20)
print(v)
avg = mean(v)
avg2 = v |> mean()
abs_value = v |> mean() |> abs()
print(paste(avg, avg2, abs_value))
```

---

#  Native Pipe (`|>`) vs. Magrittr Pipe (`%>%`)

```r
library(tidyverse)
# 1. Native Pipe (|>):
# Built directly into base R (R version 4.1+). Requires zero packages.
mpg |> 
  ggplot(aes(x = displ, y = hwy)) + 
  geom_point()

# 2. Magrittr Pipe (%>%):
# Loaded via the magrittr package (or loaded automatically with tidyverse).
mpg %>% 
  ggplot(aes(x = displ, y = hwy)) + 
  geom_point()
```

---

# How do they differ?

```r
c(1:5) %>% mean # works!
c(1:5) |> mean # doesn't work
c(1:5) |> mean() # now it works!
```

---

# Plotting: Visual representation of data

**Graphing** or **plotting** is the representation of data in a visual form, typically on a 2D plane.

Humans have a wonderful ability to process visual stimuli quickly.

Great for displaying large data sets that might be difficult to describe.

**But Plotting ain't easy**

* What exactly can we put in a plot?
* How to connect the plot to data?
* What are our goals for the plot?
* What additional information is necessary to understand the plot?

---

# The Semiology of Graphics

In 1967, **Jacques Bertin** published the *Semiology of Graphics* to describe common elements of plots and what they could achieve.

Bertin described two ways of thinking about plots:

1. Visual ("retinal") variables: connections between objects in the plot and underlying data
2. Relationship what types of relationships can the visual variables express


[Visual Variables](https://en.wikipedia.org/wiki/Visual_variable)


---


# The Grammar of Graphics and `ggplot`

A follow up to Bertin's work was *The Grammar of Graphics* by Leland Wilkinson.
This book described a programming language for graphics based on ideas in
Bertin's system.

The GoG was implemented for R in `ggplot` (and later replaced by `ggplot2`). 

---


# The main components of a ggplot graph

>* The graph object itself (creating using `ggplot(data)`)
>* A set of [aesthetic mappings](https://ggplot2.tidyverse.org/articles/ggplot2.html?q=scales#mapping) (connecting data to visual variables)
>* [Layers](https://ggplot2.tidyverse.org/articles/ggplot2.html?q=scales#layers): collections of geometric elements (`geom_*()`) and [statistical transformations](https://ggplot2.tidyverse.org/reference/layer_stats.html) (`stat_*()`). Stat performs computation on the data before it is displayed
>* [Scales](https://ggplot2.tidyverse.org/articles/ggplot2.html?q=scales#scales): information on the range, breaks for labels and legends
>* [Coordinate systems](https://ggplot2.tidyverse.org/articles/ggplot2.html?q=scales#coordinates): how the data are arranged spatially
>* [Facet](https://ggplot2.tidyverse.org/articles/ggplot2.html?q=scales#facets): breaking a single plot into many, similar plots
>* [Theme](https://ggplot2.tidyverse.org/articles/ggplot2.html?q=scales#theme): all the other color and printing aspects of the plot


---

# Creating a ggplot

Start use the `ggplot` function to start our plot
```r
library(tidyverse)
efficiency <- ggplot(data = mpg)
efficiency # for now, blank
```

---

# What can we plot?

Let us take a glimpse of the dataset
```r
glimpse(mpg)
```

"Aesthetic" mappings connect columns to visual variables
```r
efficiency <- ggplot(
  data = mpg,
  aes(
    x = displ, 
    y = hwy, 
    color = cyl
  )
)

efficiency
```
displ: a car’s engine size, in litres. A larger displacement (e.g., a 5.0L V8 engine) means the engine can
burn more air and fuel in each cycle, which generally translates to more power but is it at the cost of fuel efficiency? Let us find out.

hwy: highway miles/gallon
cyl: number of cylinders


But the chart is still blank? Well we need to add the geometric layer to define how to display the visual elements

---

# Geometries: objects on the plot

We will use a **geometry function** (have the form `geom_TYPE()`).

```r
efficiency + geom_point()
```


**Alternative forms**


`ggplot(data = mpg) + geom_point(aes(x = displ, y = hwy, color = cyl))`

`mpg |> ggplot() + geom_point(aes(x = displ, y = hwy, color = cyl))`

`mpg |> ggplot(mapping = aes(x = displ, y = hwy, color = cyl)) + geom_point()`

`ggplot(mpg, aes(x = displ, y = hwy, color = cyl)) + geom_point()`

`ggplot(mpg, aes(x = displ)) + geom_point(aes(y = hwy, color = cyl))`


Note: You can use positional arguments or use `data`, `mapping` argument names to call these functions

Mapping values from `ggplot` are inherited by layers

---
      
# Question
Is the cylinder really a continuous variable?
How else can I make this better?

```r
mpg |> 
  ggplot() + 
  geom_point(aes(x = displ, y = hwy, color = cyl))
```

---
# Insight

Using `factor()` tells ggplot2 to treat cyl as distinct categories, assigning a unique color to each one, which is exactly what you want.

```r
mpg |> 
  ggplot() + 
  geom_point(aes(x = displ, y = hwy, color = factor(cyl))) + 
  labs(title = "Dipl vs hwy", color = "cyl")
```

The chart illustrates the fundamental trade-off in
automotive engineering between power (larger displacement and more cylinders) and fuel economy. Cars with smaller, 4-cylinder engines are fuel-efficient, while cars with larger, 8-cylinder engines offer more power at the cost of higher fuel consumption.


---

# Trying out some other mappings



```r
ggplot(data = mpg, aes(x = displ, y = hwy, size = cyl, color = class)) + 
  geom_point()
```

Visit the docs to learn more: [geom_point](https://ggplot2.tidyverse.org/reference/geom_point.html)

---

# Using expressions

We can also use expressions involving columns.

```r
ggplot(data = mpg, aes(x = displ, y = hwy, shape = year > 2000)) + 
  geom_point()
```

---

# Overriding parameters for all points

We can pass in constants that apply to all points (size and transparency):

```r
ggplot(data = mpg, aes(x = displ, y = hwy, shape = year > 2000)) + 
  geom_point(size = 5)
```

---

# Jitter: useful noise

```r
ggplot(data = mpg, aes(x = displ, y = hwy)) + 
  geom_point(position = "jitter")
```

---

# General observations

* Generally limit plots to having 3 or 4 distinct visual variables
* Almost everything can be tweaked in ggplot, finding it is the tricky part
* The [R Graph Gallery](https://r-graph-gallery.com/) is a great source of inspiration and instruction


---



# Other geometries

To visualize continuous data spread and identify outliers across multiple groups, use a 'box plot'.

```r
ggplot(data = mpg, aes(x = displ, y = class)) + 
  geom_boxplot() 
```



**List of geometries**

[More ggplot documentation](https://ggplot2.tidyverse.org/reference/index.html#geoms).

# Statistical Summaries

* In addition to the raw data (or our calculations), our plots involved **data summaries** 
* `ggplot2` calls these **summary statistics** or `stat_*` functions
* We already saw a summaries in the boxplot: quantiles, twice IQR bars
* We can access summaries that geometries compute and add additional summaries.

---

# Boxplot as statistic

```r
ggplot(data = mpg, aes(x = displ, y = class)) + 
  stat_boxplot() 
```

Compare with

```r
ggplot(data = mpg, aes(x = displ, y = class)) + 
  geom_boxplot() 
```

`geom_boxplot()` is a convenient wrapper that automatically uses
  `stat_boxplot()` behind the scenes to do the calculations.

You would use `stat_boxplot()` explicitly if you wanted to use its calculations but draw them with a different geom.

Example: Let's say you want to show the range of a boxplot (the
whiskers) but not with a box. You could use the calculations from
`stat_boxplot()` but represent them with an errorbar geom:

```r
ggplot(data = mpg, aes(x = displ, y = class)) + 
  stat_boxplot(geom = "errorbar")
```

---

# Adding computed summaries

The `stat_summary` function allows you to use any function to summarize 

```r
ggplot(data = mpg, aes(x = displ, y = class)) + 
  geom_boxplot() +
  stat_summary(fun = mean, size = 3, color = "red", geom = "point") 
```

---

# Trend lines

When using scatter plots, one of the most common summaries is a **trend line**.
```r
ggplot(data = mpg, aes(x = displ, y = hwy)) + 
  geom_point(position = "jitter", alpha = 0.25) +
  stat_smooth() # geom_smooth also works
```

---

# More layering

```r
ggplot(data = mpg, aes(x = displ)) +
  geom_point(aes(y = hwy), color = "orange") +
  geom_point(aes(y = cty), color = "blue") +
  stat_smooth(aes(y = hwy), lty = 1, color = "black") +
  stat_smooth(aes(y = cty), lty = 2, color = "red")
```

We'll see a better way to make this table when we talk about tall vs. wide format data.

`lty` specifies the line-type; 1 being a solid line and 2 being a dashed line

---

# Overriding defaults of `stat` functions

Each `geom_*` has a default statistic function. We can override this.

```r
ggplot(data = mpg, aes(x = class)) +
  geom_bar() # default stat is count
```

Override the default

```r
ggplot(data = mpg, aes(x = class, y = hwy)) +
  geom_bar(stat = "summary", fun = "mean") +
  labs(title = 'Mean highway miles per class')
```

---

# Replacing tables

We often use **tables** in documents to give numerical summaries. But why not
replace those with a nice graphic?

```r
ggplot(data = mpg, aes(x = class, y = hwy)) +
  stat_summary(
    fun.min = min,
    fun.max = max,
    fun = median
  )
```


---



#  Chart Selection & Diagram Diagnostics

Choosing the correct visualization geometry and diagnosing layout anomalies is a core data science skill. We will analyze 4 critical diagram diagnostics:

* **The Jagged Line Trap**: Connecting continuous unordered coordinates sequentially.
* **Simpson's Paradox**: Trends reversing or disappearing when grouped by categories.
* **Heteroscedasticity**: Non-constant variance spread across categorical groupings.
* **Power-Law Scaling**: Extreme outliers compressing data points into an unreadable corner.

---

#  Unordered Traps: Jagged Line & Looping Spaghetti

**engine sizes vs mileage**

```r
# 1. The geom_line() Trap (The Jagged Cage):
# sorts along x-axis, but overlapping y-values force vertical lines
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_line()

# 2. The geom_path() Trap (The Looping Spaghetti):
# does NOT sort; connects points in raw row order of appearance,
# jumping forward and backward to create chaotic loops
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_path()
```

---

#   Fixing the Jagged Line Trap


```r
# The Fix: Use geom_point() to inspect the 2D coordinate space, 
# and layer geom_smooth() to view the sequence trend curve.

ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point() +
  geom_smooth()
```

---

#  Simpson's Paradox (Group Confounding)

Simpson's Paradox is a statistical phenomenon where an apparent trend in aggregate data is completely reversed or disappears once you partition the data into logical categories:

* **The Aggregate View**: Plotting Sepal.Width vs Sepal.Length in R's built-in `iris` dataset suggests a weak, flat downward-sloping correlation overall.

```r
# Confounded Aggregate Line
ggplot(iris, aes(x = Sepal.Width, y = Sepal.Length)) +
  geom_point() + 
  geom_smooth(method = "lm")
```


* **The Grouped View**: Partitioning and coloring points by `Species` reveals that every single group has a strong, distinct **positive** correlation!

```r
# Mapping Species to Color
ggplot(iris, aes(x = Sepal.Width, y = Sepal.Length, color = Species)) +
  geom_point() + 
  geom_smooth(method = "lm")
```

---

#  Heteroscedasticity & Box Plots (Spread Analysis)

Heteroscedasticity refers to a situation where the spread or variance of a continuous dependent variable is unequal or non-constant across different groups or levels:

* **Why It Matters**: Equal variance (homoscedasticity) is a fundamental prerequisite/assumption for key statistical models like linear regressions and ANOVA.
* **Our Visual Tool**: The box plot (`geom_boxplot`) is the gold standard for visualizing and diagnosing heteroscedasticity across discrete categorical groupings.
* **How to Address It**: Apply coordinate transformations (like `log(y)`)

---

#   Visualizing Unequal Variance

**How do the median and spread of highway fuel efficiency compare across front, rear, and four-wheel drive configurations?**
```r
# Compare overall vertical ranges (whiskers + outliers) vs. box heights.
# The overall spreads and whiskers vary dramatically across groups (f vs. r):
ggplot(mpg, aes(x = drv, y = hwy, fill = drv)) +
  geom_boxplot()
```

---

#  Power-Law Scaling (The Compressed Plot Trap)

When plotting variables that span multiple orders of magnitude, a standard linear coordinate scale will compress 99% of your data points into a tiny, unreadable cluster in the corner.

* **The Problem**: Extreme outliers (like elephants or whales in mammalian body/brain weight) stretch the linear scale, hiding details for smaller animals (like mice or rabbits).
* **The Concept**: Relationships that follow power-law scaling can be transformed into a linear, readable format by applying a natural logarithm transform on both coordinates.

**What is the direct ratio of mammalian brain weight to body weight across species of highly varying sizes?**
```r
# Linear Scale Scatter Plot (highly compressed):
ggplot(msleep, aes(x = bodywt, y = brainwt)) +
  geom_point()
```

---

#   Logarithmic coordinate transformation

**What is the constant-ratio scaling relationship between mammalian body weight and brain weight across species?**

```r
# Taking log() of both coordinates linearizes the scaling relationship.
# Note: method = "lm" ALWAYS draws a straight line.
# Add the geom_point() layer to show the points around the line to make sure we understand
# that the Power-law relationship is indeed getting us a straight line 
# points should be evenly distributed around the line

ggplot(msleep, aes(x = log(bodywt), y = log(brainwt))) +
  geom_point() +
  geom_smooth(method = "lm")
```



---

#  Summary: Thinking Like a Data Scientist

Always apply these core visualization, diagnostic when working with 2D plots in R:

* **The Jagged Line Rule**: Never connect continuous unordered coordinates with lines. Choose scatter plots (`geom_point`) and trend lines (`geom_smooth`) instead.
* **Simpson's Paradox Check**: Always inspect grouped categorical behaviors to avoid aggregate-level trend reversals.
* **Heteroscedasticity Check**: Check for constant variance spread across categorical categories using box plots (`geom_boxplot`).
* **Power-Law Scale Transform**: Apply logarithmic transforms (`log()`) on both coordinates when data spans multiple orders of magnitude.

