# Iteration Constructs: Conditional Logic & Loops

## Why Learn Loops and Conditionals in Data Analytics?

In exploratory data analysis, you often need to make dynamic decisions or repeat a process across multiple parameters. For example:
* Analyzing server traffic logs: if traffic drops below a critical threshold, send an alert.
* Simulating asset prices: repeat a random stock price fluctuation $1,000$ times to estimate the probability of hitting a target threshold.

While R is designed around vectorized operations, understanding conditional execution and traditional loops is critical for building custom functions, running simulations, and structuring analytical algorithms.

---

## Part 1: Conditional Execution

Conditional statements allow your code to branch and run different routines based on logical evaluations.

### A. The Basic `if` and `else` Structure
The horse-work of conditional logic is the `if` statement:

```r
# Syntactic Structure:
if (condition) {
  # executed when condition is TRUE
} else {
  # executed when condition is FALSE
}
```

Example in R:
```r
x <- 1
if (x > 2) {
  print("x is greater than 2")
} else {
  print("x is 2 or less")
}
```

---

### B. Multi-Branch Chains
For more complex decisions, chain multiple checks using `else if`:

```r
a <- -1
b <- 1

if (a * b > 0) {
  print("Zero is not between a and b")
} else if (a < b) {
  smaller <- a
  larger  <- b
} else {
  smaller <- b
  larger  <- a
}

print(c(smaller, larger))
```

---

### C. Multi-Branch Function Returns (FizzBuzz)
Inside functions, conditional blocks allow you to return custom tags. Consider the classic "FizzBuzz" puzzle, returning `"fizz"` for multiples of 3, `"buzz"` for multiples of 5, and the original number for others:

```r
fizzbuzz <- function(x) {
  if (x %% 3 == 0) {
    return("fizz")
  } else if (x %% 5 == 0) {
    return("buzz")
  }
  return(x)
}

print(fizzbuzz(9))  # "fizz"
print(fizzbuzz(10)) # "buzz"
print(fizzbuzz(7))  # 7
```

---

## Part 2: The `for` Loop

A `for` loop repeats a code block once for each element in a specified vector or sequence:

```r
# Syntax:
for (index in vector) {
  # code executed for each value of index
}
```

### Example: Scanning for Alerts
```r
# Generate 10 random integers
x <- sample(1:100, 10, replace = FALSE)
print(x)

# Scan and print each number
for (item in x) {
  print(item)
}
```

---

## Part 3: The `while` Loop & Random Walk Simulations

A `while` loop continues executing as long as its condition remains `TRUE`. This is invaluable when you do not know how many iterations are needed beforehand—highly common in statistical simulations.

### The Random Walk Simulation
A **random walk** is a path constructed by a series of random steps. Let's simulate a walk that terminates if the accumulated value escapes a threshold of $\pm 10$:

```r
# ALWAYS define a safety iteration limit to prevent infinite loops!
max_iterations <- 1000 
val <- c()

# Initialize starting value
val[1] <- rnorm(1) 

k <- 1
while (abs(val[k]) < 10 && k <= max_iterations) {
  val[k + 1] <- val[k] + rnorm(1)
  k <- k + 1
}

# Trim vector to actual step count
val <- val[1:k]

# Plot the walk path
plot(val, type = 'l', main = "Random Walk Path", xlab = "Steps", ylab = "Value")
```

---

## Part 4: Loop Control: `break` and `next`

To control execution dynamically inside a loop, use these keywords:
* **`next`**: Skips the remaining code in the current iteration and jumps directly to the start of the next iteration (equivalent to `continue` in Python or C++).
* **`break`**: Terminates the loop immediately.

### A. Skipping Iterations with `next`
```r
# Print only odd numbers between 1 and 10
for (i in 1:10) {
  if (i %% 2 == 0) {
    next # Skip even numbers
  }
  cat(i, '\n')
}
```

---

### B. Breaking Out with `break`
We can refactor our random walk simulation to use an explicit `break` condition inside a loop:

```r
max_iterations <- 1000
val <- c()
val[1] <- rnorm(1)

k <- 1
while (k <= max_iterations) {
  val[k + 1] <- val[k] + rnorm(1)
  k <- k + 1
  
  # Explicit break if value escapes threshold
  if (abs(val[k]) > 10) {
    break
  }
}
val <- val[1:k]
```

---

## Hands-on Exercises

### Exercise 1: Finding Specific Elements in a Vector
**How can we iterate through a sequence of random numbers and extract only the even values using a loop?**

*Analytical Guidance*:
Filter numeric elements. Your analysis should:
1. Generate a vector of 10 random integers using: `x <- sample(1:100, 10, replace = FALSE)`.
2. Write a `for` loop to scan each item in the vector.
3. Use a conditional check to identify if the number is even (`item %% 2 == 0`).
4. Print even numbers on the console.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
set.seed(42) # For reproducibility
x <- sample(1:100, 10, replace = FALSE)
print("Starting vector:")
print(x)

for (item in x) {
  if (item %% 2 == 0) {
    print(paste("Even number found:", item))
  }
}
```
</details>

---

### Exercise 2: Simulated Temperature Alerts with Safety Thresholds
**How can we simulate fluctuating temperature logs and alert when a threshold is breached, while protecting our environment with safety limits?**

*Analytical Guidance*:
Design a loop simulation. Your analysis should:
1. Initialize a starting temperature at `35` degrees.
2. Initialize an empty vector `temp_logs <- c(35)`.
3. Write a `while` loop that runs as long as the temperature stays below `50` degrees.
4. Enforce a maximum safety limit of `500` iterations.
5. In each iteration, simulate a temperature change by adding `rnorm(1, mean = 0.5, sd = 1.5)`.
6. Record each step, and plot the resulting temperature sequence.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
max_iter <- 500
temp_logs <- c(35)
k <- 1

while (temp_logs[k] < 50 && k <= max_iter) {
  # Add simulated heat fluctuation
  temp_logs[k + 1] <- temp_logs[k] + rnorm(1, mean = 0.5, sd = 1.5)
  k <- k + 1
}

print(paste("Simulation ended after", k - 1, "steps."))
print(paste("Final temperature:", temp_logs[k]))

# Plot simulated temperature logs
plot(temp_logs, type = 'o', col = "red", xlab = "Simulation Steps", ylab = "Temperature (°C)")
```
</details>
