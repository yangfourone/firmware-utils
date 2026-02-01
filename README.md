# Firmware Utils

A collection of specialized web tools designed to assist firmware engineers and embedded systems developers. Built with React and TypeScript, this project aims to provide accurate, offline-capable utilities for low-level calculation and visualization tasks.

## 🚀 Features

- **Dark Mode UI**: Designed for visual comfort with a clean, high-contrast interface.
- **Offline Capable**: Static single-page application (SPA) architecture.
- **Responsive Design**: Works on desktop and mobile for quick checks.
- **No Server Dependency**: All calculations and parsing happen entirely client-side.

## 🛠 Tools

### 1. C Macro Calculator
Evaluates complex C preprocessor macro definitions that standard calculators often choke on.
- **Syntax Support**: Handles `0x` hex literals, `U/u` unsigned suffixes, and nested parentheses.
- **Logic**: Uses BigInt arithmetic to simulate integer behavior.
- **Output**: Provides results in both Decimal and Hexadecimal formats.
- **Copy-Paste**: One-click copying for results.

### 2. Register Bit Field Viewer
Visualizes memory dumps or register values as a structured bit map.
- **Dual Mode Parsing**:
  - **Word List**: Interprets inputs like `0xFF000000` as 32-bit integers.
  - **Byte Stream**: Automatically detects byte streams (e.g., `FF AA BB CC`) and reconstructs them into 32-bit words using **Little Endian** logic.
- **Visualization**: Displays a grid of 32 bits for every Double Word (DW), with visual separators for bytes and nibbles.
- **Responsive**: Adapts to screen width for easy reading.

### 3. Memory Hex Dump
View binary files or hex strings as a formatted memory map.
- **Input Flexibility**: Parse raw hex strings or upload binary files (`.bin`, `.dat`).
- **formatted Display**: Shows data in a grid with configurable row width (4, 8, 16, or 32 bytes).
- **Smart Decoding**: Automatically interprets byte streams using **Little Endian** logic for 32-bit word display.
- **Custom Addressing**: define a custom base address to match your specific memory map.

## 💻 Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📦 Getting Started

To run this project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/firmware-utils.git
    cd firmware-utils
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm start
    # or if using Vite
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).