# Simple Linear Regression & Model Diagnostics

DATASCI 306: Lecture 19

```r Notice="" block=setup
library(tidyverse)
library(modelr)

processors <- read.csv("https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/all-data.csv")

get_column <- function(x, y) {
  benchmark <- paste(paste("Spec", x, sep = ""), "..average.base.", sep = "")
  ix <- !is.na(processors[, benchmark])
  return(processors[ix, y])
}

extract_data <- function(benchmark) {
  temp <- paste(paste("Spec", benchmark, sep = ""), "..average.base.", sep = "")
  perf <- get_column(benchmark, temp)
  max_perf <- max(perf)
  min_perf <- min(perf)
  range <- max_perf - min_perf
  nperf <- 100 * (perf - min_perf) / range

  clock <- get_column(benchmark, "Processor.Clock..MHz.")
  threads <- get_column(benchmark, "Threads.core")
  cores <- get_column(benchmark, "Cores")
  TDP <- get_column(benchmark, "TDP")
  transistors <- get_column(benchmark, "Transistors..millions.")
  dieSize <- get_column(benchmark, "Die.size..mm.2.")
  voltage <- get_column(benchmark, "Voltage..low.")
  featureSize <- get_column(benchmark, "Feature.Size..microns.")
  channel <- get_column(benchmark, "Channel.length..microns.")
  FO4delay <- get_column(benchmark, "FO4.Delay..ps.")
  L1icache <- get_column(benchmark, "L1..instruction...on.chip.")
  L1dcache <- get_column(benchmark, "L1..data...on.chip.")
  L2cache <- get_column(benchmark, "L2..on.chip.")
  L3cache <- get_column(benchmark, "L3..on.chip.")

  return(data.frame(
    nperf, perf, clock, threads, cores, TDP, transistors, dieSize,
    voltage, featureSize, channel, FO4delay, L1icache, L1dcache, L2cache, L3cache
  ))
}

int92.dat <- extract_data("Int1992")
int00.dat <- extract_data("Int2000")
```

---

# Learning Objectives

After today's lecture, you will understand:
* How to run simple linear regressions in R using **`lm()`**
* How to extract predictions and residuals using **`modelr`** (`add_predictions()`, `add_residuals()`)
* How to interpret every section of the **`summary.lm()`** output (coefficients, standard errors, $t$-values, $p$-values, residuals, and $R^2$)
* How to diagnose model assumptions and apply feature engineering on real datasets (CPU benchmarks and diamond prices)

These notes follow Chapters 1 and 3 of [*Linear Regression Using R*](https://conservancy.umn.edu/bitstream/handle/11299/189222/LinearRegressionUsingR2ed_fulltext.pdf?sequence=12&isAllowed=y).

---

# What Is a Statistical Model?

Visualizations let you spot relationships, whereas statistical models let you quantify them.

A **statistical model** is a mathematical formula that relates an outcome with one or more explanatory variables:

$$Y = f(X) + \epsilon$$

* **$Y$** — **Outcome** (response or dependent variable)
* **$f$** — **Model function** capturing systematic relationships
* **$X$** — **Explainer** (predictor, explanatory, or independent variable)
* **$\epsilon$** — **Noise** (random error or variation not captured by $f(X)$)

---

# Model Classes

The types of functions $f$ that we allow determine what is called the **model class**.

For example, in introductory statistics you learned about **simple linear regression**, where $f$ is any function of the form:

$$f(x) = a_0 + a_1 x$$

for some parameters $a_0$ (intercept) and $a_1$ (slope).
* This defines an entire **family of models**: one for each choice of intercept $a_0$ and slope $a_1$.
* **Linear regression** modeling assumes that the outcome can be explained using a linear combination of the input values.

---

# Model Fitting

The process of **fitting** a model refers to selecting a particular function from the chosen family of models in order to best match the observed data.

* The fitted model is the member of our selected model family that is "closest" to the data.
* This does **not** mean that the fitted model is the "true" underlying law of nature! In most real-world problems, there is no "true" model.

> **Key Principle:** The goal of a model is not to uncover absolute truth, but to discover a simple approximation that is still useful.

---

# Model Selection

Beyond fitting parameters within a single family, we also face a broader question: *which family of models (which class of functions $f(x)$) should we use?*

For example, we could instead choose our model family to be:

$$\{f : f \text{ is a neural network}\}$$

* Choosing an appropriate model family is known as **model selection**.
* Model selection is much trickier than model fitting because there is no single universal answer ("all models are wrong, but some are useful").
* An appropriate model family balances our needs for **interpretability**, **predictiveness**, and **simplicity**.

---

# The `lm()` Command and `modelr`

The linear model is the most foundational model in statistics. In base R, the command to fit linear models is **`lm()`**.

We also load the **`modelr`** package so that `lm()` integrates seamlessly with tidyverse pipelines and tibbles:

```r
library(modelr)

# modelr includes a simple bivariate dataset called sim1:
sim1 |> print()
```

---

# Exploring the `sim1` Dataset

Let's first explore `sim1` visually using a scatter plot:

```r
ggplot(sim1, aes(x, y)) +
  geom_point(size = 2, color = "steelblue") +
  labs(title = "Bivariate Relationship in sim1")
```

The plot suggests a strong linear relationship, indicating that $y = a_0 + a_1 x$ is a promising candidate model family.

---

# Guessing a Linear Model Visually

If we pick specific values for $a_0$ and $a_1$, we get a candidate prediction line. Let's plot various choices of $a_0$ and $a_1$ to visually see how well they fit:

```r
# Compare an initial guess (a0 = 4, a1 = 4) with a closer guess (a0 = 2, a1 = 2.5)
ggplot(sim1, aes(x, y)) +
  geom_abline(aes(intercept = 4, slope = 4), color = "red", linewidth = 1) +
  geom_abline(aes(intercept = 2, slope = 2.5), color = "darkgreen", linetype = "dashed", linewidth = 1) +
  geom_point(size = 2) +
  labs(subtitle = "Red: y = 4 + 4x | Dashed Green: y = 2 + 2.5x")
```

The line represents the value $\hat{y}$ that our model predicts for each value of $x$.

---

# Measuring Model Fit: Residuals

How do we quantify how well a candidate line fits the data?
* For each data point $(x_i, y_i)$, we measure the vertical discrepancy between the observed value $y_i$ and the predicted value $\hat{y}_i = a_0 + a_1 x_i$.
* The difference between the observed and predicted value is called the **residual**:

$$\text{resid}_i = y_i - \hat{y}_i = y_i - (a_0 + a_1 x_i)$$

* The residual is the component of the data that isn't predicted by our model.
* If we predicted the data perfectly ($\hat{y}_i = y_i$ for all $i$), every residual would equal zero—so smaller residual magnitudes indicate a closer fit (though fitting noisy data *too* perfectly with overly complex models causes overfitting).

---

# Fitting a Linear Model with `lm()`

To find the best-fitting line in R, we use `lm()` with R's formula syntax denoted by `~`:

```
lm(y ~ x, data = sim1)
```

which reads: *"regress `y` on `x` using `sim1`"*.

```r
mdl <- lm(y ~ x, data = sim1) |> print()
```

This tells us that the best-fitting linear model has intercept $\hat{a}_0 = 4.221$ and slope $\hat{a}_1 = 2.052$.

---

# Why Is This the Best-Fitting Model? (OLS)

Over all possible choices of $a_0$ and $a_1$, the estimates $\hat{a}_0$ and $\hat{a}_1$ selected by `lm()` minimize the **Sum of Squared Errors (SSe)** using **Ordinary Least Squares (OLS)**:

$$\text{SSe} = \sum_{i=1}^{n} \big[ \underbrace{y_i}_{\text{observed}} - \underbrace{(\hat{a}_0 + \hat{a}_1 x_i)}_{\text{predicted}} \big]^2$$

```r
# Plot the OLS best-fit line (intercept = 4.221, slope = 2.052)
ggplot(sim1, aes(x, y)) +
  geom_point(size = 2) +
  geom_abline(intercept = coef(mdl)[1], slope = coef(mdl)[2], color = "blue", linewidth = 1)
```

---

# Generating Predictions with `add_predictions()`

We can use `modelr::add_predictions()` to append the model's predicted values ($\hat{y}_i$) as a new `pred` column in the original data frame:

```r
sim1 |>
  add_predictions(mdl) |>
  print()
```

---

# Exercise: Predicting $y$ When $x = 0$

**Question:** According to our fitted model `mdl`, what is the predicted value of $y$ when $x = 0$?

```r
mdl <- lm(y ~ x, data = sim1)
mdl

# Compute the predicted value of y when x = 0:
y_at_0 <- 0 * 2.0515 + 4.2208
y_at_0

# Verify using add_predictions() on a new tibble:
tibble(x = 0) |> add_predictions(mdl)
```

When $x = 0$, the predicted value $\hat{y}$ is simply the intercept $\hat{a}_0 \approx 4.221$.

---

# Summarizing the Linear Model

The main tool for inspecting a fitted `lm` object in detail is the **`summary()`** function:

```r
summary(mdl)
```

Let's break down each section of this output: **Coefficients**, **Residuals**, and **Goodness-of-Fit**.

---

# Deconstructing the `Coefficients` Section

In most analyses, the `Coefficients` table is the primary focus:

* **`Estimate`**: The OLS parameter estimates ($\hat{a}_0 = 4.2208$, $\hat{a}_1 = 2.0515$).
* **`Std. Error`**: The standard error of each estimate, measuring uncertainty in the estimated parameter.
* **`t value`**: The Student $t$-statistic, which is simply the ratio of the estimate to its standard error:
  $$t = \frac{\text{Estimate}}{\text{Std. Error}}$$
* **`Pr(>|t|)`**: The $p$-value—the probability of observing a $t$-statistic at least this extreme under the null hypothesis that the true parameter is zero ($H_0: a_j = 0$). Here, both the intercept and slope are highly significantly different from zero ($p < 0.001$).

```r
# Verify that t value = Estimate / Std. Error:
coef_table <- summary(mdl)$coefficients
coef_table[, "Estimate"] / coef_table[, "Std. Error"]
```

---

# Deconstructing the `Residuals` Summary

Recall that the residual is $\text{resid}_i = y_i - \hat{y}_i$. The `Residuals` section of `summary(mdl)` displays the five-number summary (`Min`, `1Q`, `Median`, `3Q`, `Max`) of the residuals:

* If the linear model is well-specified and errors are normally distributed:
  * The **median** residual should be close to **zero**.
  * The **minimum** and **maximum** values should have roughly the **same magnitude**.
  * The **first (`1Q`)** and **third (`3Q`)** quartiles should also have roughly the **same magnitude**.
* **Residual Standard Error (RSE)** measures the typical magnitude of the residuals (the standard deviation of the unexplained variation).

```r
summary(mdl)$sigma # Residual standard error
summary(residuals(mdl))
```

---

# Extracting & Inspecting Residuals

Using `modelr::add_residuals()`, we can append the residuals (`resid`) alongside `pred` directly to our dataset:

```r
sim1 |>
  add_residuals(mdl) |>
  add_predictions(mdl) |>
  print()
```

---

# Visualizing the Residual Distribution

If the model has done a good job of capturing systematic patterns in the data, the residuals should look like normally distributed random noise centered at zero:

```r
sim1 |>
  add_residuals(mdl) |>
  ggplot(aes(x = resid)) +
  geom_histogram(bins = 12, fill = "steelblue", color = "white") +
  labs(title = "Histogram of Residuals for sim1", x = "Residual", y = "Count")
```

If the residuals contain obvious patterns or strong skewness, there is more modeling work to be done!

---

# Diagnosing Non-Normal Residuals

Let's see an example where the error term follows an asymmetric exponential distribution (`rexp()`), causing the residuals to look strongly non-normal:

```r
set.seed(42)
df <- tibble(x = rnorm(n = 100), y = x + rexp(n = 100))
fit <- lm(y ~ x, data = df)
summary(fit)
```

```r
df |>
  add_residuals(fit) |>
  ggplot(aes(x = resid)) +
  geom_histogram(bins = 20, fill = "tomato", color = "white") +
  labs(title = "Right-Skewed Residuals Signal Model Misspecification")
```

If you see this in real data, it is a clear signal that a simple untransformed linear model is not appropriate.

---

# Measures of Goodness-of-Fit

The bottom lines of `summary(mdl)` quantify the overall fit of the linear model:

* **Degrees of freedom (`df`)**: Number of observations ($n$) minus number of estimated parameters ($p$). For `sim1`, $\text{df} = 30 - 2 = 28$.
* **$\text{SSe}$ (Sum of Squared Errors)**: $\sum_{i=1}^{n} (\hat{y}_i - y_i)^2$.
* **Residual Standard Error (RSE)**: $\sqrt{\frac{\sum_{i=1}^{n} (\hat{y}_i - y_i)^2}{\text{df}}} = \sqrt{\frac{\text{SSe}}{\text{df}}}$.
* **$\text{SSy}$ (Total Sum of Squares)**: $\sum_{i=1}^{n} (y_i - \bar{y})^2$.
* **Multiple R-squared ($R^2$)**: Proportion of total variance in $y$ explained by the model:
  $$R^2 = 1 - \frac{\text{SSe}}{\text{SSy}}$$
* **Adjusted R-squared**: Penalizes $R^2$ for the number of predictors used (since raw $R^2$ always increases when adding predictors).
* **F-statistic**: Tests the null hypothesis that all slope coefficients in the model are simultaneously zero.

---

# Computing $\text{SSy}$, $\text{SSe}$, and $R^2$ Manually

We can verify how `summary(mdl)` computes $R^2 = 0.8846$ using a simple `dplyr` pipeline:

```r
sim1 |>
  add_residuals(mdl) |>
  summarize(
    SSy = sum((y - mean(y))^2),
    SSe = sum(resid^2),
    RSE = sqrt(SSe / 28)
  ) |>
  mutate(R2 = 1 - SSe / SSy)
```

---

# Regression Example #1: The CPU DB Database

Our first real-world regression dataset comes from the textbook's CPU DB processor database (`all-data.csv`), which records computer processors and their performance-related engineering metrics.

![CPU processor chip](https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/images/cpu.jpeg)

* **`int00.dat`** contains all processors with benchmark results for the **SPEC Integer 2000 (`Int2000`)** benchmark suite.
* **`fp00.dat`** contains processors tested on the **Floating-Point 2000 (`Fp2000`)** benchmarks.

Let's inspect the first few rows of `int00.dat`:

```r
int00.dat |> head()
```

---

# CPU DB Variable Dictionary & Ranges

Let's inspect the ranges of normalized performance (`nperf`, scaled 0 to 100) and raw SPEC performance (`perf`):

```r
int00.dat$nperf |> range()
int00.dat$perf |> range()
```

| Variable | Description | Variable | Description |
| :--- | :--- | :--- | :--- |
| **`nperf`** | Normalized performance (0–100) | **`voltage`** | Nominal operating voltage |
| **`perf`** | Raw SPEC benchmark performance | **`featureSize`** | Fabrication feature size (microns) |
| **`clock`** | Clock frequency (MHz) | **`channel`** | Fabrication channel length (microns) |
| **`threads`** | Hardware threads available per core | **`FO4delay`** | Fan-out-four delay (ps) |
| **`cores`** | Number of hardware cores available | **`L1icache`** | Level 1 instruction cache size |
| **`TDP`** | Thermal design power (Watts) | **`L1dcache`** | Level 1 data cache size |
| **`transistors`** | Transistors on the chip (millions) | **`L2cache`** | Level 2 cache size |
| **`dieSize`** | Physical size of the chip ($\text{mm}^2$) | **`L3cache`** | Level 3 cache size |

---

# EDA & Fitting `perf` vs. `clock`

`perf` measures benchmark performance and `clock` measures clock speed in MHz. Are they linearly related?

$$\text{perf} = a_0 + a_1 \cdot \text{clock}$$

```r
# Fit the linear model regressing perf on clock:
int00.lm <- lm(perf ~ clock, data = int00.dat)
int00.lm
```

---

# Visualizing the `perf ~ clock` Regression Line

We can use `geom_smooth(method = "lm")` to plot the OLS regression line directly atop the scatter plot:

```r
ggplot(int00.dat, aes(x = clock, y = perf)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm", color = "blue") +
  labs(title = "SPEC Integer 2000 Performance vs. Clock Speed (MHz)")
```

---

# Summarizing `int00.lm` & Visualizing Residuals

Let's examine `summary(int00.lm)` and check the distribution of residuals:

```r
summary(int00.lm)
```

```r
int00.dat |>
  add_residuals(int00.lm) |>
  ggplot(aes(x = resid)) +
  geom_histogram(bins = 30, fill = "steelblue", color = "white")
```

* **Residual standard error** is high (about $396.1$) relative to the scale of `perf`.
* **$R^2$ is $0.6455$**, which is moderate.
* The residuals do **not** appear to be normally distributed!

---

# Diagnostic Plot: Residuals vs. Fitted Values

Next, let's plot the residuals against the fitted predictions, colored by `clock`:

```r
int00.dat |>
  add_residuals(int00.lm) |>
  add_predictions(int00.lm) |>
  ggplot() +
  geom_point(aes(x = resid, y = pred, color = clock)) +
  labs(title = "Residuals vs. Predicted Performance")
```

If the linear model is correct, remaining variation should look like pure random noise with no discernible pattern. Instead, we observe:
1. **Heteroscedasticity**: Residuals have increasing variance for larger values of `clock`.
2. **Clustering**: Several distinct clusters of residuals appear.
* **Conclusion**: `clock` alone is not sufficient to fully explain `perf`!

---

# Exploring Further: What Explains the Clusters?

What explains the distinct clusters in the CPU performance data and residuals? Let's color the scatter plot by the number of hardware **`cores`**:

```r
int00.dat |>
  ggplot(aes(x = clock, y = perf, color = factor(cores))) +
  geom_point(size = 2) +
  labs(title = "Performance vs. Clock Speed by Number of Cores", color = "Cores")
```

Multi-core processors achieve much higher performance at the same clock speed! In the next lecture, we will use **multiple linear regression** to account for multiple predictors simultaneously.

---

# Regression Example #2: Modeling Diamond Prices

Next, let's use linear regression to study the relationship between the `price` and weight (`carat`) of diamonds:

```r
dm.lm1 <- lm(price ~ carat, data = diamonds)
summary(dm.lm1)
```

```r
ggplot(diamonds, aes(x = carat, y = price)) +
  geom_point(alpha = 0.1) +
  geom_smooth() +
  labs(title = "Diamond Price vs. Carat Weight (Untransformed)")
```

---

# Feature Engineering: Log-Log Transformation

Sometimes a strong linear relationship emerges if we first transform the variables. Let's examine $\log(\text{price})$ vs. $\log(\text{carat})$:

```r
dm.lm <- lm(log(price) ~ log(carat), data = diamonds)
summary(dm.lm)
```

```r
diamonds |>
  add_residuals(dm.lm) |>
  ggplot(aes(x = resid)) +
  geom_histogram(bins = 40, fill = "seagreen", color = "white") +
  labs(title = "Residuals of Log-Log Diamond Model: Symmetric & Normal!")
```

After taking logarithms, $R^2$ jumps from $0.8493$ to **$0.933$**, and the residuals look remarkably symmetric and normal around zero!

---

# Hands-On Practice Exercises

### Exercise 1: Exploring Untransformed vs. Log-Transformed Predictions
Fit both `dm.lm1 <- lm(price ~ carat, data = diamonds)` and `dm.lm <- lm(log(price) ~ log(carat), data = diamonds)`. Compare their $R^2$ values and plot the log-log scatter plot with `geom_smooth(method = "lm")`.

```r
# Write your solution here:
```

<details>
<summary><strong>Click to view Solution</strong></summary>

```r
dm.lm1 <- lm(price ~ carat, data = diamonds)
dm.lm <- lm(log(price) ~ log(carat), data = diamonds)

cat("Untransformed R2:", summary(dm.lm1)$r.squared, "\n")
cat("Log-Log R2:      ", summary(dm.lm)$r.squared, "\n")

ggplot(diamonds, aes(x = log(carat), y = log(price))) +
  geom_point(alpha = 0.05, color = "royalblue") +
  geom_smooth(method = "lm", color = "red") +
  theme_minimal()
```

</details>
