# Introduction to Statistical Computing

Getting Started with R, RStudio & CLI



---

# R, a statistical programming language


* R is a free, open-source statistical programming language.
* Specifically designed for statistical computing and visualization
* Maintained by CRAN (Comprehensive R Archive Network).
* Supported by a massive global community in research, industry, and government.

---

# Why We Program in Data Science

* Point-and-click GUI software (e.g., Excel) limits transparency.
* GUI operations are unrecorded, unscaleable, and invisible to third parties.
* Programmatic data science uses code scripts as recipes.
* Code provides an auditable, reproducible record of every analytical step.

---

# What is Reproducibility?

* The baseline of empirical scientific research.
* An analysis is reproducible if:
    * A third party can take your raw datasets and scripts...
    * Run them on their own operating system...
    * And obtain the identical numbers, tables, and charts.

---

# The Reproducibility Crisis

* Many published academic results cannot be replicated.
* Key scientific failures:
    * Lost aggregation metadata.
    * Forgot which Excel cells were shifted or edited.
    * Lack of documentation for software version configurations.




---

# Installing Your Local Environment

* **R (The Engine)**: Runs math, matrix algebra, and calculations behind the scenes.
* **RStudio (The Dashboard)**: The graphical interface (IDE) where you write and review code.
* Always install R **before** installing RStudio!


---

# RStudio Pane Layout

* **Source Editor (Top-Left)**: Write and save scripts and Rmd tutorials.
* **Console (Bottom-Left)**: Run interactive R expressions.
* **Environment (Top-Right)**: View stored datasets and variables.
* **Files / Plots / Help (Bottom-Right)**: Navigate folders and view guides.

---

# Cloud Alternative: Posit Cloud

* Matches local RStudio Desktop exactly in your browser.
* Free registration: [https://posit.cloud/](https://posit.cloud/)
* Excellent for quick testing or Chromebook environments.


---

# Cloud Alternative: Google Colab

* Run R in an interactive, cell-based notebook.
* Launch a pre-configured R notebook instantly:
    * **[Colab-r](https://colab.research.google.com/#create=true&language=r)**
* Great for mixing descriptive text and code blocks.



---

# Basic POSIX CLI Commands

CLI - command line interface is the text based UI (User Interface) to run commands as opposed to using GUI (Graphical User Interface)

In an CLI you have an interactive prompt where you type a command. It might look something like this:

`$ command -o --options argument1 argument2`

* `$` is the prompt
* `command` is what we want to do (e.g., `cd`, `git` etc.)
* Optional flags have `-` or `--` in front and change behavior
* We can tell what to do with argument1 and argument2. Some commands have no arguments.

---

# Let's try some hands-on

* Open the "Terminal" pane in RStudio.
* Basic directory navigation commands:
    * `pwd` (print working directory)
    * `ls` (list files in current directory)
    * `cd dir_name` (change directory)
    * `mkdir dir_name` (make new directory)

---

# The Dangerous rm -r Command

* `rm -r directory_name` recursively deletes directories and everything inside.
* **CAUTION**: There is **no recycle bin** in the terminal.
* Running `rm -r` permanently deletes your files instantly. Use with extreme care!


---
# Hands-On: Basic Analytics with R

Let's calculate simple business metrics for a small store over a work week (5 days):

1. **Addition**: Calculate total weekend revenue by adding Saturday's revenue (`$450`) and Sunday's revenue (`$350`).
2. **Multiplication**: Find total revenue from selling `25` units of a product priced at `$18` each.
3. **Division**: A 5-day marketing campaign cost `$250`. Calculate the daily marketing cost.
4. **Vectors & Mean**: Create a vector named `daily_sales` with sales from Monday to Friday: `120, 150, 180, 140, 210`. Print the vector and compute its `mean()`.

```r


```

```r block=answer
# 1. Addition: Total weekend revenue
weekend_revenue <- 450 + 350
weekend_revenue

# 2. Multiplication: Units sold * Unit price
product_revenue <- 25 * 18
product_revenue

# 3. Division: Total campaign cost / Number of days
daily_ad_cost <- 250 / 5
daily_ad_cost

# 4. Vectors: Daily sales for the 5-day work week and average daily sales
daily_sales <- c(120, 150, 180, 140, 210)
print(daily_sales)
mean(daily_sales)
```


---
# Expressions and Statements

When a program executes, you typically create temporary variables in the RAM of your computer. The values that these variables keep at any point of time during your R program execution is called its **state**.

An **expression** is R code that, when run, provides a value (do not change state):

<pre>
3 + 4
</pre>

Commands that change the **state** of the program are called **statements**, such as assignment:

<pre>
a <- 3 + 4
a
</pre>

Note: You can also use `=` in the above expression like `a = 3 + 4`. However, the recommended style from <a href='https://style.tidyverse.org/syntax.html?q=assignment#assignment-1' target="_blank">tidyverse</a> and  <a href='http://adv-r.had.co.nz/Style.html' target="_blank">Hadley</a> is `<-` for assignments