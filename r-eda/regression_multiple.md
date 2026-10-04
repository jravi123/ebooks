# Multiple Linear Regression & Predictor Selection

## Why Learn Multiple Linear Regression?

In real-world data science, a single predictor variable rarely tells the complete story. To make robust business and analytical decisions, we must model relationships that involve multiple predictors simultaneously. For example:
* A processor's performance is determined not just by its clock frequency, but also by its core count, thread density, fabrication architecture, and cache capacity.
* A diamond's price is influenced by its carat weight, but also by its cut quality, color grade, and clarity rating.

Multiple linear regression expands our mathematical framework to model outcomes as a linear combination of several predictors:

$$y = a_0 + a_1 x_1 + a_2 x_2 + \dots + a_k x_k + \epsilon$$

Where:
* **$y$**: The continuous outcome.
* **$a_0$**: The intercept.
* **$a_1, \dots, a_k$**: The slope coefficients for each respective predictor $x_i$.
* **$\epsilon$**: Random noise.

This allows us to isolate the impact of one variable while holding all other confounding variables constant.

---

## Part 1: Modeling Categorical Predictors

When we include a categorical variable in a linear regression, R cannot perform mathematical operations on text categories (such as "apple", "banana", "orange"). Instead, it automatically converts categories into binary indicator columns known as **dummy variables** or **treatment contrasts**.

### The Mathematical Dummy Formula
Consider a categorical variable $x$ with four categories: `a`, `b`, `c`, and `d`. When we regress $y$ on $x$, R fits the following model:

$$y = a_0 + a_1\{x=b\} + a_2\{x=c\} + a_3\{x=d\}$$

Where each bracketed term represents a binary indicator:
* **$\{x=b\}$**: Equal to $1$ if the observation belongs to category `b`, and $0$ otherwise.
* **$\{x=c\}$**: Equal to $1$ if the observation belongs to category `c`, and $0$ otherwise.
* **$\{x=d\}$**: Equal to $1$ if the observation belongs to category `d`, and $0$ otherwise.

### The Reference Level (Baseline)
Notice that there is no indicator variable for category `a`. This omitted group is called the **Reference Level** or baseline:
* When $x = a$, all indicator variables are $0$.
* Therefore, the expected outcome is simply:

  $$\mathbb{E}(y \mid x=a) = a_0$$

* The intercept **$a_0$ represents the average value of the reference level** (the mean of group `a`).
* For other groups (e.g., $x=b$), the expected value is:

  $$\mathbb{E}(y \mid x=b) = a_0 + a_1$$

* The coefficients $a_1, a_2, a_3$ represent the **relative offsets** (differences in means) between that specific group and the reference level.

### Visualizing Dummy Variables with `model_matrix()`
We can inspect the exact matrix of numerical columns R creates under the hood using **`model_matrix()`**:

```r
library(tidyverse)
library(modelr)

# View the underlying model matrix columns
sim2 |>
  model_matrix(y ~ x) |>
  print()
# # A tibble: 10 x 4
#   `(Intercept)`   xb    xc    xd
#           <dbl> <dbl> <dbl> <dbl>
# 1             1     0     0     0  # Belongs to reference category 'a'
# 2             1     1     0     0  # Belongs to category 'b'
# 3             1     0     1     0  # Belongs to category 'c'
```

---

## Part 2: Categorical vs. Continuous Modeling (The CPU Case Study)

In our previous EDA of computer hardware, we found that clock speed alone left unexplained patterns in performance. Let's add processor `cores` as a predictor. We have two choices: treat `cores` as a categorical factor, or treat it as a continuous variable.

### Option A: Cores as a Categorical Factor
If we treat `cores` as a categorical variable using `factor(cores)`, R treats each core configuration as an independent group, fitting distinct intercepts:

```r
# Regress performance on clock speed and cores (as factor)
cpu_cat_model <- lm(perf ~ clock + factor(cores), data = int00.dat)
summary(cpu_cat_model)
```

The resulting model is:
* $\text{perf} = a_0 + a_1 \cdot \text{clock}$ when $\text{cores} = 1$ (Reference level)
* $\text{perf} = (a_0 + a_2) + a_1 \cdot \text{clock}$ when $\text{cores} = 2$
* $\text{perf} = (a_0 + a_3) + a_1 \cdot \text{clock}$ when $\text{cores} = 4$

This fits **three parallel regression lines** with identical slopes but shifted intercepts.

```r
int00.dat |>
  add_predictions(cpu_cat_model) |>
  ggplot(aes(x = clock, color = factor(cores))) +
  geom_point(aes(y = perf)) +
  geom_line(aes(y = pred), linewidth = 1.2) +
  labs(title = "Cores modeled as Categorical Groups", y = "SPEC Performance")
```

### Option B: Cores as a Continuous Predictor
If we treat `cores` as a continuous numeric column, R fits a single baseline intercept and scales performance linearly:

```r
# Regress performance on clock and cores (as continuous)
cpu_cont_model <- lm(perf ~ clock + cores, data = int00.dat)
summary(cpu_cont_model)
```

In this case:
* The slope of `cores` is roughly $+431$.
* This means that adding one core is modeled to increase performance by exactly $431$ points, regardless of whether we move from 1 to 2 cores, or from 3 to 4 cores.
* This forces a constant linear step, whereas the categorical model allows the differences between groups to be non-linear.

---

## Part 3: Predictor Selection & Stepwise Regression

When we have dozens of variables in a dataset, how do we select the best subset?

```
                         Variable Selection Rules:
                         
       Model Goal                       Analytical Strategy
    ─────────────────                 ─────────────────────────────
     • Interpretability                Seek the smallest possible model (parsimony)
                                       with high explanatory power.
     • Predictive Accuracy             Utilize more predictors, but risk overfitting 
                                       (model performs poorly on new test data).
```

Always guide variable selection with domain knowledge, rather than relying blindly on automated algorithms.

### The "Kitchen Sink" Model Failure
A common mistake is throwing every column into a model (`lm(perf ~ ., data = int00.dat)`). This fails on real-world datasets due to **missingness**:
* Real datasets contain missing values (`NA`).
* R automatically drops any row containing even one `NA` in the target formula.
* In our CPU dataset, several columns are empty for almost every processor, dropping our sample size from $198$ down to just $19$ rows, yielding garbage estimates!

### Applying Stepwise Regression and Domain Knowledge
To construct a robust model, we start with variables selected based on domain expertise:
1. Include `clock`, `threads`, `cores`, `transistors`, `dieSize`, `voltage`, `featureSize`, and `channel`.
2. Ignore irrelevant columns (like Thermal Design Power, `TDP`).
3. Transform cache features: Computer science reveals that cache miss rates are proportional to the square root of the cache size. So, we include **$\sqrt{\text{L1icache}}$**, **$\sqrt{\text{L1dcache}}$**, and **$\sqrt{\text{L2cache}}$**.

Let's fit the full domain model:

```r
cpu_full_model <- lm(nperf ~ clock + threads + cores + transistors + 
                     dieSize + voltage + featureSize + channel + FO4delay + 
                     L1icache + sqrt(L1icache) + L1dcache + sqrt(L1dcache) + 
                     L2cache + sqrt(L2cache), data = int00.dat)
summary(cpu_full_model)
```

### The Pruning Cycle
Our goal is to iteratively remove insignificant predictors:
1. Identify the predictor with the highest insignificant p-value ($> 0.05$). For example, `FO4delay` has a p-value of $0.99$.
2. Drop this predictor using the R helper function **`update()`**, re-fit, and inspect the summary:

```r
# Drop FO4delay
cpu_model_2 <- update(cpu_full_model, . ~ . - FO4delay, data = int00.dat)
summary(cpu_model_2)
```

3. Repeat this process: identify and drop the next insignificant column (e.g., `featureSize`, `transistors`, and `dieSize`).
4. **The Missingness Reward**: Along the way, notice that as we eliminate columns prone to missingness, R can rescue rows formerly dropped due to `NA` values. This increases our sample size, degrees of freedom, and statistical power!

---

## Hands-on Exercises

### Exercise 1: Multi-variable Automobile Efficiency
**How does engine displacement, cylinder count, and vehicle drivetrain type interact to explain highway fuel efficiency in modern cars?**

*Analytical Guidance*:
Fit a multiple linear regression. Your analysis should:
1. Load `library(tidyverse)`.
2. Fit a model regressing highway mileage (`hwy`) on three predictors: engine size (`displ`), cylinder count (`cyl`), and drivetrain type (`drv`) using the `mpg` dataset. Store it in `mpg_multi_model`.
3. Print `summary(mpg_multi_model)` and explain the reference category for drivetrain type.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Fit multiple regression
mpg_multi_model <- lm(hwy ~ displ + cyl + drv, data = mpg)

# Inspect model summary
summary(mpg_multi_model)

# Observe:
# Drivetrain has three categories: '4' (four-wheel), 'f' (front-wheel), and 'r' (rear-wheel).
# The Coefficients block displays 'drvf' and 'drvr', meaning '4' is the reference level.
# The intercept (33.09) is the baseline highway mileage for a 4WD car with zero displacement and cylinders.
# Holding all else constant, front-wheel drive cars ('drvf') gain ~4.99 MPG on average compared to 4WD.
```
</details>

---

### Exercise 2: Visualizing Multi-variable Predictions
**How can we visualize the exact regression slopes and categorical offsets computed by our model on a scatter plot?**

*Analytical Guidance*:
Plot the multiple regression lines. Your analysis should:
1. Load `library(tidyverse)` and `library(modelr)`.
2. Reuse your fitted `mpg_multi_model` from Exercise 1.
3. Append predictions to the `mpg` dataset using **`add_predictions()`**.
4. Plot the raw scatter points of displacement (`displ`) vs. highway mileage (`hwy`), color-coded by drivetrain type (`drv`).
5. Overlay the model predictions as distinct lines using **`geom_line()`**, map the `y` aesthetic to `pred`, and color-code by `drv`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(modelr)

# Refit model
mpg_multi_model <- lm(hwy ~ displ + cyl + drv, data = mpg)

# Append predictions
mpg_predictions <- mpg |> add_predictions(mpg_multi_model)

# Plot raw points and model lines
ggplot(mpg, aes(x = displ, y = hwy, color = drv)) +
  geom_point(alpha = 0.5, size = 2) +
  geom_line(data = mpg_predictions, aes(y = pred), linewidth = 1.2) +
  labs(title = "Expected Highway Mileage by Drivetrain & Engine Size",
       subtitle = "Slopes and Offsets generated from OLS model",
       x = "Engine Size (Liters)", y = "Highway MPG", color = "Drivetrain") +
  theme_minimal()
```
</details>
