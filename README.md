# Task Management System

A comprehensive Next.js frontend application for managing tasks, users, and team performance with AI-powered task detection and chat functionality.

## Features

### 🏠 **Home Page with AI Chat**

- Interactive chat interface using the `/conversations/chat` endpoint
- Real-time message history and thread management
- Beautiful chat UI with user and bot message differentiation

### 📋 **Task Management**

- **Tasks Listing Page** (`/tasks`) with comprehensive filtering:
  - Filter by status (pending, in progress, completed, cancelled)
  - Filter by priority (low, medium, high, urgent)
  - Filter by deadline ranges (before/after dates)
  - Filter by creation dates (before/after dates)
  - Pagination for large task lists
- **Task Creation** (`/tasks/new`) with:
  - Comprehensive form with validation
  - User assignment dropdown
  - Priority and status selection
  - Deadline and tags management
- **Task Editing** (`/tasks/[task_id]/edit`) with:
  - Pre-populated form with existing data
  - Real-time validation
  - Update functionality
- **Individual Task Page** (`/tasks/[task_id]`) with:
  - Detailed task information
  - Similar tasks recommendations
  - Quick action buttons
  - Task history tracking

### 👥 **User Management**

- **Users Listing Page** (`/users`) with filtering by:
  - Role, department, active status
  - Search functionality
- **User Creation** (`/users/new`) with:
  - Comprehensive user registration form
  - Role and department assignment
  - Email validation and required fields
- **User Editing** (`/users/[user_id]/edit`) with:
  - Pre-populated form with existing data
  - Update functionality with validation
- **Individual User Page** (`/users/[user_id]`) featuring:
  - User profile information
  - Performance analytics and metrics
  - Assigned and created tasks
  - Performance summary with ratings

### 🔍 **AI Task Detection**

- **Task Detection Page** (`/task-detection`) supporting:
  - Multiple source types (general text, email, WhatsApp)
  - Automatic task extraction with confidence scores
  - Priority and deadline estimation
  - One-click task creation from detected items

### 📊 **Analytics Dashboard**

- **Analytics Page** (`/analytics`) with:
  - Team performance overview
  - Performance trends over time
  - Performance patterns and insights
  - Quick statistics and metrics

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system and dark/light mode
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **UI Components**: Custom components with loading skeletons
- **Theme**: Responsive design with mobile-first approach

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page with chat
│   ├── tasks/             # Task management pages
│   ├── users/             # User management pages
│   ├── task-detection/    # AI task detection
│   ├── analytics/         # Analytics dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components
├── hooks/                # Custom React Query hooks
├── lib/                  # Utilities and configurations
│   ├── api.ts           # API client and types
│   ├── providers.tsx    # React Query provider
│   └── utils.ts         # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd task-management-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Integration

The application is designed to work with the provided API endpoints. Make sure your backend server is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

### Key API Features Used:

- **Authentication**: Bearer token-based auth (currently disabled as requested)
- **Tasks**: Full CRUD operations with filtering and search
- **Users**: User management with performance tracking
- **Conversations**: AI chat functionality with thread management
- **Analytics**: Performance metrics and trends
- **Task Detection**: AI-powered task extraction from text

## Features Implemented

### ✅ **Completed**

- [x] Next.js project setup with TypeScript and Tailwind CSS
- [x] API client service with comprehensive type definitions
- [x] React Query integration for state management
- [x] Reusable UI components (Button, Input, Select, Textarea)
- [x] Responsive layout with sidebar navigation
- [x] Home page with AI chat interface
- [x] Tasks listing page with advanced filtering
- [x] Individual task detail pages
- [x] Users listing page with search and filtering
- [x] Individual user pages with performance data
- [x] Task detection page with multiple source support
- [x] Analytics dashboard with team performance
- [x] Error handling and loading states
- [x] Optimistic updates for better UX

### 🔄 **In Progress / Future Enhancements**

- [ ] Task creation and editing forms
- [ ] User creation and editing forms
- [ ] Pagination for large datasets
- [ ] Advanced search functionality
- [ ] Export functionality
- [ ] Dark mode toggle
- [ ] Mobile-responsive optimizations
- [ ] Unit and integration tests

## Customization

### Styling

The application uses a custom design system with CSS variables. You can customize colors, spacing, and other design tokens in:

- `src/app/globals.css` - CSS variables and base styles
- `tailwind.config.ts` - Tailwind configuration

### API Configuration

Update the API base URL in `src/lib/api.ts` or set the `NEXT_PUBLIC_API_URL` environment variable.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team.
