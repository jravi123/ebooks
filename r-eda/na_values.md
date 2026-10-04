# Handling Missing Data: NA Values in R

## Why Learn About NA Values in Data Analytics?

In real-world data science, datasets are rarely clean or complete. Sensors fail, survey respondents skip questions, and data merges leave blanks. In R, missing data is represented by a special value: **`NA`** (Not Available).

Understanding how R treats `NA` is crucial because:
1. **`NA` values propagate**: A single missing value can ruin your entire calculation.
2. **Visualizations reflect missingness**: When plotting data with ggplot2, `NA` values are either automatically removed (with warnings) or displayed as an explicit `"NA"` category, which can clutter your charts.

Let's learn how to identify, calculate around, and clean `NA` values in R.

---

## 1. What is `NA`?
In R, `NA` is a special logical constant that represents **missing or unknown data**. 

It is different from:
* **`NaN`** (Not a Number): Represents mathematically undefined operations (like `0 / 0`).
* **`NULL`**: Represents the complete empty set or the absence of an object (length 0), whereas `NA` represents a placeholder for a missing value (length 1).

---

## 2. The Propagation of `NA`
Because `NA` represents an *unknown* value, any mathematical operation involving an `NA` will also result in `NA`. This is called **propagation**:

```r
# If we don't know one day's sales, we cannot know the sum or average
daily_sales <- c(2500, 3100, NA, 2800)

print(sum(daily_sales))  # Output: NA
print(mean(daily_sales)) # Output: NA
```

### The Solution: `na.rm = TRUE`
Most of R’s summary and statistical functions (like `sum()`, `mean()`, `median()`, `sd()`, `min()`, and `max()`) include an argument called **`na.rm`** (NA Remove). Setting `na.rm = TRUE` instructs R to strip out the missing values *before* executing the calculation:

```r
daily_sales <- c(2500, 3100, NA, 2800)

# Calculate average sales of known days
avg_sales <- mean(daily_sales, na.rm = TRUE)
print(avg_sales) # Output: 2800
```

---

## 3. Detecting NA Values with `is.na()`
You cannot check for `NA` values using standard relational operators like `==`. This is because `NA == NA` asks "is an unknown value equal to another unknown value?" to which the logical answer is another unknown value (`NA`).

To check for missingness, always use the built-in helper function **`is.na()`**, which returns `TRUE` if an element is `NA` and `FALSE` otherwise:

```r
daily_sales <- c(2500, 3100, NA, 2800)

# This DOES NOT work:
print(daily_sales == NA) 
# Output: NA NA NA NA

# This WORKS:
print(is.na(daily_sales)) 
# Output: FALSE FALSE  TRUE FALSE

# Count how many NA values exist
print(sum(is.na(daily_sales))) # Output: 1 (TRUE is treated as 1)
```

---

## 4. How ggplot2 Handles NA Values
When you pass a dataset containing `NA` values to `ggplot2`, the behavior depends on where the `NA` lies:

To see how ggplot2 handles these missing values, let's explore an example that generates a warning, followed by the code to fix it.

### Code That Triggers a Warning
If you plot continuous variables (like `Ozone` vs `Temp` in the built-in `airquality` dataset) and some rows have `NA` values in those columns, `ggplot2` will silently omit those points and print a warning in your console.

Run this code in your editor to see the warning message displayed on your screen:
```r
library(tidyverse)

# 1. Count how many NA values exist in the Ozone column
print(sum(is.na(airquality$Ozone))) # 37

# 2. Plotting this data directly will trigger a warning message!
ggplot(data = airquality, mapping = aes(x = Temp, y = Ozone)) +
  geom_point()
```

### The Clean Fix (No Warnings!)
To avoid this warning and ensure data integrity, it is best practice to filter out `NA` values from your data frame *before* passing it to `ggplot()` using R's bracket subsetting `[row_conditions, column_conditions]`:
```r
library(tidyverse)

# 1. Subsetting rows where Ozone is NOT NA, keeping all columns (empty after comma)
clean_airquality <- airquality[!is.na(airquality$Ozone), ]

# 2. Plotting the cleaned data frame produces 0 warnings!
ggplot(data = clean_airquality, mapping = aes(x = Temp, y = Ozone)) +
  geom_point()
```

---

## Hands-on Exercises

### Exercise 1: Clean and Calculate Vector Average
You are given a vector of sensor temperature readings containing some missing values: `c(22.5, NA, 24.1, 23.8, NA, 21.9)`.
Write R code to:
1. Assign the vector to `temps`.
2. Print the average temperature of the vector *without* handling NAs (verify it prints `NA`).
3. Calculate and print the correct average temperature by removing `NA` values using `na.rm = TRUE`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
temps <- c(22.5, NA, 24.1, 23.8, NA, 21.9)

# 2. This returns NA
print(mean(temps))

# 3. This returns the clean average (23.075)
clean_avg <- mean(temps, na.rm = TRUE)
print(clean_avg)
```
</details>

---

### Exercise 2: Removing NA values from a Data Frame
Given a mock dataset of products and their ratings:
```r
library(tidyverse)
products <- tibble(
  id     = c(1L, 2L, 3L, 4L),
  name   = c("Laptop", "Mouse", "Keyboard", "Monitor"),
  rating = c(4.8, NA, 4.2, 4.5)
)
```
Write R code to:
1. Count the number of missing ratings in the `rating` column using `is.na()` and `sum()`.
2. Subset the `products` data frame using bracket notation `[` to keep only rows that have a valid rating (non-NA) and print the result.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
products <- tibble(
  id     = c(1L, 2L, 3L, 4L),
  name   = c("Laptop", "Mouse", "Keyboard", "Monitor"),
  rating = c(4.8, NA, 4.2, 4.5)
)

# 1. Count NAs
na_count <- sum(is.na(products$rating))
print(paste("Number of missing ratings:", na_count))

# 2. Subset to remove NAs
clean_products <- products[!is.na(products$rating), ]

print(clean_products)
```
</details>
