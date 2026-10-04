# Control Statements: If - Conditional Block

## Why Learn Control Statements in Data Analytics?

Imagine you are developing a credit approval system for a bank. You have a dataset of customer credit scores. You need to categorize each applicant automatically based on their score:
* **Score of 700 or above**: Status is `"Approved"`.
* **Score between 600 and 699**: Status is `"Under Review"`.
* **Score below 600**: Status is `"Denied"`.

If you write a simple sequential script, it will execute every line of code without stopping to think. To make decisions, you must deviate from this straight path. You need **Control Statements** (`if`, `else if`, and `else`) to guide the program down different paths depending on each applicant's credit score.

---

## 1. The `if` Statement Syntax
In R, conditions must be enclosed in **parentheses `( )`**, and the block of code to run must be enclosed in **curly braces `{ }`**.

```r
score <- 750

if (score >= 700) {
  print("Status: Approved")
}
```

---

## 2. Short-Circuiting Logical Operators (`&&` and `||`)
In the Vectors chapter, you learned about element-wise logical operators (`&`, `|`, and `!`) for filtering data. However, inside `if` statements, you should use their scalar counterparts: **`&&`** (AND) and **`||`** (OR).

| Operator Name | Notation | Example | Result |
| :--- | :--- | :--- | :--- |
| **Logical AND** | `&&` | `9 > 8 && 5 > 4` | `TRUE` (both must be TRUE) |
| **Logical OR** | `\|\|` | `8 > 9 \|\| 5 > 4` | `TRUE` (at least one must be TRUE) |

### Short-Circuit Evaluation
These double operators feature **Short-Circuit Evaluation**, which means R evaluates expressions from left to right and stops as soon as the final result is determined:
* **`&&` stops at the first `FALSE`**: If the left side is `FALSE`, R knows the entire expression must be `FALSE` and skips evaluating the right side.
* **`||` stops at the first `TRUE`**: If the left side is `TRUE`, R knows the entire expression must be `TRUE` and skips evaluating the right side.

This is extremely useful for writing safe conditions. For instance:
```r
x <- NULL

# This is safe because !is.null(x) evaluates to FALSE.
# R "short-circuits" and never evaluates x > 0, preventing a crash!
if (!is.null(x) && x > 0) {
  print("x is a positive number")
}
```

>[!IMPORTANT] Scalar vs. Vectorized Safety
> While single operators like `&` and `|` might seem to work for basic, single-value comparisons inside `if` conditions, they evaluate *both* sides (no short-circuiting) and are designed to return vectors. 
> 
> Because an `if` statement expects exactly **one** logical value, passing a vector of length > 1 (which `&` and `|` can produce) results in a **hard error** in modern R (version 4.2.0+). Always use `&&` and `||` in control flow!

---

## 3. Multi-Way Conditionals: `else if` and `else`
To handle multiple branches, chain them together using `else if` and `else`:

```r
score <- 650

if (score >= 700) {
  print("Status: Approved")
} else if (score >= 600) {
  print("Status: Under Review")
} else {
  print("Status: Denied")
}
```

>[!IMPORTANT] Syntax Layout Constraint
> In R, the `else` or `else if` keyword **must** be on the same line as the closing curly brace `}` of the preceding block. 
> 
> **Incorrect:**
> ```r
> if (score >= 700) {
>   print("Approved")
> }
> else { # This will throw a syntax error in R!
>   print("Denied")
> }
> ```

---

## 4. Inline Conditionals: `ifelse()` vs. `if_else()`
For simple conditional assignments, writing a full multi-line `if/else` block can be verbose. R offers vectorized inline functions for this.

### Base R: `ifelse()`
The built-in `ifelse(test, yes, no)` evaluates a test condition, returning the `yes` value if `TRUE` and the `no` value if `FALSE`:

```r
score <- 550
status <- ifelse(score >= 600, "Pass", "Fail")
print(status) # "Fail"
```

Base R's `ifelse()` is flexible and will automatically coerce data types if they differ between the `yes` and `no` values (e.g., mixing characters and numbers).

### Tidyverse: `if_else()`
The `dplyr` package (part of the `tidyverse`) provides a stricter alternative called `if_else(condition, true, false, missing = NULL)`:

```r
library(dplyr)
score <- 650
# Returns "large" if >600, else "small"
status <- if_else(score > 600, "large", "small")
print(status)
```

> [!IMPORTANT] The Strict Type-Safety Rule of `if_else()`
> Unlike base `ifelse()`, the `true` and `false` arguments of `dplyr::if_else()` **must return the exact same data type**. If you try to mix types (e.g., `if_else(x > 3, "large", 0)`), R will throw a compilation error.
> Furthermore, `if_else()` has a fourth argument, `missing`, which specifies what value to return if the condition evaluates to `NA`. This prevents unexpected propagation of missing values!

---

## Hands-on Exercises

### Exercise 1: Risk Profiling
**How can we dynamically classify a client's investment risk profile as conservative, moderate, or aggressive based on their numerical age?**

*Analytical Guidance*:
Develop a decision rule inside a custom logical script. Your code should:
1. Assign a test variable `age <- 62`.
2. Construct a control flow statement:
   * If age is strictly under 35, print `"Risk Profile: Aggressive"`.
   * If age is between 35 and 60 (inclusive), print `"Risk Profile: Moderate"`.
   * If age is above 60, print `"Risk Profile: Conservative"`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
age <- 62

if (age < 35) {
  print("Risk Profile: Aggressive")
} else if (age <= 60) {
  print("Risk Profile: Moderate")
} else {
  print("Risk Profile: Conservative")
}
```
</details>

---

### Exercise 2: Premium Pricing Logic
**How can we calculate the subscription price for a client based on their student status and numerical age?**

*Analytical Guidance*:
Create a logical evaluation branch using conditional logic. Your code should:
1. Define variables `is_student <- TRUE` and `age <- 22`.
2. Write a conditional control statement that checks if the client is a student **OR** is under 18 years of age:
   * If true, assign a price of `$10`.
   * Otherwise, assign a price of `$15`.
3. Print the final price outcome.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
is_student <- TRUE
age <- 22

if (is_student || age < 18) {
  price <- 10
} else {
  price <- 15
}

print(paste("Subscription Price: $", price))
```
</details>
