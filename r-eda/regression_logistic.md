# Classification & Logistic Regression

## Why Learn Logistic Regression?

Many critical questions in data science have binary answers:
* Will a Titanic passenger survive the tragedy? (Survived / Perished)
* Will a customer click a promotion link? (Yes / No)
* Will a student pass an exam? (Pass / Fail)

Standard linear regression (`lm()`) is highly unsuitable for binary outcomes. Forcing a straight line to fit a binary (0/1) outcome yields several critical failures:
1. **Out-of-bound predictions**: The line will inevitably predict values less than 0 or greater than 1, which are impossible to interpret as logical probabilities.
2. **Bimodal residual distributions**: Since the actual outcome is strictly 0 or 1, the residuals are highly non-normal, violating core OLS assumptions.
3. **Heteroscedasticity**: The variance of errors is not constant across predicted ranges.

**Logistic Regression** solves these problems by modeling the **probability** ($p$) of the binary outcome, using an S-shaped curve (sigmoid) that constrains predictions to stay strictly between 0 and 1.

---

## Part 1: The Mathematics of Odds, Log-Odds, and Sigmoids

To understand logistic regression, we must master the conversion between three scales:

```
                            Scale Conversions:
                            
        Scale                 Formula                         Boundaries
     ─────────────          ───────────────────────────────   ─────────────
      • Probability (p)      Actual likelihood of occurrence   [0, 1]
      • Odds                 p / (1 - p)                       [0, ∞)
      • Log-Odds (Logit)     log(p / (1 - p))                  (-∞, +∞)
```

### The Log-Odds Model
Instead of modeling probability linearly, we fit a linear combination of predictors to the **log-odds** scale:

$$\log \left( \frac{p}{1-p} \right) = a_0 + a_1 x_1 + \dots + a_k x_k$$

### Reversing the Logit: The Logistic Function (Sigmoid)
The **logistic function** (also known as the **sigmoid curve**) is the mathematical inverse of the log-odds (logit) function. It maps the unrestricted log-odds prediction ($x$) back to a bounded probability scale $[0, 1]$:

$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

Where $e$ is Euler's constant ($\approx 2.71828$).

---

## Part 2: Hands-on Titanic Case Study (Single Categorical Predictor)

Let's examine passenger survival data from the Titanic using a single categorical predictor: `Sex`.

```r
library(tidyverse)
library(modelr)

# View raw data structure
data(Titanic)
titanic_df <- Titanic |>
  as_tibble() |>
  mutate(Survived = Survived == "Yes")

# Replicate rows to expand counts (matching the 'n' column)
titanic_df <- titanic_df[rep(row.names(titanic_df), titanic_df$n), -5]
print(head(titanic_df))
```

### Fitting the Logistic Model
To fit a logistic regression model in R, use the Generalized Linear Model **`glm()`** function and specify **`family = "binomial"`**:

```r
# Fit logistic regression model predicting survival based on Sex
gender_model <- glm(Survived ~ Sex, data = titanic_df, family = "binomial")
print(gender_model)
# Coefficients:
# (Intercept)      SexMale  
#      1.0022      -2.3164  
```

Our estimated model represents:

$$\log \left( \frac{p}{1-p} \right) = 1.0022 - 2.3164 \cdot \{\text{Sex = Male}\}$$

### Verifying the Mathematical Estimates
Let's confirm these coefficients by calculating empirical survival rates:

```r
# Count outcomes by gender
titanic_df |> count(Sex, Survived)
# Female: 126 Perished, 344 Survived -> p = 344 / (126 + 344) = 0.7319
# Male:   1364 Perished, 367 Survived -> p = 367 / (1364 + 367) = 0.2120
```

1. **Female Survival Odds**:
   $$\text{Odds} = \frac{0.7319149}{1 - 0.7319149} = 2.730159$$
   $$\text{Log-Odds} = \log(2.730159) = 1.0043 \quad (\text{matches Intercept!})$$

2. **Male Survival Odds**:
   $$\text{Odds} = \frac{0.2120162}{1 - 0.2120162} = 0.2690616$$
   $$\text{Log-Odds} = \log(0.2690616) = -1.3128$$

3. **Relative Offset**:
   The coefficient for `SexMale` represents the difference between male and female log-odds:
   $$\text{Offset} = -1.3128 - 1.0043 = -2.3171 \quad (\text{matches SexMale coefficient!})$$

### Generating Probabilities: `type = "response"`
By default, predicting from a `glm` model yields log-odds. To obtain actual probabilities, we must specify **`type = "response"`**:

```r
# Add probability predictions to our dataframe
titanic_probs <- titanic_df |>
  add_predictions(gender_model, type = "response")

print(head(titanic_probs))
# # A tibble: 6 x 4
#   Class Sex    Age   Survived  pred
#   <chr> <chr>  <chr> <lgl>    <dbl>
# 1 1st   Female Child TRUE     0.732 # Female expected survival rate
# 2 1st   Female Child TRUE     0.732
```

---

## Part 3: Modeling Continuous Predictors & Multiple Variables

Let's download a richer Titanic dataset that records passenger ages as continuous integers:

```r
# Load rich titanic dataset
titanic_rich <- read_csv('https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv')

# Fit model with a continuous predictor
age_model <- glm(Survived ~ Age, data = titanic_rich, family = "binomial")
summary(age_model)
```

The model represents:

$$\log \left( \frac{p}{1-p} \right) = a_0 + a_1 \cdot \text{Age}$$

A negative slope coefficient $a_1$ indicates that the log-odds (and therefore the probability) of survival declines as age increases.

### Logistic Regression with Multiple Predictors
Just like linear regression, we can add multiple continuous and categorical predictors:

```r
# Fit multi-variable logistic model
multi_model <- glm(Survived ~ Class + Age + Sex, data = titanic_df, family = "binomial")
summary(multi_model)
```

For an adult, male, third-class passenger, the predicted log-odds from this model is $-2.153985$. To find their probability of survival, we apply the logistic function:

$$p = \frac{1}{1 + e^{2.153985}} = 0.104 \quad (10.4\% \text{ survival chance})$$

---

## Part 4: Classification Performance & The Confusion Matrix

To evaluate a classifier's predictions, we map our predicted probabilities to binary outcomes using a threshold (commonly $0.5$):
* If $\text{Probability} \ge 0.5 \to \text{Predict Survived}$
* If $\text{Probability} < 0.5 \to \text{Predict Perished}$

We summarize these classifications in a **Confusion Matrix**:

```
                              Confusion Matrix:
                              
                            Actual Positive      Actual Negative
                          ────────────────────  ──────────────────
      • Predicted Positive  True Positive (TP)    False Positive (FP)
      • Predicted Negative  False Negative (FN)   True Negative (TN)
```

### Key Performance Metrics:
* **True Positive Rate (TPR)** (Sensitivity / Recall): The proportion of actual survivors correctly predicted by the model:
  
  $$\text{TPR} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

* **False Positive Rate (FPR)**: The proportion of actual perishers incorrectly predicted to survive:
  
  $$\text{FPR} = \frac{\text{FP}}{\text{FP} + \text{TN}}$$

* **Specificity** (True Negative Rate): The proportion of actual perishers correctly predicted by the model:
  
  $$\text{Specificity} = \frac{\text{TN}}{\text{TN} + \text{FP}} = 1 - \text{FPR}$$

---

## Part 5: The Threshold Trade-off & Cross-Validation

Choosing a classification threshold involves a fundamental trade-off:

```
                            Threshold Decisions:
                            
        Threshold Choice                  Impact on Metrics
     ───────────────────────            ──────────────────────────────────────────────────
      • High Threshold (0.8)             Low FPR (good, few false alarms), but low TPR 
                                         (misses actual survivors).
      • Low Threshold (0.2)              High TPR (captures survivors), but high FPR 
                                         (many false alarms).
```

### Splitting Data for Robust Validation
To assess how well our model generalizes to unseen data, we divide our dataset into **Training** (70%) and **Test** (30%) subsets:

```r
library(caTools)

# Set seed for reproducibility
set.seed(123)

# Split dataset
split <- sample.split(titanic_df$Survived, SplitRatio = 0.7)
train_data <- filter(titanic_df, split == TRUE)
test_data  <- filter(titanic_df, split == FALSE)

# Fit model on training data
log_model <- glm(Survived ~ ., data = train_data, family = "binomial")

# Compute predicted probabilities on test data
test_predictions <- test_data |>
  mutate(predicted_prob = predict(log_model, newdata = test_data, type = "response"))

# Calculate test classification accuracy
accuracy <- test_predictions |>
  mutate(pred_outcome = if_else(predicted_prob >= 0.5, TRUE, FALSE)) |>
  summarize(acc = mean(pred_outcome == Survived))

cat("Validation Accuracy on Unseen Test Data:", accuracy$acc * 100, "%\n")
```

---

## Hands-on Exercises

### Exercise 1: Fuel Efficiency Logistic Classifier
**How can we use engine displacement and cylinder counts to predict whether a vehicle is fuel-efficient (achieving more than 25 MPG)?**

*Analytical Guidance*:
Fit a logistic regression model. Your analysis should:
1. Load `library(tidyverse)` and `library(modelr)`.
2. Mutate the `mpg` dataset to add a binary column: `is_efficient = if_else(hwy > 25, 1, 0)`.
3. Fit a logistic model predicting `is_efficient` based on engine size (`displ`) and cylinders (`cyl`) using `glm()`, specifying `family = "binomial"`. Store it in `efficiency_model`.
4. Print the summary and evaluate the slope coefficients.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

# Prepare binary column
mpg_binary <- mpg |>
  mutate(is_efficient = if_else(hwy > 25, 1, 0))

# Fit model
efficiency_model <- glm(is_efficient ~ displ + cyl, family = "binomial", data = mpg_binary)

# Inspect summary
summary(efficiency_model)

# Observe: Both displacement and cylinder count have negative slope coefficients.
# As engine size or cylinder count increases, the probability of being fuel-efficient declines.
```
</details>

---

### Exercise 2: Evaluating Classifier Accuracy on Test Data
**How do we assess the predictive performance of our vehicle fuel-efficiency classifier on unseen validation datasets?**

*Analytical Guidance*:
Generate predictions and calculate test accuracy. Your analysis should:
1. Load `library(tidyverse)`, `library(modelr)`, and `library(caTools)`.
2. Reuse the mutated `mpg_binary` dataset from Exercise 1.
3. Split the data into 70% training and 30% testing subsets using `sample.split(mpg_binary$is_efficient, SplitRatio = 0.7)`.
4. Fit the model on the training set and compute predicted probabilities on the test set.
5. Compute the final classification accuracy on the test dataset using a $0.5$ threshold.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(caTools)

# Set seed and split data
set.seed(42)
split <- sample.split(mpg_binary$is_efficient, SplitRatio = 0.7)
train_mpg <- filter(mpg_binary, split == TRUE)
test_mpg  <- filter(mpg_binary, split == FALSE)

# Fit model on training data
mpg_model <- glm(is_efficient ~ displ + cyl, family = "binomial", data = train_mpg)

# Compute probabilities on test data
test_mpg_preds <- test_mpg |>
  mutate(pred_prob = predict(mpg_model, newdata = test_mpg, type = "response"))

# Calculate accuracy
accuracy_summary <- test_mpg_preds |>
  mutate(pred_class = if_else(pred_prob >= 0.5, 1, 0)) |>
  summarize(accuracy = mean(pred_class == is_efficient))

print(accuracy_summary)
```
</details>
