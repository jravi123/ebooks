# Multiple Linear Regression & Model Selection
## Dummy Variables, Design Matrices, Categorical Contrasts, and Interactions

---
# Lecture Agenda & Topics

Real-world outcomes are rarely governed by a single predictor. Multiple linear regression allows us to estimate the partial effect of each variable while holding other variables constant.

Today we will cover:
* **The Multiple Linear Formulation**: $Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \dots + \epsilon$.
* **Categorical Predictors & Dummy Encoding**: How R converts factors into binary $(0, 1)$ indicators.
* **Reference Baselines**: Interpreting intercepts and relative categorical offsets.
* **The Design Matrix**: Inspecting dummy structures with `model_matrix()`.
* **Interaction Effects**: Modeling non-parallel slopes with `y ~ x1 * x2`.
* **Model Comparison & Adjusted $R^2$**: Penalizing unnecessary model complexity.

---
# The Multiple Linear Formulation

Multiple regression models the response $Y$ as a linear combination of several predictors:

$$Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \dots + \beta_k X_k + \epsilon$$

Where:
* **$\beta_0$ (Intercept)**: Expected value of $Y$ when all $X_i = 0$.
* **$\beta_j$ (Partial Slope)**: Expected change in $Y$ for a 1-unit increase in $X_j$, **holding all other predictors constant**.
* **$\epsilon$**: Unobserved random error ($\epsilon \sim N(0, \sigma^2)$).

---
# Multiple Continuous Predictors in R

Let's fit a multiple regression model predicting vehicle fuel efficiency:

```r
library(tidyverse)

# Predict highway MPG using engine displacement (displ) and cylinder count (cyl)
model_multi <- lm(hwy ~ displ + cyl, data = mpg)

summary(model_multi)
```

Both `displ` and `cyl` contribute negatively to highway mileage.

---
# Categorical Predictors & Dummy Variables

R cannot multiply words by numbers. When a factor or character column is included in `lm()`, R automatically converts it into **dummy indicator variables** ($0$ or $1$):

For a categorical variable with $k$ levels, R creates $k - 1$ dummy indicators:

```
                  Categorical Factor: Level A, B, C
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
            Indicator 'B'                     Indicator 'C'
         (1 if B, else 0)                  (1 if C, else 0)
```

The omitted category is the **Reference Level** (captured in the Intercept).

---
# Inspecting Design Matrices: `model_matrix()`

Use **`modelr::model_matrix()`** to inspect the internal numerical matrix passed to the regression solver:

```r
library(tidyverse)
library(modelr)

toy_df <- tibble(
  y = c(10, 15, 20, 25),
  group = factor(c("Control", "TreatA", "TreatB", "TreatA"))
)

# Generate design matrix
toy_df |>
  model_matrix(y ~ group)
```

`Control` serves as the reference intercept; `groupTreatA` and `groupTreatB` measure relative offsets from `Control`.

---
# Parallel Slopes: Continuous + Categorical

Fitting a continuous predictor alongside a categorical predictor produces parallel regression lines:

```r
library(tidyverse)

# Predict hwy from displ + drive type (drv: 4-wheel, front, rear)
model_parallel <- lm(hwy ~ displ + drv, data = mpg)

coef(model_parallel)
```

All drive types share the same slope for engine displacement, but each has its own intercept offset.

---
# Interaction Terms: `x1 * x2`

To allow different groups to have **different slopes** (non-parallel lines), include an interaction term using `*`:

```r
library(tidyverse)

# displ * drv expands to displ + drv + displ:drv
model_interaction <- lm(hwy ~ displ * drv, data = mpg)

summary(model_interaction)
```

The interaction coefficients (`displ:drvf`, `displ:drvr`) capture how the relationship between displacement and fuel economy changes depending on drive train.

---
# Model Comparison: $R^2$ vs. Adjusted $R^2$

Adding more predictors always increases raw $R^2$, even if the added variables are random noise.

> [!IMPORTANT] Adjusted $R^2$
> **Adjusted $R^2$** adds a penalty for each additional parameter $p$:
> 
> $$R^2_{\text{adj}} = 1 - \frac{(1 - R^2)(n - 1)}{n - p - 1}$$
> 
> Always compare nested models using Adjusted $R^2$, AIC/BIC, or cross-validation rather than raw $R^2$.

---
# Module Summary & Key Takeaways

1. **Multiple Regression**: Estimates partial effects holding all other variables constant.
2. **Dummy Coding**: Categorical variables with $k$ levels are automatically converted to $k - 1$ binary indicator columns.
3. **Reference Category**: The baseline category is absorbed into the intercept $\beta_0$.
4. **Additive Models (`+`)**: Create parallel regression lines with identical slopes and shifted intercepts.
5. **Interaction Models (`*`)**: Allow both slopes and intercepts to vary across subgroups.
6. **Adjusted $R^2$**: Penalizes model complexity to prevent overfitting.
