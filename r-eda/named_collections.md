# Named Collections (Keys and Sets)

## Why Learn Named Collections in Data Analytics?

Imagine you are configuring settings for a data analysis database pipeline. You need to store:
* Host address: `"db.company.com"`
* Port number: `5432`
* Connection status: `TRUE`

If you use a simple list or vector, you must access them by their positions (e.g., `config[[1]]` for host, `config[[2]]` for port). This makes your code hard to read and prone to bugs if the order of elements changes.

Instead, you want to retrieve these values using descriptive names—like `config$host` or `config["port"]`. 

In R, this key-value association is achieved using **Named Vectors** and **Named Lists**. Let's learn how to create and query named collections, and how to perform set operations like finding common values between groups.

---

## 1. Named Vectors
A named vector allows you to assign a label (key) to each item in a vector. All items must still be of the same data type.

```r
# Creating a named character vector
country_codes <- c(US = "United States", UK = "United Kingdom", CA = "Canada")

# Retrieving values using keys
print(country_codes["US"])  # "United States"

# Modifying or adding key-value pairs
country_codes["MX"] <- "Mexico"
print(country_codes)
```

---

## 2. Named Lists & The `$` Operator
For heterogeneous data, **Named Lists** are highly popular. You can name the items inside a list and access them using R's signature dollar sign **`$` operator**:

```r
# Creating a named list representing a customer profile
customer <- list(
  name = "Alice Smith",
  age = 34,
  purchases = c(12.50, 45.00, 110.20)
)

# Accessing values using the $ operator
print(customer$name)       # "Alice Smith"
print(customer$age)        # 34
print(mean(customer$purchases)) # 55.9

# Adding a new key-value pair
customer$is_premium <- TRUE
print(customer)
```

---

## 3. Set Operations on Vectors
In data analytics, you often need to compare categories across datasets (e.g., finding customers who purchased in both January and February). R provides native set operations on vectors:

* **`unique(x)`**: Removes duplicate elements from vector `x`.
* **`intersect(x, y)`**: Returns elements common to both `x` and `y`.
* **`union(x, y)`**: Returns all unique elements from both `x` and `y`.
* **`setdiff(x, y)`**: Returns elements in `x` that are **not** in `y`.
* **`setequal(x, y)`**: Checks if the sets contain the exact same elements.

```r
jan_customers <- c("Alice", "Bob", "Charlie", "Alice")
feb_customers <- c("Charlie", "David", "Eve")

# Remove duplicates
print(unique(jan_customers)) # "Alice" "Bob" "Charlie"

# Shared customers (Intersection)
print(intersect(jan_customers, feb_customers)) # "Charlie"

# All unique customers across both months (Union)
print(union(jan_customers, feb_customers)) # "Alice" "Bob" "Charlie" "David" "Eve"

# Customers who bought in Jan but NOT Feb (Difference)
print(setdiff(jan_customers, feb_customers)) # "Alice" "Bob"
```

---

## Hands-on Exercises

### Exercise 1: Querying a Database Config
Create a named list representing a server configuration with the keys: `host` (value `"localhost"`), `port` (value `5432`), and `ssl` (value `TRUE`).
Write R code to:
1. Initialize the named list.
2. Retrieve and print the `port` value using the `$` operator.
3. Update the `host` value to `"127.0.0.1"`.
4. Print the updated config list.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
config <- list(
  host = "localhost",
  port = 5432,
  ssl = TRUE
)

print(config$port) # 5432

config$host <- "127.0.0.1"
print(config)
```
</details>

---

### Exercise 2: Customer Cohort Comparison
You have two customer vectors representing product views:
* Product A buyers: `c("ID_101", "ID_102", "ID_103", "ID_104")`
* Product B buyers: `c("ID_103", "ID_104", "ID_105", "ID_106")`

Write R code to:
1. Find customers who bought Product A but did **not** buy Product B (Difference).
2. Find customers who bought both products (Intersection).
3. Find the total number of unique customers across both groups.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
prod_a <- c("ID_101", "ID_102", "ID_103", "ID_104")
prod_b <- c("ID_103", "ID_104", "ID_105", "ID_106")

only_a <- setdiff(prod_a, prod_b)
print(only_a) # "ID_101" "ID_102"

both <- intersect(prod_a, prod_b)
print(both) # "ID_103" "ID_104"

total_unique <- length(union(prod_a, prod_b))
print(total_unique) # 6
```
</details>
