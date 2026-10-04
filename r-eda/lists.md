# Lists (Heterogeneous Collections) and Sequences

## Why Learn Lists and Sequences in Data Analytics?

Imagine you are saving metadata about a machine learning model run to track its performance. You need to store:
* The algorithm name: `"Random Forest"`
* The final test accuracy: `0.945` (a decimal)
* The epoch counts: `1 to 5` (a sequence of integers)
* The loss values at each epoch: `0.55`, `0.32`, `0.21`, `0.15`, `0.10` (a numeric vector)

A vector cannot hold this information because it requires all elements to be of the exact same type and dimension. 

In R, the structure we use to pack different types of data together is a **List**. A list can store variables, vectors, functions, and even other lists inside it. Additionally, we need R's **sequence** tools to easily generate ranges of numbers like epoch counts.

---

## 1. Creating Lists: The `list()` Function
In R, we create lists using the `list()` function. R lists can store **heterogeneous** values.

```r
# Creating a list representing model run details
model_run <- list("Random Forest", 0.945, c(0.55, 0.32, 0.21, 0.15, 0.10))
print(model_run)
```

---

## 2. List Indexing: `[ ]` vs `[[ ]]`
>[!IMPORTANT] THE GOLDEN RULE OF R LIST INDEXING
> When retrieving items from a list, R differentiates between single brackets `[ ]` and double brackets `[[ ]]`:
> * **Single brackets `[ ]`** return a **sub-list** (a smaller box containing the item).
> * **Double brackets `[[ ]]`** return the **actual element** inside that position (the contents of the box).

Think of a list as a train with cargo boxes:
* `model_run[1]` gives you **the first cargo box** (it is still a list!). You cannot perform string operations on it directly.
* `model_run[[1]]` gives you **the cargo inside the first box** (the character string `"Random Forest"`).

```r
model_run <- list("Random Forest", 0.945, c(0.55, 0.32, 0.21, 0.15, 0.10))

# Get the second item as a sub-list
sub_list <- model_run[2]
print(class(sub_list))     # "list"

# Get the actual numeric value of accuracy
accuracy <- model_run[[2]]
print(class(accuracy))     # "numeric"
print(accuracy * 100)      # 94.5 (mathematical operations work!)
```

---

## 3. Sequences in R
In R, generating a sequence of numbers (equivalent to Python's `range()`) is extremely simple.

### The Colon Operator `:`
To generate sequences of integers in steps of 1:

```r
# Generate integers from 1 to 5
epochs <- 1:5
print(epochs) # 1 2 3 4 5

# Generate integers from 10 down to 6
countdown <- 10:6
print(countdown) # 10 9 8 7 6
```

### The `seq()` Function
For more control (e.g., custom step increments), use the `seq()` function:

* `seq(from, to, by)`: Generates sequence from a number to a number by a step increment.
* `seq(from, to, length.out)`: Generates sequence divided into a specific number of equal parts.

```r
# Generate numbers from 0 to 1 with an increment of 0.2
prob_thresholds <- seq(from = 0, to = 1, by = 0.2)
print(prob_thresholds) # 0.0 0.2 0.4 0.6 0.8 1.0

# Generate 5 equally spaced numbers between 10 and 20
grid <- seq(from = 10, to = 20, length.out = 5)
print(grid) # 10.0 12.5 15.0 17.5 20.0
```

---

## Hands-on Exercises

### Exercise 1: Parsing Model Metrics
You have a model summary list: `list("Logistic Regression", 0.88, 12L)`.
Write R code to:
1. Extract the number of iterations (the third element) using the appropriate indexing operator to get the **actual value**.
2. Multiply this value by 2 and print it.
3. Extract the algorithm name (first element) as a **sub-list** and print its class to confirm it is indeed of class `"list"`.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
summary_list <- list("Logistic Regression", 0.88, 12L)

# Get the actual value
iterations <- summary_list[[3]]
print(iterations * 2) # 24

# Get as sub-list
algo_sub <- summary_list[1]
print(class(algo_sub)) # "list"
```
</details>

---

### Exercise 2: Sampling Percentiles
In statistical analytics, you often need to test models at different threshold values.
Write R code to:
1. Generate a sequence of values from `0` to `100` in steps of `25`.
2. Generate another sequence of `6` values between `0` and `1` (inclusive) using the `length.out` parameter.
3. Print both sequences.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
percentiles <- seq(from = 0, to = 100, by = 25)
print(percentiles) # 0 25 50 75 100

probabilities <- seq(from = 0, to = 1, length.out = 6)
print(probabilities) # 0.0 0.2 0.4 0.6 0.8 1.0
```
</details>
