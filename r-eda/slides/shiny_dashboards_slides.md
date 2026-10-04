# Interactive Dashboards & Shiny
## Reactive Programming, UI-Server Architecture, Inputs, Outputs, and Reactive Conductors

---
# Lecture Agenda & Topics

Static plots and reports only display a single pre-rendered view of data. **R Shiny** enables data scientists to build interactive web applications that empower users to explore datasets dynamically.

Today we will cover:
* **The Shiny Architecture**: The User Interface (UI), the Server function, and `shinyApp()`.
* **Imperative vs. Declarative Programming**: How reactivity differs from standard script execution.
* **The Reactive Graph**: Sources (`input$*`), Conductors (`reactive()`), and Endpoints (`output$*`).
* **Input Widgets**: Sliders, dropdown select menus, text boxes, and action buttons.
* **Render Functions**: `renderPlot()`, `renderTable()`, and `renderText()`.
* **Performance Optimization**: Eliminating redundant computations with reactive conductors.

---
# The Three Pillars of a Shiny Application

Every Shiny app is built on three foundational components:

```
                            The Shiny Architecture
                                      │
     ┌────────────────────────────────┼────────────────────────────────┐
     ▼                                ▼                                ▼
User Interface (UI)            Server Function                     shinyApp()
Defines HTML layout,           Contains business logic,            Binds UI and Server
widgets, and visual outputs    computations, and rendering         to launch the web server
```

---
# Minimal Template: "Hello World" App

Here is the minimal complete Shiny application structure:

```r
library(shiny)

# 1. User Interface (UI)
ui <- fluidPage(
  titlePanel("Interactive Greeting App"),
  sidebarLayout(
    sidebarPanel(
      textInput("user_name", "Enter your name:", value = "Data Scientist")
    ),
    mainPanel(
      textOutput("greeting_message")
    )
  )
)

# 2. Server Logic
server <- function(input, output, session) {
  output$greeting_message <- renderText({
    paste0("Welcome to R Shiny, ", input$user_name, "!")
  })
}

# 3. Launch App
# shinyApp(ui = ui, server = server)
```

---
# Imperative vs. Declarative Reactive Execution

Standard R code is **imperative**—it runs once in a sequential line-by-line order:

```r
x <- 5
y <- x + 10
# If x changes later, y does NOT automatically update
```

Shiny code is **declarative**—it defines persistent reactive relationships:

```r
# Establishes a persistent live dependency
output$summary <- renderText({
  paste("Current value is:", input$slider_val)
})
```

Whenever `input$slider_val` changes in the browser, Shiny automatically invalidates and re-executes downstream render blocks.

---
# The Reactive Graph: Sources, Conductors, Endpoints

Shiny coordinates updates through a directed dependency graph:

```
    Reactive Source              Reactive Conductor             Reactive Endpoint
    (input$species)  ─────────►   (selected_data)   ─────────►   (output$scatter_plot)
    User controls widget          Filters & caches data          Renders plot to UI
```

* **Sources**: Read-only input values provided by user actions (`input$*`).
* **Conductors**: Cached intermediate computations defined with `reactive()`.
* **Endpoints**: Visual output blocks defined with `render*()` assigned to `output$*`.

---
# Optimizing with Reactive Conductors: `reactive()`

> [!CAUTION] The Duplicate Computation Anti-Pattern
> Avoid filtering the exact same dataset inside multiple independent `renderPlot()` and `renderTable()` blocks.

### The Idiomatic Solution:
```r
library(shiny)
library(tidyverse)

# Conductors filter once and cache the result
filtered_mpg <- reactive({
  mpg |> filter(cyl == input$cyl_select)
})

# Endpoints call the reactive conductor as a function: filtered_mpg()
output$plot <- renderPlot({
  ggplot(filtered_mpg(), aes(x = displ, y = hwy)) + geom_point()
})

output$table <- renderTable({
  filtered_mpg() |> summarize(avg_hwy = mean(hwy), n = n())
})
```

---
# Common Shiny Input Widgets & Render Pairs

| User Interface Input | Server Output Target | Render Function | UI Output Function |
| :--- | :--- | :--- | :--- |
| `selectInput()` | Categorical dropdown | `renderPlot()` | `plotOutput()` |
| `sliderInput()` | Continuous range/number | `renderTable()` | `tableOutput()` |
| `textInput()` | Freeform text entry | `renderText()` | `textOutput()` |
| `numericInput()` | Bounded integer/float | `renderPrint()` | `verbatimTextOutput()` |
| `checkboxInput()` | Logical boolean toggle | `renderUI()` | `uiOutput()` |

---
# Action Buttons & Isolation: `eventReactive()`

To prevent an expensive analysis from re-running on every keystroke, trigger execution only when an action button is pressed using `eventReactive()`:

```r
library(shiny)
library(tidyverse)

# Only recompute when the "Run Analysis" button is clicked
filtered_data <- eventReactive(input$run_button, {
  diamonds |>
    filter(carat >= input$min_carat, cut == input$cut_choice)
})
```

---
# Module Summary & Key Takeaways

1. **UI vs. Server**: UI controls visual structure and widgets; Server performs reactive computations and rendering.
2. **The Reactive Graph**: Changes in reactive sources automatically propagate down to reactive conductors and endpoints.
3. **`reactive()`**: Caches intermediate data transformations and prevents duplicate calculations.
4. **Calling Reactives**: Always invoke reactive conductors with trailing parentheses (e.g. `filtered_data()`).
5. **Action Controls**: Use `eventReactive()` or `isolate()` to prevent expensive re-computations until the user is ready.
