---
title: DeterministicColorGen
date: August 2025
links:
  - GitHub: https://github.com/alexeyalbert/DeterministicColorGen
---

![Example photo](/images/deterministic-color-gen.png)

A simple SwiftUI package to deterministically generate OKLCH colours based off a string.

While working on a side project, I wanted to incorporate colour in my UI for tags/badges. I wanted the tag's colour to stay consistent across those with the same label, yet be visually differentiable across different labels.

This package will always generate the same colour for a given string, supports light and dark modes, and has the option of also returning a text fill colour, specifically for the type of use case I described.
