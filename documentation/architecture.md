# ZEUS Portfolio Architecture

## High-level system diagram

```mermaid
flowchart TB
    B["◈ ZEUS<br/>Visitor Browser"]

    subgraph APP["ZEUS Astro Application"]
        direction TB
        L["Shared Site Layout<br/>Navigation · Theme · Metadata · Footer"]

        subgraph ROUTES["Astro Routes"]
            direction LR
            D["Dashboard"]
            W["Writeup Library"]
            AU["Author"]
            P["Portfolio"]
        end

        subgraph UI["Reusable UI Components"]
            direction LR
            TB["Threat Brief"]
            TC["Topic Cards"]
            LC["Lab Cards"]
        end

        subgraph CONTENT["Typed Content"]
            MD["Markdown Writeups"]
            CC["Astro Content Collection"]
        end
    end

    subgraph DATA["Security Data Layer"]
        API["Security Brief API"]
        RSS["Trusted Publisher RSS Feeds"]
        NVD["NVD Vulnerability API"]
    end

    subgraph ASSETS["Static Assets"]
        LOGO["ZEUS Logo and Publisher Marks"]
        MEDIA["Certificates · Covers · Images"]
        CSS["Organized CSS and Motion Styles"]
    end

    subgraph SCM["Source Control and Branch Management"]
        FEATURE["Feature Branch<br/>feat/*"]
        PR["Pull Request<br/>into main"]
        MAIN["Protected main<br/>Production Branch"]
    end

    subgraph DELIVERY["CI/CD and Delivery"]
        CI["GitHub Actions<br/>Quality Gate"]
        CHECKS["Format · Type · Build<br/>Links · Accessibility"]
        PREVIEW["Vercel Preview<br/>Branch / PR URL"]
        BUILD["Astro Static Build"]
        PROD["Vercel Production<br/>Deployment"]
        LEGACY["Legacy Site<br/>Preserved During Migration"]
    end

    B --> APP
    L --> ROUTES
    ROUTES --> UI
    W --> CONTENT
    MD --> CC
    TB --> API
    API --> RSS
    API --> NVD
    APP --> ASSETS
    APP --> BUILD
    FEATURE --> PR
    PR --> CI
    CI --> CHECKS
    CHECKS --> BUILD
    BUILD --> PREVIEW
    PREVIEW --> PR
    PR --> MAIN
    MAIN --> PROD
    LEGACY -. fallback during migration .-> BUILD

    classDef brand fill:#123f4a,stroke:#8bf1d0,color:#effcf9,stroke-width:2px;
    classDef route fill:#182b43,stroke:#76bde8,color:#edf3fb;
    classDef ui fill:#203b51,stroke:#a4ffcf,color:#effcf9;
    classDef content fill:#263452,stroke:#c4b5fd,color:#f5f3ff;
    classDef data fill:#493a22,stroke:#ffd186,color:#fff8e7;
    classDef asset fill:#243d36,stroke:#92e5b2,color:#effcf9;
    classDef scm fill:#182b43,stroke:#76bde8,color:#edf3fb;
    classDef delivery fill:#34334a,stroke:#c4b5fd,color:#f5f3ff;
    classDef preview fill:#243d36,stroke:#92e5b2,color:#effcf9;
    classDef production fill:#123f4a,stroke:#8bf1d0,color:#effcf9,stroke-width:2px;
    classDef legacy fill:#303642,stroke:#a1b3cb,color:#edf3fb;

    class B,L brand;
    class D,W,AU,P route;
    class TB,TC,LC ui;
    class MD,CC content;
    class API,RSS,NVD data;
    class LOGO,MEDIA,CSS asset;
    class FEATURE,PR,MAIN scm;
    class CI,CHECKS,BUILD delivery;
    class PREVIEW preview;
    class PROD production;
    class LEGACY legacy;

    style APP fill:#0c1321,stroke:#8bf1d0,stroke-width:2px,color:#effcf9;
    style ROUTES fill:#111b2c,stroke:#76bde8,color:#edf3fb;
    style UI fill:#111b2c,stroke:#a4ffcf,color:#effcf9;
    style CONTENT fill:#111b2c,stroke:#c4b5fd,color:#f5f3ff;
    style DATA fill:#1b1820,stroke:#ffd186,color:#fff8e7;
    style ASSETS fill:#111b2c,stroke:#92e5b2,color:#effcf9;
    style SCM fill:#111b2c,stroke:#76bde8,color:#edf3fb;
    style DELIVERY fill:#111b2c,stroke:#c4b5fd,color:#f5f3ff;
```

## Color system

| Color | Meaning |
| --- | --- |
| Teal | ZEUS brand and shared application shell |
| Blue | Page routes |
| Mint | Reusable UI components |
| Violet | Content and build architecture |
| Amber | External security data |
| Green | Assets and branding |
| Gray-violet | Delivery and migration infrastructure |

## Architecture notes

- Astro owns the new page structure and production build.
- A shared layout owns navigation, theme controls, metadata, and the footer.
- Markdown writeups will become typed content rather than manually maintained HTML.
- The threat feed remains a separate serverless/API concern.
- Existing CSS, images, and legacy pages remain available until the Astro version is verified.
- GitHub Actions is the central quality gate for formatting, types, links, accessibility, and the production build.
- Feature branches are reviewed through pull requests and must pass required checks before merging.
- Vercel creates preview deployments for branches and pull requests, while protected `main` produces the production deployment.
