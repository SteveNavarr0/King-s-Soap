# King’s Soap Style Guide

## JavaScript formatting
- Use two spaces for indentation.
- Use double quotes and semicolons.
- Prefer const; use let only when reassignment is necessary.
- Use one blank line between logical sections.
- Follow existing formatter and linter configuration when available.
- Avoid reformatting unrelated code.

## Naming and components
- Use PascalCase for React components and their filenames.
- Use camelCase for variables and functions.
- Use descriptive names such as selectedProductId and applyingDiscount.
- Prefix event handlers with handle, such as handleCheckout.
- Prefix data-fetching functions with fetch, such as fetchProducts.
- Use functional components with a default export.
- Both function declarations and arrow-function components exist;
  preserve the style of the component being edited.

## Imports and component organization
- Group imports: React hooks, external libraries, then local modules.
- Remove unused imports.
- Organize components as:
  1. Hooks and context
  2. State and derived values
  3. Helper functions and effects
  4. Returned JSX
- Keep helper definitions before effects that use them when practical.

## React patterns
- Use useState for local state and useEffect for synchronization.
- Use the existing useAuth context for authentication state.
- Import the shared Supabase client from supabaseClient.
- Use Link for internal navigation.
- Use stable database IDs as list keys.
- Copy arrays before sorting state-derived data.
- Use optional chaining and nullish coalescing where appropriate.
- Include all reactive dependencies required by effects.

## JSX
- Indent nested elements consistently with two spaces.
- Place props on separate lines when an element becomes difficult to read.
- Use conditional rendering for optional messages, panels, and dialogs.
- Extract repeated UI when a shared component improves clarity.
- Use descriptive alt text and accessible labels.

## Visual design
- Use Tailwind utilities and existing shared components.
- Match the warm palette shown in existing pages:
  - Main background: #C5AE98
  - Brown action accent: #8B6B4A
  - White text and translucent white surfaces
- Use font-serif for headings and product presentation.
- Use font-sans for controls and supporting interface text.
- Match existing rounded corners, subtle borders, and spacing.
- Use mobile-first layouts with responsive md: and lg: overrides.
- Keep hover animations subtle.
- Provide visible keyboard focus and readable text contrast.

## Data and request handling
- Use async/await for asynchronous operations.
- Check Supabase errors and HTTP response.ok explicitly.
- Use try/catch/finally when managing request loading state.
- Show useful user-facing errors for failed user actions.
- Disable relevant controls while requests are pending.
- Format displayed currency consistently to two decimal places.
- Reuse existing API configuration; do not introduce new
  hardcoded localhost URLs.

## Comments
- Explain business rules, intent, and non-obvious behavior.
- Keep comments accurate when implementation changes.
- Avoid comments that only repeat the next line of code.