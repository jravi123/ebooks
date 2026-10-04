# Packages and Libraries

## Why Learn Packages in Data Analytics?

Imagine you are analyzing a massive transaction log. You need to:
1. Filter out cancelled transactions.
2. Group the remaining sales by store region.
3. Compute the average sales amount per region.
4. Draw a beautiful bar chart showing region-wise sales.

If you write this in base R, you have to manage subsetting indices, use complicated aggregate formulas, and write verbose graphing code. 

Instead, you want to use a highly readable language for data manipulation like `dplyr` and a state-of-the-art charting library like `ggplot2`:
```r
# Leveraging specialized packages (Tidyverse)
library(dplyr)
library(ggplot2)

ggplot(mpg, aes(y = manufacturer)) + geom_bar()
```

R's core installation is powerful, but its true strength lies in its ecosystem of over 20,000 add-on bundles called **Packages**. Let's learn how to download, load, and manage packages in R.

---

## 1. What is CRAN?
The **Comprehensive R Archive Network (CRAN)** is a global network of servers that hosts the official R software and thousands of tested R packages. 

---

## 2. Installing and Loading Packages

### Installing: `install.packages()`
To download a package from CRAN to your computer, use `install.packages()`. The package name **must** be inside quotation marks. You only need to run this command **once** per computer.

```
# Download and install dplyr from CRAN
install.packages("dplyr")
```

### Loading: `library()`
Before you can use a package in a script, you must load it into R's memory. The package name does **not** need to be in quotes. You must run this command in **every session/script** where you use the package.

```r
# Load the package into memory
library(dplyr)
```

---

## 3. Namespace Resolution: The `::` Operator
If you only need to use a single function from a package once, or want to avoid name conflicts (e.g., two packages containing a function named `filter`), you can call it directly using the double-colon **`::`** operator without loading the package via `library()`:

```r
# Call the filter function directly from the dplyr package namespace
clean_df <- dplyr::filter(customers, Age > 21)
```

---

## 4. Key R Packages for Data Analytics

In R, data analysts heavily rely on a collection of packages called the **Tidyverse**, designed specifically for data science:

| Package | Description | Key Functions |
| :--- | :--- | :--- |
| **dplyr** | The grammar of data manipulation. | `filter()`, `select()`, `mutate()`, `summarize()` |
| **ggplot2** | The industry standard for data visualization. | `ggplot()`, `geom_point()`, `geom_line()` |
| **tidyr** | Tools for cleaning and reshaping messy data. | `pivot_longer()`, `pivot_wider()`, `drop_na()` |
| **readr** | Fast, user-friendly way to import flat files (CSV, TSV). | `read_csv()`, `read_tsv()` |
| **stringr** | Expressive functions for character string manipulation. | `str_detect()`, `str_replace()` |
| **lubridate** | Makes working with dates and times simple. | `ymd()`, `hms()`, `now()` |

---

## Hands-on Exercises

### Exercise 1: Loading and Explicit Namespace Call
Imagine you have a data frame of employee records: `employees <- data.frame(Name = c("Alice", "Bob"), Salary = c(50000, 60000))`. 
Write R code to:
1. Load the `dplyr` package using `library()`.
2. Extract the `Salary` column as a vector using `dplyr::pull(employees, Salary)`.
3. Print the resulting salary vector.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
# Load package
library(dplyr)

employees <- data.frame(Name = c("Alice", "Bob"), Salary = c(50000, 60000))

# Call function with namespace
salaries <- dplyr::pull(employees, Salary)
print(salaries) # Output: 50000 60000
```
</details>

---

### Exercise 2: Tidyverse Inspection
R has a meta-package called `tidyverse` that loads all key data science packages at once.
Write R code to:
1. Load the `tidyverse` library. (In our interactive editor, this is pre-installed).
2. Use the package function `stringr::str_to_title("r programming language")` to convert the string.
3. Print the title-cased result.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

title_string <- stringr::str_to_title("r programming language")
print(title_string) # Output: "R Programming Language"
```
</details>
