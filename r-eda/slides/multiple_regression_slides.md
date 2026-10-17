# Multiple Linear Regression & Predictor Selection

DATASCI 306: Lecture 20

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

data(Titanic)
titanic_df <- Titanic |>
  as_tibble() |>
  mutate(Survived = Survived == "Yes")
titanic_df <- titanic_df[rep(row.names(titanic_df), titanic_df$n), -5]
```

---

# Learning Objectives

After today's lecture, you will understand:
* The role of **categorical predictors** in regression and how R constructs dummy variables (`model_matrix()`)
* How to fit **multiple linear regressions** using `lm()`
* How to interpret the multiple linear model graphically and mathematically (`summary.lm()`)
* How to perform **stepwise predictor selection** guided by domain knowledge (`update()`)
* Why linear regression fails on binary outcomes and how **logistic regression (`glm()`)** solves it

These notes follow Chapters 1, 3, and 4 of [*Linear Regression Using R*](https://conservancy.umn.edu/bitstream/handle/11299/189222/LinearRegressionUsingR2ed_fulltext.pdf?sequence=12&isAllowed=y).

---

# Recap: Simple Linear Regression on `sim1`

In the last lecture, we studied the `sim1` dataset, which had:
* Only one **continuous** predictor (`x`), and
* A **continuous** outcome (`y`).

```r
sim1 |> print()
```

---

# Dealing with a Categorical Variable (`sim2`)

Today, we begin with `sim2` (from `library(modelr)`), which is similar to `sim1` except that `x` is now a **categorical variable** with four discrete categories (`"a"`, `"b"`, `"c"`, `"d"`):

```r
sim2 |> print()
```

```r
ggplot(sim2) +
  geom_boxplot(aes(x = x, y = y, fill = x)) +
  theme_minimal()
```

---

# Categorical Predictors in `lm()`

What happens when we regress `y` on the categorical variable `x` using `lm(y ~ x, sim2)`?

```r
mdl <- lm(y ~ x, data = sim2)
summary(mdl)
```

Notice that regressing `y` on `x` caused R to automatically create **three** indicator predictors (`xb`, `xc`, `xd`)!

---

# Dummy Variables & `model_matrix()`

R has estimated the model:

$$y = a_0 + a_1\{x=b\} + a_2\{x=c\} + a_3\{x=d\}$$

Each bracketed term (e.g., $\{x=b\}$) is an **indicator (dummy) variable** equal to $1$ if the observation has `x == "b"`, and $0$ otherwise.

We can use **`model_matrix()`** to inspect the exact numerical predictors R constructed under the hood:

```r
sim2 |> model_matrix(y ~ x)
```

---

# Interpreting Categorical Coefficients

How do we interpret the coefficients in:

$$y = a_0 + a_1\{x=b\} + a_2\{x=c\} + a_3\{x=d\}$$

* When `x == "a"` (the **reference level** or baseline category), each of $\{x=b\}$, $\{x=c\}$, and $\{x=d\}$ equals $0$.
* Therefore, the regression prediction for the subset of observations with `x == "a"` simplifies to:

$$y = a_0$$

---

# Exercise: What Exactly Is the Value $a_0$?

**Question:** In `lm(y ~ x, data = sim2)`, we found `(Intercept) = 1.1522`. What property of the `x == "a"` group does $a_0$ represent? Verify using `dplyr`.

```r
# Compute the mean of y for observations where x == 'a':
sim2 |>
  filter(x == "a") |>
  summarize(a0 = mean(y, na.rm = TRUE))
```

The intercept $\hat{a}_0 = 1.152166$ is the exact sample mean of $y$ in the baseline category `x == "a"`!

---

# What About the Other Coefficients ($a_1, a_2, a_3$)?

The remaining coefficients measure **offsets relative to the baseline group `x == "a"`**.

For example, the predicted mean of all observations with `x == "b"` is $\hat{a}_0 + \hat{a}_1$ because `{x=b} = 1` and `{x=c} = {x=d} = 0`:

$$\mathbb{E}(y \mid x = b) = \hat{a}_0 + \hat{a}_1 \implies \hat{a}_1 = \bar{y}_{x=b} - \bar{y}_{x=a}$$

```r
# Mean of x == 'b' group minus the baseline mean (a0 = 1.152166) equals xb's coefficient (6.963873):
sim2 |>
  filter(x == "b") |>
  summarize(a1 = mean(y) - 1.152166)
```

---

# Multiple Linear Regression

The categorical model above is an instance of **multiple linear regression**, which generalizes simple linear regression to assume that each observation $y$ is a linear combination of several predictors $x_1, \dots, x_k$:

$$y = a_0 + a_1 x_1 + a_2 x_2 + \dots + a_k x_k + \text{noise}$$

Recall from our last lecture that the simple model `perf ~ clock` on `int00.dat` left clustered residuals and unexplained variation:

```r
ggplot(int00.dat, aes(x = clock, y = perf)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm")
```

Let's use multiple linear regression to add more predictors and improve the fit!

---

# Adding a Categorical Predictor (`factor(cores)`)

Recall that `cores` tells us how many hardware cores each processor chip has, which appeared to explain the performance clusters at higher `clock` speeds:

```r
ggplot(int00.dat) +
  geom_point(aes(x = clock, y = perf, color = factor(cores)))
```

Let's add `factor(cores)` as a categorical predictor alongside `clock`:

```r
mdl <- lm(perf ~ clock + factor(cores), data = int00.dat)
summary(mdl)
```

---

# Interpreting the Multiple Linear Model: Graphical View

How do we interpret `lm(perf ~ clock + factor(cores), data = int00.dat)`? Let's add the predicted values (`pred`) and plot them:

```r
int00.dat |>
  add_predictions(mdl) |>
  ggplot(aes(x = clock, color = factor(cores))) +
  geom_point(aes(y = perf), alpha = 0.6) +
  geom_line(aes(y = pred), linewidth = 1.1) +
  labs(title = "Parallel Regression Lines: clock + factor(cores)", color = "Cores")
```

---

# Interpreting the Multiple Linear Model: Mathematical View

Graphically and mathematically, the additive model `perf ~ clock + factor(cores)` fits **three parallel lines** with identical slopes ($a_1$) for `clock` but different $y$-intercepts for each `cores` group:

$$\begin{aligned}
\text{perf} &= a_0 + a_1 \cdot \text{clock} & (\text{cores} = 1) \\
\text{perf} &= (a_0 + a_2) + a_1 \cdot \text{clock} & (\text{cores} = 2) \\
\text{perf} &= (a_0 + a_3) + a_1 \cdot \text{clock} & (\text{cores} = 4)
\end{aligned}$$

* `cores = 1` is the baseline intercept ($a_0 = -246.5$).
* Dual-core chips (`cores = 2`) shift the line upward by $a_2 = +486.0$.
* Quad-core chips (`cores = 4`) shift the line upward by $a_3 = +1352.9$.

---

# Modeling `cores` as a Continuous Variable

Now let's see what happens if we treat `cores` as a **continuous numeric variable** instead of a factor:

```r
mdl_cont <- lm(perf ~ clock + cores, data = int00.dat)
summary(mdl_cont)
```

```r
int00.dat |>
  add_predictions(mdl_cont) |>
  ggplot(aes(x = clock, color = factor(cores))) +
  geom_point(aes(y = perf), alpha = 0.6) +
  geom_line(aes(y = pred), linewidth = 1.1)
```

Here, each additional core is constrained to increase average performance by a fixed linear step of **$+431.3$** points, whereas `factor(cores)` allowed the jumps from $1 \to 2$ and $2 \to 4$ to differ freely.

---

# Exercise: Predicting `perf` for `clock = 1000, cores = 4`

**Question:** Using the continuous model `lm(perf ~ clock + cores, data = int00.dat)`, what is the predicted value of `perf` when `clock = 1000` and `cores = 4`?

```r
mdl_cont <- lm(perf ~ clock + cores, data = int00.dat)

# Predict using add_predictions() on a 1-row tibble:
tibble(clock = 1000, cores = 4) |>
  add_predictions(mdl_cont)
```

---

# Identifying Predictors: General Rules of Thumb

Now that we can include arbitrarily many predictors in a model, how should we decide which variables to include?

There is no single mechanical answer—it depends on your analytical goal:
1. **Interpretability (Parsimony)**: Smaller models are easier to interpret. If your goal is to understand the data-generating process, seek the smallest model that achieves strong explanatory power.
2. **Predictive Accuracy vs. Overfitting**: If your goal is prediction, using more predictors (and engineered features) often helps—up to a point! Adding too many predictors leads to **overfitting**, where the model memorizes training noise and performs poorly on new, unseen data.
3. **Domain Knowledge & EDA**: Always guide variable selection with domain knowledge and exploratory data analysis rather than relying blindly on automated algorithms.

---

# Starting with Everything: The "Kitchen Sink" Model

Let's inspect `int00.dat` and see what happens if we regress `perf` on **every** column (`perf ~ .`):

```r
int00.dat |> head(3)
lm(perf ~ ., data = int00.dat) |> summary()
```

We get a useless model (`ALL 19 residuals are 0: no residual degrees of freedom!`)! Why did this happen?

---

# Why Did `lm(perf ~ .)` Fail? Missingness!

Let's inspect `summary(int00.dat)` and `nrow(int00.dat)`:

```r
nrow(int00.dat)
summary(int00.dat)
```

* `int00.dat` has **$256$ rows**, but several columns (like `L3cache` with $236$ `NA`s and `TDP` with $186$ `NA`s) are missing for almost every processor!
* Because `lm()` automatically drops any row containing an `NA` in any predictor used in the formula, including all columns reduces our dataset to just $19$ complete rows!

---

# Applying Domain Knowledge to Choose Predictors

Instead of blindly throwing every column into `lm()`, we use **computer architecture domain knowledge** to form our initial candidate predictor list:

* **Hardware & Fabrication Metrics**: `clock`, `threads`, `cores`, `transistors`, `dieSize`, `voltage`, `featureSize`, `channel`, `FO4delay`
* **Cache Size & Square-Root Terms**: `L1icache`, $\sqrt{\text{L1icache}}$, `L1dcache`, $\sqrt{\text{L1dcache}}$, `L2cache`, $\sqrt{\text{L2cache}}$
* **Why exclude `TDP` and `L3cache`?**
  * Thermal design power (`TDP`) is not a direct architectural driver of integer benchmark speed (and has 186 `NA`s).
  * `L3cache` was absent on almost all chips in the SPEC 2000 era (236 `NA`s).
* **Why include $\sqrt{\text{cache}}$?** In computer architecture, cache miss rates are empirically proportional to the **square root** of the cache size!

---

# Stepwise Regression: Fitting the Full Domain Model

Let's apply **backward stepwise regression**:
1. Start with all candidate predictors chosen via domain knowledge.
2. Iteratively drop the predictor with the largest insignificant $p$-value ($p > 0.05$).
3. Repeat until all remaining predictors are statistically significant.

```r
int00.lm.full <- lm(
  nperf ~ clock + threads + cores + transistors + dieSize + voltage +
    featureSize + channel + FO4delay + L1icache + sqrt(L1icache) +
    L1dcache + sqrt(L1dcache) + L2cache + sqrt(L2cache),
  data = int00.dat
)
summary(int00.lm.full)
```

---

# Checking Degrees of Freedom in `int00.lm.full`

Notice the message at the bottom of `summary(int00.lm.full)`:
* `(179 observations deleted due to missingness)`
* With $15$ predictors plus $1$ intercept ($16$ parameters total), the residual degrees of freedom (`df`) is:

```r
missing <- 179
df <- nrow(int00.dat) - missing - 16
df
```

---

# Dropping a Candidate Predictor with `update()`

Looking at the coefficients of `int00.lm.full`, which predictor is the least significant?
* `FO4delay` has estimate `-1.765e-02`, $t = -0.011$, and **$p\text{-value} = 0.99123 > 0.05$**.

We can remove `FO4delay` cleanly without retyping the entire formula using R's **`update()`** function (`. ~ . - FO4delay`):

```r
int00.lm.2 <- update(int00.lm.full, . ~ . - FO4delay, data = int00.dat)
summary(int00.lm.2)
```

---

# Continuing the Pruning Cycle (`featureSize`, `transistors`, `dieSize`)

Next, we can iteratively drop `featureSize`, `transistors`, and `dieSize`:

```r
int00.lm.3 <- update(int00.lm.2, . ~ . - featureSize - transistors - dieSize, data = int00.dat)
summary(int00.lm.3)
```

Notice two major improvements as we eliminate predictors that had missing values:
1. **Fewer deleted observations**: Missingness drops from $179$ deleted rows down to $143$ deleted rows!
2. **Higher degrees of freedom**: Residual degrees of freedom increase from $61$ to $101$, strengthening statistical power!

---

# What Could Go Wrong? Case Study with `int92.dat`

Let's try fitting the exact same 15-predictor domain formula to **`int92.dat`** (processors benchmarked on the older SPEC Integer 1992 suite):

```r
int92.lm.full <- lm(
  nperf ~ clock + threads + cores + transistors + dieSize + voltage +
    featureSize + channel + FO4delay + L1icache + sqrt(L1icache) +
    L1dcache + sqrt(L1dcache) + L2cache + sqrt(L2cache),
  data = int92.dat
)
summary(int92.lm.full)
```

Look closely: `Coefficients: (2 not defined because of singularities)` and `74 observations deleted due to missingness`! Why?

---

# Diagnosing Singularities in `int92.dat`

Let's inspect the number of rows and the values of `clock` and `threads` in `int92.dat`:

```r
nrow(int92.dat)
int92.dat |> count(clock) |> head(6)
int92.dat |> count(threads)
```

Every single non-missing processor in `int92.dat` has **`threads == 1`**! A column with zero variance (constant `1`) is collinear with the intercept and cannot have a slope estimated.

---

# Exercise: Is `cores` a Good Predictor in `int92.dat`?

**Question:** Why was `cores` also flagged as `NA` (singular) in `int92.lm.full`? Check the distribution of `cores` in `int92.dat`:

```r
# Count the distinct values of cores in int92.dat:
int92.dat |> count(cores)
```

In 1992, multi-core processors did not exist yet—every non-missing row has `cores == 1`! Thus `cores` provides zero information and causes a singularity if included.

---

# From Continuous Outcomes to Binary Classification

In linear regression, our outcome $y$ is continuous (`perf`, `price`, `log(price)`) and we model the conditional mean:

$$\mathbb{E}(y \mid x) = a_0 + a_1 x$$

```r
lm(log(price) ~ log(carat), data = diamonds) |> summary()
```

This says the average value of $\log(\text{price})$ given $\log(\text{carat})$ is $8.449 + 1.676 \cdot \log(\text{carat})$.
* **What if our outcome is not continuous, but a binary `TRUE` / `FALSE` indicator of whether an event occurred?**

---

# Deaths on the RMS Titanic

The RMS *Titanic* sank on April 15, 1912, during its maiden voyage, killing about two-thirds of its $2,201$ passengers and crew. Let's expand the built-in `Titanic` frequency table into individual passenger rows (`titanic_df`):

```r
data(Titanic)
titanic_df <- Titanic |>
  as_tibble() |>
  mutate(Survived = Survived == "Yes")

# Replicate rows to match the count column 'n', then drop column 5 ('n')
titanic_df <- titanic_df[rep(row.names(titanic_df), titanic_df$n), -5]
titanic_df |> print()
```

---

# Exploratory Data Analysis of Titanic Survival

We have three categorical predictors—`Class` (`1st`, `2nd`, `3rd`, `Crew`), `Sex` (`Male`, `Female`), and `Age` (`Adult`, `Child`)—and a binary outcome `Survived`:

```r
ggplot(titanic_df) +
  geom_bar(
    aes(x = interaction(Class, Sex, Age), fill = Survived),
    position = "dodge"
  ) +
  coord_flip() +
  theme_minimal()
```

---

# Why Not Use `lm()` for Binary Outcomes?

What happens if we fit an ordinary linear model `lm(Survived ~ Class + Sex + Age, data = titanic_df)` to our `TRUE`/`FALSE` ($1$/$0$) outcome?

```r
mdl_lm <- lm(Survived ~ Class + Sex + Age, data = titanic_df)
summary(mdl_lm)
```

```r
titanic_df |>
  add_residuals(mdl_lm) |>
  mutate(resid = as.numeric(resid)) |>
  ggplot() +
  geom_histogram(aes(x = resid), binwidth = 0.1, fill = "tomato", color = "white")
```

* $R^2$ is low ($0.22$), the residual standard error ($0.41$) is huge relative to a $0/1$ outcome, and the residuals are weird and non-normal!

---

# Out-of-Bounds Predictions & The Logistic Function

Even worse, `lm()` produces decimal predictions that can fall outside $[0, 1]$:

```r
titanic_df |> add_predictions(mdl_lm) |> distinct() |> head()
```

Instead of a straight line, we want to model $\text{Prob}(y = 1) = f(a + bx)$ using a function $f$ whose range is strictly $[0, 1]$ and which approaches $0$ or $1$ for extreme inputs: the **logistic function** $f(x) = \frac{1}{1 + e^{-x}}$!

```r
expand.grid(x = seq(-5, 5, 0.1)) |>
  ggplot(aes(x = x)) +
  stat_function(fun = function(x) 1 / (1 + exp(-x)), xlim = c(-5, 5), color = "blue", linewidth = 1) +
  stat_function(fun = function(x) 1 / 2 + x / 5, xlim = c(-5, 5), color = "red", linewidth = 1) +
  annotate(x = 3.5, y = 1.5, geom = "text", label = "linear model", color = "red") +
  annotate(x = 3.5, y = 0.85, geom = "text", label = "logistic model", color = "blue") +
  ylab("outcome")
```

---

# Fitting a Generalized Linear Model (`glm()`)

To fit a logistic regression model in R, we use **`glm()`** (*generalized linear model*) with `family = "binomial"`:

```r
mdl_glm <- glm(Survived ~ Sex, data = titanic_df, family = "binomial")
#                                                 ^^^^^^ important!
mdl_glm
```

In Lecture 21, we will dive deeply into interpreting logistic regression coefficients, log-odds, predicted probabilities, and confusion matrices!

---

# Hands-On Practice Exercises

### Exercise: Multiple Regression on `mpg` (`hwy ~ displ + cyl + drv`)
Fit `mpg_multi_model <- lm(hwy ~ displ + cyl + drv, data = mpg)`, inspect `summary(mpg_multi_model)`, and plot the predicted lines across `displ` colored by `drv`.

```r
# Write your solution here:
```

<details>
<summary><strong>Click to view Solution</strong></summary>

```r
mpg_multi_model <- lm(hwy ~ displ + cyl + drv, data = mpg)
summary(mpg_multi_model)

mpg |>
  add_predictions(mpg_multi_model) |>
  ggplot(aes(x = displ, y = hwy, color = drv)) +
  geom_point(alpha = 0.5) +
  geom_line(aes(y = pred), linewidth = 1) +
  theme_minimal()
```

</details>
