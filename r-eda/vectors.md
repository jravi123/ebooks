# Vectors (Homogeneous Ordered Collections)

## Why Learn Vectors in Data Analytics?

Imagine you are tracking daily revenue for a small local business over a single week:
* Monday: `$120`
* Tuesday: `$150`
* Wednesday: `$90`
* Thursday: `$200`
* Friday: `$250`
* Saturday: `$300`
* Sunday: `$180`

Instead of creating seven separate variables (`revenue_mon`, `revenue_tue`, etc.) which makes calculations a nightmare, you want a single, ordered container. 

In R, this structure is a **Vector**. With a vector, you can:
1. Find the total weekly revenue in one command.
2. Retrieve the revenue of specific days (e.g., Wednesday).
3. Omit specific days (e.g., removing the weekends).
4. Filter for days that exceeded a certain sales target.

Let's learn how to create and manipulate vectors, which form the bedrock of all data operations in R.

---

## Creating Vectors: The `c()` Function
In R, we create vectors using the **combine/concatenate function `c()`**. All elements in a vector must be of the **same data type** (homogeneous).

```r
# Creating a numeric vector of weekly revenues
revenues <- c(120, 150, 90, 200, 250, 300, 180)
print(revenues)
```

### The Implicit Coercion Rule
If you try to combine different data types in a vector, R will silently convert (coerce) them to a single type, usually the most flexible one (character):

```r
mixed_vector <- c(10, "Closed", TRUE)
print(mixed_vector) 
# Output: "10" "Closed" "TRUE" (All converted to character strings!)
```

---

## R Indexing (1-Based Indexing)
>[!IMPORTANT] CRITICAL DIFFERENCE FROM PYTHON
> R uses **1-based indexing**. The first element in a vector is at index `1`, not `0`!

```r
revenues <- c(120, 150, 90, 200, 250, 300, 180)

# Get the first element (Monday)
print(revenues[1])  # 120

# Get the third element (Wednesday)
print(revenues[3])  # 90
```

---

## Negative Indexing (Omitting Elements)
>[!CAUTION] CRITICAL DIFFERENCE FROM PYTHON
> In Python, a negative index like `[-1]` returns the last element. 
> In R, a negative index **excludes/omits** that element from the output!

```r
revenues <- c(120, 150, 90, 200, 250, 300, 180)

# Return all revenues EXCEPT the first one (Monday)
print(revenues[-1])  # 150  90 200 250 300 180

# Return all revenues EXCEPT the weekends (positions 6 and 7)
print(revenues[-c(6, 7)])  # 120 150  90 200 250

# Alternative way
print(revenues[c(-6, -7)])  # 120 150  90 200 250
```

---

## Slicing and Ranges
To extract a sub-vector, use the colon `:` operator to generate a range of indices:

```r
revenues <- c(120, 150, 90, 200, 250, 300, 180)

# Slice from Wednesday (3) to Friday (5)
print(revenues[3:5])  # 90 200 250
```

---

## Useful Built-in Vector Functions
R features powerful vector statistics functions:
* **`length(x)`**: Returns the count of elements.
* **`sum(x)`**: Adds all elements together.
* **`mean(x)`**: Returns the arithmetic average.
* **`sort(x)`**: Sorts the vector (defaults to ascending; use `decreasing = TRUE` for descending).
* **`min(x)` / `max(x)`**: Returns the lowest/highest value.

```r
revenues <- c(120, 150, 90, 200, 250, 300, 180)

total_rev <- sum(revenues)
avg_rev <- mean(revenues)
max_rev <- max(revenues)

print(paste("Total:", total_rev, "| Average:", avg_rev, "| Max:", max_rev))
```

---

## Relational Operators & Logical Subsetting (Boolean Filtering)
To ask questions about your data, R uses **relational operators**. When applied to a vector, relational operations are evaluated for *every individual element*, producing a logical vector of `TRUE` and `FALSE` values.

| Operator | Meaning | Example |
| :--- | :--- | :--- |
| `<` | Less than | `x < y` |
| `>` | Greater than | `x > y` |
| `<=` | Less than or equal to | `x <= y` |
| `>=` | Greater than or equal to | `x >= y` |
| `==` | Exactly equal to | `x == y` |
| `!=` | Not equal to | `x != y` |

### Logical Filtering
You can pass a logical `TRUE/FALSE` vector inside the brackets `[]` to filter and return only the values where the condition is `TRUE`. This is called **logical subsetting** or **boolean filtering**:

```r
revenues <- c(120, 150, 90, 200, 250, 300, 180)

# 1. Ask: Which days exceeded a target of $180?
high_days <- revenues > 180
print(high_days)
# Output: FALSE FALSE FALSE  TRUE  TRUE  TRUE FALSE

# 2. Subset: Extract the actual revenues for those high days
print(revenues[high_days])
# Output: 200 250 300

# 3. Direct filtering in one step
print(revenues[revenues > 180])
# Output: 200 250 300
```

---

## Boolean Logical Operators (Element-wise)
To combine multiple conditions together for vectors, R provides element-wise boolean logical operators. These operators compare entire vectors element-by-element and return a logical vector of the same length, which is perfect for **logical filtering / subsetting**:

* **`&` (AND)**: Evaluates to `TRUE` only if *both* corresponding elements are `TRUE`.
* **`|` (OR)**: Evaluates to `TRUE` if *at least one* corresponding element is `TRUE`.
* **`!` (NOT)**: Inverts each logical value in the vector (`!TRUE` becomes `FALSE`).

```r
revenues <- c(120, 150, 90, 200, 250, 300, 180)

# Get revenues that are greater than 100 AND less than or equal to 200
print(revenues[revenues > 100 & revenues <= 200])
# Output: 120 150 200 180

# Get revenues that are extremely high (>250) OR extremely low (<100)
print(revenues[revenues > 250 | revenues < 100])
# Output: 90 300
```

---

## Hands-on Exercises

### Exercise 1: Weekly Revenue Audit
Given the daily revenue vector: `c(120, 150, 90, 200, 250, 300, 180)`
Write R code to:
1. Calculate and print the average weekday revenue (first 5 elements).
2. Calculate and print the total weekend revenue (last 2 elements).
3. Determine the difference between the average weekday revenue and the average weekend revenue.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
revenues <- c(120, 150, 90, 200, 250, 300, 180)

weekday_rev <- revenues[1:5]
weekend_rev <- revenues[6:7]

avg_weekday <- mean(weekday_rev)
total_weekend <- sum(weekend_rev)

print(paste("Average Weekday Revenue: $", avg_weekday))
print(paste("Total Weekend Revenue: $", total_weekend))

difference <- mean(weekend_rev) - avg_weekday
print(paste("Weekend average exceeds Weekday average by: $", difference))
```
</details>

---

### Exercise 2: Removing Anomalies
You have a vector of sensor readings: `c(22.1, 23.5, 999.0, 21.8, 22.4)`. The value `999.0` is an obvious sensor error at index position 3.
Write R code to:
1. Store the readings in a vector.
2. Use negative indexing to remove the faulty third reading.
3. Compute and print the average temperature of the remaining correct readings.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
readings <- c(22.1, 23.5, 999.0, 21.8, 22.4)
clean_readings <- readings[-3]
avg_temp <- mean(clean_readings)

print(paste("Cleaned Average Temperature:", avg_temp))
```
</details>
