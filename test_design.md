# Question Section Design Specification

## Visual Layout

### 1. Card Design
- Modern, elevated card layout with clean white background
- Subtle shadow effect (`shadow-lg`)
- Smooth shadow transition on hover (`hover:shadow-xl`)
- Elegant border-less design (`border-none`)
- Generous padding (`p-8`) for comfortable reading

### 2. Typography
- Question Text:
  - Large, clear font size (`text-2xl`)
  - Semi-bold weight (`font-semibold`)
  - Navy blue color (`text-[#263468]`)
  - Comfortable bottom margin (`mb-8`)

### 3. Answer Options
- Letter-based option indicators (A, B, C, D)
- Full-width buttons with ample padding (`p-6`)
- Large, readable text (`text-lg`)
- Medium font weight (`font-medium`)
- Custom styling:
  - Navy blue border (`border-[#263468]`)
  - White background (`bg-white`)
  - Navy blue text (`text-[#263468]`)

## Animations and Transitions

### 1. Question Entry Animation
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.5 }}
```
- Smooth fade-in effect
- Subtle upward slide motion
- 500ms duration for natural feel

### 2. Answer Options Animation
```typescript
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: index * 0.1 }}
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```
- Staggered entrance (100ms delay between each option)
- Slight horizontal slide from left
- Subtle scale increase on hover (102%)
- Tactile press effect (98% scale)

### 3. Feedback Animation
```typescript
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{
    type: "spring",
    stiffness: 300,
    damping: 25
}}
```
- Spring-based animation for natural feel
- Scale and fade combination
- Custom stiffness and damping for smooth motion

## Interactive Elements

### 1. Correct Answer Feedback
- Green theme (`bg-green-50`, `text-green-700`)
- Celebratory emoji "🎉"
- Confetti animation effect
- Scaling entrance animation
- Success message: "Correct! Well done!"

### 2. Incorrect Answer Feedback
- Red theme (`bg-red-50`, `text-red-700`)
- Shake animation effect
- Displays correct answer
- Gentle border highlight (`border-red-200`)

### 3. Button States
- Hover Effect:
  - Color transition to coral (`hover:bg-[#E35A4B]`)
  - Text color change to white
  - Shadow enhancement
- Disabled State:
  - Reduced opacity (50%)
  - Not-allowed cursor
  - Maintains visual hierarchy

## Special Effects

### 1. Confetti Celebration
```typescript
confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
});
```
- Triggers on correct answers
- 100 particles for festive effect
- Wide spread for visual impact
- Originates from middle of screen

### 2. Transition Effects
- All color transitions: 300ms duration
- Easing function: ease-in-out
- Smooth shadow transitions
- Scale transitions on interaction

## Accessibility Features
- High contrast color combinations
- Clear visual feedback
- Adequate text sizing
- Disabled states properly handled
- Focus-visible states maintained

---

This design system creates an engaging, interactive quiz experience while maintaining professional aesthetics and usability. The animations are carefully timed to enhance the user experience without being distracting, and the color scheme creates a clear visual hierarchy while maintaining readability. 