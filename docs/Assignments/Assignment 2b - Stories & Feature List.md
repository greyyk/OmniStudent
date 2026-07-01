## **OmniStudent Assignment 2b** 

## **User Stories and Feature List** 

## **Part 1: User Stories from Scenarios** 

## **Ruby – The Overwhelmed Working Student** 

- Work Schedule tracking: As an overwhelmed working student, I need to see weekly work schedules that frequently change so that OmniStudent can organize study sessions that affect my academic commitments. 

- Organizing Task Priority: As a full-time student, I want my task organized by due dates, time for completion and grade weight so that I can decide on my off time what takes precedents. 

- Study Session Planning: As a full-time student balancing a rigorous work schedule, I want to schedule study sessions to find available time to work on assignments with an urgent deadline. 

## **David – The Highly Involved Achiever** 

- Campus commitment tracking: As a highly involved student, I need to enter club meetings, volunteer events, tutoring sessions, and group project meetings so that OmniStudent can show how these activities affect my academic time. 

- Priority Task Ranking: As an achiever, I want my tasks ranked by due date, grade weight, and time to complete so that I can decide what deserves my attention first. 

- Grade Goal Planning: As a grade focused student, I need to be able to enter my current grades and target grades so that OmniStudent can recommend how much time I should spend preparing for each class. 

- Weekly Workload Overview: As a highly involved student, I want a weekly workload overview so that I can see when I am becoming overcommitted before the week gets too stressful. 

- Nonacademic Commitment Recommendation: As a student balancing academics and campus involvement, I want OmniStudent to suggest when I should move or reduce nonacademic commitments so that my grades do not suffer. 

## **Sarah – The Non-Traditional Commuter Student** 

- Emergency Blocking: As a student parent, I need to be able to block out time for an unexpected personal emergency so that the system knows I am unavailable for scheduled study sessions. 

- Automated Missed Event Tracking: As a student parent, I want the system to automatically mark my scheduled study sessions and assignments as missed during an emergency block so that I do not have to update them manually. 

- Intelligent Rescheduling: As a commuter student balancing work and family, I want the system to automatically schedule new study times during my lunch breaks and post-bedtime hours so that I can make up for missed study sessions. 

## **Part 2: Feature List Using the Input / Activation / Action / Output Model** 

## **Ruby – The Overwhelmed Working Student** 

## **Feature Name: Smart Schedule Sync** 

- **Input** : Ruby enters her class times, work shifts, and assignment deadlines into the app. 

- **Activation** : The system detects overlapping commitments, tight deadlines, or missing study blocks. 

- **Action** : The app automatically generates a balanced weekly plan that fits study time 

- around her work schedule and sends reminders. 

- **Output** : Ruby receives a clear, conflict free schedule that reduces stress and helps her stay on track. 

## **Feature Name: Quick Study Mode** 

- **Input** : Ruby selects a class she needs to study for but only has limited time available. 

- **Activation** : The system recognizes she is in “short time” mode (e.g., between work shifts or during a break). 

- **Action** : The app creates a short, focused study session using flashcards, 

- summaries, and key concepts. 

- **Output** : Ruby completes a fast, efficient study session that helps her retain essential material without feeling overwhelmed. 

## **David – The Highly Involved Achiever** 

## **Feature Name: Nonacademic Commitment Recommendation** 

- **Input** : Campus events, club meetings, volunteer activities, tutoring sessions, academic deadline dates, and workload scores. 

- **Activation** : The system detects academic overload, or the user asks for advice on what to move. 

- **Action** : OmniStudent compares academic priority with nonacademic commitments and suggests optional commitments could be moved or reduced. 

- **Output** : A recommendation message identifying low priority commitments that can be rescheduled to protect study time. 

## **Feature Name: Priority Task Board** 

- **Input** : Assignments, due dates, estimated completion time, grade weight, current grades, target grades, and scheduled events. 

- **Activation** : The user opens the task board or asks OmniStudent to prioritize the week. 

- **Action** : The system ranks tasks based on urgency, grade impact, and time required. 

- **Output** : A ranked task board showing high, medium, and low priority work with recommended next steps. 

## **Sarah – The Non-Traditional Commuter Student** 

## **Feature Name: Emergency Block Rescheduler** 

- **Input** : Sarah enters the start and end times of an unexpected personal emergency (like a sick child). 

- **Activation** : Triggered when Sarah creates a “personal emergency” event on her calendar. 

- **Action** : The system overrides all previously scheduled events during that block, marks the interrupted study sessions as missed, and intelligently scans her calendar for alternative free times (such as lunch breaks or post-bedtime hours). 

- **Output** : An updated calendar that reflects the emergency block, automatically places the rescheduled study sessions in new time slots, and generates updated reminders. 

## **Feature Name: Automated Status Modifier** 

- **Input** : An emergency block that overlaps existing scheduled study blocks or assignment work time. 

- **Activation** : Occurs simultaneously with the creation of an emergency block. 

- **Action** : The system automatically changes the status of any affected study session 

- to “missed” without requiring the user to manually click and edit each individual event. 

- **Output** : A refreshed view of her daily tasks showing which specific sessions were missed, providing a clear overview of what needs to be made up. 

