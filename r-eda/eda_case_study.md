# Exploratory Data Analysis (EDA): Case Study

## What is Exploratory Data Analysis?

Exploratory Data Analysis (EDA) is not a rigid set of mathematical rules or a checklist to tick off; it is a creative, iterative mindset. As John Tukey—the father of EDA—famously stated: 

> "The greatest value of a picture is when it forces us to notice what we never expected to see."

In EDA, you treat your dataset like a crime scene. Your goal is to systematically investigate the data, search for hidden patterns, expose outliers and anomalies, identify missingness structures, and build intuition. You do this by continuously cycling through three steps:

```
                  ┌────────────────────────────────────────┐
                  │ 1. Formulate data-driven questions.    │◄────────┐
                  └────────────────────────────────────────┘         │
                                      │                              │
                                      ▼                              │
                  ┌────────────────────────────────────────┐         │
                  │ 2. Investigate via plots & transforms. │         │
                  └────────────────────────────────────────┘         │
                                      │                              │
                                      ▼                              │
                  ┌────────────────────────────────────────┐         │
                  │ 3. Refine questions & generate new ones│─────────┘
                  └────────────────────────────────────────┘
```

To explore any dataset systematically, we focus our inquiry on two fundamental behaviors:
1. **Variation**: How a single variable behaves within itself (its range, typical values, spread, and anomalies).
2. **Covariation**: How different variables behave in relation to one another (does a change in one variable associate with a pattern of change in another?).

---

## 1. The Cursory Data Understanding Phase

Before writing custom plotting code, you must gain a basic understanding of your database's shape. This prevents "Garbage In, Garbage Out" analysis.

### Step A: Load and Glimpse
Load your packages and inspect the column types and dimensions:
```r
library(tidyverse)

# View a high-level summary of the dataset
glimpse(diamonds)
```

### Step B: Inspect First Rows and Structure
```r
# View the first few rows
head(diamonds)

# Check base R internal representation
str(diamonds)
```

### Step C: Summary Statistics and Missingness Check
Calculate central tendencies and audit the entire table for missing values (`NA`):
```r
# View summaries for every column
summary(diamonds)

# Check total NA count in the entire dataframe
sum(is.na(diamonds))

# Check NA counts broken down per column
colSums(is.na(diamonds))
```

---

## 2. Exposing Variation

Variation is the tendency of values to change from measurement to measurement. 

### A. Continuous Variables
A variable is **continuous** if it can take on an infinite set of ordered numerical values (e.g., height, temperature, price, or carat). We visualize continuous variation using **Histograms** or **Density Plots**:

```r
# Visualizing carat distributions for smaller diamonds
diamonds |>
  filter(carat < 3) |>
  ggplot(aes(x = carat)) +
  geom_histogram(binwidth = 0.1, fill = "steelblue", color = "white")
```

### B. Categorical Variables
A variable is **categorical** (or discrete) if it can only take on one value from a small, predefined set of labels (e.g., diamond cut, color, or vehicle class). We visualize categorical variation using **Bar Charts**:

```r
# Count of diamonds within each cut quality group
ggplot(diamonds, aes(x = cut)) +
  geom_bar(fill = "darkgreen")
```

---

### C. Detecting Outliers (Anomalies)
Outliers are unusual observations that lie far outside the main cluster of values. They can indicate data entry errors (typos) or valuable scientific discoveries. 

To spot outliers easily, use a **Boxplot**:

```r
# Detect carat outliers along the high end
ggplot(diamonds, aes(x = carat)) +
  geom_boxplot(fill = "gold")
```

---

### D. The Power of Binwidth Manipulation
Never rely on a single histogram binwidth! Changing the bin size can reveal structural patterns that were previously hidden.

Let's look at the carat distribution of diamonds using an extremely fine binwidth:

```r
# Zoom in using a tiny binwidth of 0.01 carats
ggplot(diamonds, aes(x = carat)) +
  geom_histogram(binwidth = 0.01, fill = "darkblue") +
  xlim(0, 3)
```

**The Discovery**: This fine-grained histogram reveals massive, sharp spikes at exact decimal boundaries (e.g., 0.3, 0.5, 0.7, 1.0, 1.5 carats) followed by complete empty spaces immediately below them. This tells us that diamonds are intentionally cut to clear premium carat boundaries for higher pricing, exposing human rounding bias!

---

### E. Advanced Multi-Column Profiling
To visualize the distributions of all numerical variables in a dataset at once, we can use a powerful Tidyverse pipeline. This reshapes the columns into a long format and facets them:

```r
# Profile all numerical variables simultaneously
diamonds |>
  select(where(is.numeric)) |>
  gather() |>
  ggplot(aes(x = value, fill = key)) +
  geom_histogram(binwidth = 0.5) +
  facet_wrap(~key, scales = "free") +
  labs(title = "Distributions of Numerical Features")
```

---

## 3. Exposing Covariation

Covariation is the relationship between two or more variables, where changes in one variable tend to associate with changes in another.

| Variable Type A | Variable Type B | Recommended Visualizations |
| :--- | :--- | :--- |
| **Continuous** | **Categorical** | Boxplots, Violin Plots, Faceted Histograms |
| **Categorical** | **Categorical** | Count Plots (`geom_count`), Heatmaps (`geom_tile`) |
| **Continuous** | **Continuous** | Scatter Plots (`geom_point`), 2D Binning (`geom_bin2d`), Trend Lines |

---

### A. Continuous vs. Categorical Covariation

Let's investigate how diamond prices behave across different cuts:

```r
# Compare price distributions across cut qualities
ggplot(diamonds, aes(x = cut, y = price)) +
  geom_boxplot(fill = "lightblue")
```

#### Reordering Factors for Visual Clarity
To make comparative boxplots easier to read, we can use **`fct_reorder()`** from the `forcats` package. This reorders the categorical axis labels based on the median value of the continuous variable:

```r
# Reorder cut labels by median price
ggplot(diamonds, aes(x = fct_reorder(cut, price, median), y = price)) +
  geom_boxplot(fill = "lightgreen") +
  labs(x = "Cut (Ordered by Median Price)", y = "Price")
```

#### Violin Plots for Density Shape
Violin plots show the entire probability density shape of the groups, which is helpful for seeing if a distribution is multi-modal:

```r
# Show the distribution of price by cut using violin plots
ggplot(diamonds, aes(x = cut, y = price, fill = cut)) +
  geom_violin(alpha = 0.5)
```

---

### B. Categorical vs. Categorical Covariation

To see how two categorical variables behave together, we can use two different approaches:

#### Method 1: Count Plots
The size of each point represents the number of observations for that combination:
```r
# Size-mapped frequencies of color vs. cut
ggplot(diamonds, aes(x = color, y = cut)) +
  geom_count()
```

#### Method 2: Grouped Heatmaps
A Heatmap counts the occurrences and maps the count (`n`) to a color gradient:
```r
# Group, count, and plot as a tile heatmap
diamonds |>
  count(color, cut) |>
  ggplot(aes(x = color, y = cut, fill = n)) +
  geom_tile() +
  scale_fill_gradient(low = "aliceblue", high = "navy") +
  labs(title = "Concentration of Gems across Cut & Color")
```

---

### C. Continuous vs. Continuous Covariation

#### Method 1: Scatter Plots with Alpha Transparency
To prevent thousands of overlapping points from looking like a solid block, use **`alpha`** to make the points semi-transparent:

```r
# Carat vs. Price colored by cut quality
ggplot(diamonds, aes(x = carat, y = price, color = cut)) +
  geom_point(alpha = 0.3)
```

#### Method 2: Non-Linear Trend Smoothing (LOESS)
To see underlying non-linear trends, use **`stat_smooth()`** (which defaults to a local regression smoothing curve):

```r
# Fit a localized trend line through carat vs. price
ggplot(diamonds, aes(x = carat, y = price)) +
  geom_point(alpha = 0.1) +
  stat_smooth()
```

#### Method 3: 2D Binning (Hexagonal or Rectangular)
When dealing with large datasets (like 54,000 diamonds), scatter plots can become slow to render and hard to read. Use 2D binning to aggregate the points into bins:

```r
# Create a 2D rectangular density bin chart
ggplot(diamonds, aes(x = carat, y = price)) +
  geom_bin2d() +
  scale_fill_viridis_c()
```

---

## 4. Multivariate Analysis: Pairs Plots

To quickly inspect relationships across all numerical variables at once, you can generate a **Pairs Plot**:

```r
# Generate a scatter plot matrix of numerical variables
diamonds |>
  select(where(is.numeric)) |>
  pairs(col = alpha("steelblue", 0.1))
```

---

## Hands-on Exercises

### Exercise 1: Diamond Precision Graded Boundaries
**How does human precision-rounding bias manifest in the weight distributions of retail diamonds, and how can we use fine-grained histograms to locate these pricing thresholds?**

*Analytical Guidance*:
Investigate the distribution of diamond weights (`carat`). Your analysis should:
1. Filter the `diamonds` dataset to isolate gems weighing less than 1.5 carats (`carat < 1.5`).
2. Create a histogram of these weights.
3. Set the `binwidth` to a precise value of `0.01` to expose fine-grained weight patterns.
4. Set the bar fill color to `"darkcyan"` and apply `theme_minimal()`.
5. Identify the sharp spikes and the empty gaps immediately preceding them to explain retail cutting thresholds.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

diamonds |>
  filter(carat < 1.5) |>
  ggplot(aes(x = carat)) +
  geom_histogram(binwidth = 0.01, fill = "darkcyan", color = "white") +
  theme_minimal() +
  labs(title = "Diamond Weight Spikes at Key Graded Boundaries", x = "Carat")
```
</details>

---

### Exercise 2: Factoring Visual Quality Reorders
**How do diamond price distributions behave across different cut qualities, and how can we reorder our plot labels to easily compare median prices?**

*Analytical Guidance*:
Generate comparative boxplots to explore cut quality vs. price. Your analysis should:
1. Reorder the categorical `cut` variable on the x-axis based on the median `price` of each group. (Hint: Use `fct_reorder(cut, price, median)`).
2. Plot these distributions using `geom_boxplot()`, adding a soft fill color.
3. Identify the paradox: Why do lower-quality cuts (like "Fair") have higher median prices than premium cuts? (Hint: Lower-quality cuts are often saved for much larger, heavier diamonds where carat weight drives the price!).

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(diamonds, aes(x = fct_reorder(cut, price, median), y = price, fill = cut)) +
  geom_boxplot() +
  theme_minimal() +
  labs(
    title = "Price Distributions Across Cuts (Ordered by Median Price)",
    x = "Cut Quality",
    y = "Price (USD)"
  )
```
</details>

---

### Exercise 3: Heatmaps of Visual Attributes
**Where do the highest concentrations of diamond inventory lie when cross-tabulating color grades and cut qualities, and how can we highlight these hotspots using a heatmap?**

*Analytical Guidance*:
Create a grouped heatmap of color vs. cut. Your analysis should:
1. Group and calculate the count of observations (`n`) for each combination of `color` and `cut`.
2. Map `color` to the x-axis, `cut` to the y-axis, and the count `n` to the fill color.
3. Create the heatmap using `geom_tile()`.
4. Style the heatmap using `scale_fill_gradient()` with a low color of `"aliceblue"` and a high color of `"orangered"`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

diamonds |>
  count(color, cut) |>
  ggplot(aes(x = color, y = cut, fill = n)) +
  geom_tile() +
  scale_fill_gradient(low = "aliceblue", high = "orangered") +
  theme_minimal() +
  labs(title = "Diamond Inventory Concentrations", x = "Color Grade", y = "Cut Quality")
```
</details>

---

### Exercise 4: Binned Joint Distributions
**How can we visualize the joint distribution of carat weight and price for 54,000 diamonds without causing overplotting issues that hide the data density?**

*Analytical Guidance*:
Use 2D binning to visualize high-volume joint continuous distributions. Your analysis should:
1. Create a 2D rectangular binned density chart of `carat` on the x-axis and `price` on the y-axis.
2. Use **`geom_bin2d()`** to aggregate overlapping points into density counts.
3. Apply the viridis color scale (`scale_fill_viridis_c()`) to clearly show density differences.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(diamonds, aes(x = carat, y = price)) +
  geom_bin2d() +
  scale_fill_viridis_c() +
  theme_minimal() +
  labs(title = "Binned 2D Density: Carat vs. Price", x = "Carat Weight", y = "Price (USD)")
```
</details>

---

### Exercise 5: Stratified Non-Linear Trends
**How does the non-linear relationship between weight and price differ across cut qualities, and how can we visualize these trends using smoothed curves?**

*Analytical Guidance*:
Fit non-linear trend curves across different categories. Your analysis should:
1. Plot `carat` on the x-axis, `price` on the y-axis, and map `cut` to the color aesthetic.
2. Add semi-transparent scatter points (`alpha = 0.2`) to show the background data distribution.
3. Add stratified localized smoothing curves using **`stat_smooth()`** to fit a separate trend line for each cut quality.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(diamonds, aes(x = carat, y = price, color = cut)) +
  geom_point(alpha = 0.2) +
  stat_smooth(se = FALSE) +
  theme_minimal() +
  labs(title = "Stratified Non-Linear Trends", x = "Carat Weight", y = "Price (USD)")
```
</details>
