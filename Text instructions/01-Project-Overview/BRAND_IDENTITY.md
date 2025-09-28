# 🎨 Brand Identity & Design System
## Live Football TV Guide - "Pitch Perfect"

### 🏆 Brand Overview

**Brand Name:** Live Football TV Guide  
**Tagline:** "Where Every Match Matters"  
**Brand Personality:** Premium, Dynamic, Professional, Tech-Savvy

### 🎯 Brand Values

1. **Premium Quality** - We deliver the highest quality football coverage and betting tools
2. **Dynamic Energy** - Like the energy of a live match, our platform is vibrant and engaging
3. **Professional Trust** - Reliable, accurate, and trustworthy for serious football fans
4. **Innovation** - Cutting-edge technology and modern user experience

### 🎨 Visual Identity

#### Color Palette

**Primary Blue (#0ea5e9)**
- Represents trust, professionalism, and technology
- Used for main actions, links, and primary elements
- Variants: 50-950 for different contexts

**Secondary Green (#22c55e)**
- Inspired by football pitch green
- Represents success, growth, and the sport itself
- Used for positive actions and success states

**Accent Orange (#f97316)**
- Dynamic and energetic
- Represents excitement and action
- Used for highlights, warnings, and call-to-actions

**Neutral Grays**
- Professional and clean
- Provides excellent readability
- Full range from 50-950 for different contexts

#### Typography

**Primary Font: Inter**
- Modern, clean, highly readable
- Used for body text, UI elements, and general content
- Weights: 300-900

**Secondary Font: Poppins**
- Sporty, dynamic, engaging
- Used for headings, titles, and brand elements
- Weights: 300-900

**Monospace Font: JetBrains Mono**
- Technical and precise
- Used for code, odds, and numerical data
- Weights: 300-700

### 🧩 Design System Components

#### Typography Scale
- **H1:** 2.25rem (36px) - Font Black
- **H2:** 1.875rem (30px) - Font Extrabold
- **H3:** 1.5rem (24px) - Font Bold
- **H4:** 1.25rem (20px) - Font Semibold
- **H5:** 1.125rem (18px) - Font Semibold
- **H6:** 1rem (16px) - Font Semibold
- **Body:** 1rem (16px) - Font Normal
- **Small:** 0.875rem (14px) - Font Normal
- **Caption:** 0.75rem (12px) - Font Normal

#### Spacing System
- **Base Unit:** 4px
- **XS:** 4px (0.25rem)
- **SM:** 8px (0.5rem)
- **MD:** 16px (1rem)
- **LG:** 24px (1.5rem)
- **XL:** 32px (2rem)
- **2XL:** 48px (3rem)
- **3XL:** 64px (4rem)

#### Border Radius
- **SM:** 2px (0.125rem)
- **Base:** 4px (0.25rem)
- **MD:** 6px (0.375rem)
- **LG:** 8px (0.5rem)
- **XL:** 12px (0.75rem)
- **2XL:** 16px (1rem)
- **3XL:** 24px (1.5rem)

#### Shadows
- **SM:** Subtle elevation
- **Base:** Standard card shadow
- **MD:** Medium elevation
- **LG:** High elevation
- **XL:** Maximum elevation
- **2XL:** Dramatic elevation

### 🎭 Component Library

#### Buttons
- **Primary:** Blue background, white text
- **Secondary:** Green background, white text
- **Accent:** Orange background, white text
- **Outline:** Transparent with border
- **Ghost:** Transparent with hover effect
- **Danger:** Red background for destructive actions

#### Cards
- **Default:** White background with subtle shadow
- **Elevated:** White background with prominent shadow
- **Outlined:** Transparent with border
- **Brand:** Gradient background with brand colors

#### Typography Components
- **Heading:** Brand typography for titles
- **Text:** Body text with different variants
- **Label:** Form labels with consistent styling
- **BrandText:** Brand-colored text elements

### 🎨 Usage Guidelines

#### Color Usage
1. **Primary Blue** - Main actions, navigation, links
2. **Secondary Green** - Success states, positive actions
3. **Accent Orange** - Highlights, warnings, CTAs
4. **Neutral Grays** - Text, backgrounds, borders

#### Typography Usage
1. **Headings** - Use Poppins for all headings
2. **Body Text** - Use Inter for all body content
3. **UI Elements** - Use Inter for buttons, labels, etc.
4. **Technical Data** - Use JetBrains Mono for odds, scores

#### Spacing Guidelines
1. **Consistent Spacing** - Always use the defined spacing scale
2. **Visual Hierarchy** - Use larger spacing for more important elements
3. **Component Spacing** - Maintain consistent internal spacing

#### Component Usage
1. **Buttons** - Use appropriate variant for the action type
2. **Cards** - Choose variant based on content importance
3. **Typography** - Use semantic heading levels
4. **Icons** - Use consistent icon sizes and colors

### 🌙 Dark Mode

Our design system fully supports dark mode with:
- **Background:** Dark grays (900-950)
- **Text:** Light grays (100-300)
- **Borders:** Medium grays (600-700)
- **Brand Colors:** Adjusted for dark mode visibility

### 📱 Responsive Design

- **Mobile First** - Design for mobile, enhance for desktop
- **Breakpoints:** SM (640px), MD (768px), LG (1024px), XL (1280px), 2XL (1536px)
- **Flexible Layouts** - Use grid and flexbox for responsive layouts
- **Touch Friendly** - Minimum 44px touch targets

### 🎯 Brand Voice & Tone

#### Personality Traits
- **Confident** - Bold and authoritative
- **Passionate** - Enthusiastic about football
- **Professional** - Trustworthy and reliable
- **Modern** - Tech-savvy and innovative

#### Writing Style
- **Headings** - Bold, confident, and engaging
- **Body** - Clear, informative, and accessible
- **Buttons** - Action-oriented and encouraging
- **Captions** - Concise and helpful

### 🔧 Implementation

#### CSS Variables
All brand colors, typography, and spacing are available as CSS variables:
```css
--color-primary-500: #0ea5e9;
--font-primary: 'Inter', sans-serif;
--spacing-md: 1rem;
```

#### Tailwind Classes
Custom Tailwind classes are available:
```css
.text-brand-primary
.bg-brand-secondary
.font-primary
.btn-primary
```

#### Component Usage
```tsx
import { Heading, Text, Button, Card } from '@/components/ui';

<Card variant="elevated">
  <Heading level={2}>Match Details</Heading>
  <Text variant="body">Live football coverage</Text>
  <Button variant="primary">View Match</Button>
</Card>
```

### 📋 Brand Guidelines Checklist

- [ ] Use brand colors consistently
- [ ] Apply correct typography hierarchy
- [ ] Maintain consistent spacing
- [ ] Use appropriate component variants
- [ ] Ensure dark mode compatibility
- [ ] Test responsive behavior
- [ ] Follow accessibility guidelines
- [ ] Maintain brand voice in copy

### 🎨 Brand Assets

#### Logo Usage
- **Primary Logo** - Full color on light backgrounds
- **White Logo** - White version for dark backgrounds
- **Icon Only** - Square icon for favicon and small spaces

#### Photography Style
- **Action Shots** - Dynamic football moments
- **Stadium Views** - Atmospheric venue shots
- **Player Portraits** - Professional player images
- **Data Visualization** - Clean, modern charts and graphs

#### Icon Style
- **Line Icons** - Clean, minimal line style
- **Consistent Weight** - 2px stroke width
- **Rounded Corners** - 2px border radius
- **Brand Colors** - Use brand color palette

---

*This brand identity ensures consistency across all touchpoints and creates a memorable, professional experience for football fans and betting enthusiasts.*
