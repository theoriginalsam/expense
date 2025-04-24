# Productivity Expense Tracker App

A comprehensive expense tracking application with AI-powered features for managing personal finances and productivity.

## Tech Stack
Frontend: React Native with TypeScript, Expo, and Expo Router
Backend/Database: Supabase
UI Framework: React Native Paper
AI Processing: DeepSeek

## 📁 Project Structure

pwd: '/Users/samir/Desktop/Budget/my-app'

```
my-app/
├── app/                      # Expo Router app directory
│   ├── (tabs)/              # Main app tabs
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── expenses.tsx     # Expenses view
│   │   ├── earnings.tsx     # Earnings view
│   │   └── settings.tsx     # App settings
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Shared components
│   │   ├── expenses/       # Expense-related components
│   │   ├── earnings/       # Earnings-related components
│   │   └── charts/         # Chart components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and external services
│   │   ├── supabase.ts     # Supabase client
│   │   └── ai.ts           # AI service integration
│   ├── store/              # State management
│   │   ├── expenses.ts
│   │   ├── earnings.ts
│   │   └── budget.ts
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions
│   └── constants/          # App constants
├── assets/                 # Static assets
│   ├── images/
│   └── fonts/
├── config/                 # Configuration files
├── tests/                  # Test files
└── docs/                   # Documentation
```

## 🗄️ Database Schema

### Expenses Table
```sql
expenses (
  id uuid primary key default uuid_generate_v4(),
  amount decimal(10,2) not null,
  category text not null,
  date date not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  tags text[],
  receipt_url text,
  is_recurring boolean default false,
  recurrence_pattern jsonb
)
```

### Earnings Table
```sql
earnings (
  id uuid primary key default uuid_generate_v4(),
  amount decimal(10,2) not null,
  source text not null,
  date date not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_recurring boolean default false,
  recurrence_pattern jsonb
)
```

### Budgets Table
```sql
budgets (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  limit_amount decimal(10,2) not null,
  month date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  rollover_amount decimal(10,2) default 0,
  notifications_enabled boolean default true
)
```

### Tasks Table
```sql
tasks (
  id uuid primary key default uuid_generate_v4(),
  task_description text not null,
  due_date timestamp with time zone,
  completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  priority text check (priority in ('low', 'medium', 'high')),
  category text,
  reminder_time timestamp with time zone
)
```

### Categories Table
```sql
categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text check (type in ('expense', 'earning')),
  icon text,
  color text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_default boolean default false
)
```

### Notifications Table
```sql
notifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  type text check (type in ('budget', 'task', 'system')),
  created_at timestamp with time zone default now(),
  read boolean default false,
  action_url text,
  metadata jsonb
)
```

### Database Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_earnings_date ON earnings(date);
CREATE INDEX idx_budgets_month ON budgets(month);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

## 📱 Core Features

### 🏠 Main Dashboard

The central hub for all financial activities, accessible via bottom tab bar:

- Quick-Add Expense button
- AI Chat Assistant
- My Earnings section
- Budget Tracker
- Categorized expense overview

### ➕ Quick-Add Expense

**Access**: Floating action button (`+`) on main dashboard

**Required Fields**:
- Amount
- Category (Food, Transport, Bills, etc.)
- Date
- Notes (optional)

**Action**: Saves to Expenses table

### 💬 AI Chat Assistant

Natural language interface for managing finances and tasks.

**Capabilities**:
- Add expenses/tasks
- Budget inquiries
- Financial goal management

**Example Commands**:
- "Add $50 to groceries"
- "What's my total spending this week?"
- "Set a reminder to pay my rent on the 1st"
- "What category did I spend the most on this month?"

**Features**:
- NLP Classification for:
  - Task Management
  - Expense Tracking
  - Budget Inquiry
- Intelligent database interaction

### 📊 Budget and Expense Tracker

**Monthly Overview**:
- Income vs. Expenses comparison
- Savings calculation (Earnings - Expenses)
- Category-wise visualization (Pie/Bar Charts)

**Budget Management**:
- Category-specific limits
- Overspending alerts
- Multiple view options:
  - Daily
  - Weekly
  - Monthly
  - Calendar integration
  - Category filters

### 💰 My Earnings

**Access**: Bottom menu tab

**Fields**:
- Amount
- Source (Job, Freelance, Gift, etc.)
- Date
- Notes (optional)

**Action**: Records to Earnings table

## 🔔 Additional Features

### Notifications
- Custom bill reminders
- Goal achievement alerts
- Budget limit warnings

### Data Export
- PDF/CSV report generation
- Monthly spending summaries

### UI/UX
- Dark/Light mode support
- Cross-device synchronization
- Secure cloud database integration

## 📋 Feature Summary

| Feature | Description |
|---------|-------------|
| AI Chat Assistant | Natural language interface for expense and task management |
| Quick Add Expense | Streamlined expense logging |
| Categorized Expenses | Organized view with filtering capabilities |
| Budget Tracker | Monthly goals with overspending alerts |
| Earnings Tracker | Comprehensive income management |
| Task Integration | AI-powered reminder and task system |

---

*This documentation is subject to updates as new features are implemented.*
