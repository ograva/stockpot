# UX Flow: Platform Catalog (ADMN)

## 1. Full Navigation Flow

```mermaid
flowchart TD
    %% Nodes
    Dash[Admin Dashboard]
    Catalog[Platform Catalog Tabs]
    UoMTab[UoM List]
    IngTab[Ingredient List]
    OpenUoM[Add UoM Dialog]
    OpenIng[Add Ingredient Dialog]
    SaveUoM[API: Save UoM]
    SaveIng[API: Save Ingredient]
    Success[Update View & Show Toast]
    Error[Show Error Toast]

    %% Edges
    Dash --> Catalog
    Catalog -->|Click UoM Tab| UoMTab
    Catalog -->|Click Ingredients Tab| IngTab
    
    UoMTab -->|Click Add| OpenUoM
    IngTab -->|Click Add| OpenIng
    
    OpenUoM -->|Submits valid form| SaveUoM
    OpenIng -->|Submits valid form| SaveIng
    
    SaveUoM -->|Success| Success
    SaveIng -->|Success| Success
    
    SaveUoM -->|Duplicate Code/Name| Error
    SaveIng -->|Duplicate Name| Error
    
    Success --> Catalog
    Error --> Catalog
```

## 2. Happy Path Callout
**Primary Success Path:** A platform administrator needs to append "Gallon" to the global units. They navigate to the Platform Catalog, remain on the UoM tab, hit "Add UoM", fill in the Name, Abbreviation ("Gal"), and Base Conversion Math (to ml), and save. The dialog closes and the list natively refreshes.

## 3. State Machine (Dialog Workflow)
```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Editing : Click Add / Edit
    Editing --> Saving : Click Submit
    Editing --> Closed : Click Cancel
    Saving --> Error : API Rejects
    Error --> Editing : Resolve constraints
    Saving --> Closed : API Accepts
```

## 4. Route Map
| Screen Node | Angular Route Path | Layout Wrapper | Auth Requirement |
| :--- | :--- | :--- | :--- |
| Admin Dashboard | `projects/admin` -> `/dashboard` | `FullComponent` | `platform_admin` claim |
| Platform Catalog | `projects/admin` -> `/catalog` | `FullComponent` | `platform_admin` claim |

## 5. Error & Edge Case Paths
- **Duplicate Document ID:** The platform prevents duplicate Base UoMs or Duplicate Master Ingredients. The Cloud Function / Firebase rule rejects the write. UI displays a Red (`bg-error`) toast notification: "Cannot create: Item already exists."
- **Network Failure Layout:** Buttons inside the modal disable and show inline spinners. If offline on submit, Firebase caches the write locally and the UI functions optimistically. A silent status sync pushes to the cloud immediately upon reconnection.