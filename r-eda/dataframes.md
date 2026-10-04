# Data Frames (Tabular Structures)

## Why Learn Data Frames in Data Analytics?

Imagine you are analyzing customer registration data. You have the following details for three customers:
* **Names**: Alice, Bob, Charlie
* **Ages**: 25, 32, 19
* **Subscription Status**: `TRUE`, `FALSE`, `TRUE`

If you keep these as three separate vectors, filtering for "active subscribers over 20 years old" is challenging. If you sort or reorder one vector, it falls out of sync with the others.

You need a spreadsheet-like structure where columns have names, but rows represent connected records.

In R, this structure is a **Data Frame (`data.frame`)**. It is R's native 2D grid structure. In this chapter, we will learn how to create data frames, inspect their structures, extract rows or columns, and filter for target subsets.

---

## 1. Creating a Data Frame
A data frame is constructed using the `data.frame()` function, combining vectors of the **exact same length** as columns:

```r
# Create vectors
names <- c("Alice", "Bob", "Charlie")
ages <- c(25, 32, 19)
active <- c(TRUE, FALSE, TRUE)

# Combine into a data frame
customers <- data.frame(Name = names, Age = ages, ActiveStatus = active)
print(customers)
```

---

## 2. Inspecting Data Frames
When working with larger datasets, you cannot print the whole table to the console. R provides helpful functions to inspect tables:
* **`dim(df)`**: Returns dimensions (rows, columns).
* **`nrow(df)`** / **`ncol(df)`**: Returns the number of rows or columns.
* **`head(df, n)`**: Prints the first `n` rows.
* **`str(df)`**: Displays the structure of the data frame (column types, dimensions).
* **`summary(df)`**: Provides statistical summary statistics for each column.

```r
# Inspect customer data frame structure
str(customers)
```

---

## 3. Selecting Columns and Rows (Indexing)
Like vectors, data frames use square brackets `[row, column]` for indexing.

* **`df[row, col]`**: Gets value at specific row and column.
* **`df[row, ]`**: Returns the entire row as a sub-table.
* **`df[, col]`**: Returns the entire column as a vector.
* **`df$col`**: Fast syntax to get a column as a vector.

```r
# Get Alice's Age (Row 1, Column 2)
print(customers[1, 2]) # 25

# Get Bob's entire record (Row 2)
print(customers[2, ]) 

# Get all Names (Column 1)
print(customers[, 1]) # "Alice" "Bob" "Charlie"

# Alternative: Get all Ages using $
print(customers$Age)  # 25 32 19
```

---

## 4. Subsetting / Filtering Data
In data science, we constantly filter tables based on logical conditions. We can place a logical comparison inside the row position of `df[row_condition, ]`:

```r
# Find all rows where Age is greater than 20
adult_rows <- customers[customers$Age > 20, ]
print(adult_rows)

# Find active customers
active_customers <- customers[customers$ActiveStatus == TRUE, ]
print(active_customers)
```

### Why the Comma `,` and Trailing Blank Space are Critical
Because a data frame is 2-dimensional, R always expects index queries to specify both dimensions, separated by a comma: `df[row_index, column_index]`.

* **The Trailing Blank Space (`df[condition, ]`)**: By placing the condition *before* the comma and leaving the column slot *after* the comma completely blank, you are telling R: "Filter the **rows** based on my condition, and **return all columns**."
* **Omitting the Comma (`df[condition]`)**: If you forget the comma (e.g., `customers[customers$Age > 20]`), R will fall back to treating the data frame as a 1D list of *columns* (since a data frame is internally a list of column vectors). It will try to use the condition to filter columns rather than rows, which either returns completely wrong results (such as subsetting specific columns) or triggers a confusing error!

> [!IMPORTANT]
> **Rule of thumb for square brackets `[]`:**
> * `df[condition, ]` (with comma) $\rightarrow$ filters **rows** (observations).
> * `df[columns]` (no comma) $\rightarrow$ selects **columns** (variables).

## 5. Sorting and Reordering Data: `sort()` vs. `order()`
When sorting data in R, it is critical to distinguish between `sort()` and `order()` to avoid corrupting your rectangular tables:

* **`sort(x)`**: Returns the values of vector `x` rearranged in ascending order. It works on single vectors but **cannot** be used to sort data frames.
* **`order(x)`**: Returns the **indices (row positions)** of the elements in their sorted order. This index vector is the standard way to sort matching columns or data frame rows.

### Example: Keeping Records in Sync
Imagine we have a small table of patient heart rates:

```r
patients <- data.frame(
  Name = c("Alice", "Bob", "Charlie", "David"),
  HR   = c(80, 72, 95, 68)
)
```

Using `sort(patients$HR)` yields the values `68 72 80 95`, but throws away their association to patient names. 

Instead, we use `order(patients$HR)` to retrieve the sorted row positions:

```r
indices <- order(patients$HR)
print(indices)  # Output: 4 2 1 3 (Row 4 is smallest, then 2, 1, 3)

# Pass the indices to the row position inside square brackets to sort the entire table:
sorted_patients <- patients[indices, ]
print(sorted_patients)
```

**Output:**
```text
     Name HR
4   David 68
2     Bob 72
1   Alice 80
3 Charlie 95
```

---

## 6. Modern Tables: Tibble vs. data.frame
While base R provides `data.frame`, the tidyverse package `tibble` provides a modern alternative.

```r
library(dplyr)
# Create a tibble
cust_tibble <- tibble(
  Name = c("Alice", "Bob", "Charlie"),
  Age = c(25, 32, 19)
)
print(class(cust_tibble))
# Output displays three classes: "tbl_df" "tbl" "data.frame"
```

### Why use Tibbles?
1. **Painless Printing**: A tibble only prints the first 10 rows and lists column data types (e.g., `<chr>`, `<dbl>`), preventing console flooding.
2. **Strict Subsetting**: Double brackets `[[ ]]` are required to extract single columns as vectors, avoiding silent type conversions.
3. **`glimpse()`**: A tidyverse function to view data columns transpose-style (useful for very wide tables):

```r
glimpse(cust_tibble)
```

---

## 7. Combining Tables: `rbind()` and `cbind()`
To merge different vectors or tables together, R provides two functions:

* **`rbind(...)`**: Binds/joins data frames or matrices by **row** (adds observations). The tables must have the **exact same column names**.
* **`cbind(...)`**: Binds/joins data frames, matrices, or vectors by **column** (adds new variables). The items must have the **exact same number of rows**.

```r
# rbind example (adding a row/observation)
t1 <- tibble(Name = "Alice", Age = 25)
t2 <- tibble(Name = "Bob", Age = 32)
combined_rows <- rbind(t1, t2)
print(combined_rows)

# cbind example (adding a column/variable)
new_info <- c("Boston", "Chicago")
combined_cols <- cbind(combined_rows, City = new_info)
print(combined_cols)
```

---

## 8. Importing and Exporting Data (File I/O)
In real-world data science, you rarely type datasets by hand. The tidyverse package **`readr`** is the standard way to load and save data.

### Loading Delimited Files: `read_csv()`
* **`read_csv(file)`**: Reads a Comma-Separated Values (CSV) file into a tibble. It can read files stored locally on your computer, or fetch them directly from a web URL!
* **`read_tsv(file)`**: Reads a Tab-Separated Values (TSV) file.

```r
library(readr)

# Option A: Loading from a local file path
# titanic <- read_csv("data/titanic.csv")

# Option B: Loading directly from a web URL
# (Let's load the famous Titanic passenger dataset)
titanic_url <- "https://raw.githubusercontent.com/jravi123/datasets/main/titanic.csv"
titanic <- read_csv(titanic_url)

# Display the first few rows of the loaded dataset
head(titanic)
```

> [!CAUTION] The GitHub URL Trap
> When loading a CSV file hosted on GitHub, beginners often copy the standard browser URL (e.g., `https://github.com/jravi123/datasets/blob/main/titanic.csv`). 
> 
> Passing this `/blob/` URL to `read_csv()` will trigger parsing errors or return an empty table because the URL points to the **HTML web page** that renders the table on GitHub, not the raw CSV data.
> 
> Always click the **"Raw"** button on GitHub to get the raw text URL (which begins with `https://raw.githubusercontent.com/...` and removes the `/blob/` segment). This raw URL is the one you must pass to `read_csv()`.

### Handling Common CSV Issues
Sometimes CSV files contain metadata at the top, comments, or missing value indicators. `read_csv` handles this via keyword arguments:
1. **Skipping Rows**: Use `skip = n` to skip metadata headers, or use `comment = "#"` to skip lines beginning with a comment symbol.
2. **Missing Column Headers**: If the CSV file has no header row, set `col_names = FALSE` (R will assign names like `X1`, `X2`) or pass a character vector of names: `col_names = c("Product", "Price", "Qty")`.
3. **Specifying Missing (NA) values**: If missing data is represented by special symbols like `.` or `N/A`, specify them using the `na` argument: `na = c(".", "N/A")`.
4. **Enforcing Column Types**: R tries to guess column types based on the first 1,000 rows. You can override R's guess using the `col_types` parameter:

```r
# Load file and explicitly specify column types
# df <- read_csv("sales_data.csv",
#   col_types = cols(
#     Transaction_ID = col_integer(),
#     Price = col_double(),
#     Date = col_date(format = "%Y-%m-%d")
#   )
# )
```

### Exporting / Saving Data
To write a data frame back to disk, use **`write_csv()`**:

```r
# write_csv(combined_cols, "output_data.csv")
```

### Native R Binary Files: RDS
If you want to save a complex R object (like a list, factor, or model) while preserving its exact classes (e.g. maintaining factor levels), write it to an **RDS** binary file using **`write_rds()`** and read it with **`read_rds()`**:

```
# Save to RDS
# write_rds(combined_cols, "my_dataset.rds")

# Load from RDS
# my_data <- read_rds("my_dataset.rds")
```

---

## Hands-on Exercises

### Exercise 1: Building a Sales Ledger
Create a data frame representing sales transactions with three columns: `Product` (values `"Laptop"`, `"Mouse"`, `"Keyboard"`), `Price` (values `1200`, `25`, `75`), and `Quantity` (values `2`, `10`, `5`).
Write R code to:
1. Create and print the data frame.
2. Calculate the average Price using the `mean()` function on the `Price` column.
3. Retrieve and print the dimensions of the data frame.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
ledger <- data.frame(
  Product = c("Laptop", "Mouse", "Keyboard"),
  Price = c(1200, 25, 75),
  Quantity = c(2, 10, 5)
)

print(ledger)

avg_price <- mean(ledger$Price)
print(paste("Average Price: $", avg_price))

print(dim(ledger)) # 3 rows, 3 columns
```
</details>

---

### Exercise 2: Filtering High-Value Sales
Using the `ledger` data frame from Exercise 1:
Write R code to:
1. Re-create the `ledger` data frame.
2. Filter and print only the rows where `Price * Quantity` (total value) is greater than `$200`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
ledger <- data.frame(
  Product = c("Laptop", "Mouse", "Keyboard"),
  Price = c(1200, 25, 75),
  Quantity = c(2, 10, 5)
)

# Calculate total value and filter
high_value_sales <- ledger[(ledger$Price * ledger$Quantity) > 200, ]
print(high_value_sales)
# Only Laptop (Value: 2400) and Keyboard (Value: 375) rows should print
```
</details>
