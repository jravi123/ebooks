# Simple Linear Regression & Model Diagnostics

## Why Learn Simple Linear Regression in Data Analytics?

Visualizations let you spot relationships, but statistical models let you quantify them. Imagine you are studying consumer spending patterns, real estate valuations, or computer hardware performance:
* You notice that larger houses sell for more. 
* To make a precise business decision, you need to answer a concrete question: *"For every additional square foot of space, how many dollars does the sales price increase on average?"*
* You notice that higher processor clock speeds yield better performance. You need to know: *"Exactly how much performance is gained per megahertz of speed?"*

A statistical model is a mathematical formula that relates an outcome with one or more explanatory variables:

$$Y = f(X) + \epsilon$$

Where:
* **$Y$**: The response (outcome or dependent variable).
* **$f$**: The model function capturing systematic relationships.
* **$X$**: The predictor (explanatory or independent variable).
* **$\epsilon$**: The random noise (errors or variables not captured).

Fitting a model means selecting a specific formula from a general family of functions that is "closest" to the observed data. The goal of a model is not to uncover a "true" physical law, but to **discover a simple, reliable approximation of reality that remains useful for prediction and decision-making.**

---

## Part 1: The Linear Model and OLS Fitting

The most fundamental class of statistical models is the linear model, assuming $y$ can be explained by a linear combination of inputs:

$$y = a_0 + a_1 x$$

Where $a_0$ is the intercept and $a_1$ is the slope. In R, we fit linear models using the built-in **`lm()`** function, utilizing formula syntax **`response ~ predictor`**:

```r
library(tidyverse)
library(modelr) # Makes linear models tidy-compatible

# Fit linear model regressing y on x
mdl <- lm(y ~ x, data = sim1)
print(mdl)
```

### Ordinary Least Squares (OLS)
`lm()` selects intercept ($\hat{a}_0$) and slope ($\hat{a}_1$) values that minimize the **Sum of Squared Errors (SSe)**, representing the cumulative squared distances between observed and predicted values:

$$\text{SSe} = \sum_{i=1}^{n} \big[ y_i - (\hat{a}_0 + \hat{a}_1 x_i) \big]^2$$

---

## Part 2: Programmatic Predictions and Diagnostics

Once a model is fit, we can extract predicted values ($\hat{y}$) and errors (residuals). The tidyverse **`modelr`** package provides helper functions that append these metrics directly to our tibble without disrupting pipes:

```r
# Add predictions (pred) and residuals (resid) columns
sim1_diagnostics <- sim1 |>
  add_predictions(mdl) |>
  add_residuals(mdl)

print(head(sim1_diagnostics))
# # A tibble: 6 x 4
#       x     y  pred   resid
#   <int> <dbl> <dbl>   <dbl>
# 1     1  4.26  6.27 -2.01  
# 2     1  5.12  6.27 -1.15  
# 3     1  7.31  6.27  1.04  
```

The residual represents the part of the outcome that the model cannot predict:

$$\text{resid}_i = y_i - \hat{y}_i = y_i - (\hat{a}_0 + \hat{a}_1 x_i)$$

If a model successfully captures all systematic patterns, the residuals should look like random, normally distributed noise around a mean of zero. If residuals show patterns, there is more modeling work to do!

---

## Part 3: Deconstructing the `summary.lm()` Output

To interpret regression results, call **`summary(mdl)`**:

```r
summary(mdl)
```

### Key Summary Components:

#### A. The Coefficients Block
```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)    
(Intercept)  4.22082    0.86884   4.858 1.05e-05 ***
x            2.05153    0.14001  14.653  < 2e-16 ***
```
* **Estimate**: The computed parameters.
  * Intercept ($\hat{a}_0 = 4.22$): The expected value of $y$ when $x = 0$.
  * Slope ($\hat{a}_1 = 2.05$): For every 1-unit increase in $x$, $y$ increases by 2.05 units on average.
* **Std. Error**: Standard deviation of the parameter estimate. Measures uncertainty.
* **t value**: The Student t-statistic ($\text{Estimate} / \text{Std. Error}$).
* **Pr(>|t|)**: The p-value. The probability of observing this slope under the null hypothesis ($a_1 = 0$). A p-value $< 0.05$ indicates statistical significance.

#### B. The Residuals Section
Provides quantile distributions (Min, 1Q, Median, 3Q, Max) of errors. For valid linear models, we expect residuals normally distributed around zero:
* Median should be close to 0.
* Min and Max magnitudes should be similar.
* 1Q and 3Q should have similar absolute values.

#### C. Goodness-of-Fit Section
* **Degrees of Freedom (DF)**: Number of observations ($N$) minus number of estimated parameters ($p$).
* **Residual Standard Error (RSE)**: Standard deviation of residuals, measuring typical prediction error.
* **Multiple R-squared ($R^2$)**: The proportion of response variance explained by the model:
  
  $$R^2 = 1 - \frac{\text{SSe}}{\text{SSy}}$$
  
  Where **$\text{SSy} = \sum (y_i - \bar{y})^2$** is the sum of squared differences from the mean.
  * *Important rule*: Adding more variables to a model always increases $R^2$, even if those variables are useless!
* **F-statistic**: Tests the joint hypothesis that all coefficients are simultaneously zero.

---

## Part 4: Case Study 1: CPU Hardware Performance

Let's model raw hardware performance (`perf`) based on clock frequency (`clock`) using processor benchmark data:

```r
# Fit CPU model
cpu_model <- lm(perf ~ clock, data = int00.dat)
summary(cpu_model)
```

### Visualizing the Fit and Residuals
We plot the fitted line over the points and evaluate the residual distributions:

```r
# Plot OLS line
ggplot(int00.dat, aes(x = clock, y = perf)) +
  geom_point() +
  geom_smooth(method = "lm", color = "red")

# Plot residuals histogram
int00.dat |>
  add_residuals(cpu_model) |>
  ggplot(aes(x = resid)) +
  geom_histogram(bins = 20)
```

The resulting histogram is severely skewed to the right, showing non-normal residual errors.

### Residual vs. Predicted Scatter Plots
For linear regression to be valid, prediction errors must be independent. Plotting residuals against predicted values is crucial:

```r
int00.dat |>
  add_residuals(cpu_model) |>
  add_predictions(cpu_model) |>
  ggplot(aes(x = pred, y = resid, color = clock)) +
  geom_point() +
  geom_hline(yintercept = 0, linetype = "dashed", color = "red")
```

This diagnostic plot reveals major problems:
1. **Heteroscedasticity**: The range of residuals widens as predictions increase (increasing error variance).
2. **Clustering**: Distinct groups of residuals appear.
3. *Insight*: Clock speed alone is insufficient. We must account for other variables, such as `cores`, using multiple linear regression.

---

## Part 5: Case Study 2: Diamond Price Transformation

Let's examine how weight (`carat`) relates to diamond `price`:

```r
ggplot(diamonds, aes(x = carat, y = price)) +
  geom_point(alpha = 0.2) +
  geom_smooth(color = "red")
```

The scatter plot shows a curved relationship. Fitting a simple straight line is inappropriate because prices rise exponentially with size.

### Feature Engineering: The Log-Log Transformation
By applying a logarithmic transformation to both axes, we convert the exponential relationship into a highly linear model:

```r
# Plot log-log relationship
ggplot(diamonds, aes(x = log(carat), y = log(price))) +
  geom_point(alpha = 0.2) +
  geom_smooth(method = "lm", color = "blue")

# Fit transformed model
log_model <- lm(log(price) ~ log(carat), data = diamonds)
summary(log_model)
```

The log-log transformation yields:
* A highly linear scatter.
* An exceptionally high $R^2$ value ($>0.93$).
* Normally distributed, zero-centered residuals histogram!

---

## Hands-on Exercises

### Exercise 1: Exploring Carat-Price Linear Models
**How does a simple linear model behave when predicting diamond prices based on carat weight, and what are its standard error limits?**

*Analytical Guidance*:
Fit a non-transformed model. Your analysis should:
1. Load the `tidyverse` library.
2. Fit a basic linear regression predicting `price` based on `carat` using the `diamonds` dataset, storing it in `diamonds_lm`.
3. Print the `summary(diamonds_lm)` to extract coefficients, R-squared values, and residual standard errors.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Fit simple model
diamonds_lm <- lm(price ~ carat, data = diamonds)

# Inspect summary
summary(diamonds_lm)

# Observe: 
# Carat slope is roughly 7756 (price increases by ~$7,756 per carat)
# R-squared is roughly 0.85
# Residual standard error is very high (~$1,549), indicating large prediction errors.
```
</details>

---

### Exercise 2: Evaluating Residual Normality
**How can we diagnose whether our simple carat-price model violates linear regression assumptions by analyzing residual error distributions?**

*Analytical Guidance*:
Generate and plot model residuals. Your analysis should:
1. Load `library(tidyverse)` and `library(modelr)`.
2. Reuse your fitted `diamonds_lm` model from Exercise 1.
3. Append residuals to the `diamonds` dataset using **`add_residuals()`**.
4. Plot a histogram of these residuals (`resid`) using `geom_histogram()`.
5. Evaluate whether the errors are normally distributed around zero.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(modelr)

# Refit model
diamonds_lm <- lm(price ~ carat, data = diamonds)

# Append residuals and plot
diamonds |>
  add_residuals(diamonds_lm) |>
  ggplot(aes(x = resid)) +
  geom_histogram(bins = 50, fill = "royalblue", color = "white") +
  labs(title = "Residual Distribution of Untransformed Carat Model",
       x = "Residual Error ($)", y = "Count") +
  theme_minimal()

# Observe: The residual histogram is highly skewed and non-normal, 
# confirming that the simple untransformed linear model is inappropriate.
```
</details>
