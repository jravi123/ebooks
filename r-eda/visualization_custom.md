# Themes, Labels & Customization

## Why Customize Plots in Exploratory Data Analysis?

A default chart is useful for personal exploration, but it is insufficient for communication.

Imagine you are presenting a customer analysis report to executives. 
* A default chart with column headers like `displ` and `hwy` as axis labels will confuse stakeholders who do not know the dataset's schema.
* Points representing anomalies (like a single high-performance car with weird mileage) will look like errors unless you add a text label directly to that point explaining *why* it is there.
* The chart background grid might look too cluttered for a slide deck.

To turn your graphs into data-driven stories, you must add clear titles and descriptions, customize text alignments, apply minimal presentation backgrounds, and export them in high-resolution formats. Let's learn how to customize our ggplot charts.

---

## 1. Descriptive Titles and Labels: `labs()`

Use the `labs()` function to set titles, subtitles, axis labels, captions, and legend names:

**What is the relationship between a vehicle's engine size and its highway mileage, including complete contextual descriptions of the data sources?**
```r
library(tidyverse)

ggplot(mpg, aes(x = displ, y = hwy, color = factor(cyl))) +
  geom_point(position = "jitter", alpha = 0.7) +
  labs(
    title = "Engine Size vs. Highway Fuel Efficiency",
    subtitle = "Analysis of 234 car models (1999-2008)",
    caption = "Source: US EPA (fueleconomy.gov)",
    x = "Engine Displacement (Litres)",
    y = "Highway Mileage (Miles Per Gallon)",
    color = "Cylinder Count" # Renames the legend title
  )
```

---

## 2. Text Annotations: `annotate()`

To call out a specific data point, outlier, or reference line directly on the canvas without mapping a whole table of labels, use the `annotate()` function:

**Which specific vehicles exhibit exceptionally high fuel efficiency relative to their small engine size, and what makes them unique?**
```r
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point(position = "jitter", alpha = 0.5) +
  # Add a text annotation pointing to a specific coordinate
  annotate(
    geom = "text",
    x = 6, y = 40,
    label = "High Efficiency Outlier",
    color = "red",
    fontface = "bold"
  ) +
  # Add a helper segment line (arrow) pointing to the outlier
  annotate(
    geom = "segment",
    x = 5.8, y = 38,
    xend = 5.4, yend = 33,
    arrow = arrow(length = unit(0.2, "cm")),
    color = "red"
  )
```

---

## 3. Tick Label Rotation: `theme()`

If your horizontal axis categories have long names, you can rotate them using the `theme()` function. You can specify:
* **`angle`**: Rotation angle in degrees (e.g., `45` or `90`).
* **`hjust`**: Horizontal justification (`1` aligns the text edge with the tick mark).
* **`vjust`**: Vertical justification (`1` aligns the top edge vertically).

**What is the volume of vehicles across each class when categorized along the horizontal axis?**
```r
ggplot(mpg, aes(x = class)) +
  geom_bar(fill = "steelblue") +
  # Rotate tick labels by 45 degrees
  theme(axis.text.x = element_text(angle = 45, hjust = 1, vjust = 1))
```

---

## 4. Built-in Presentation Themes

`ggplot2` provides several built-in themes that instantly style the background grid, borders, and margins:

* **`theme_minimal()`**: A clean background with light grey grid lines and no outer border (recommended for reports).
* **`theme_classic()`**: A simple axis-line layout with no grid lines (similar to academic journals).
* **`theme_bw()`**: A black-and-white grid layout with an outer border.
* **`theme_light()`**: Light grey borders and grid lines for a crisp presentation.

**What is the relationship between engine size and highway mileage when presented in a simplified, distraction-free visual layout?**
```r
# Apply a clean minimal theme
ggplot(mpg, aes(x = displ, y = hwy)) +
  geom_point() +
  theme_minimal()
```

---

## 5. Visualizing Categorical Data: Integrating `forcats`

By default, R and `ggplot2` sort categorical axis levels alphabetically. This is often unhelpful and makes reading charts difficult. To arrange plots logically—such as sorting bar heights, ordering boxplots by numeric efficiency, or grouping small categories—you can use the `forcats` package directly inside your aesthetics:

### 1. Reordering Bar Charts by Frequency: `fct_infreq()`
To sort a categorical bar chart by its category volume rather than alphabetically:
**Which vehicle classes are the most and least common in our dataset, ordered from highest frequency to lowest?**
```r
library(forcats)

# Plot class sorted by count
ggplot(mpg, aes(y = fct_infreq(class))) +
  geom_bar(fill = "steelblue") +
  labs(
    title = "Common Vehicle Classes",
    y = "Vehicle Class",
    x = "Count"
  ) +
  theme_minimal()
```

### 2. Reordering Boxplots by a Numeric Variable: `fct_reorder()`
To sort categories on your axis based on another numeric column (e.g. arranging car manufacturers by their median highway mileage `hwy` rather than alphabetically):
**How does highway fuel efficiency compare across vehicle manufacturers, ordered from the lowest median performance to the highest?**
```r
library(forcats)

# Reorder manufacturer based on median hwy mileage
ggplot(mpg, aes(x = hwy, y = fct_reorder(manufacturer, hwy, .fun = median))) +
  geom_boxplot(fill = "aquamarine3") +
  labs(
    title = "Highway Mileage by Manufacturer",
    subtitle = "Sorted by median mileage",
    y = "Manufacturer",
    x = "Highway Mileage (MPG)"
  ) +
  theme_minimal()
```

> [!TIP] Statistical Design: Why Sort by Median Over Mean?
> By default, `fct_reorder()` uses `.fun = median` as its sorting summary function rather than `.fun = mean`. 
> 
> As an analyst, you should prefer the median because it is a **robust estimator of central tendency**. In real-world datasets, skewness and extreme outliers (e.g., anomalous sensor errors or rare high-performance vehicles) can heavily distort the mean of a category. Sorting by the mean can pull a highly typical category to an incorrect rank due to a single extreme outlier, whereas sorting by the median ensures your visual ranking accurately represents the performance of a typical observation in each group.

### 3. Lumping Rare Categories on Plots: `fct_lump_n()`
If your dataset contains dozens of small groups, plotting them all makes the chart messy. Use `fct_lump_n()` to keep only the largest groups and automatically group the rest into `"Other"`:
**What is the vehicle volume of the four most common manufacturers compared to all other brands grouped together?**
```r
library(forcats)

# Keep the top 4 manufacturers, group the rest as 'Other'
ggplot(mpg, aes(y = fct_lump_n(manufacturer, n = 4, other_level = "Other Brands"))) +
  geom_bar(fill = "tomato2") +
  labs(
    title = "Top Car Manufacturers by Volume",
    y = "Manufacturer Group",
    x = "Count"
  ) +
  theme_minimal()
```

---

## 6. Exporting High-Resolution Charts: `ggsave()`

To save your plot to disk as a PDF, PNG, or SVG image, use the **`ggsave()`** function. By default, it saves the **last plot** rendered:

**What is the relationship between engine displacement and city mileage for different vehicle classes when styled for final distribution?**
```r-norun
# Generate plot
ggplot(mpg, aes(x = displ, y = hwy)) + 
  geom_point() + 
  theme_minimal()

# Save the plot to the local directory in high resolution (300 DPI)
ggsave("fuel_efficiency_plot.png", width = 8, height = 6, dpi = 300)

# Save as vector graphic PDF (ideal for prints and documents)
ggsave("fuel_efficiency_plot.pdf", width = 10, height = 7)
```

> [!NOTE] In-Browser Sandbox Limitation
> Running `ggsave()` inside this ebook's code editors saves the file to a virtual, sandboxed file system in your browser memory rather than your physical hard drive. **These saved files cannot be downloaded directly from the ebook.** To export and save actual image or PDF files to your computer, copy and run this code locally in RStudio.

### Format Selection & Resolution Standards

When saving charts for stakeholders or publications, selecting the correct file format and resolution is critical for visual professionalism:

| Graphic Type | Formats | How It Works | Best Use Cases |
| :--- | :--- | :--- | :--- |
| **Vector** | `.pdf`, `.svg` | Stores elements as mathematical shapes, paths, and coordinate systems. It scales infinitely without losing sharpness. | Professional reports, slide decks, and print publications. |
| **Raster** | `.png`, `.jpg` | Stores elements as a static grid of pixels. Scaling causes pixelation and blurriness. | Web embeds, email updates, and quick social media sharing. |

#### Resolution and Print Standards:
*   **Web Standard (72 - 96 DPI)**: Fine for digital screens, but appears fuzzy and unreadable when printed.
*   **Print Standard (300 DPI)**: The professional standard for publishing. Specify `dpi = 300` in `ggsave()` when saving raster formats to ensure lines and text are razor-sharp.

---

## Hands-on Exercises

### Exercise 1: Presentation-Ready Chart
**How do city and highway fuel efficiency compare in modern passenger vehicles, and how can we style this relationship for an executive presentation?**

*Analytical Guidance*:
Evaluate the joint relationship between city and highway fuel efficiency across all vehicles in the `mpg` dataset. Your analysis should:
1. Examine the correlation between city and highway mileage on a scatter plot.
2. Label the chart with professional, descriptive title and axis names to ensure it is immediately understandable.
3. Apply a clean, high-contrast, clutter-free minimalist aesthetic to maximize presentation readability.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = cty, y = hwy)) +
  geom_point() +
  labs(
    title = "City vs. Highway Fuel Performance",
    x = "City Mileage (MPG)",
    y = "Highway Mileage (MPG)"
  ) +
  theme_minimal()
```
</details>

---

### Exercise 2: Rotated Categorical Distribution
**How does highway fuel efficiency vary across different passenger vehicle classes, and how can we prevent vertical axis category labels from colliding?**

*Analytical Guidance*:
Compare the central tendencies, ranges, and outliers of highway mileage across vehicle classes in the `mpg` dataset. Your analysis should:
1. Render side-by-side boxplot distributions for each vehicle class.
2. Distinctly fill each boxplot category with a unique color.
3. Apply a classic clean plotting theme with a professional title.
4. Rotate the category names on the horizontal axis by 90 degrees to ensure they are fully vertical and readable without overlapping.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)

ggplot(mpg, aes(x = class, y = hwy, fill = class)) +
  geom_boxplot() +
  labs(title = "Highway Mileage by Vehicle Class") +
  theme_classic() +
  theme(axis.text.x = element_text(angle = 90, hjust = 1, vjust = 0.5))
```
</details>

---

### Exercise 3: Sorting and Lumping Categorical Plots
**Which vehicle manufacturers represent the largest volume of observations in our dataset, and how can we focus our analysis on these high-volume brands?**

*Analytical Guidance*:
Analyze the count frequency of vehicles across different manufacturers in the `mpg` dataset. Your analysis should:
1. Group and lump all rare, low-frequency brands together into a single category while preserving the top 5 high-volume brands individually.
2. Arrange the categories on a horizontal bar chart sorted directly by volume (most frequent brands first) to enable instant ranking.
3. Style the chart with a custom color, clean professional labels, and a minimalist theme.

```r
# Write your code below and click Run Code
```

<details>
<summary>Click to view Answer</summary>

```r
library(tidyverse)
library(forcats)

# 1. Create the plot with lumped and frequency-ordered manufacturer bars
ggplot(mpg, aes(y = fct_infreq(fct_lump_n(manufacturer, n = 5, other_level = "Other Manufacturers")))) +
  geom_bar(fill = "darkturquoise") +
  labs(
    title = "Top Car Manufacturers by Volume",
    y = "Manufacturer",
    x = "Number of Vehicles"
  ) +
  theme_minimal()
```
</details>

