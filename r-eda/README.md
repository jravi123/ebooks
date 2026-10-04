# Exploratory Data Analysis in R

## Introduction

In data science and analytics, we rarely deal with single values or static equations. Instead, we work with rich datasets containing multiple columns, missing values, and complex relationships. To extract meaningful insights, identify anomalies, and make data-driven decisions, we use **Exploratory Data Analysis (EDA)**.

EDA is an iterative cycle where we:
1. Generate questions about our data.
2. Search for answers by visualizing, transforming, and modeling the data.
3. Use what we learn to refine our questions and generate new ones.

This eBook serves as a hands-on guide to mastering EDA using the R programming language. We will focus extensively on the **Tidyverse**, an ecosystem of packages designed specifically for data science.

---

## Why Code? Programmatic vs. Point-and-Click Data Science

Why use R programming for data analysis when you can use spreadsheet software like Microsoft Excel? Modern, professional data science is strictly programmatic because point-and-click graphical (GUI) applications introduce several fatal limitations:

* **Point-and-click GUI software (e.g., Excel) limits transparency**: In Excel, the raw data and the formulas are merged in the same visual interface. A cell shows a value, but the history of how that number came to be (sorting, manual filtering, copy-paste) is hidden from view.
* **GUI operations are unrecorded, unscaleable, and invisible**: 
  * *Unrecorded*: There is no permanent log of your mouse clicks. If you return to a file six months later, it is nearly impossible to remember every click, filter, and manual adjustment you made.
  * *Unscaleable*: Cleaning a 500-row file with clicks might take 20 minutes, but those clicks cannot scale when you are handed a 500,000-row file.
  * *Invisible to third parties*: Regulators, team members, and scientific peers cannot audit or verify your analytical steps because there is no trail of actions.
* **Programmatic data science uses code scripts as "recipes"**: When you use a scripting language like R or Python, the raw, original data remains completely untouched and pristine. We write a plain-text code script (a "recipe") that contains instructions for loading, cleaning, and modeling the data.
* **Code provides an auditable, reproducible record**: Because the script is pure code, it serves as a permanent, auditable, and 100% reproducible record of every single calculation. If you share your script and your raw dataset, anyone, anywhere in the world can run it and reproduce your exact charts, tables, and models in milliseconds.

---

## Why Learn R?

_R_ is a dynamically typed, interpreted programming language widely adopted for statistical computing, data analysis, and _Data Science_.

>[!CALLOUT] Keywords Definition
>* **Dynamically typed**: R does not require you to declare variables with explicit types (like `int`, `double`, or `string`)—the type is figured out automatically behind the scenes.
>* **Interpreted**: Unlike compiled languages (like C++ or Java) that require a separate build step, R code runs directly statement-by-statement, allowing you to get immediate feedback.

While general-purpose languages like Python are excellent, **R was built from the ground up by statisticians, for statisticians and data scientists.** This means it has native support for data handling, statistical formulas, and mathematical models that require separate library imports in other languages.

---

## The Powerhouses of the R Ecosystem (Key Libraries)

R has a massive package repository (CRAN) featuring specialized libraries that make data collection, manipulation, and modeling exceptionally clean:

* **Tidyverse**: A collection of packages (including **dplyr** for data manipulation, **tidyr** for data cleaning, and **purrr** for functional programming) that work under a shared philosophy to make data science expressive and intuitive.
* **ggplot2**: The gold standard of data visualization, implementing a "grammar of graphics" that allows you to construct professional, layered visualizations (scatter plots, bar charts, box plots, and line charts) to visually inspect data relationships.
* **dplyr**: The grammar of data transformation. You will master data manipulation verbs to select, filter, mutate, sort, group, and aggregate tables.
* **tidyr**: Tools for reshaping data. You will learn to pivot datasets between wide and long formats to ensure your tables are "tidy" (each column is a variable, each row is an observation).
* **Hypothesis Testing**: You will learn to perform core statistical tests (two-sample t-tests, ANOVA, Chi-squared tests of independence, and correlation tests) to verify if patterns are statistically significant.
* **Statistical Models (`lm`, `glm`)**: You will fit linear, multiple, and logistic regression models to understand and predict trends in data.
* **Databases & SQL**: You will query databases using SQL directly inside R.
* **Shiny**: A framework to build fully interactive, reactive web dashboards directly in R, without needing HTML, CSS, or JavaScript.
* **data.table**: An ultra-fast package for processing massive datasets (millions of rows) in memory, often outperforming alternatives in other languages.
* **caret & parsnip/tidymodels**: Comprehensive frameworks for training, tuning, and evaluating machine learning models (regression, classification, random forests).
* **lubridate & stringr**: Specialized tools to parse dates/times and manipulate text strings cleanly.

---

## Who Uses R Today? (Industry Adoption)

Some of the world's most advanced companies, research institutes, and data-driven organizations rely on R for their analytics pipeline:

* **Google**: Uses R to calculate advertising ROI, evaluate search algorithm performance, and forecast economic trends.
* **Meta (Facebook)**: Uses R for behavioral analysis on user interactions and to model feed engagement.
* **Microsoft**: Integrates R directly into SQL Server and Azure ML Services for advanced statistical computing.
* **Airbnb**: Employs R to optimize search rankings and perform predictive modeling for booking success.
* **Pfizer**: Relies on R for clinical trial data evaluation, drug efficacy analysis, and bioinformatics research.
* **The New York Times**: Uses R for data journalism, polling analysis, and generating interactive graphics.

---

## About This Book

This eBook is written as a direct, hands-on path to master exploratory analysis. Our design focuses on three core principles:

* **Concise and Focused**: Every chapter covers only the essential concepts and libraries you need to perform high-quality data analysis—however, you are highly encouraged to go beyond this text and consult the <a href="https://www.r-project.org/" target="_blank">official R documentation</a> as a comprehensive reference as often as required.
* **Interactive Playgrounds**: Most code blocks can run directly in your web browser. No installation is required to start executing and practicing R code.
* **Problem-Driven Learning**: Each chapter begins with a real-world analytical question, showing you the practical purpose behind every tool and function.

Practice is key to building muscle memory. Try running the hands-on exercises at the end of each chapter inside the browser editor, and compare your solutions with the provided answers.

---

## Moving Beyond the eBook: Workspace Options

While executing code inside this eBook's browser console is ideal for learning, real-world data projects require dedicated workspaces. To transition to a full development workflow, you can choose between a **local installation** on your computer or a **cloud-based interface** in your browser:

### 1. Local Development (Highly Recommended)

Writing, organizing, and running code on your own computer is the standard way of working as a data analyst. It gives you full control over your files, packages, and system resources.

* **RStudio Desktop**: The standard and most popular interface for R developers. It provides a complete workspace to write code, manage files, and render plots directly on your local machine.
  > **Get Started**: To set up R and RStudio locally, follow our step-by-step **[Environment Setup Guide](/book/r-eda/setup)** in the next chapter.

---

### 2. Cloud-Based Environments

If you prefer not to install software on your machine, or if you are working on a system with limited local resources (like a Chromebook), you can use a dedicated cloud workspace:

* **Posit Cloud**: A web-based version of RStudio. It provides the exact same layout and features as the desktop version, but runs entirely in your browser without utilizing your local computer's hardware. You can sign up for free at <a href="https://posit.cloud/" target="_blank">posit.cloud</a>.
* **Google Colab**: A notebook-style environment that allows you to combine explanatory text, live code cells, and visualizations in a single document.
  * You can create a new notebook with an active R engine using <a href="https://colab.research.google.com/#create=true&language=r" target="_blank">this link</a>.
  * Colab comes with the `tidyverse` suite pre-installed. If you need to load additional libraries, you can install them using the standard R command inside a code cell.

Let's begin our journey into R-EDA!
