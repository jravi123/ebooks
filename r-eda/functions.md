# Custom Functions

## Why Learn Custom Functions in Data Analytics?

Imagine you are analyzing the **volatility** of monthly user growth rates across several departments (e.g., Marketing, Sales, Engineering) to see which ones experience the most dramatic fluctuations. To measure volatility, the direction of change (positive or negative) does not matter, only its scale.

Your data cleaning pipeline requires:
1. Converting growth rates to absolute values (representing absolute volatility magnitude).
2. Multiplying by 100 to convert to a percentage.
3. Rounding the result to 2 decimal places.

If you copy and paste these three math steps for every department, your code becomes bloated and hard to maintain. If you decide to change the rounding to 3 decimal places later, you must find and update every single copy!

Instead, you want to package this calculation into a reusable box:
```r
clean_growth <- function(rate) {
  rounded <- round(abs(rate) * 100, digits = 2)
  return(rounded)
}
```

In R, this is a **User-Defined Function**. It allows you to modularize your analytics, reduce duplication, and debug errors easily.

---

## 1. Defining a Custom Function
In R, functions are assigned to variables using the standard `<-` operator, followed by the `function` keyword, argument list, and braces `{ }`.

### Syntax
```r
function_name <- function(param1, param2) {
  # statements
  return(value)
}
```

---

## 2. Implicit vs. Explicit Returns
In R, you can return values in two ways:
* **Explicit**: Using the `return()` function.
* **Implicit**: R automatically returns the value of the **last statement** evaluated inside the function body.

```r
# Explicit Return
multiply_explicit <- function(x, y) {
  return(x * y)
}

# Implicit Return (Recommended R idiom for simple functions)
multiply_implicit <- function(x, y) {
  x * y # This is the last line, so it gets returned automatically!
}

print(multiply_implicit(5, 4)) # 20
```

---

## 3. Parameter Defaults
You can set default values for arguments. If a default is set, you don't have to provide that argument when calling the function:

```r
calculate_target <- function(base, growth_rate = 0.05) {
  base * (1 + growth_rate)
}

# Uses default growth_rate of 0.05
print(calculate_target(100))      # 105

# Overrides default with 0.10
print(calculate_target(100, 0.10)) # 110
```

---

## Hands-on Exercises

### Exercise 1: Clean and Standardize Metric
Write a function called `normalize_metric` that takes a numeric vector, finds the difference of each element from the mean of the vector, and divides it by the standard deviation (`sd()`).
1. Define `normalize_metric <- function(vec) { ... }`
2. The formula to return is `(vec - mean(vec)) / sd(vec)`. Use implicit return.
3. Test your function by calling it with `c(10, 20, 30)` and print the result.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
normalize_metric <- function(vec) {
  (vec - mean(vec)) / sd(vec)
}

test_vec <- c(10, 20, 30)
print(normalize_metric(test_vec))
# Output: -1  0  1
```
</details>

---

### Exercise 2: Discount Calculator with Defaults
Write a function `calculate_price` that takes a raw `price` and a `discount` percentage (defaulting to `0.10`).
Write R code to:
1. Define the function. The formula is `price * (1 - discount)`.
2. Call it with a price of `100` and no discount (verify it returns `90`).
3. Call it with a price of `150` and a discount of `0.20` (verify it returns `120`).

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
calculate_price <- function(price, discount = 0.10) {
  price * (1 - discount)
}

# Test 1
print(calculate_price(100)) # 90

# Test 2
print(calculate_price(150, 0.20)) # 120
```
</details>
