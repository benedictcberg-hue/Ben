# CLAUDE.md

## Repository: Ben

### Overview

"Die Reise nach Innen" - Eine interaktive neuropsychologische Selbsterkundungs-Anwendung auf Deutsch.

### Current State

- **Status**: Active development - React app with cognitive games and reflection modules
- **Branch**: Development occurs on feature branches prefixed with `claude/`
- **Remote**: `origin` points to `benedictcberg-hue/Ben`
- **Tech Stack**: React 18, Vite, Tailwind CSS, Lucide React

### Development Workflow

- Create feature branches off the main branch
- Commit with clear, descriptive messages
- Push to the remote using `git push -u origin <branch-name>`

### Conventions

**Programming Language & Runtime:**
- JavaScript/JSX (React 18)
- Node.js with npm package manager

**Package Manager:**
- npm (see package.json for dependencies)

**Directory Structure:**
```
Ben/
├── src/
│   ├── App.jsx          # Main component (all games & modules)
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

**Code Style:**
- Functional React components with hooks
- Tailwind CSS for styling (utility-first)
- German language for all UI text and content
- Component organization: Data → Components → Main App

**Naming Conventions:**
- Components: PascalCase (e.g., `StroopGame`, `ScenarioView`)
- Files: PascalCase for components (e.g., `App.jsx`)
- Constants: UPPER_SNAKE_CASE (e.g., `CHAPTERS`, `SCENARIOS`)
- Functions/Variables: camelCase

### Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Create production build
npm run preview      # Preview production build
```

### Project Features

**5 Narrative Chapters:**
1. Das Tal der Emotionen (Limbisches System)
2. Die Festung der Gedanken (Frontallappen)
3. Die Bibliothek der Echos (Temporallappen)
4. Der Garten der Sinne (Parietallappen)
5. Der Brunnen der Lebenskraft (Vital-Zentrum)

**Cognitive Games:**
- Stroop Test (cognitive control)
- Echo/Simon Game (auditory memory)
- N-Back Test (working memory)
- Trail Making Test (visual attention)

**Reflection Modules:**
- Scenario-based questions with insights
- Spectrum questions (personality dimensions)
- Likert scales (structure/order)
- Rapid-fire questions (impulse control)
- Perception preferences
- Sensory sensitivity assessment
- Mood tracking
- Chronotype determination
- Life balance wheel

### Notes for AI Assistants

- Read this file at the start of every session for up-to-date project context
- Keep this file updated as the project evolves (new dependencies, scripts, conventions)
- Prefer editing existing files over creating new ones
- Do not over-engineer — match the complexity of the solution to the task
- All content should be in German (UI text, questions, narratives)
- Maintain the immersive narrative tone throughout the app
