# UX Flow: Auth Setup Wizard (AUTH)

## 1. Full Navigation Flow

```mermaid
flowchart TD
    %% Nodes
    Login[Login / Register]
    Check{Is Setup Complete?}
    Step1[Profile: Name & Currency]
    Step2[Team: Invite Managers/Staff]
    Step3[Data: Seed Starter Catalog]
    ActionSaveProfile[User clicks Next]
    ActionInvite[User clicks Send Invites]
    ActionSkip[User clicks Skip]
    ActionFinish[User clicks Finish Setup]
    Dash[User-App Main Dashboard]
    Error1[Show Validation Error]
    Error2[Show Invite Failed Error]

    %% Edges
    Login --> Check
    Check -->|Yes| Dash
    Check -->|No| Step1
    
    Step1 -.->|Fills data| ActionSaveProfile
    ActionSaveProfile -->|Valid| Step2
    ActionSaveProfile -->|Invalid| Error1
    Error1 --> Step1
    
    Step2 -.->|Enters emails| ActionInvite
    ActionInvite -->|Success| Step3
    ActionInvite -->|Fail| Error2
    Error2 --> Step2
    Step2 -.->|Skips| ActionSkip
    ActionSkip --> Step3
    
    Step3 -.->|Selects seed options| ActionFinish
    ActionFinish -->|Creates Tenant Docs| Dash
```

## 2. Happy Path Callout
**Primary Success Path:** A new Owner registers, is seamlessly routed into the `SetupWizard`, fills in a currency and restaurant name, inputs one manager's email, accepts the default starter catalog seed, and lands on the Main Dashboard completely provisioned.

## 3. State Machine (Form Progression)
```mermaid
stateDiagram-v2
    [*] --> Step1_Profile
    Step1_Profile --> Step2_Team : form.valid & next()
    Step2_Team --> Step3_Seed : skip() or inviteSuccess()
    Step3_Seed --> Completing : finish()
    Completing --> [*] : onAuthStateChanged triggers dashboard
```

## 4. Route Map
| Screen Node | Angular Route Path | Layout Wrapper | Auth Requirement |
| :--- | :--- | :--- | :--- |
| Login / Register | `projects/user-app` -> `/auth/login` | `BlankLayout` | Public |
| Setup Wizard | `projects/user-app` -> `/auth/setup` | `BlankLayout` | Authenticated (No tenant yet) |
| Dashboard | `projects/user-app` -> `/dashboard` | `FullLayout` | Authenticated + `owner` role |

## 5. Error & Edge Case Paths
- **Validation Failure (Step 1):** Missing restaurant name or currency blocks progression. Input border turns Red (`text-error`) with local validation hint.
- **Invite Delivery Failure (Step 2):** Backend rejects email format or Firebase triggers an error. Toast notification presented; user can resolve or use "Skip".
- **Network Disconnect (Step 3):** If connection drops right as tenant provisioning is called, the Setup Wizard catches the network error, prevents advancing, and displays an offline amber banner (`bg-accent`), preserving form state until connection restores.