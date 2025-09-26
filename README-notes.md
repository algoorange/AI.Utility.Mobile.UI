/*
You are building a modern mobile application in React Native (Expo preferred).  
The app is for an **Electricity & Water Utility Company** targeting end-users.  

✅ Core Requirements:
- Dashboard showing outstanding bill, due date, and quick pay button.
- Bill history screen (with search, filter, PDF download).
- Bill payment screen with multiple methods (credit card, PayNow, PayPal, Auto-debit).
- Bill amount dispute:
   - User selects a disputed bill.
   - Upload a supporting photo OR capture photo using camera.
   - Add feedback/comments.
   - Submit dispute for review.
- Meter reading:
   1. Upload a meter photo.
   2. Capture photo directly using the camera.
   3. Auto-extract reading using OCR (show extracted text for user confirmation).
- Consumption tracking with graphs (monthly/weekly, electricity vs water).
- Customer support:
   - Submit complaints or queries.
   - Track complaint status.
   - Option to chat/call.
- User profile:
   - Enable biometric login (FaceID/TouchID).
   - Payment method management.


🎨 Design & Theming:
- Use **React Native Paper** or **NativeBase** for Material Design 3 components.
- Use **React Navigation (stack + bottom tab)** for navigation flow:
   - Tabs: Dashboard | Bills | Meter | Usage | Support
- Use **Victory Native** or **Recharts** for graphs.
- Theme: Modern, minimal, professional (utility brand style).
   - Primary color: #0066CC (electric blue).
   - Secondary color: #00A86B (eco green).
   - Accent: #FFC107 (warning/due reminder).
   - Background: #F5F7FA (light), #121212 (dark).
- Rounded cards, drop shadows, and responsive layout for all devices.

🔧 Technical Notes:
- Use Expo Camera for capturing meter photos.
- Use React Native File System for uploads.
- Use AsyncStorage or SecureStore for local user data.
- Follow TypeScript for type safety.
- Keep all screens in `/screens` folder, reusable components in `/components`.
- Use Context API or Zustand for state management.
- Dummy mock data for bills, payments, and usage initially.

👉 Task for Copilot:
1. Scaffold the **React Native project** with Expo + TypeScript.
2. Set up bottom tab navigation with 5 tabs: Dashboard, Bills, Meter, Usage, Support.
3. Create placeholder screens with UI components based on the above requirements.
4. Apply theming (light/dark toggle) and reusable header/footer.
5. Add sample graphs for consumption trends and cards for bills.

Now, generate the code for the initial project structure and UI screens.
*/

<!-- Copilot: Implement the above core requirements as a React Native (Expo + TypeScript) mobile app.
- Scaffold the project structure.
- Set up bottom tab navigation: Dashboard, Bills, Dispute, Meter, Usage, Support, Profile.
- Create placeholder screens with proper UI components for each requirement.
- For Dispute screen: allow photo upload OR capture via camera, add feedback text, and a submit button.
- Use React Native Paper for theming (Material Design 3) with light/dark mode support.
- Add sample data for bills, payments, and usage.
-->
