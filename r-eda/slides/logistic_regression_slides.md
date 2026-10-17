---
theme: default
title: "Logistic Regression & Classification"
---

```r {block=setup}
library(tidyverse)
library(modelr)
data(Titanic)
titanic_df <- Titanic |> as_tibble() |> mutate(Survived = Survived == "Yes")
titanic_df <- titanic_df[rep(row.names(titanic_df), titanic_df$n), -5]
sigma <- function(x) 1 / (1 + exp(-x))
```

# Logistic Regression & Classification

Predicting Binary Outcomes, Log-Odds, Sigmoid Probabilities, and Confusion Matrices

---

## Recap of Last Lecture: The Titanic Dataset

In the previous lecture, we expanded the aggregated `Titanic` table into an individual-level dataset (`titanic_df`) where each row represents one passenger or crew member:

```r
data(Titanic)
titanic_df <- Titanic |> as_tibble() |> mutate(Survived = Survived == "Yes")
titanic_df <- titanic_df[rep(row.names(titanic_df), titanic_df$n), -5]
titanic_df |> head(8)
```

---

## Why Linear Regression Fails for Binary Outcomes

We tried fitting a standard Ordinary Least Squares (OLS) linear regression model (`lm(Survived ~ Class + Sex + Age)`) to predict whether a passenger survived (`TRUE = 1`, `FALSE = 0`), and encountered two major problems:

```r
mdl_lm <- lm(Survived ~ Class + Sex + Age, data = titanic_df)
titanic_df |>
  add_predictions(mdl_lm) |>
  add_residuals(mdl_lm) |>
  summarize(
    min_pred = min(pred),
    max_pred = max(pred),
    distinct_resid = n_distinct(round(resid, 4))
  )
```

1. **Out-of-bounds predictions**: Linear regression predicts values outside $[0, 1]$ (even negative survival probabilities!).
2. **Non-normal, bimodal residuals**: Because the outcome is strictly $0$ or $1$, residuals do not follow a bell-shaped normal distribution around $0$.

---

## Generalized Linear Models (`glm`)

To model a binary outcome properly, we use **Logistic Regression**, which is a member of the **Generalized Linear Model (GLM)** family:

$$\text{glm}(\text{formula}, \text{data}, \text{family} = \text{"binomial"})$$

- Instead of fitting a straight line directly to the $0/1$ response, logistic regression models the **log-odds** of the event occurring as a linear combination of the predictors.
- Specifying `family = "binomial"` tells R to use the **logit link function** and a binomial likelihood for binary outcomes.

---

## Fitting a Logistic Regression Model (`Survived ~ Sex`)

Let's fit a logistic regression model predicting `Survived` from `Sex`:

```r
mdl <- glm(Survived ~ Sex, data = titanic_df, family = "binomial")
summary(mdl)
```

---

## Inspecting Default Predictions (`add_predictions`)

What happens when we add predictions from `mdl` to `titanic_df` using `add_predictions(mdl)`?

```r
titanic_df |>
  add_predictions(mdl) |>
  select(Class, Sex, Age, Survived, pred) |>
  head(8)
```

Notice that `pred` is `-1.312186` for males and `+1.004360` for females! How should we interpret these numbers?

---

## Understanding Probability vs. Odds

Before interpreting `pred`, let's distinguish between **probability** ($p$) and **odds**:

- **Probability ($p$)**: The fraction of times an event occurs out of all trials ($0 \le p \le 1$).
- **Odds ($\frac{p}{1 - p}$)**: The ratio of the probability that the event **occurs** ($p$) to the probability that it **does not occur** ($1 - p$).
  - If $p = 0.50$, the odds are $\frac{0.50}{0.50} = 1$ ("1-to-1" or even odds).
  - If $p = 0.75$, the odds are $\frac{0.75}{0.25} = 3$ ("3-to-1" in favor).
  - If $p = 0.20$, the odds are $\frac{0.20}{0.80} = 0.25$ ("1-to-4" against).

While probabilities are restricted to $[0, 1]$, odds range from $[0, +\infty)$.

---

## Log-Odds (The Logit Scale)

Taking the natural logarithm of the odds gives the **log-odds** (or **logit**):

$$\text{logit}(p) = \log\left(\frac{p}{1 - p}\right)$$

- As $p \to 0$, $\frac{p}{1-p} \to 0$, so $\log\left(\frac{p}{1-p}\right) \to -\infty$.
- At $p = 0.5$, $\frac{p}{1-p} = 1$, so $\log\left(\frac{p}{1-p}\right) = 0$.
- As $p \to 1$, $\frac{p}{1-p} \to +\infty$, so $\log\left(\frac{p}{1-p}\right) \to +\infty$.

Because log-odds span the entire real line $(-\infty, +\infty)$, we can safely model them with a linear equation without ever predicting impossible probabilities!

---

## Interpreting Predictions as Log-Odds

In logistic regression, the default prediction from `mdl` is the **log-odds** of survival:

$$\log\left(\frac{p}{1 - p}\right) = a_0 + a_1 \cdot \{\text{Male}\}$$

Let's verify this empirically by counting how many males and females survived in `titanic_df`:

```r
titanic_df |> count(Sex, Survived)
```

---

## Calculating Empirical Survival Probabilities

From the contingency table:
- **Males**: $367$ survived out of $1364 + 367 = 1731$ total males.
- **Females**: $344$ survived out of $126 + 344 = 470$ total females.

```r
# Empirical survival rate for men
p_male <- 367 / (1364 + 367)
print(p_male)

# Empirical survival rate for women
p_female <- 344 / (126 + 344)
print(p_female)
```

---

## From Empirical Probabilities to Odds and Log-Odds

Now let's compute the empirical **odds** $\frac{p}{1 - p}$ and **log-odds** $\log\left(\frac{p}{1 - p}\right)$ for males and females:

```r
odds <- c(
  male = 0.2120162 / (1 - 0.2120162),
  female = 0.7319149 / (1 - 0.7319149)
)
print(odds)
log(odds)
```

---

## Comparing Log-Odds to Model Coefficients and Predictions

Let's compare `log(odds)` directly to the coefficients and predictions of `mdl`:

```r
# Intercept a0 = log-odds for Female (reference level)
coef(mdl)[[1]]

# a0 + a1 = log-odds for Male
sum(coef(mdl))

# Distinct predictions from the model
titanic_df |> add_predictions(mdl) |> count(Sex, pred)
```

- $a_0 = 1.00436$ is the exact log-odds of survival for females.
- $a_0 + a_1 = 1.00436 - 2.31655 = -1.31219$ is the exact log-odds of survival for males!

---

## Exponentiating Coefficients: Odds Ratios

What does the slope $a_1 = -2.31655$ mean on its own?

$$\log(\text{odds}_{\text{Male}}) - \log(\text{odds}_{\text{Female}}) = \log\left(\frac{\text{odds}_{\text{Male}}}{\text{odds}_{\text{Female}}}\right) = a_1$$

Exponentiating both sides gives the **Odds Ratio (OR)**:

```r
exp(coef(mdl))
```

The odds of a male surviving are $\exp(-2.31655) \approx 0.0986$ times the odds of a female surviving (roughly one-tenth the odds!).

---

## Converting Log-Odds Back to Probability: The Logistic Function

How do we recover the probability $p$ from the log-odds $x = \log\left(\frac{p}{1 - p}\right)$?

We apply the **logistic (sigmoid) function** $\sigma(x)$, which is the mathematical inverse of the log-odds function:

$$\sigma(x) = \frac{1}{1 + e^{-x}} = \frac{e^x}{1 + e^x}$$

$$\sigma\left(\log\left(\frac{p}{1 - p}\right)\right) = p$$

---

## Visualizing the Sigmoid Function $\sigma(x)$

Let's define `sigma` in R and plot how it smoothly squashes any real number $x \in (-\infty, +\infty)$ into a valid probability $\sigma(x) \in (0, 1)$:

```r
sigma <- function(x) 1 / (1 + exp(-x))

tibble(x = seq(-6, 6, length.out = 200), p = sigma(x)) |>
  ggplot(aes(x = x, y = p)) +
  geom_line(color = "steelblue", linewidth = 1.2) +
  geom_hline(yintercept = c(0, 0.5, 1), linetype = "dashed", color = "gray50") +
  geom_vline(xintercept = 0, linetype = "dashed", color = "gray50") +
  labs(
    title = "The Logistic (Sigmoid) Function",
    x = "Log-Odds (x)",
    y = "Predicted Probability sigma(x)"
  ) +
  theme_minimal()
```

---

## Verifying $\sigma(x)$ on Our Titanic Model

Let's apply `sigma()` to our model coefficients and log-odds to verify that we recover the exact survival probabilities:

```r
sigma <- function(x) 1 / (1 + exp(-x))

# Predicted probability of survival for females: sigma(a0)
sigma(coef(mdl)[[1]])

# Predicted probability of survival for males: sigma(a0 + a1)
sigma(sum(coef(mdl)))

# Verifying that sigma() is the exact inverse of log(p / (1 - p))
sigma(log(0.21 / (1 - 0.21)))
```

---

## Logistic Regression with a Continuous Predictor

In the built-in `Titanic` dataset, `Age` is only recorded as `"Child"` or `"Adult"`. Let's load a more detailed Titanic dataset from a public CSV that includes each passenger's numerical `Age` in years:

```r
titanic_df2 <- read_csv(
  "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv",
  show_col_types = FALSE
)
titanic_df2 |> select(Survived, Pclass, Sex, Age, Fare) |> head(6)
```

---

## Fitting `Survived ~ Age` (Continuous Predictor)

Now let's fit a logistic regression model predicting `Survived` from continuous `Age`:

$$\log\left(\frac{p}{1 - p}\right) = a_0 + a_1 \cdot \text{Age}$$

```r
titanic_df2 <- read_csv(
  "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv",
  show_col_types = FALSE
)
mdl_age <- glm(Survived ~ Age, data = titanic_df2, family = "binomial")
summary(mdl_age)
```

Each additional year of age changes the log-odds of survival by $a_1 = -0.01096$ (so older passengers had slightly lower survival odds).

---

## Multiple Predictors in Logistic Regression

Just like multiple linear regression, `glm()` supports multiple predictors (`Class`, `Age`, and `Sex`):

```r
mdl <- glm(Survived ~ Class + Age + Sex, data = titanic_df, family = "binomial")
summary(mdl)
```

---

## Interpreting the Multiple Logistic Regression Formula

From the coefficient table above, the fitted log-odds equation is:

$$\log\left(\frac{p}{1 - p}\right) = 2.04 - 1.02 \cdot \{\text{2nd}\} - 1.78 \cdot \{\text{3rd}\} - 0.86 \cdot \{\text{Crew}\} + 1.06 \cdot \{\text{Child}\} - 2.42 \cdot \{\text{Male}\}$$

- **Baseline ($2.04$)**: 1st-class adult female ($\sigma(2.04) \approx 88.5\%$ survival probability).
- **Class effect**: Holding age and sex constant, 2nd-class, 3rd-class, and crew members all have significantly lower log-odds of survival than 1st-class passengers ($p < 0.001$).
- **Age effect**: Children have $+1.06$ higher log-odds of survival than adults ($p < 0.001$).
- **Sex effect**: Males have $-2.42$ lower log-odds of survival than females ($p < 0.001$).

---

## Predicting Survival for a 3rd-Class Adult Male

What is the predicted survival probability for a **Male**, **Adult**, **3rd-class** passenger?

$$\log\left(\frac{p}{1 - p}\right) = 2.0438 - 1.7778 - 2.4201 = -2.1540$$

```r
mdl <- glm(Survived ~ Class + Age + Sex, data = titanic_df, family = "binomial")

titanic_df |>
  add_predictions(mdl) |>
  filter(Class == "3rd", Sex == "Male", Age == "Adult") |>
  head(4)

# Convert log-odds (-2.153985) to probability using sigma()
sigma(-2.153985)
```

A 3rd-class adult male has a predicted survival probability of only **$10.4\%$**.

---

## Predicting Probabilities Directly (`type = "response"`)

Instead of manually applying `sigma()` to log-odds, we can pass `type = "response"` to `add_predictions()` (or `predict()`) so R outputs predicted probabilities $\hat{p} \in (0, 1)$ directly:

```r
mdl <- glm(Survived ~ Class + Age + Sex, data = titanic_df, family = "binomial")
titanic_pred <- titanic_df |>
  add_predictions(mdl, type = "response") |>
  print()
```

---

## Evaluating Binary Classifiers: The Confusion Matrix

Once our model outputs a predicted probability $\hat{p}$, we choose a **threshold** $t$ (such as $t = 0.5$) to classify each observation as predicted positive ($\hat{y} = \text{TRUE}$) or predicted negative ($\hat{y} = \text{FALSE}$).

Comparing predicted classes against actual outcomes gives the **Confusion Matrix**:

![Confusion Matrix](https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/images/confusion.png)

---

## The Four Outcomes of a Confusion Matrix

| Term | Meaning | In the Titanic Context |
| :--- | :--- | :--- |
| **True Positive (TP)** | Actual = `TRUE`, Predicted = `TRUE` | Passenger survived, and model predicted survival |
| **False Positive (FP)** | Actual = `FALSE`, Predicted = `TRUE` | Passenger perished, but model predicted survival (*Type I error*) |
| **True Negative (TN)** | Actual = `FALSE`, Predicted = `FALSE` | Passenger perished, and model predicted they would perish |
| **False Negative (FN)** | Actual = `TRUE`, Predicted = `FALSE` | Passenger survived, but model predicted they would perish (*Type II error*) |

---

## True Positive Rate (TPR) and False Positive Rate (FPR)

From the confusion matrix counts, we define two key evaluation metrics:

1. **True Positive Rate (TPR / Sensitivity / Recall)**: Out of all actual positives, what fraction did the model correctly identify?
   $$\text{TPR} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

2. **False Positive Rate (FPR / $1 - \text{Specificity}$)**: Out of all actual negatives, what fraction did the model falsely label as positive?
   $$\text{FPR} = \frac{\text{FP}}{\text{FP} + \text{TN}}$$

---

## Computing TPR and FPR at Threshold $t = 0.5$

Let's classify a passenger as surviving if their predicted probability exceeds $0.5$ (`pred > 1/2`), and calculate TP, FP, TN, FN, TPR, and FPR:

```r
mdl <- glm(Survived ~ Class + Age + Sex, data = titanic_df, family = "binomial")
titanic_pred <- titanic_df |> add_predictions(mdl, type = "response")

titanic_pred |>
  mutate(
    pred = pred > 1/2,
    tp = pred & Survived,
    fp = pred & !Survived,
    tn = !pred & !Survived,
    fn = !pred & Survived
  ) |>
  summarize(
    tpr = sum(tp) / (sum(tp) + sum(fn)),
    fpr = sum(fp) / (sum(fp) + sum(tn))
  )
```

At $t = 0.5$, our model achieves $\text{TPR} = 49.5\%$ and $\text{FPR} = 7.45\%$.

---

## Adjusting the Classification Threshold ($t = 0.4$)

What if we lower the classification threshold from $0.5$ to $0.4$ (`pred > 0.4`) so the model is more willing to predict survival?

```r
mdl <- glm(Survived ~ Class + Age + Sex, data = titanic_df, family = "binomial")
titanic_pred <- titanic_df |> add_predictions(mdl, type = "response")

titanic_pred |>
  mutate(
    pred = pred > 0.4,
    tp = pred & Survived,
    fp = pred & !Survived,
    tn = !pred & !Survived,
    fn = !pred & Survived
  ) |>
  summarize(
    tpr = sum(tp) / (sum(tp) + sum(fn)),
    fpr = sum(fp) / (sum(fp) + sum(tn))
  )
```

Lowering the threshold increases $\text{TPR}$ from $49.5\%$ to $52.5\%$, while $\text{FPR}$ increases slightly from $7.45\%$ to $8.39\%$.

---

## How to Pick a Good Threshold?

There is always a trade-off between **TPR** and **FPR** when choosing a threshold $t$:

- **Extreme High Threshold ($t \ge 1$)**: We always predict `Survived = FALSE`.
  - Then $\text{TP} = 0$ and $\text{FP} = 0$, so $\text{FPR} = 0$, **but also $\text{TPR} = 0$** (we never catch any true positives!).
- **Extreme Low Threshold ($t \le 0$)**: We always predict `Survived = TRUE`.
  - Then $\text{FN} = 0$ and $\text{TN} = 0$, so $\text{TPR} = 1$, **but also $\text{FPR} = 1$** (every negative is falsely flagged!).

```r
# Sweeping thresholds from 0.1 to 0.9
map_dfr(c(0.1, 0.2, 0.3, 0.5, 0.7, 0.9), function(thresh) {
  titanic_pred |>
    mutate(p = pred > thresh) |>
    summarize(
      threshold = thresh,
      tpr = sum(p & Survived) / sum(Survived),
      fpr = sum(p & !Survived) / sum(!Survived)
    )
})
```

---

## Building a Good Model: Train / Test Split

In practice, evaluating a model on the exact same dataset used to fit it can overestimate performance (**overfitting**). Instead, we split our data into:
- **Training set ($70\%$)**: Used to estimate the model parameters (`glm()`).
- **Testing set ($30\%$)**: Held out to evaluate predictions on unseen observations.

In R, you can split data using `caTools::sample.split(titanic_df$Survived, SplitRatio = 0.7)` or directly with base R's `sample()`:

```r
set.seed(123)
# 70% training / 30% testing split
train_idx <- sample(seq_len(nrow(titanic_df)), size = floor(0.7 * nrow(titanic_df)))
train <- titanic_df[train_idx, ]
test  <- titanic_df[-train_idx, ]

cat("Training rows:", nrow(train), "| Testing rows:", nrow(test), "\n")
```

---

## Training on `train` and Evaluating on `test`

Now we fit our logistic regression model strictly on `train`, and evaluate its confusion matrix metrics on `test`:

```r
set.seed(123)
train_idx <- sample(seq_len(nrow(titanic_df)), size = floor(0.7 * nrow(titanic_df)))
train <- titanic_df[train_idx, ]
test  <- titanic_df[-train_idx, ]

mdl_train <- glm(Survived ~ Class + Age + Sex, data = train, family = "binomial")

test |>
  add_predictions(mdl_train, type = "response") |>
  mutate(
    pred_class = pred > 0.5,
    tp = pred_class & Survived,
    fp = pred_class & !Survived,
    tn = !pred_class & !Survived,
    fn = !pred_class & Survived
  ) |>
  summarize(
    accuracy = mean(pred_class == Survived),
    tpr = sum(tp) / (sum(tp) + sum(fn)),
    fpr = sum(fp) / (sum(fp) + sum(tn))
  )
```

---

## Exercise 1: Fuel Efficiency Logistic Classifier (`mpg`)

How can we use engine displacement (`displ`) and cylinder count (`cyl`) to predict whether a vehicle is fuel-efficient (achieving `hwy > 25` MPG)?
1. Mutate `mpg` to add `is_efficient = if_else(hwy > 25, 1, 0)`.
2. Fit a logistic model `glm(is_efficient ~ displ + cyl, family = "binomial", data = mpg_binary)`.
3. Print the summary and evaluate the slope coefficients.

```r
# Write your solution here:

```

---

## Exercise 1: Solution

```r
mpg_binary <- mpg |>
  mutate(is_efficient = if_else(hwy > 25, 1, 0))

efficiency_model <- glm(is_efficient ~ displ + cyl, family = "binomial", data = mpg_binary)
summary(efficiency_model)
```

Both `displ` and `cyl` have negative slope coefficients: as engine displacement or cylinder count increases, the log-odds (and probability) of a vehicle achieving over 25 highway MPG decrease.

---

## Exercise 2: Evaluating Classifier Accuracy on Test Data

Assess the predictive performance of our vehicle fuel-efficiency classifier on an unseen test split:
1. Split `mpg_binary` into a 70% training set and 30% testing set.
2. Fit `glm(is_efficient ~ displ + cyl, family = "binomial")` on the training set.
3. Compute predicted probabilities (`type = "response"`) on the testing set and calculate the classification accuracy using a `0.5` threshold.

```r
# Write your solution here:

```

---

## Exercise 2: Solution

```r
mpg_binary <- mpg |>
  mutate(is_efficient = if_else(hwy > 25, 1, 0))

set.seed(42)
train_idx <- sample(seq_len(nrow(mpg_binary)), size = floor(0.7 * nrow(mpg_binary)))
train_mpg <- mpg_binary[train_idx, ]
test_mpg  <- mpg_binary[-train_idx, ]

mpg_model <- glm(is_efficient ~ displ + cyl, family = "binomial", data = train_mpg)

test_mpg |>
  mutate(
    pred_prob = predict(mpg_model, newdata = test_mpg, type = "response"),
    pred_class = if_else(pred_prob >= 0.5, 1, 0)
  ) |>
  summarize(accuracy = mean(pred_class == is_efficient))
```
