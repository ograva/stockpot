# Wireframe: Master Recipes (MSTR)

## 1. Screen Purpose
A complex builder interface permitting the Owner or Head Chef to construct final menu recipes out of sub-components and raw materials. Vital for defining theoretical food cost and setting up the POS-to-Recipe deduction maps.

## 2. Mobile Layout
*Note: A desktop-focused interface due to density, but mobile responsive.*
```text
+-------------------------------------------------+
| [Hamburger]  Recipe Builder        [ Save ]     |
+-------------------------------------------------+
|  [     Recipe Name: "Spaghetti Bolognese"    ]  |
|  [     Category: Mains               v       ]  |
|  [     Target Cost%: 28%                     ]  |
+-------------------------------------------------+
|  INGREDIENTS                    [ + Add Item ]  |
+-------------------------------------------------+
|  (-) Bolognese Sauce (Sub-Comp)                 |
|      0.25 L     Cost: $1.20                     |
+-------------------------------------------------+
|  (-) Dry Spaghetti (Raw)                        |
|      150 g      Cost: $0.45                     |
+-------------------------------------------------+
|                                                 |
|  TOTAL THEORETICAL COST: $1.65                  |
|  Current Selling Price:  $12.00                 |
|  Current Food Cost %:    + 13.75% (Excellent)   |
+-------------------------------------------------+
```

## 3. Desktop Layout
- **Left Panel:** Recipe Details (Name, Category, Image, Target Cost %, Prep Instructions).
- **Right Panel (Builder):** Interactive list where users search and pull in Ingredients or Sub-Components.
- **Bottom Footer:** Sticky footer maintaining the live summation of Theoretical Cost vs Target Selling Price. Color-coded if the cost exceeds the target percentage.

## 4. Component Inventory
| Component | Material or Tailwind? | Notes |
| :--- | :--- | :--- |
| **Grid Framework**| Tailwind | Grid / Flex panels. |
| **Inputs** | Material (`mat-form-field`) | Readily available. |
| **AutoComplete**| Material (`mat-autocomplete`)| Essential for searching through hundreds of ingredients. |
| **Live Math Box**| Tailwind card | Prominent colored background (`bg-background` -> `bg-green-100` or `bg-rose-100`). |

## 5. Interaction & State Map
| Element | Default | Hover / Focus | Active | Loading | Error / Empty |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Add Item** | Secondary Outline | Primary Focus | Ripple | Spinner | N/A |
| **Remove Row (-)**| Gray Icon | Red Icon (`color="warn"`) | Ripple | N/A | N/A |
| **Cost Output**| Green text | N/A | N/A | N/A | Red text (`text-error`) if > Target % |

## 6. UX Flow Diagram
```mermaid
flowchart TD
    A[Recipes List] --> B(Create/Edit Recipe)
    B --> C{Define Header}
    C -->|Enter Details| D[Add Recipe Name/Target Cost]
    D --> E{Add Components}
    E -->|Select Sub-Comp| F[Input Qty (e.g. 0.25 L)]
    E -->|Select Raw Mat| G[Input Qty (e.g. 150 g)]
    F --> H[Live Cost Recalculates]
    G --> H
    H --> I{Cost Exceeds Target?}
    I -->|Yes| J[Highlight Red]
    I -->|No| K[Highlight Green]
    J --> L[Save Recipe]
    K --> L
    L --> M[Return to Master List]
```

## 7. data-test-id Map
| Element Description | `data-test-id` |
| :--- | :--- |
| Recipe Name Input | `mstr-recipe-name-input` |
| Target Cost % Input | `mstr-recipe-target-input` |
| Ingredient Autocomplete | `mstr-recipe-search-ing` |
| Added Item Row | `mstr-recipe-item-{id}` |
| Item Qty Form Field | `mstr-recipe-item-qty-{id}` |
| Save Recipe Button | `mstr-recipe-save-btn` |
| Live Cost Output | `mstr-recipe-theor-cost` |
