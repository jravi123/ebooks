# Built-in Functions

## Why Learn Built-in Functions in Data Analytics?

Imagine you are analyzing product reviews for an e-commerce website. You have a customer rating stored as a text string: `"4.8"`. Additionally, another review has a typo storing the rating as a negative number: `-3.5` (which should be positive `3.5`).

To use these ratings in your analytics model, you need to:
1. Convert the text `"4.8"` into a real decimal number.
2. Convert the negative `-3.5` to its absolute value `3.5`.
3. Round a long average rating like `4.166667` to a clean `4.2` for display.

Instead of writing complex math formulas to achieve this, R provides pre-built solutions called **built-in functions**. Knowing these functions allows you to clean and format data in seconds.

---

## 1. What is a Function?
A function is a reusable block of code that takes one or more inputs (**arguments**), processes them, and returns an output.

In the previous chapter, you used `print()` and `class()`. These are built-in functions:
* `class(4.5)`: The argument is `4.5`, and the function returns the character string `"numeric"`.

---

## 2. R Built-in Data Type Conversions
Since data importing often reads values as text (character class), you must frequently convert them to numbers or logials. In R, these functions are prefixed with `as.`:

* **`as.numeric()`**: Converts to decimal/numeric.
* **`as.integer()`**: Converts to integer.
* **`as.character()`**: Converts to character text.
* **`as.logical()`**: Converts to logical (`TRUE`/`FALSE`).

```r
# Data cleaning example
raw_rating <- "4.8"
clean_rating <- as.numeric(raw_rating)

print(class(raw_rating))     # "character"
print(class(clean_rating))   # "numeric"
print(clean_rating * 2)      # 9.6 (Now mathematical calculations work!)
```

---

## 3. Handy Mathematical Built-in Functions
R is built for statistics, so it includes outstanding math functions out-of-the-box:

* **`abs(x)`**: Returns the absolute value of `x`.
* **`sqrt(x)`**: Returns the square root of `x`.
* **`round(x, digits)`**: Rounds `x` to a specified number of decimal places.
* **`ceiling(x)`**: Rounds `x` *up* to the nearest integer.
* **`floor(x)`**: Rounds `x` *down* to the nearest integer.

```r
# Cleaning a negative rating and rounding
bad_entry <- -3.567
clean_entry <- abs(bad_entry)
rounded_entry <- round(clean_entry, digits = 1)

print(clean_entry)    # 3.567
print(rounded_entry)  # 3.6
```

---

## 4. Built-in Statistical Summary Functions
Data analysts frequently need to summarize entire lists (vectors) of numbers to calculate key metrics. R includes highly optimized base statistical functions out-of-the-box:

* **`sum(x)`**: Adds all elements in a vector.
* **`mean(x)`**: Calculates the arithmetic average.
* **`median(x)`**: Finds the middle value (50th percentile).
* **`sd(x)`**: Computes the standard deviation (how spread out the values are).
* **`min(x)`** and **`max(x)`**: Finds the minimum and maximum values.

### Handling Missing Data: The `na.rm = TRUE` Argument
In real-world data science, missing values are extremely common and are represented by the reserved value `NA` (Not Available). If a vector contains even a single `NA` value, R's statistical summary functions will return `NA` by default!

To bypass this, base R statistical functions include a special argument: **`na.rm = TRUE`** (which stands for "NA remove = TRUE").

Let's look at a practical weekly analytics summary:

```r
# Daily store customer count (with one missing day due to sensor error)
daily_customers <- c(120, 150, NA, 190, 110, 140, 175)

# Summary functions fail by default if NA is present:
print(mean(daily_customers)) # Output: NA

# Clean calculation using the na.rm = TRUE argument
total_customers <- sum(daily_customers, na.rm = TRUE)
avg_customers   <- mean(daily_customers, na.rm = TRUE)
variation       <- sd(daily_customers, na.rm = TRUE)

print(paste("Total Weekly Customers:", total_customers))
print(paste("Average Daily Customers:", round(avg_customers, digits = 1)))
print(paste("Standard Deviation:", round(variation, digits = 2)))
```

---

## 5. Simple Text Manipulation Built-in Functions
Text data (character strings) is often messy, containing mixed capitalization or accidental leading and trailing whitespace. Base R provides extremely handy built-in functions to clean text:

* **`nchar(x)`**: Counts the number of characters (letters, numbers, punctuation, spaces) in a string.
* **`tolower(x)`** / **`toupper(x)`**: Standardizes text casing.
* **`trimws(x)`**: Trims off any accidental leading or trailing blank spaces.
* **`paste(..., sep = " ")`**: Combines multiple strings or vectors together with a custom separator.
* **`paste0(...)`**: A faster version of `paste()` that joins strings together with no space/separator.

Let's look at a text-standardization example:

```r
# Messy customer submissions
raw_location <- "   Ann Arbor  "
promo_code   <- "SAVE_20_Percent"

# 1. Trim blanks and convert location to standard uppercase (nested functions!)
clean_location <- toupper(trimws(raw_location))

# 2. Check characters of promo code to ensure it meets system limits
code_length <- nchar(promo_code)

# 3. Join them into a clean transaction receipt entry
receipt_entry <- paste0("LOCATION: ", clean_location, " | PROMO_CODE: ", promo_code, " (Length: ", code_length, ")")
print(receipt_entry)
```

---

## Hands-on Exercises

### Exercise 1: Cleanup and Compute
You receive a sensor temperature value as a text string: `"102.73"`. Write R code to:
1. Store `"102.73"` in a variable.
2. Convert it to a numeric data type.
3. Calculate the square root of the temperature.
4. Round the square root to 2 decimal places and print it.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
temp_str <- "102.73"
temp_num <- as.numeric(temp_str)
temp_sqrt <- sqrt(temp_num)
temp_rounded <- round(temp_sqrt, digits = 2)

print(temp_rounded)
```
</details>

---

### Exercise 2: Absolute Growth Target
A company had a sales change metric of `-12.4%`. 
Write R code to:
1. Store `-12.4` in a variable.
2. Convert it to its absolute value to represent the **absolute magnitude** of change.
3. Ceiling the result to the next whole percentage integer.
4. Print the final absolute target change.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
sales_change <- -12.4
absolute_magnitude <- abs(sales_change)
target_change <- ceiling(absolute_magnitude)

print(target_change) # Output: 13
```
</details>
