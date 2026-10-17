---
theme: default
title: "Interactive Web Apps with Shiny"
---

```r {block=setup}
library(tidyverse)
products <- read_tsv(
  "https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/products.tsv",
  show_col_types = FALSE
)
population <- read_tsv(
  "https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/population.tsv",
  show_col_types = FALSE
)
injuries <- read_tsv(
  "https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/dataset/injuries.tsv.gz",
  show_col_types = FALSE
)
```

# Interactive Web Apps with Shiny

Building Dynamic User Interfaces, Reactive Graphs, and Real-World Dashboards in R

---

## What Is Shiny?

- **Shiny** is an R package and framework for creating interactive web applications and dashboards directly from R code.
- It empowers data scientists to create interactive web applications **without requiring knowledge of HTML, CSS, or JavaScript**.
- You can explore real-world, award-winning Shiny dashboards here:
  - [Posit Shiny Contest Winners](https://posit.co/blog/winners-of-the-3rd-annual-shiny-contest/)
  - [Mastering Shiny (Hadley Wickham)](https://mastering-shiny.org/)
  - [Posit Shiny Cheatsheet (PDF)](https://rstudio.github.io/cheatsheets/shiny.pdf)

> **Note on Running Shiny**: A live Shiny web server (`shinyApp(ui, server)`) runs inside RStudio or on a Shiny server. In these interactive slides, you can inspect complete Shiny app scripts and run the underlying reactive data-wrangling and `ggplot2` pipelines directly in the browser!

---

## Main Building Blocks of a Shiny App

Every Shiny application consists of **three core structural components** connected by **reactive expressions**:

1. **User Interface (`ui`)**: Controls the layout, appearance, input widgets, and output placeholders of the web page (`fluidPage(...)`).
2. **Server Function (`server`)**: Defines the R instructions (`function(input, output, session) { ... }`) that compute outputs from user inputs.
3. **App Launcher (`shinyApp(ui, server)`)**: Combines the `ui` and `server` objects and starts the web application.
4. **Reactive Expressions**: Special expressions that automatically re-evaluate only when their upstream dependencies change.

---

## A Minimal `app.R` ("Hello, World!")

The simplest way to create a Shiny app is to create a new directory for your project and place a single file named **`app.R`** inside it:

```r
# Structure of a minimal app.R (run locally in RStudio)
if (FALSE) {
  library(shiny)

  ui <- fluidPage(
    "Hello, world!"
  )

  server <- function(input, output, session) {
  }

  shinyApp(ui, server)
}
```

---

## What `app.R` Does (Four Steps)

Looking closely at the `app.R` file on the previous slide, it performs four things:

1. **Calls `library(shiny)`** to load the Shiny package.
2. **Defines the user interface (`ui`)** — in this case, an HTML page (`fluidPage()`) displaying the words `"Hello, world!"`.
3. **Specifies the behavior of our app by defining a `server` function** — currently empty, so our app doesn't compute anything yet, though we will fill it in shortly.
4. **Executes `shinyApp(ui, server)`** to construct and start the Shiny application from the UI and server definitions.

---

## Ways to Run a Shiny App in RStudio

There are several convenient ways to launch `app.R` in RStudio:

1. Click the **Run App** button in the top-right toolbar of the RStudio document editor.
2. Use the keyboard shortcut **`Cmd/Ctrl + Shift + Enter`** while viewing `app.R`.
3. Run `shiny::runApp("path/to/app_folder")` from the R console.

Before closing a running app, always check the RStudio console—while a Shiny app is active, the R session is busy listening for browser events (`Listening on http://127.0.0.1:...`) until you click the red **Stop** button or press `Esc`.

---

## Imperative vs. Declarative Programming

Understanding Shiny requires shifting from **imperative** to **declarative** thinking:

- **Imperative programming**: You issue a specific command and it is carried out *immediately* (e.g., running a standard R script from top to bottom).
- **Declarative programming**: You express high-level goals or constraints and rely on someone else (Shiny's reactive engine) to decide *how* and *when* to translate that into action.

| Imperative | Declarative |
| :--- | :--- |
| *"Make me a sandwich."* | *"Ensure there is a sandwich in the refrigerator whenever I look inside."* |
| Assertive, immediate execution | Passive-aggressive, lazy/on-demand execution |

---

## Reactivity in Shiny

How does declarative programming work in Shiny? Through **reactivity**:

- In Shiny, you express the logic of your server using **reactive programming**.
- Normally, reading a variable in R is a simple lookup of its current value.
- In reactive programming, reading a reactive input (`input$name`) or reactive expression (`dataset()`) automatically registers a **dependency**: whenever that input changes in the browser, Shiny knows which outputs depend on it and automatically recomputes them!

---

## Working with a Reactive Program

Let's look at a reactive greeting app where typing a name into a `textInput` immediately updates a `textOutput`:

```r
if (FALSE) {
  library(shiny)

  ui <- fluidPage(
    textInput("name", "What's your name?"),
    textOutput("greeting")
  )

  server <- function(input, output, session) {
    output$greeting <- renderText({
      paste0("Hello ", input$name, "!")
    })
  }

  shinyApp(ui, server)
}

# Simulating the reactive logic in R:
input <- list(name = "Data Scientist")
paste0("Hello ", input$name, "!")
```

---

## How `renderText()` Works

In the greeting app:

```r
output$greeting <- renderText({
  paste0("Hello ", input$name, "!")
})
```

- We do **not** assign a static string to `output$greeting` once.
- Instead, we wrap the code block inside `renderText({ ... })`, which gives Shiny a **recipe** for how to compute `greeting`.
- Every time the user types a new character into the `"name"` text box, `input$name` changes, and Shiny automatically re-runs the recipe inside `renderText()` and updates the browser!

---

## Lazy Evaluation in Shiny

Shiny apps are **lazy** by design:
- An app will never do more work than it strictly needs to in order to update the currently visible outputs.
- What happens if you misspell an output name in `server` (e.g., `output$greting <- renderText(...)` instead of `output$greeting`)?
  - Shiny will **not** throw an error!
  - Because no UI element asks for `"greting"`, the `renderText()` block is simply **never executed**, and the greeting stays blank.
- **Debugging Tip**: If a Shiny output stays blank without an error, always check that every `output$id` in `server` matches the exact `Output("id")` string in `ui`!

---

## Reactive Expressions (`reactive({})`)

What if multiple outputs (e.g., a plot and a summary table) depend on the **same filtered dataset** or expensive simulation?

- If you copy-paste the filtering code into both `renderPlot({})` and `renderTable({})`:
  1. You duplicate code (violating DRY: *Don't Repeat Yourself*).
  2. Shiny recomputes the exact same filtering work **twice** every time the input changes!
- Instead, wrap shared computations inside a **reactive expression** (`reactive({ ... })`):
  - You call a reactive expression like a function (`selected()`).
  - It **caches** its result and only recomputes when its upstream inputs change!

---

## The Reactive Graph: Source $\to$ Conductor $\to$ Endpoint

Shiny tracks dependencies using a directed **Reactive Graph** with three node types:

1. **Reactive Source (`input$x`)**: User inputs coming from the browser UI. Has outgoing arrows (dependents).
2. **Reactive Conductor (`reactive({})`)**: Intermediate cached computation. Has both incoming arrows (dependencies) and outgoing arrows (dependents).
3. **Reactive Endpoint (`output$y`)**: Displayed tables, plots, or text in the browser. Has incoming arrows (dependencies).

![Simple Reactive Graph](https://raw.githubusercontent.com/jravi123/ebooks/main/r-eda/images/lecture22_graph_simple.png)

---

## Common UI Input Widgets

Shiny provides rich input widgets for every data type. Every input widget takes `inputId` as its first argument and `label` as its second argument:

| Function | Widget Created | Value Returned (`input$id`) |
| :--- | :--- | :--- |
| `textInput("id", "Label")` | Single-line text box | Character string |
| `numericInput("id", "Label", value = 10)` | Number spinner box | Numeric value |
| `sliderInput("id", "Label", min, max, value)` | Draggable range slider | Numeric value (or length-2 vector) |
| `selectInput("id", "Label", choices = ...)` | Dropdown menu | Selected item value |
| `radioButtons("id", "Label", choices = ...)` | Radio button group | Selected item value |
| `actionButton("id", "Label")` | Clickable button | Integer click counter |

---

## Matching UI Outputs with Server Render Functions

Every `*Output()` placeholder in `ui` must be paired with a corresponding `render*()` function in `server`:

| UI Output Function (`ui`) | Server Render Function (`server`) | What It Displays |
| :--- | :--- | :--- |
| `textOutput("id")` | `renderText({ ... })` | Plain text string |
| `verbatimTextOutput("id")` | `renderPrint({ ... })` | Console output (e.g., `summary(mdl)`) |
| `tableOutput("id")` | `renderTable({ ... })` | Static HTML table |
| `dataTableOutput("id")` | `renderDataTable({ ... })` | Interactive sortable/searchable table |
| `plotOutput("id")` | `renderPlot({ ... })` | Any base R or `ggplot2` graphic |

---

## Structuring Page Layouts (`fluidRow` & `column`)

Shiny uses Bootstrap's **12-column grid system** inside `fluidPage()`:
- `fluidRow(...)` creates a horizontal row on the page.
- `column(width, ...)` places content inside a `fluidRow`, where the `width` values in a row sum to **12** (e.g., three columns of `width = 4`, or two columns of `width = 6`).
- Alternatively, `sidebarLayout(sidebarPanel(...), mainPanel(...))` creates a classic two-pane dashboard layout with inputs on the left and outputs on the right.

---

## Working Directory Commands (`getwd()` & `setwd()`)

When developing a Shiny app locally in RStudio, make sure your working directory points to the folder containing `app.R` and its data files:

```r
# Check the current working directory
getwd()
```

In a local RStudio session, you can switch directories with `setwd("path/to/shiny-project-er-injuries")` (or by opening the project's `.Rproj` file). When loading hosted datasets in the cloud or across machines, you can also read directly from URLs!

---

## Case Study: Exploring US Emergency Room Injuries (NEISS)

Let's examine the complete **ER Injuries Shiny App** (`shiny-project-er-injuries/app.R`), based on Chapter 4 of Hadley Wickham's *Mastering Shiny*.

The data comes from the **National Electronic Injury Surveillance System (NEISS)**, collected by the US Consumer Product Safety Commission (CPSC). It contains three linked tables:
1. **`products.tsv`**: Product codes (`prod_code`) and titles (`title`, e.g., `"toilets"`, `"skateboards"`).
2. **`population.tsv`**: Total US population by `age` ($0$ to $85$) and `sex` (`"male"`, `"female"`) in 2017.
3. **`injuries.tsv.gz`**: Over $250,000$ emergency room visits in 2017, including `age`, `sex`, `prod_code`, `weight` (statistical survey weight estimating total national injuries), `narrative`, `diag` (diagnosis), `body_part`, and `location`.

---

## Inspecting the NEISS Datasets (`products`, `population`, `injuries`)

Let's inspect the three datasets loaded from our repository:

```r
cat("Products rows:", nrow(products), "\n")
products |> head(4)

cat("\nPopulation rows:", nrow(population), "\n")
population |> head(4)

cat("\nInjuries rows:", nrow(injuries), "\n")
injuries |> select(trmt_date, age, sex, prod_code, body_part, diag, location, weight) |> head(4)
```

---

## Step 1 of `app.R`: Preparing Product Choices

In `app.R`, we want the user to pick a product name from a dropdown menu (`selectInput`), while passing the numeric `prod_code` to R behind the scenes. We achieve this with `setNames()`:

```r
prod_codes <- setNames(products$prod_code, products$title)
head(prod_codes, 8)
```

When `choices = prod_codes` is passed to `selectInput("code", "Product", choices = prod_codes)`:
- The user sees human-readable product names (`"toilets"`, `"stairs, steps"`).
- `input$code` returns the corresponding numeric code (e.g., `649` for `"toilets"`).

---

## Step 2 of `app.R`: Designing the User Interface (`ui`)

Look at how `ui` in `app.R` uses `fluidPage()`, `fluidRow()`, and `column()` (whose widths sum to $12$ in each row):

```r
if (FALSE) {
  ui <- fluidPage(
    # Row 1: Product selector (width 8) + Y-axis selector (width 2)
    fluidRow(
      column(8,
        selectInput("code", "Product",
          choices = setNames(products$prod_code, products$title),
          width = "100%"
        )
      ),
      column(2, selectInput("y", "Y axis", c("rate", "count")))
    ),
    # Row 2: Three summary tables side-by-side (4 + 4 + 4 = 12)
    fluidRow(
      column(4, tableOutput("diag")),
      column(4, tableOutput("body_part")),
      column(4, tableOutput("location"))
    ),
    # Row 3: Full-width ggplot time/age series (width 12)
    fluidRow(
      column(12, plotOutput("age_sex"))
    ),
    # Row 4: Action button (width 2) + Random narrative text (width 10)
    fluidRow(
      column(2, actionButton("story", "Tell me a story")),
      column(10, textOutput("narrative"))
    )
  )
}
```

---

## Step 3 of `app.R`: Reactive Conductors in `server`

Inside `server`, two **reactive conductors** (`selected` and `summary`) avoid repeating expensive filtering and joining across multiple outputs:

```r
if (FALSE) {
  # Conductor 1: Filter injuries to the currently selected product code
  selected <- reactive(injuries |> filter(prod_code == input$code))

  # Conductor 2: Count weighted injuries by age & sex, and join with US population
  summary <- reactive({
    selected() |>
      count(age, sex, wt = weight) |>
      left_join(population, by = c("age", "sex")) |>
      mutate(rate = n / population * 1e4)
  })
}
```

Notice how `summary()` calls `selected()`! Whenever `input$code` changes, `selected()` updates first, which then invalidates `summary()` and the three `renderTable()` endpoints.

---

## Running the Reactive Table Logic (`diag`, `body_part`, `location`)

Let's run the exact code from `server` for product code `649` (`"toilets"`):

```r
# Simulate input$code = 649 ("toilets")
selected_df <- injuries |> filter(prod_code == 649)

cat("--- Top Diagnoses (weighted) ---\n")
selected_df |> count(diag, wt = weight, sort = TRUE) |> head(5)

cat("\n--- Top Body Parts (weighted) ---\n")
selected_df |> count(body_part, wt = weight, sort = TRUE) |> head(5)

cat("\n--- Top Locations (weighted) ---\n")
selected_df |> count(location, wt = weight, sort = TRUE) |> head(5)
```

---

## Running the `summary()` Reactive Conductor

Now let's run the exact `summary()` pipeline from `app.R` that joins the weighted injury count `n` with the `population` table to compute the injury rate per $10,000$ people (`rate = n / population * 1e4`):

```r
selected_df <- injuries |> filter(prod_code == 649)

summary_df <- selected_df |>
  count(age, sex, wt = weight) |>
  left_join(population, by = c("age", "sex")) |>
  mutate(rate = n / population * 1e4)

summary_df |> head(10)
```

---

## Why Compare Injury Rate vs. Raw Count?

Why did `app.R` include `selectInput("y", "Y axis", c("rate", "count"))`?
- There are far fewer 80-year-olds in the total US population than 20-year-olds.
- Looking only at the **raw count (`n`)** might hide how dangerous a product is for older adults.
- Looking at the **injury rate per 10,000 people (`rate`)** normalizes by age-and-sex population size!

Let's compare both plots on the next two slides.

---

## Visualizing `output$age_sex` (`input$y == "count"`)

When the user selects `"count"` on the Y-axis dropdown, `output$age_sex` renders estimated number of injuries (`n`) by `age` and `sex`:

```r
selected_df <- injuries |> filter(prod_code == 649)
summary_df <- selected_df |>
  count(age, sex, wt = weight) |>
  left_join(population, by = c("age", "sex")) |>
  mutate(rate = n / population * 1e4)

summary_df |>
  ggplot(aes(age, n, colour = sex)) +
  geom_line(linewidth = 1) +
  labs(
    title = "Toilet-Related ER Injuries by Age and Sex (Raw Count)",
    y = "Estimated number of injuries"
  ) +
  theme_minimal()
```

---

## Visualizing `output$age_sex` (`input$y == "rate"`)

When the user selects `"rate"` on the Y-axis dropdown, `output$age_sex` plots `rate` (injuries per $10,000$ people):

```r
selected_df <- injuries |> filter(prod_code == 649)
summary_df <- selected_df |>
  count(age, sex, wt = weight) |>
  left_join(population, by = c("age", "sex")) |>
  mutate(rate = n / population * 1e4)

summary_df |>
  ggplot(aes(age, rate, colour = sex)) +
  geom_line(na.rm = TRUE, linewidth = 1) +
  labs(
    title = "Toilet-Related ER Injuries by Age and Sex (Rate per 10,000)",
    y = "Injuries per 10,000 people"
  ) +
  theme_minimal()
```

Notice the dramatic spike in injury rate per $10,000$ people after age 65!

---

## Step 4 of `app.R`: Event-Driven Narrative Sampling (`actionButton`)

At the bottom of `app.R`, clicking the `"Tell me a story"` button (`input$story`) triggers a random sample of one injury `narrative` from `selected()`:

```r
if (FALSE) {
  narrative_sample <- eventReactive(
    list(input$story, selected()),
    selected() |> pull(narrative) |> sample(1)
  )
  output$narrative <- renderText(narrative_sample())
}

# Let's sample 3 random injury narratives for product 649 ("toilets"):
set.seed(42)
injuries |>
  filter(prod_code == 649) |>
  pull(narrative) |>
  sample(3)
```

`eventReactive()` ensures a new random narrative is drawn whenever **either** the user clicks the `"Tell me a story"` button (`input$story`) **or** selects a different product (`selected()`).

---

## Complete `app.R` Listing (ER Injuries Dashboard)

Here is the complete `app.R` script combining all four rows of the UI and the reactive server:

```r
if (FALSE) {
  library(shiny)
  library(vroom)
  library(tidyverse)

  prod_codes <- setNames(products$prod_code, products$title)

  ui <- fluidPage(
    fluidRow(
      column(8, selectInput("code", "Product", choices = prod_codes, width = "100%")),
      column(2, selectInput("y", "Y axis", c("rate", "count")))
    ),
    fluidRow(
      column(4, tableOutput("diag")),
      column(4, tableOutput("body_part")),
      column(4, tableOutput("location"))
    ),
    fluidRow(column(12, plotOutput("age_sex"))),
    fluidRow(
      column(2, actionButton("story", "Tell me a story")),
      column(10, textOutput("narrative"))
    )
  )

  server <- function(input, output, session) {
    selected <- reactive(injuries |> filter(prod_code == input$code))
    output$diag      <- renderTable(selected() |> count(diag, wt = weight, sort = TRUE))
    output$body_part <- renderTable(selected() |> count(body_part, wt = weight, sort = TRUE))
    output$location  <- renderTable(selected() |> count(location, wt = weight, sort = TRUE))

    summary <- reactive({
      selected() |>
        count(age, sex, wt = weight) |>
        left_join(population, by = c("age", "sex")) |>
        mutate(rate = n / population * 1e4)
    })

    output$age_sex <- renderPlot({
      if (input$y == "count") {
        summary() |>
          ggplot(aes(age, n, colour = sex)) +
          geom_line() +
          labs(y = "Estimated number of injuries")
      } else {
        summary() |>
          ggplot(aes(age, rate, colour = sex)) +
          geom_line(na.rm = TRUE) +
          labs(y = "Injuries per 10,000 people")
      }
    }, res = 96)

    narrative_sample <- eventReactive(
      list(input$story, selected()),
      selected() |> pull(narrative) |> sample(1)
    )
    output$narrative <- renderText(narrative_sample())
  }

  shinyApp(ui, server)
}
```

---

## Exercise 1: Reactive Filtering Pipeline (`mtcars`)

Before wiring up a Shiny `server` function, it is best practice to test your reactive filtering and plotting pipeline in R.
1. Simulate user inputs `input_cyl <- 6` and `input_max_wt <- 3.5`.
2. Filter `mtcars` to rows where `cyl == input_cyl` and `wt <= input_max_wt`.
3. Compute the mean `mpg` and mean `hp` of the filtered cars.

```r
# Write your solution here:

```

---

## Exercise 1: Solution

```r
input_cyl <- 6
input_max_wt <- 3.5

filtered_cars <- mtcars |>
  filter(cyl == input_cyl, wt <= input_max_wt)

filtered_cars |>
  summarize(
    n_cars = n(),
    mean_mpg = mean(mpg),
    mean_hp = mean(hp)
  )
```

---

## Exercise 2: Exploring Another NEISS Product (`skateboards`)

Using the `products`, `injuries`, and `population` tables already loaded in this session:
1. Find the `prod_code` in `products` whose `title` is `"skateboards"`.
2. Filter `injuries` to that `prod_code`, compute the weighted injury rate per $10,000$ people by `age` and `sex`, and plot `rate` vs. `age` colored by `sex`.

```r
# Write your solution here:

```

---

## Exercise 2: Solution

```r
skateboard_code <- products |>
  filter(title == "skateboards") |>
  pull(prod_code)

cat("Skateboard product code:", skateboard_code, "\n")

injuries |>
  filter(prod_code == skateboard_code) |>
  count(age, sex, wt = weight) |>
  left_join(population, by = c("age", "sex")) |>
  mutate(rate = n / population * 1e4) |>
  ggplot(aes(age, rate, colour = sex)) +
  geom_line(na.rm = TRUE, linewidth = 1) +
  labs(
    title = "Skateboard ER Injuries per 10,000 People by Age and Sex",
    x = "Age",
    y = "Injuries per 10,000 people"
  ) +
  theme_minimal()
```
