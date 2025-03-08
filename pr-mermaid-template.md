# TowTrace PR Mermaid Diagram Template

## PR Overview
Include a brief description of the PR here.

## Class/Component Diagram
```mermaid
classDiagram
    %% Replace this with your actual class/component diagram
    class ComponentName {
        +property1: type
        +property2: type
        +method1()
        +method2()
    }
    
    class RelatedComponent {
        +property1: type
        +method1()
    }
    
    ComponentName --> RelatedComponent
```

## Sequence Diagram (For API/Flow Changes)
```mermaid
sequenceDiagram
    %% Replace this with your actual sequence diagram
    actor User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Action
    Frontend->>API: Request
    API->>Database: Query
    Database-->>API: Response
    API-->>Frontend: Response
    Frontend-->>User: Result
```

## Flow Diagram (For Business Logic)
```mermaid
flowchart TD
    %% Replace this with your actual flow diagram
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

## State Diagram (For Component States)
```mermaid
stateDiagram-v2
    %% Replace this with your actual state diagram
    [*] --> State1
    State1 --> State2: Event1
    State2 --> State3: Event2
    State3 --> [*]
```

## ER Diagram (For Database Changes)
```mermaid
erDiagram
    %% Replace this with your actual ER diagram
    ENTITY1 ||--o{ ENTITY2 : relationship
    ENTITY1 {
        uuid id
        string name
    }
    ENTITY2 {
        uuid id
        uuid entity1_id
        string data
    }
```

## How to Use This Template
1. Copy this template to your PR description
2. Replace the example diagrams with actual diagrams representing your changes
3. Remove any diagram types that aren't relevant to your PR
4. Update the diagrams to match your actual implementation

### Tips for Creating Effective Diagrams
- Keep diagrams focused on the specific changes in the PR
- Use clear, descriptive labels
- Include only relevant components and interactions
- Use colors to highlight key elements (where appropriate)
- Ensure relationships are accurately represented

For more information on Mermaid syntax, visit: [Mermaid.js Documentation](https://mermaid.js.org/)