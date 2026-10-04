# Data Types, Variables, and Arithmetic Operators

## Why Learn Data Types and Variables in Data Analytics?

Imagine you are analyzing sales performance for a retail brand. You receive data from three store locations:
* **Store A**: `1250.50` dollars (a decimal value)
* **Store B**: `980` dollars (an integer value)
* **Store C**: `"Closed"` (a text message representing that the store was closed due to a holiday)

To report the average sales across all the stores, you need to add the numbers and divide by three. However, if you try to add `1250.50 + 980 + "Closed"` in a calculator or program, it will fail because you cannot add words to numbers!

To solve this data problem, you need to store these data points in **variables**, identify their **data types** (numbers vs text), filter out or replace invalid values, and use **arithmetic operators** to compute the results. Let's learn how R handles these fundamental components.

---

## Interactive Learning
This eBook is designed to be fully interactive. The code blocks you see throughout the chapters run entirely within your **web browser**. This means there is no round trip to a remote server—your code executes locally and instantly on your machine.

**How to use code blocks:**
1. **View**: Read the code provided in the editor.
2. **Edit**: You can click directly inside the code block to modify the values or logic. Your input is saved in your browser. You can reset it to the original value at any time.
3. **Run**: When ready, click on the **Run Code** button to execute your code snippet.
4. **Observe**: The results will appear immediately below in the Output block.

>[!CALLOUT] R Editor Tips & Context
>* **Persistent Context**: All R code cells on the same page share a single active R session. If you define a variable `x <- 5` in the first editor and run it, that variable `x` will be available in any subsequent R code blocks you execute on that page! Remember that execution order is what matters, not the visual top-to-bottom layout of cells.
>* **Refreshing the Page**: Refreshing your browser will wipe the active R session's memory (removing all defined variables). However, the code changes you wrote in the boxes are preserved.
>* **Reset Code Button**: If you want to undo your edits and restore a code block to its original textbook state, click **Reset Code**.
>* **Clear Cache Button**: R packages (like `ggplot2` and `dplyr`) are cached locally in your browser's IndexedDB storage for fast loading. If a package download becomes corrupted or fails, click **Clear Cache** in any R editor. This will securely delete the R engine cache database and reload the page.
>* **Package Installation Constraints**: The browser-based R environment has core analytics, wrangling, and plotting libraries (such as `ggplot2`, `dplyr`, `tidyr`, etc.) pre-loaded. Because this engine executes securely inside a WebAssembly sandbox directly in your web browser (WebR), you should **not** try to install other external packages using `install.packages()`, as browser security sandboxes block the required raw network downloads and compilation processes and will fail.
>* **Context Suffixes**:
>    * `r` (Shared): Variables are shared across all standard blocks on the same page. The system dynamically isolates variables by page name so they do not pollute other pages.
>    * `r-isolated` (or `isolated`) (Isolated): Creates a private sandbox for that specific block.

---

## 1. Assignment and Variables
In R, we assign values to variables using the **left-assignment operator `<-`** (formed by a less-than symbol `<` and a hyphen `-`). 

### Reversibility of Assignment: The Right-Assignment Operator `->`
R also allows you to reverse the direction of assignment using the **right-assignment operator `->`**. This pushes the value on the left into the variable name on the right:

```r
# Right-assignment example
1250.50 -> sales_a
980.00 -> sales_b

# Perform arithmetic calculation
sales_a + sales_b -> total_sales
total_sales / 2 -> avg_sales

# Output the results
print(total_sales)
print(avg_sales)
```

While both `<-` and `->` are syntactically valid, left-assignment `<-` is the industry-wide standard and is highly recommended for readability.

### Assignment vs. Function Arguments: `<-` vs. `=`
A common point of confusion is when to use the equals sign (`=`) instead of an arrow. 
* Use `<-` (or `->`) for **assigning values to variables** in your active environment.
* Use `=` **only** for passing named keyword arguments into functions (e.g., `mean(data, na.rm = TRUE)`).

> [!CAUTION] The Function Argument Assignment Trap
> If you write an arrow instead of an equals sign inside a function call (e.g., `mean(data, na.rm <- TRUE)`), R will actually perform a variable assignment in your active workspace, creating a variable named `na.rm` set to `TRUE`, rather than cleanly passing the parameter to the function. Always use `=` inside function call parentheses!

**Try it out:** Run the code block above in your browser. Feel free to edit the sales values or add a `sales_c` variable to see how the output changes.

---

## 2. Common R Data Types
Every value in R belongs to a **class** (data type). R automatically determines the type of a variable when you assign a value to it (dynamic typing).

| Data Type (Class) | Description | Example |
| :--- | :--- | :--- |
| **numeric** | Real numbers / decimals (double-precision) | `sales <- 1250.50` |
| **integer** | Whole numbers (denoted by an `L` suffix) | `count <- 10L` |
| **character** | Text strings (wrapped in double or single quotes) | `status <- "Closed"` |
| **logical** | Boolean flags (`TRUE` or `FALSE`, abbreviated as `T` or `F`) | `is_active <- TRUE` |
| **complex** | Complex numbers with imaginary parts | `val <- 3 + 2i` |
| **NULL** | Represents the absence of a value | `missing_val <- NULL` |

### Identifying Data Types
To check the data type of a variable, use the `class()` function:

```r
status <- "Closed"
print(class(status))

sales_a <- 1250.50
print(class(sales_a))
```

### Integers vs. Numerics: The `L` Suffix Mystery

In the data types table above, you noticed that integers are denoted with a trailing `L` suffix (like `10L`). You might wonder: **Do I always need to write `L` when working with whole numbers?**

The short answer is **no!** For almost all everyday data analytics tasks, bare numbers without `L` (like `count <- 10`) work perfectly fine for arithmetic, looping, and data frames. 

#### Try It Yourself:
Let's see what class R assigns to whole numbers with and without the `L` suffix:

```r
# Define a whole number without 'L'
count_without_l <- 10
print(class(count_without_l)) # Output: "numeric"

# Define a whole number with 'L'
count_with_l <- 10L
print(class(count_with_l))    # Output: "integer"
```

#### Why does R default to `numeric`?
In R, any bare number like `10` or `3.14` is classified as `numeric` (which is stored internally as a 64-bit double-precision floating-point decimal). R does this because it is a statistical programming language—almost any mathematical operation (such as division) can result in a decimal (e.g., `10 / 4` becomes `2.5`). By defaulting to `numeric`, R prevents unexpected truncation errors or bugs.

#### When does adding `L` actually make sense?
While your code will work flawlessly without `L` in 99% of cases, explicitly declaring integers with `L` is highly beneficial in a few specific scenarios:

1. **Memory Optimization**: Storing a number as an `integer` takes only **4 bytes** of memory, whereas a `numeric` double takes **8 bytes**. For a single number, this difference is completely unnoticeable. However, if you are creating a vector containing millions of ID numbers, zip codes, or row indices, using integers (`1L:1000000L`) can **cut your memory usage in half!**
2. **Strict API/Package Requirements**: Some advanced R packages, database connectors, or compiled low-level libraries (such as compiled C++ code called via `Rcpp`) are very strict about types. They may expect a 32-bit integer and throw a type mismatch error or warning if you pass a 64-bit numeric double instead.
3. **Exact Equality Matching (and Scaling Decimals)**: Floating-point decimals can sometimes suffer from minor binary computer rounding errors (e.g., in computers, `0.1 + 0.2` is slightly different from `0.3` because fractional decimals cannot be represented perfectly in binary). Integers, however, are represented with absolute exactness. While integers cannot store decimal points directly, data analysts often **scale decimals into integers** to guarantee exact matching—for example, storing money as whole cents (`350L` instead of `$3.50`) or interest rates as basis points (`425L` instead of `4.25%`). This avoids floating-point inaccuracies entirely when performing strict equality checks (`==`).

---

## 3. Rules for Variable Names
In R, variables (often called identifiers) must adhere to the following strict rules:

* **Allowed Characters**: Can consist of letters (which are case-sensitive), numbers, underscores (`_`), and periods (`.`).
* **Starting Characters**: Must start with a letter or a period (`.`).
  * It **cannot** start with a number or an underscore (`_`).
  * *Crucial Exception*: If a variable starts with a period (`.`), the second character **cannot** be a number (for example, `.total` is valid, but `.2total` is invalid).
* **Reserved Keywords**: Cannot be any of R's reserved keywords (such as `if`, `else`, `while`, `function`, `repeat`, `for`, `TRUE`, `FALSE`, `NULL`, or `NA`).

>[!CALLOUT] Naming Recommendations
> R code traditionally uses periods (`sales.average`) or underscores (`sales_average`) to separate words. Today, the R community highly recommends **snake_case** (`sales_average`) for modern readability, ease of typing, and direct compatibility with SQL database conventions.

---

## 4. Arithmetic Operators

R supports all standard mathematical operators:

| Operation | Operator | Example | Result |
| :--- | :--- | :--- | :--- |
| **Addition** | `+` | `10 + 5` | `15` |
| **Subtraction** | `-` | `10 - 5` | `5` |
| **Multiplication** | `*` | `10 * 5` | `50` |
| **Division** | `/` | `10 / 4` | `2.5` |
| **Integer Division** | `%/%` | `10 %/% 4` | `2` (removes remainder) |
| **Modulo** | `%%` | `10 %% 4` | `2` (returns remainder) |
| **Exponentiation** | `^` (or `**`) | `2 ^ 3` | `8` |

```r
# Exploring integer division and modulo
division <- 11 / 3
integer_division <- 11 %/% 3
remainder <- 11 %% 3

print(division)          # 3.666667
print(integer_division)  # 3
print(remainder)         # 2
```

---

## Hands-on Exercises

### Exercise 1: Calculating Data Analytics Metrics
A marketing campaign had a budget of $5,000. It generated 12,500 clicks and 450 actual sales (conversions). 
Write R code to:
1. Store budget, clicks, and conversions in variables.
2. Calculate the **Cost Per Click (CPC)** (Budget divided by Clicks).
3. Calculate the **Conversion Rate** (Conversions divided by Clicks, multiplied by 100 to get a percentage).
4. Print both metrics.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
budget <- 5000
clicks <- 12500
conversions <- 450

cpc <- budget / clicks
conversion_rate <- (conversions / clicks) * 100

print(paste("Cost Per Click (CPC): $", cpc))
print(paste("Conversion Rate:", conversion_rate, "%"))
```
</details>

---

### Exercise 2: Odd or Even Records
In data preprocessing, you often want to split a dataset based on row numbers (e.g., extracting odd rows or even rows). Use the modulo operator (`%%`) to check if a specific row ID is even or odd.
1. Assign `row_id <- 27`
2. Divide the row ID by 2 using the modulo operator to check the remainder (if it is 1, the row is odd; if it is 0, the row is even).
3. Print the remainder.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
row_id <- 27
remainder <- row_id %% 2
print(paste("Remainder is:", remainder))
# Since remainder is 1, the row is odd!
```
</details>
