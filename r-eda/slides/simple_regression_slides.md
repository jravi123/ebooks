# Statistical Modeling: Simple Regression
## Ordinary Least Squares (OLS), Residuals, Predictions, and Diagnostics

---
# Lecture Agenda & Topics

Statistical modeling attempts to approximate the relationship between an outcome and one or more explanatory variables. Simple linear regression is the foundational technique for modeling linear relationships.

Today we will cover:
* **The Modeling Formulation**: $Y = f(X) + \epsilon$.
* **Ordinary Least Squares (OLS)**: Minimizing the sum of squared residuals ($SSe$).
* **Fitting Models in R**: Using `lm(response ~ predictor, data)`.
* **Extracting Predictions & Residuals**: Using `modelr::add_predictions()` and `add_residuals()`.
* **Interpreting Summary Outputs**: Estimates, standard errors, $t$-statistics, and $p$-values.
* **Goodness of Fit**: Interpreting $R^2$ and residual standard error.
* **Residual Diagnostics**: Checking linearity, homoscedasticity, and normality of errors.

---
# The Mathematical Framework of Linear Regression

Linear regression assumes the response variable $Y$ can be approximated as a linear combination of a predictor $X$:

$$Y = \beta_0 + \beta_1 X + \epsilon$$

Where:
* **$\beta_0$ (Intercept)**: Expected value of $Y$ when $X = 0$.
* **$\beta_1$ (Slope)**: Expected change in $Y$ for a 1-unit increase in $X$.
* **$\epsilon$ (Error/Residual)**: Unexplained variation ($\epsilon \sim N(0, \sigma^2)$).

---
# Ordinary Least Squares (OLS)

The OLS method chooses the line ($\hat{\beta}_0, \hat{\beta}_1$) that minimizes the **Sum of Squared Errors (SSe)**:

$$\text{SSe} = \sum_{i=1}^{n} (y_i - \hat{y}_i)^2 = \sum_{i=1}^{n} [y_i - (\hat{\beta}_0 + \hat{\beta}_1 x_i)]^2$$

```
       Observed Point (y)
             ●
             │  Residual (e = y - ŷ)
             ▼
        ─────┬─────────────  Fitted Line (ŷ = β₀ + β₁x)
```

Squaring residuals penalizes large errors and ensures positive and negative deviations do not cancel out.

---
# Fitting a Simple Model with `lm()`

Fit a linear regression in R using the formula syntax `response ~ predictor`:

```r
library(tidyverse)

# Sample dataset
df <- tibble(
  x = c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
  y = c(2.5, 4.1, 5.8, 8.2, 9.9, 12.1, 14.3, 16.0, 18.2, 20.4)
)

# Fit linear regression
model <- lm(y ~ x, data = df)

# View fitted coefficients
coef(model)
```

---
# Predictions & Residuals with `modelr`

Use `modelr` helper functions to append fitted predictions and residuals to your tibble:

```r
library(tidyverse)
library(modelr)

df <- tibble(
  x = c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
  y = c(2.5, 4.1, 5.8, 8.2, 9.9, 12.1, 14.3, 16.0, 18.2, 20.4)
)
model <- lm(y ~ x, data = df)

# Append predictions and residuals
df_evaluated <- df |>
  add_predictions(model) |>
  add_residuals(model)

print(df_evaluated)
```

---
# Visualizing the Regression Line

Plot the observed points alongside the fitted regression line using `geom_smooth(method = "lm")`:

```r
library(tidyverse)

df <- tibble(
  x = c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
  y = c(2.5, 4.1, 5.8, 8.2, 9.9, 12.1, 14.3, 16.0, 18.2, 20.4)
)

ggplot(df, aes(x = x, y = y)) +
  geom_point(size = 3, color = "steelblue") +
  geom_smooth(method = "lm", se = TRUE, color = "darkred") +
  labs(title = "Linear Fit with 95% Confidence Band", x = "Predictor (x)", y = "Response (y)")
```

---
# Deconstructing `summary(lm)`

Inspect detailed statistical significance and variance metrics:

```r
library(tidyverse)

df <- tibble(
  x = c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
  y = c(2.5, 4.1, 5.8, 8.2, 9.9, 12.1, 14.3, 16.0, 18.2, 20.4)
)
model <- lm(y ~ x, data = df)

summary(model)
```

### Key Metrics to Evaluate:
* **Estimate**: The estimated coefficient ($\hat{\beta}_0$ and $\hat{\beta}_1$).
* **Std. Error**: Standard deviation of the coefficient estimate.
* **$\text{Pr}(>|t|)$**: $p$-value for the test $H_0: \beta_1 = 0$.
* **Multiple R-squared ($R^2$)**: Proportion of variance in $Y$ explained by $X$ ($0 \le R^2 \le 1$).

---
# Residual Diagnostics: Checking Assumptions

A valid linear regression assumes residuals are randomly distributed with constant variance (**homoscedasticity**) and no leftover non-linear structure:

```r
library(tidyverse)
library(modelr)

df <- tibble(
  x = c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
  y = c(2.5, 4.1, 5.8, 8.2, 9.9, 12.1, 14.3, 16.0, 18.2, 20.4)
)
model <- lm(y ~ x, data = df)

# Residuals vs. Fitted Plot
df |>
  add_predictions(model) |>
  add_residuals(model) |>
  ggplot(aes(x = pred, y = resid)) +
  geom_point(size = 3) +
  geom_hline(yintercept = 0, linetype = "dashed", color = "red") +
  labs(title = "Residuals vs. Fitted Values", x = "Predicted (ŷ)", y = "Residual (e)")
```

A random cloud around zero confirms linearity and constant error variance.

---
# Module Summary & Key Takeaways

1. **Simple Linear Model**: Fits $Y = \beta_0 + \beta_1 X + \epsilon$ via OLS minimization of squared errors.
2. **`lm(y ~ x, data)`**: Standard R syntax for fitting linear models.
3. **`add_predictions()` & `add_residuals()`**: Seamlessly augment original tibbles for plotting and diagnostics.
4. **$R^2$**: Measures the proportion of total outcome variance explained by the model.
5. **Residual Checks**: Always inspect residual plots to verify linearity and constant variance.
