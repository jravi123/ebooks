# Running R in the Cloud (Google Colab & Posit Cloud)

If you don't want to install R locally or need to run your analytics on a Chromebook, tablet, or another computer, you can run R entirely in the cloud.

---

## 1. Using Google Colab for R
Google Colab is widely known for Python, but it also natively supports R! Since Colab notebooks run on Google's cloud servers, you can perform heavy statistical operations without draining your own computer's battery.

### The Quick Shortcut Link
The easiest way to start a new R notebook in Google Colab is to visit:
👉 **<a href="https://colab.research.google.com/#create=true&language=r" target="_blank" rel="noopener noreferrer">Colab-R</a>**

This link instantly provisions a new Google Colab notebook with R selected as the primary programming language.

### Manually Changing Python to R in an Existing Notebook
If you already have a Google Colab notebook open, you can switch its execution engine (runtime) from Python to R:

1. Click on **Runtime** in the top menu bar.
2. Select **Change runtime type**.
3. In the **Hardware accelerator / Runtime type** dropdown menu, select **R** (instead of Python 3).
4. Click **Save**.

## Writing and Running R Code in Colab
Once the runtime is set to R, code cells accept R code.

```r-norun
# This runs inside Google Colab using R!
numbers <- c(10, 20, 30, 40, 50)
mean_val <- mean(numbers)
print(paste("The average is:", mean_val))
```

---

## 2. Using Posit Cloud (Recommended R Alternative)
For a cloud setup that matches RStudio Desktop exactly, you can use **Posit Cloud** (formerly RStudio Cloud).

1. Go to **<a href="https://posit.cloud/" target="_blank" rel="noopener noreferrer">https://posit.cloud/</a>** and sign up for a free account.
2. Click **New Project** -> **New RStudio Project**.
3. RStudio will load directly inside your browser window. You can write scripts, view plots, and manage packages exactly as you would on a local machine.

>[!CALLOUT] Which should I use?
>* **Google Colab** is excellent if you prefer a notebook-style document flow (mixing text, rich output, and code blocks) similar to Jupyter.
>* **Posit Cloud** is preferred if you want to practice using the official RStudio interface and panel layout before transition to local development.
