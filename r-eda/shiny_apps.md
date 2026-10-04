# Interactive Dashboards & Reactive Programming with Shiny

> [!IMPORTANT]
> **R Shiny applications cannot be executed directly inside the webR browser engine of this eBook.** Because Shiny requires a continuous background R session and active network socket communication to process reactive inputs, **all Shiny code must be run locally in RStudio**.

## Why Learn Shiny in Exploratory Data Analysis?

In professional data science, your final step is communicating results to stakeholders. These stakeholders—such as business executives, medical administrators, or policy-makers—are rarely programmers.
* If you send them a static chart showing flight delays for three specific airports, they will inevitably ask: *"What about the other fifty airports?"*
* If you tell them to write R code to filter the raw dataset themselves, they cannot do it.

To bridge this gap, you need **Shiny**. Shiny is an R package that allows you to build interactive web applications and dashboards directly in R—no HTML, CSS, or JavaScript required. 

With Shiny, you can create slide bars, drop-down menus, and reactive plots that allow users to explore datasets dynamically. Rather than delivering a single static answer, you deliver an **exploratory dashboard** that empowers stakeholders to find their own answers.

---

## Part 1: The Core Architecture of a Shiny App

Every Shiny application is structured as a single `app.R` file consisting of three primary components:

```
                            Shiny Architecture:
                            
        Component            Purpose
     ──────────────────    ──────────────────────────────────────────────────────
      • UI (User           Defines the HTML webpage layout, styles, and input 
        Interface)         widgets that humans see and interact with.
      • Server Function    Contains the R code and reactive logic that filters 
                           data, generates plots, and performs computations.
      • shinyApp           The constructor combining UI and Server into a 
                           running web server.
```

### The "Hello World" App Structure
The simplest possible Shiny application is shown below:

```
library(shiny)

# 1. Define the User Interface
ui <- fluidPage(
  titlePanel("Hello World Dashboard"),
  textInput(inputId = "name_input", label = "What is your name?"),
  textOutput(outputId = "greeting_output")
)

# 2. Define the Server Logic
server <- function(input, output, session) {
  # Connect input to output using a reactive rendering function
  output$greeting_output <- renderText({
    paste0("Hello, ", input$name_input, "!")
  })
}

# 3. Combine and Launch
shinyApp(ui = ui, server = server)
```

---

## Part 2: Declarative vs. Imperative Programming

To master Shiny, you must understand a fundamental shift in programming paradigms:

```
                        Programming Paradigms:
                        
        Paradigm            Execution Behavior
     ───────────────      ──────────────────────────────────────────────────────
      • Imperative         You issue explicit, step-by-step commands that are 
                           carried out immediately (e.g., standard R scripts).
      • Declarative        You define relationships and dependency rules, 
                           relying on the Shiny framework to decide exactly 
                           how and when to execute them.
```

In standard R scripts (imperative), you write:
```
# Executed once, immediately
x <- 5
y <- x + 10
print(y) # Output: 15
```
If `x` changes later, `y` does not update unless you run the line again.

In Shiny (declarative), you establish a **reactive relationship**:
```
# Establishing a dependency rule
output$greeting_output <- renderText({
  paste0("Hello, ", input$name_input, "!")
})
```
This line does not execute once and stop. Instead, it remains active, listening for changes to `input$name_input`. When the input changes, Shiny automatically triggers a re-evaluation of the render block.

---

## Part 3: Reactive Programming & Caching Conductors

Reactivity relies on a directed acyclic graph (the **reactive graph**) consisting of three nodes:

```
                            The Reactive Graph:
                            
        Reactive Source  ───►  Reactive Conductor  ───►  Reactive Endpoint
        (e.g., input$x)        (e.g., reactive())         (e.g., renderPlot)
```

1. **Reactive Sources**: User-generated inputs (such as text boxes or sliders).
2. **Reactive Conductors**: Intermediate computations defined via **`reactive({ ... })`**.
3. **Reactive Endpoints**: Rendering blocks that display output on the webpage (such as `renderPlot` or `renderTable`).

### The Power of `reactive()` Caching
Imagine you have a dashboard filtering a large dataset of $1,000,000$ rows. If you need to show both a scatter plot and a summary table of this filtered data, you might write:

```
# Bad practice: Filtering the same large dataset twice!
server <- function(input, output) {
  output$plot <- renderPlot({
    filtered <- big_data |> filter(category == input$cat)
    ggplot(filtered, aes(x, y)) + geom_point()
  })
  
  output$table <- renderTable({
    filtered <- big_data |> filter(category == input$cat)
    filtered |> summarize(mean_val = mean(value))
  })
}
```

This code is highly inefficient. Every time the user changes `input$cat`, the server performs the expensive filter operation twice!

To solve this, use a **reactive expression** as a caching conductor:

```
# Best practice: Filter once, cache results, and share across endpoints!
server <- function(input, output) {
  
  # Define reactive expression (note: no output$ prefix)
  filtered_data <- reactive({
    big_data |> filter(category == input$cat)
  })
  
  output$plot <- renderPlot({
    # Call the reactive conductor as a function!
    ggplot(filtered_data(), aes(x, y)) + geom_point()
  })
  
  output$table <- renderTable({
    # Reuses cached results without re-filtering!
    filtered_data() |> summarize(mean_val = mean(value))
  })
}
```

*Crucial rule*: Reactive conductors are evaluated lazily. They only execute when called by an active endpoint, and they **cache their results**. If `input$cat` has not changed, calling `filtered_data()` reuses the cached value instantly!

---

## Part 4: Designing High-Fidelity UI Layouts

Shiny provides layout templates to structure dashboards cleanly. The most common is the **`sidebarLayout`**, which splits the page into a side panel for inputs and a main panel for outputs:

```
ui <- fluidPage(
  titlePanel("Interactive Explorer"),
  sidebarLayout(
    sidebarPanel(
      # Input Widgets go here
    ),
    mainPanel(
      # Output Placeholders go here
    )
  )
)
```

### Essential Input Widgets
* **`textInput(id, label)`**: Text input box.
* **`numericInput(id, label, value)`**: Numeric selector.
* **`sliderInput(id, label, min, max, value)`**: Slide bar.
* **`selectInput(id, label, choices)`**: Dropdown selection menu.
* **`radioButtons(id, label, choices)`**: Multiple choice radio list.
* **`checkboxInput(id, label)`**: Binary true/false checkbox.

### Essential Output Placeholders
* **`textOutput(id)`**: Normal paragraph text.
* **`verbatimTextOutput(id)`**: Monospaced code blocks or statistical summaries.
* **`plotOutput(id)`**: Rendered ggplots.
* **`tableOutput(id)`**: Static tables.
* **`dataTableOutput(id)`**: Interactive, searchable data tables.

---

## Part 5: Practical Case Study: ER Injuries Dashboard

Let's design a complete, production-ready Shiny dashboard to analyze Emergency Room injuries using the National Electronic Injury Surveillance System (NEISS) data. 

The dashboard allows administrators to select an injury category and filters records to plot top injury locations and display summary metrics:

```
library(shiny)
library(tidyverse)
library(modelr)

# Sample injuries dataset
injury_data <- tibble(
  age = sample(1:90, 500, replace = TRUE),
  sex = sample(c("Male", "Female"), 500, replace = TRUE),
  body_part = sample(c("Head", "Arm", "Leg", "Hand", "Foot"), 500, replace = TRUE),
  diagnosis = sample(c("Fracture", "Cut", "Sprain", "Burn", "Bruise"), 500, replace = TRUE)
)

# 1. Define UI Layout
ui <- fluidPage(
  titlePanel("ER Injury Diagnosis Dashboard"),
  
  sidebarLayout(
    sidebarPanel(
      selectInput(
        inputId = "selected_diag",
        label = "Choose Injury Diagnosis:",
        choices = unique(injury_data$diagnosis)
      ),
      sliderInput(
        inputId = "age_limit",
        label = "Maximum Patient Age:",
        min = 5, max = 90, value = 50
      )
    ),
    
    mainPanel(
      # Render plots and summary statistics side by side
      plotOutput(outputId = "part_plot"),
      verbatimTextOutput(outputId = "summary_stats")
    )
  )
)

# 2. Define Server Logic with Reactive Caching
server <- function(input, output, session) {
  
  # Filter data once and cache the results
  filtered_injuries <- reactive({
    injury_data |>
      filter(
        diagnosis == input$selected_diag,
        age <= input$age_limit
      )
  })
  
  # Render the categorical body-part plot
  output$part_plot <- renderPlot({
    ggplot(filtered_injuries(), aes(x = body_part, fill = sex)) +
      geom_bar(position = "dodge") +
      theme_minimal() +
      labs(title = "Injuries by Body Part and Gender", x = "Body Part", y = "Count")
  })
  
  # Render the monospaced summary table
  output$summary_stats <- renderPrint({
    filtered_injuries() |>
      summarize(
        Total_Injuries = n(),
        Average_Age = mean(age, na.rm = TRUE)
      )
  })
}

# 3. Launch Application
shinyApp(ui, server)
```

---

## Hands-on Exercises

### Exercise 1: Building a Dynamic Text Display
**How do we construct a reactive web interface that processes user-submitted text inputs and renders responsive, personalized findings in real time?**

*Analytical Guidance*:
Write a simple Shiny app. Your analysis should:
1. Define a UI containing a text input box with ID `"username"` and a text output placeholder with ID `"greeting"`.
2. Define a Server that uses `renderText()` to create a greeting string: `paste("Welcome, ", input$username, "!")`.
3. Launch the app using `shinyApp()`.

```
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```
library(shiny)

# Define UI
ui <- fluidPage(
  titlePanel("Personalized Welcome Portal"),
  textInput(inputId = "username", label = "Type your name:", value = "Analyst"),
  textOutput(outputId = "greeting")
)

# Define Server
server <- function(input, output, session) {
  output$greeting <- renderText({
    paste("Welcome, ", input$username, "!")
  })
}

# Launch App
# shinyApp(ui = ui, server = server)
```
</details>

---

### Exercise 2: Scatter Plot Filter Panel with Reactive Caching
**How do we build a reactive vehicle dashboard that filters performance metrics by manufacturer and displays both scatter plots and summary stats without repeating expensive filtering steps?**

*Analytical Guidance*:
Develop a Shiny dashboard using `mpg`. Your analysis should:
1. Define a UI with a sidebar layout containing a dropdown menu (`selectInput`) with ID `"mfg"` to select the manufacturer (choices: `unique(mpg$manufacturer)`), a `plotOutput` placeholder with ID `"scatter"`, and a `verbatimTextOutput` with ID `"stats"`.
2. Define a Server that utilizes a **`reactive()`** conductor to filter the `mpg` dataset dynamically.
3. Render a scatter plot of `cty` vs `hwy` in `output$scatter`.
4. Render a summary printout showing row counts in `output$stats`.

```
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```
library(shiny)
library(tidyverse)

# Define UI
ui <- fluidPage(
  titlePanel("Manufacturer Performance Explorer"),
  sidebarLayout(
    sidebarPanel(
      selectInput(
        inputId = "mfg",
        label = "Select Manufacturer:",
        choices = unique(mpg$manufacturer)
      )
    ),
    mainPanel(
      plotOutput(outputId = "scatter"),
      verbatimTextOutput(outputId = "stats")
    )
  )
)

# Define Server
server <- function(input, output, session) {
  
  # Caching conductor filters data once
  mfg_data <- reactive({
    mpg |> filter(manufacturer == input$mfg)
  })
  
  # Render plot using cached reactive source
  output$scatter <- renderPlot({
    ggplot(mfg_data(), aes(x = cty, y = hwy)) +
      geom_point(size = 3, color = "darkorange") +
      theme_light() +
      labs(x = "City Mileage (MPG)", y = "Highway Mileage (MPG)")
  })
  
  # Render statistics summary
  output$stats <- renderPrint({
    mfg_data() |>
      summarize(
        Models_Count = n(),
        Mean_Highway_MPG = mean(hwy)
      )
  })
}

# Launch App
# shinyApp(ui = ui, server = server)
```
</details>
