# Classification & Logistic Regression
## Generalized Linear Models, Odds Ratios, the Sigmoid Function, and Confusion Matrices

---
# Lecture Agenda & Topics

When the outcome of interest is binary ($Y \in \{0, 1\}$), standard Ordinary Least Squares (OLS) produces predictions outside $[0, 1]$ and violates normality assumptions. Logistic regression solves this using Generalized Linear Models (GLMs).

Today we will cover:
* **The Failure of OLS on Binary Data**: Why straight regression lines fail for probabilities.
* **The Logit Link & The Sigmoid Curve**: Probability, Odds, and Log-Odds.
* **Fitting Logistic Models in R**: Using `glm(y ~ x, data, family = "binomial")`.
* **Interpreting Logistic Coefficients**: Log-odds and Odds Ratios ($e^{\beta_1}$).
* **Generating Probability Predictions**: `predict(..., type = "response")`.
* **Classification Metrics & The Confusion Matrix**: Accuracy, Sensitivity, and Specificity.
* **Train / Test Splitting**: Evaluating out-of-sample classification performance.

---
# The Failure of Linear Regression on Binary Outcomes

Attempting to fit $Y = \beta_0 + \beta_1 X + \epsilon$ on a binary outcome ($0$ or $1$) creates fundamental problems:

1. **Unbounded Predictions**: Predicts impossible probabilities like $\hat{p} = -0.35$ or $\hat{p} = 1.42$.
2. **Non-Normal Errors**: Residuals are strictly bimodal ($e_i = 1 - \hat{p}_i$ or $e_i = -\hat{p}_i$).
3. **Heteroscedasticity**: Error variance $\text{Var}(Y \mid X) = p(x)(1 - p(x))$ varies systematically with $X$.

---
# The Logistic Sigmoid Transformation

Logistic regression maps linear predictors to bounded probabilities $[0, 1]$ using the **sigmoid function**:

$$p(X) = P(Y = 1 \mid X) = \frac{1}{1 + e^{-(\beta_0 + \beta_1 X)}}$$

```
                Probability (p)
                   1.0 ┤          ╭───────────
                       │         ╭╯
                   0.5 ┤       ╭─╯
                       │      ╭╯
                   0.0 ┤─────╯────────────────
                       └──────────────────────
                                 Linear Score (z = β₀ + β₁x)
```

The model is linear in **log-odds (logit)**:

$$\log\left(\frac{p}{1 - p}\right) = \beta_0 + \beta_1 X$$

---
# Fitting Logistic Regression: `glm()`

Fit logistic regression models in R using **`glm()`** with `family = "binomial"`:

```r
library(tidyverse)

# Sample classification data: Hours Studied vs. Passed Exam (0/1)
exam_data <- tibble(
  hours = c(0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0),
  passed = c(0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1)
)

# Fit logistic regression model
logit_model <- glm(passed ~ hours, data = exam_data, family = "binomial")

summary(logit_model)
```

---
# Interpreting Coefficients: Odds Ratios

In logistic regression, the raw slope $\beta_1$ is the change in **log-odds** per unit increase in $X$.

To interpret this on an intuitive scale, exponentiate the coefficient:

$$\text{Odds Ratio} = e^{\beta_1}$$

```r
library(tidyverse)

exam_data <- tibble(
  hours = c(0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0),
  passed = c(0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1)
)
logit_model <- glm(passed ~ hours, data = exam_data, family = "binomial")

# Exponentiate coefficients to get Odds Ratios
exp(coef(logit_model))
```

> [!NOTE] Odds Ratio Interpretation
> An Odds Ratio of $2.5$ means that each additional hour of studying increases the odds of passing by a factor of $2.5$ ($+150\%$).

---
# Predicting Probabilities: `predict(type = "response")`

* **`predict(model)`**: Returns linear log-odds ($\beta_0 + \beta_1 x$).
* **`predict(model, type = "response")`**: Returns estimated probabilities ($\hat{p} \in [0, 1]$).

```r
library(tidyverse)

exam_data <- tibble(
  hours = c(0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0),
  passed = c(0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1)
)
logit_model <- glm(passed ~ hours, data = exam_data, family = "binomial")

# Predict probability for new students studying 2.5 and 5.0 hours
new_students <- tibble(hours = c(2.5, 5.0))
new_students |>
  mutate(prob_pass = predict(logit_model, newdata = new_students, type = "response"))
```

---
# Evaluating Classifiers: The Confusion Matrix

To turn probabilities into hard classes ($0$ or $1$), choose a decision threshold (typically $0.5$):

```r
library(tidyverse)

exam_data <- tibble(
  hours = c(0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0),
  passed = c(0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1)
)
logit_model <- glm(passed ~ hours, data = exam_data, family = "binomial")

# Classify at threshold = 0.5
classified <- exam_data |>
  mutate(
    prob = predict(logit_model, type = "response"),
    prediction = if_else(prob >= 0.5, 1, 0)
  )

# Confusion Matrix
table(Observed = classified$passed, Predicted = classified$prediction)
```

### Core Performance Metrics:
* **Accuracy**: $\frac{\text{TP} + \text{TN}}{\text{Total}}$ (Overall correctness).
* **Sensitivity (Recall)**: $\frac{\text{TP}}{\text{TP} + \text{FN}}$ (True positive detection rate).
* **Specificity**: $\frac{\text{TN}}{\text{TN} + \text{FP}}$ (True negative detection rate).

---
# Module Summary & Key Takeaways

1. **Why GLMs**: Standard OLS fails on binary targets; logistic regression models bounded probabilities via the logit link.
2. **`glm(..., family = "binomial")`**: Fits logistic regression using maximum likelihood estimation.
3. **Odds Ratios ($e^{\beta}$)**: Exponentiate coefficients to interpret relative odds multipliers.
4. **`type = "response"`**: Always specify `type = "response"` to obtain predicted probabilities rather than raw log-odds.
5. **Confusion Matrix**: Evaluates classification accuracy, sensitivity, and specificity against a decision threshold.
