# Exploratory Data Analytics (EDA)
## Variation, Covariation, Outliers, Distributions, and Multidimensional Profiling

---

# Lecture Agenda & Learning Objectives

Exploratory Data Analysis (EDA) is the art and science of investigating datasets to uncover underlying structure, detect anomalies, test assumptions, and discover hidden relationships.

Today we will methodically cover:
* **The Philosophy of EDA**: John Tukey’s visual paradigm and the iterative inquiry loop.
* **The NIST Framework**: Goals and questions driving exploratory analysis.
* **Systematic Data Profiling**: Inspecting structure (`glimpse`, `str`), descriptive statistics (`summary`), and auditing missingness (`is.na`, `colSums`).
* **Data Cleaning & Garbage-In-Garbage-Out**: Strategies for imputation vs. deletion of missing data.
* **Chart Selection by Variable Types**: Continuous vs. categorical variables, correlation charts, and color palette discipline.
* **Univariate Variation (Continuous)**:
  * Histograms, binwidth tuning, and discovering market threshold spikes in `carat`.
  * Isolating extreme outliers with Boxplots.
  * Price distributions and right-skewness.
  * Multi-feature distribution faceting using `where(is.numeric)` and `gather()`.
* **Bivariate Covariation**:
  * Continuous vs. Categorical: comparative boxplots, `fct_reorder()`, and violin plots.
  * Resolving the Diamond Cut-Price Paradox (Simpson's-style confounding).
  * Categorical vs. Categorical: `geom_count()` bubble plots and `geom_tile()` heatmaps.
  * Continuous vs. Continuous: `geom_point()`, `alpha` transparency, and 2D binning (`geom_bin2d()`).
* **Non-Linear Trend Modeling**: LOESS smoothing curves (`geom_smooth()` / `stat_smooth()`) with stratification.
* **Multivariate Exploration**: Numeric matrix pair plots (`pairs()`) for simultaneous multi-variable correlation.
* **Synthesis & Transition**: Translating EDA findings into feature engineering and predictive modeling.

---

# John Tukey: The Father of EDA

In 1977, statistician **John W. Tukey** published the pioneering book *Exploratory Data Analysis*, revolutionizing modern statistical practice:

> ### **John W. Tukey (1915 – 2000)**
> * Pioneer of Exploratory Graphics
> * Inventor of the Boxplot

> “The greatest value of a picture is when it forces us to notice what we never expected to see.”  
> — **John W. Tukey**

### The Shift in Perspective:
* **Classical Confirmatory Statistics**: Start with a formal hypothesis, run a statistical test, compute a $p$-value.
* **Exploratory Data Analysis (EDA)**: Treat the dataset as a crime scene. Use flexible visual and numerical summaries to uncover patterns, anomalies, and hypotheses that you didn't know to look for.

---

# What is EDA? Definitions & The Iterative Loop

According to Tukey, EDA encompasses:
> "Procedures for analyzing data, techniques for interpreting the results of such procedures, ways of planning the gathering of data to make its analysis easier, more precise or more accurate, and all the machinery and results of (mathematical) statistics which apply to analyzing data."

### The Iterative EDA Inquiry Cycle:

| Step | Action | Focus |
| :---: | :--- | :--- |
| **1** | **Generate Questions** | Ask open questions about data structure, distributions, and anomalies. |
| **2** | **Search for Answers** | Transform, visualize, and model the data. |
| **3** | **Refine & Iterate** | Use findings to generate sharper, deeper follow-up questions (loop back to Step 1). |

EDA is not a one-pass checklist; it is an ongoing cycle of discovery and refinement.

---

# The NIST Goals of EDA

The **National Institute of Standards and Technology (NIST)** defines the primary objectives of EDA as:

1. **Gain Maximum Insight** into data structure and underlying phenomena.
2. **Uncover Underlying Dimensionality** and hidden variable groupings.
3. **Extract Important Variables** that drive the phenomenon of interest.
4. **Detect Outliers and Anomalies** (measurement artifacts vs. rare events).
5. **Test Underlying Assumptions** required for downstream machine learning or statistical modeling.
6. **Develop Parsimonious Models** with optimal predictive power.


---

# The Two Core Questions of EDA

To explore any dataset systematically, focus your investigation around two primary questions:

| 1. Variation (Within Variables) | 2. Covariation (Between Variables) |
| :--- | :--- |
| **Core Question**: How do values within a single variable vary from measurement to measurement? | **Core Question**: How do values in one variable change in relation to changes in another? |
| **Key Focus**: Distributions, typical values, spread, clusters, and outliers. | **Key Focus**: Trends, correlations, subgroups, and interactions. |

### 1. Questions About Variation:
* What values are most common? Why?
* What values are rare? Are they outliers or recording errors?
* What is the shape of the distribution (normal, skewed, bimodal, uniform)?

### 2. Questions About Covariation:
* Is there a linear or non-linear trend between variables?
* Are there clusters or subgroups?
* Does the relationship between $X$ and $Y$ depend on a third category $Z$?

---

# Data Understanding: First Contact with Raw Data

Before writing complex visual scripts, perform a rigorous initial inspection:

| Step | Action | Key Functions & Objectives |
| :---: | :--- | :--- |
| **1** | **Import & View** | Load data; inspect first 6 rows (`head`) and last rows (`tail`). |
| **2** | **Data Types** | Distinguish numeric, categorical, boolean, datetime (`glimpse`, `str`). |
| **3** | **Summary Stats** | Compute min, median, mean, max, IQR, and standard deviation (`summary`). |
| **4** | **Audit Missingness** | Count NAs globally and per column (`colSums(is.na())`). |

```r
library(tidyverse)
library(nycflights13)

# 1. Glimpse the flights transaction log
glimpse(flights)

# 2. Check structure
str(flights)

# 3. Overall summary statistics
summary(flights)
```

---

# Data Cleaning: Garbage In, Garbage Out (GIGO)

Visualizing corrupted, noisy, or uncleaned data produces misleading charts and faulty conclusions. Clean anomalies *first*.

| Missing Values Protocol | Transformation & Feature Protocol |
| :--- | :--- |
| **1. Imputation:**<br>• *Numerical*: Mean, Median, KNN, Regression.<br>• *Categorical*: Mode, `"Missing"` category. | **1. Type Casting:**<br>• Convert strings to Datetime or Factors. |
| **2. Deletion:**<br>• *Row Deletion*: Minimal data loss, Missing at Random (MCAR).<br>• *Column Deletion*: >50% missing or uninformative. | **2. Feature Engineering:**<br>• Continuous binning (`cut()`).<br>• Log transforms to correct heavy skewness. |

---

# Visualizing by Data Type: Continuous vs. Categorical

The geometry of your chart must match the mathematical measurement level of your variables:

| Feature | Continuous Variables | Categorical Variables |
| :--- | :--- | :--- |
| **Definition** | Infinite ordered numerical values (`carat`, `price`, `delay`) | Finite set of discrete categories (`cut`, `color`, `carrier`) |
| **Primary Geometries** | • Histograms (`geom_histogram`)<br>• Density plots (`geom_density`)<br>• Boxplots (`geom_boxplot`) | • Bar charts (`geom_bar`, `geom_col`)<br>• Frequency tables (`count()`)<br>• Dot plots / Pareto charts |

---

# Chart Selection Matrix: What Chart to Use?

| Variables | Recommended Chart | Primary Purpose / Diagnostic Question |
| :--- | :--- | :--- |
| **1 Continuous** | Histogram / Boxplot | Distribution shape, spread, skewness, outliers |
| **1 Categorical** | Bar Chart | Category frequencies, class imbalance |
| **Cont. + Cat.** | Comparative Boxplots | Group medians, variance, and IQR differences |
| **Cont. + Cat.** | Violin Plot | Multimodal density profiles across categories |
| **2 Categorical** | Heatmap (`geom_tile`) | Joint frequency counts & cross-tabulations |
| **2 Categorical** | Count Plot (`geom_count`) | Proportional point size joint counts |
| **2 Continuous** | Scatter Plot (`geom_point`) | Linear/non-linear correlation, clustering |
| **2 Continuous** | 2D Density (`geom_bin2d`) | Density concentration without overplotting |
| **Multi-Numeric** | Pairs Plot (`pairs()`) | All-against-all correlation matrix |

---

# Principles of Color Selection in Visualizations

Color is a powerful visual variable, but misuse can confuse readers and obscure patterns:

1. **Continuous Data: Use Color Gradients / Ramps**
   * Monochromatic or diverging ramps (e.g., `viridis`, `scale_fill_gradient`).
   * Maps smoothly and perceptually uniformly to numeric magnitudes.

2. **Categorical Data: Limit Discrete Colors (< 5 Categories)**
   * Human short-term visual memory cannot track > 5 colors without constant legend lookups.
   * If you have 10+ categories, use facets or highlight only the top 3 categories in color.

3. **Be Kind to Your Reader**
   * Choose colorblind-friendly palettes (`viridis`, `RColorBrewer`).
   * Never use color purely for decorative purposes.

---

# Case Study Dataset: `diamonds`

To demonstrate the full EDA workflow, we use the `diamonds` dataset built into `ggplot2`:
* Contains prices and physical attributes for **53,940 diamonds**.

```r
library(tidyverse)

# Inspect high-level dimensions and types
diamonds |> glimpse()
```


---

# Profiling `diamonds`: Structure & Summary Statistics

Let's run structural and descriptive statistical checks:

```r
library(tidyverse)

# View top 6 rows
head(diamonds)

# Check internal R structure
str(diamonds)

# Comprehensive summary metrics
summary(diamonds)
```



> **Immediate Anomaly Spotted**: Minimum values for `x`, `y`, `z` are `0.000` mm! Diamonds cannot have a physical dimension of 0 mm (data entry error).

---

# Auditing Missing Values (NAs)

Before creating plots, verify whether missing values exist:

```r
library(tidyverse)

# Total NA values across entire table
sum(is.na(diamonds))

# Breakdown of NA values per individual column
colSums(is.na(diamonds))
```



The `diamonds` dataset contains zero missing cells. If NAs were present, we would evaluate imputation vs. row deletion.

---

# Continuous Variation: Visualizing `carat`

Carat weight is a continuous numeric variable. Let's inspect its distribution with a basic histogram:

```r
library(tidyverse)

diamonds |> 
  ggplot(aes(x = carat)) +
  geom_histogram(fill = "steelblue", color = "white", binwidth = 0.1) +
  labs(
    title = "Distribution of Diamond Carat Weight",
    x = "Carat",
    y = "Frequency Count"
  )
```


* The distribution is strongly **right-skewed** (most diamonds are under 1 carat).
* **`binwidth = 0.1` effect**: Groups diamonds into 0.1-carat intervals to reveal the overall distribution shape while smoothing out granular frequency spikes at round carat weights.
* But what happens if we change the binwidth?

---

# Outlier Detection with Boxplots

Histograms show overall shape, but **Boxplots** excel at detecting extreme outliers:

```r
library(tidyverse)

diamonds |> 
  ggplot(aes(x = carat)) +
  geom_boxplot(fill = "gold", color = "black", outlier.color = "red") +
  labs(
    title = "Carat Outlier Detection Boxplot",
    x = "Carat Weight"
  )
```

| Boxplot Component | Value / Metric | Diagnostic Interpretation |
| :--- | :--- | :--- |
| **Lower Whisker (Min)** | `0.20` ct | Smallest observed value within lower fence ($Q_1 - 1.5 \times \text{IQR}$) |
| **Q1 (25th Percentile)** | `0.40` ct | 25% of diamonds weigh $\le 0.40$ carats |
| **Median (50th Percentile)**| `0.70` ct | Center of distribution |
| **Q3 (75th Percentile)** | `1.04` ct | 75% of diamonds weigh $\le 1.04$ carats |
| **Upper Fence (Max Whisker)**| `2.00` ct | $Q_3 + 1.5 \times \text{IQR} = 1.04 + 0.96$ |
| **Outlier Points** | $> 2.00$ ct | Extreme values (e.g. rare 5.01 ct gemstones) |

* **Upper Threshold & Outliers**: Red dots represent values above $Q_3 + 1.5 \times \text{IQR} = 1.04 + 0.96 = 2.00$ ct. (A max carat of 5.01 is a legitimate rare gemstone, unlike an `x = 0` data error).
* **Lower Threshold & Lower Whisker (0.2)**: By formula, the lower fence is $Q_1 - 1.5 \times \text{IQR} = 0.40 - 0.96 = -0.56$. Since diamond carats cannot be negative, there are no lower outliers; the lower whisker stops at the smallest observed data point in the dataset (**0.20 ct**).

---

# The Discovery: Binwidth Tuning & Market Thresholds

Let's decrease the histogram binwidth to a fine resolution (`binwidth = 0.01`):

```r
library(tidyverse)

# Zoom into < 2.5 carats and set granular tick breaks every 0.1 carats
diamonds |> 
  filter(carat < 2.5) |> 
  ggplot(aes(x = carat)) +
  geom_histogram(binwidth = 0.01, fill = "midnightblue") +
  scale_x_continuous(breaks = seq(0, 2.5, by = 0.1)) +
  labs(
    title = "Fine Carat Histogram (binwidth = 0.01)",
    subtitle = "Zoomed to < 2.5 carats with 0.1 ct tick breaks",
    x = "Carat Weight",
    y = "Count"
  )
```


### The Economic Phenomenon:
* **Zooming & Tick Breaks**: Filtering `carat < 2.5` and adding `scale_x_continuous(breaks = seq(0, 2.5, by = 0.1))` makes the sub-carat intervals clearly visible on the x-axis.
* **Threshold Spikes**: Sharp spikes occur immediately at round numbers (**0.30, 0.40, 0.50, 0.70, 0.90, 1.00, 1.20, 1.50, 2.00 ct**).
* **Valleys of Avoidance**: Valleys occur just below (e.g., 0.29, 0.49, 0.69, 0.99 ct) because diamond cutters deliberately cut gems to exceed prestigious commercial pricing thresholds.

---

# Continuous Variation: Distribution of `price`

Let's visualize the distribution of diamond prices, highlighting skewness, central tendencies, and the hidden anomaly:

```r
library(tidyverse)

# Zoom to < $5,000 with binwidth = 50 and $500 breaks to reveal the $1,500 gap & stats
diamonds |> 
  filter(price < 5000) |> 
  ggplot(aes(x = price)) +
  geom_histogram(binwidth = 50, fill = "steelblue", color = "white") +
  geom_vline(xintercept = median(diamonds$price), color = "blue", linetype = "dashed", linewidth = 1) +
  geom_vline(xintercept = mean(diamonds$price), color = "red", linetype = "dotted", linewidth = 1) +
  scale_x_continuous(breaks = seq(0, 5000, by = 500)) +
  annotate("text", x = 1500, y = 1100, label = "Gap @ ~$1,500!", color = "darkred", fontface = "bold") +
  labs(
    title = "Diamond Price Distribution (< $5,000, binwidth = $50)",
    subtitle = "Dashed Blue = Median ($2,401) | Dotted Red = Mean ($3,933)",
    x = "Price (USD)",
    y = "Frequency"
  )

diamonds$price |> max()


```

### Observations & Visual Diagnostics:
* **Right-Skewed Distribution**: The distribution peaks sharply below \$1,000 and has a long tail reaching \$18,823.
* **Mean vs. Median Divergence**: Due to heavy right-skewness, the **Mean (\$3,933)** is pulled substantially higher than the **Median (\$2,401)**.
* **The \$1,500 Gap Revealed**: At `binwidth = 50` with `$500` ticks, an immediate anomaly is visible: virtually no diamonds are priced between \$1,450 and \$1,550 (a pricing-tier retail artifact).

---

# Profiling All Numerical Distributions at Once

Rather than writing individual histograms for every column, we can use `where(is.numeric)`, `gather()`, and `facet_wrap()`:

```r
library(tidyverse)

diamonds |>
  select(where(is.numeric)) |>
  gather() |>
  ggplot(aes(x = value, fill = key)) +
  geom_histogram(binwidth = 0.5, color = "black", show.legend = FALSE) +
  facet_wrap(~key, scales = "free") +
  labs(
    title = "Histograms of All Numerical Variables",
    x = "Measurement Value",
    y = "Frequency Count"
  )
```

```r
# Step-by-step intermediate inspection:
diamonds |>
  select(where(is.numeric)) |>
  gather()
```



* **Why `gather()`?**: Reshapes multiple numeric columns from wide to long (`key`–`value`) format, which `facet_wrap(~key)` requires to plot every variable as its own subplot simultaneously.
* **Diagnostic Power**: This multi-panel grid reveals the distributions of `carat`, `depth`, `price`, `table`, `x`, `y`, and `z` in a single command.

---

# Understanding Covariation

> **Definition**: **Covariation** is the tendency for the values of two or more variables to vary together in a related manner.

### Real-World Covariation Examples:
* **Height & Weight**: Taller people tend to weigh more (positive linear covariation).
* **Temperature & Ice Cream Sales**: Warmer days increase sales volume.
* **Study Hours & Exam Scores**: Higher study duration correlates with higher grades.
* **Exercise & Body Fat Percentage**: Increased workout frequency correlates with reduced body fat.

To uncover covariation, we analyze the **joint distribution** of variable pairs across three primary combinations:
1. One Continuous and One Categorical variable.
2. Two Categorical variables.
3. Two Continuous variables.

---

# Continuous vs. Categorical: Cut vs. Price Boxplots

How does diamond `cut` quality relate to `price`?

```r
library(tidyverse)

diamonds |> 
  ggplot(aes(x = cut, y = price, fill = cut)) +
  geom_boxplot(color = "black", show.legend = FALSE) +
  labs(
    title = "Price Distribution by Cut Quality",
    x = "Cut Quality",
    y = "Price (USD)"
  )
```


### The Paradox:
* Surprisingly, **Fair** (the lowest cut grade) has a higher median price than **Ideal** (the highest cut grade)!
* Why? We will resolve this confounding variable paradox in the next slides.

---

# Reordering Factor Levels: `fct_reorder()`

By default, ggplot plots categorical axes in alphabetical or factor level order. We can reorder categories dynamically by their median price using **`fct_reorder()`**:

```r
library(tidyverse)

ggplot(
  diamonds,
  aes(x = fct_reorder(cut, price, median), y = price, fill = cut)
) +
  geom_boxplot(show.legend = FALSE) +
  labs(
    title = "Price by Cut (Ordered by Median Price)",
    x = "Cut (Ordered by Median Price)",
    y = "Price (USD)"
  )
```

> **Syntax Breakdown**:  
> `fct_reorder(.f = categorical_variable, .x = quantitative_metric, .fun = median)`

`fct_reorder()` instantly clarifies ranking and relative group performance.

---

# Resolving the Cut-Price Paradox with Faceting

Why do Fair-cut diamonds have higher median prices?

Let's test the hypothesis: **Carat weight is a confounding variable (Simpson's Paradox).**

```r
library(tidyverse)

# Facet carat vs. price across cut quality to control for diamond weight
diamonds |> 
  filter(carat < 3) |> 
  ggplot(aes(x = carat, y = price)) +
  geom_point(alpha = 0.1, color = "steelblue") +
  geom_smooth(method = "gam", color = "darkred", se = FALSE) +
  facet_wrap(~cut) +
  labs(
    title = "Carat vs. Price Faceted by Cut Quality",
    subtitle = "Comparing price trajectories for each cut while holding carat constant",
    x = "Carat Weight",
    y = "Price (USD)"
  )
```

### The Analytical Resolution:
* **Carat Drives Price**: Diamond weight is the primary driver of price across all cut grades.
* **Why the Aggregate Median Misled**: Low-grade cuts (Fair) are typically given to very heavy, flawed rough gems, giving Fair diamonds a higher average weight.
* **Simpson's Paradox Resolved**: Within every single facet (at any identical carat size), **Ideal-cut diamonds are strictly more expensive than Fair-cut diamonds**.

---

# Conditional Distributions: Violin Plots

A **violin plot** combines a boxplot with a mirrored kernel density estimate to reveal multimodal distributions:

```r
library(tidyverse)

diamonds |> 
  ggplot(aes(x = cut, y = price, fill = cut)) + 
  geom_violin(alpha = 0.6, show.legend = FALSE) +
  labs(
    title = "Price Density by Cut Quality (Violin Plot)",
    x = "Cut Quality",
    y = "Price (USD)"
  )
```


Violin plots clearly show the heavy concentration of low-priced diamonds across all cut categories except for fair.

---

# Two Categorical Variables: `geom_count()`

To analyze covariation between two discrete categorical variables (`color` vs. `cut`), count joint combinations:

```r
library(tidyverse)

diamonds |> 
  ggplot(aes(x = color, y = cut)) +
  geom_count(color = "darkblue") +
  labs(
    title = "Joint Frequency of Diamond Color vs. Cut",
    x = "Color Grade (D = Best, J = Worst)",
    y = "Cut Quality",
    size = "Number of Diamonds"
  )
```


Point area scales proportionally with the number of observations at each intersection.

---

# Categorical Heatmaps: `geom_tile()`

A **tile heatmap** provides a cleaner, color-filled visualization of cross-tabulation counts:

```r
library(tidyverse)

# Compute joint frequencies and render a 2D tile heatmap
diamonds |> 
  count(color, cut) |>
  ggplot(aes(x = color, y = cut, fill = n)) +
  geom_tile(color = "white") +
  scale_fill_gradient(low = "aliceblue", high = "midnightblue") +
  labs(
    title = "Heatmap of Diamond Concentrations (Color vs. Cut)",
    x = "Color Grade",
    y = "Cut Quality",
    fill = "Total Gems"
  )
```

```r
# Inspecting the raw contingency table in console:
diamonds |> count(color, cut) |> print(n = 6)
```


---

# Two Continuous Variables: Managing Overplotting

Plotting 53,940 diamonds on a scatter plot causes severe **overplotting** (points stacking on top of each other into a solid black mass).

### Strategy 1: Adjust Alpha Transparency (`alpha`)
```r
library(tidyverse)

# Alpha = 0.5 allows overlapping points to reveal density
diamonds |> 
  ggplot(aes(x = carat, y = price, color = cut)) +
  geom_point(alpha = 0.5) + 
  labs(
    title = "Joint Distribution of Quantitative Variables",
    x = "Carat Weight",
    y = "Price (USD)",
    color = "Cut"
  )
```


---

# Two Continuous Variables: 2D Binning (`geom_bin2d`)

### Strategy 2: Rectangular Binning (`geom_bin2d`)
Divides the 2D plane into a grid of rectangles and counts the number of points falling into each bin:

```r
library(tidyverse)

ggplot(diamonds, aes(x = carat, y = price)) +
  geom_bin2d(bins = 40) +
  scale_fill_viridis_c() +
  labs(
    title = "2D Binned Density: Carat vs. Price",
    x = "Carat Weight",
    y = "Price (USD)",
    fill = "Count"
  )
```

> ### Alternative 2D Density Geometries:
> * **`geom_hex()`**: Hexagonal binning (requires `library(hexbin)`)
> * **`geom_density_2d()`**: Bivariate contour lines
> * **`stat_density_2d(geom = "raster")`**: Smooth raster density map

---

# Non-Linear Modeling: LOESS Smoothing

To visualize the central trajectory without being misled by individual point dispersion, fit a **LOESS** (Locally Estimated Scatterplot Smoothing) curve:

```r
library(tidyverse)

# Smooth trend curve with stat_smooth()
diamonds |> 
  ggplot(aes(x = carat, y = price)) +
  geom_point(alpha = 0.1, color = "gray60") + 
  stat_smooth(color = "blue", linewidth = 1.2) +
  labs(
    title = "Joint Distribution with LOESS Smooth Curve",
    x = "Carat Weight",
    y = "Price (USD)"
  )
```



The smoothing curve highlights the exponential price acceleration between 0.5 and 2.0 carats, followed by variance expansion and leveling off past 3 carats.

---

# Stratified Smoothing Curves by Category

We can map `color = cut` to compute independent LOESS curves for each cut quality:

```r
library(tidyverse)

diamonds |> 
  ggplot(aes(x = carat, y = price, color = cut)) +
  geom_point(alpha = 0.05) + 
  stat_smooth(se = FALSE, linewidth = 1.1) +
  labs(
    title = "Price Trajectories Stratified by Cut",
    x = "Carat Weight",
    y = "Price (USD)",
    color = "Cut Quality"
  )
```

### What Stratification Proves:
* At **every fixed carat level**, the curve for **Ideal** cut lies above **Very Good**, which lies above **Good**, which lies above **Fair**!
* Stratification completely resolves the paradox: once carat is controlled for, cut quality strictly increases diamond value.

---

# Multivariate Analysis: Matrix Pair Plots (`pairs()`)

To evaluate correlations across all numerical variables simultaneously, use the base R **`pairs()`** function:

```r
library(tidyverse)

# Generate an all-against-all matrix of scatterplots
diamonds |>
  select(where(is.numeric)) |>
  pairs(
    col = diamonds$cut,
    pch = 19,
    cex = 0.2,
    main = "Multivariate Pair Plot of Diamonds Numerical Features"
  )
```


### Diagnostics from Pair Plots:
* `carat`, `x`, `y`, and `z` are almost perfectly co-linear (physical dimensions determine weight).
* `depth` and `table` have near-zero correlation with `price`.

---

# Synthesis: Key Empirical Findings from Diamonds EDA

Through visual and numerical exploration, we discovered four major empirical insights:

1. **Price Skewness**: Price is heavily right-skewed; the majority of commercial diamonds cost under \$2,500.
2. **Carat Clustering**: Carat distributions exhibit massive artificial spikes at prestigious market thresholds (0.30, 0.50, 0.70, 1.00 ct).
3. **Multi-Variable Confounding**: Fair cuts appeared expensive in univariate summaries because low cuts are disproportionately given to larger diamonds. Holding carat constant reverses this relationship.
4. **Physical Dimension Co-linearity**: Dimensions $x$, $y$, $z$ correlate almost perfectly with carat weight, with a few notable 0.00 mm recording errors.

---

# Transition: From EDA to Modeling

EDA is the vital precursor to statistical modeling and machine learning:

| 1. Exploratory EDA | $\rightarrow$ | 2. Feature Engineering | $\rightarrow$ | 3. Predictive Modeling |
| :--- | :---: | :--- | :---: | :--- |
| • Detect & flag outliers<br>• Identify confounding variables<br>• Uncover non-linear patterns | $\rightarrow$ | • Log-transform skewed features<br>• Dimension/unit conversions<br>• Create interaction terms | $\rightarrow$ | • Linear Models (`lm`)<br>• Random Forests / XGBoost<br>• Neural Networks |

### Next Steps in the Modeling Pipeline:
* Use log-transforms on `price` and `carat` to linearize the exponential relationship.
* Remove corrupted rows where physical dimensions ($x, y, z$) equal zero.
* Include interaction terms between `carat` and categorical features (`cut`, `color`, `clarity`).

---

# Module Summary & Best Practices

1. **Adopt the Tukey Mindset**: Treat data as a mystery; let initial visualizations inspire your next question.
2. **Always Audit First**: Run `summary()`, `glimpse()`, and `colSums(is.na())` before plotting.
3. **Tune Your Binwidths**: Manipulate histogram binwidths to reveal rounding artifacts and hidden thresholds.
4. **Isolate Outliers with Boxplots**: Flag data entry errors vs. valuable rare observations.
5. **Reorder Categorical Axes**: Use `fct_reorder()` to organize factor categories by median value for instant clarity.
6. **Prevent Overplotting**: Use `alpha` transparency, `geom_bin2d()`, and LOESS smoothing curves on large datasets.
7. **Beware of Confounding Variables**: Stratify and facet continuous relationships to avoid Simpson's Paradox.
