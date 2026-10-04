# Environment Setup: R and RStudio

Before we start, we need to set up our development environment. While general software development often uses text editors, Data Science in R thrives inside **RStudio**, the premier Integrated Development Environment (IDE) specifically designed for R.

We will install **R** (the programming language/engine) and then **RStudio Desktop** (the visual interface that makes coding in R a breeze).

---

## 1. What is CRAN?
R is distributed via **CRAN** (the Comprehensive R Archive Network), a network of servers around the world that store up-to-date versions of R code and R packages. This global repository is maintained by a specialized volunteer group of package maintainers (the CRAN Team) under the auspices of the non-profit R Foundation, with its central host server located at the Vienna University of Economics and Business in Austria.

## 2. What is RStudio?
**RStudio Desktop** is a premier Integrated Development Environment (IDE) developed by **Posit** (formerly RStudio, PBC). Founded in 2009, Posit is a for-profit company legally structured as a **Public Benefit Corporation (PBC)**. Under this charter, Posit is legally mandated to balance shareholder interests with its core public mission: building and maintaining high-quality open-source software (like RStudio Desktop) to keep it 100% free for students, researchers, and hobbyists worldwide.

---

## Installation Steps

### Step 1: Install R
You must install R **before** installing RStudio.

1. Go to the CRAN website: <a href="https://cran.r-project.org/" target="_blank">https://cran.r-project.org/</a>
2. Choose the download link matching your operating system:
   * **Download R for macOS**
   * **Download R for Windows**
   * **Download R for Linux**
3. Download the latest installer package (e.g., `.pkg` for Mac, `.exe` for Windows) and run it. Accept all default settings.

### Step 2: Install RStudio Desktop (The Dashboard)
Once R is installed, install RStudio.

1. Go to the Posit download page: <a href="https://posit.co/download/rstudio-desktop/" target="_blank">https://posit.co/download/rstudio-desktop/</a>
2. Scroll to **Step 2: Install RStudio Desktop** and click the download button for your operating system.
3. Open the downloaded installer and follow the prompt instructions to complete the setup.

---

## Launching RStudio
Once installed, open RStudio:
* **macOS**: Find RStudio in your `Applications` folder.
* **Windows**: Press the Windows key, search for `RStudio`, and press Enter.

Upon opening, you will see a workspace divided into four main panes:
1. **Source Editor (Top-Left)**: Where you write and save your R scripts.
2. **Console (Bottom-Left)**: Where R code runs interactively. You can type commands directly here and press Enter to see results.
3. **Environment/History (Top-Right)**: Shows all active datasets, variables, and history of run commands.
4. **Files/Plots/Packages/Help (Bottom-Right)**: Where you browse files, view graphs, install packages, and read documentation.

>[!CALLOUT] R vs RStudio
>Think of **R** as the engine of a car and **RStudio** as the dashboard. The engine does the actual work, but you sit in the driver's seat and interact with the dashboard to drive. You cannot drive without the engine, and driving is much harder without the dashboard!

>[!CAUTION] Troubleshooting
>* **Installation Order**: If you open RStudio and get a warning that R is not found, it means you did not install R first. Close RStudio, install R from CRAN, and open RStudio again.
>* **Package Installation Errors**: On Windows or macOS, if you are prompted to compile packages from source, it is generally safer to choose "No" to install pre-compiled binary packages, which install much faster without needing complex system tools.
