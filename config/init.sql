-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Categories Table
create table if not exists public.categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    type text not null check (type in ('expense', 'earning')),
    icon text,
    color text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    is_default boolean default false
);

-- Expenses Table
create table if not exists public.expenses (
    id uuid primary key default uuid_generate_v4(),
    amount decimal(10,2) not null check (amount > 0),
    category_id uuid references public.categories(id) on delete restrict,
    date date not null,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    tags text[],
    receipt_url text,
    is_recurring boolean default false,
    recurrence_pattern jsonb
);

-- Earnings Table
create table if not exists public.earnings (
    id uuid primary key default uuid_generate_v4(),
    amount decimal(10,2) not null check (amount > 0),
    source text not null,
    category_id uuid references public.categories(id) on delete restrict,
    date date not null,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    is_recurring boolean default false,
    recurrence_pattern jsonb
);

-- Budgets Table
create table if not exists public.budgets (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid references public.categories(id) on delete restrict,
    limit_amount decimal(10,2) not null check (limit_amount > 0),
    month date not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    rollover_amount decimal(10,2) default 0 check (rollover_amount >= 0),
    notifications_enabled boolean default true,
    constraint unique_category_month unique (category_id, month)
);

-- Tasks Table
create table if not exists public.tasks (
    id uuid primary key default uuid_generate_v4(),
    task_description text not null,
    due_date timestamp with time zone,
    completed boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    priority text check (priority in ('low', 'medium', 'high')),
    category_id uuid references public.categories(id) on delete set null,
    reminder_time timestamp with time zone
);

-- Notifications Table
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    message text not null,
    type text check (type in ('budget', 'task', 'system')),
    created_at timestamp with time zone default now(),
    read boolean default false,
    action_url text,
    metadata jsonb,
    related_id uuid,
    related_type text check (related_type in ('expense', 'task', 'budget', 'earning'))
);

-- Create indexes for better performance
create index if not exists idx_expenses_date on public.expenses(date);
create index if not exists idx_expenses_category on public.expenses(category_id);
create index if not exists idx_earnings_date on public.earnings(date);
create index if not exists idx_earnings_category on public.earnings(category_id);
create index if not exists idx_budgets_month on public.budgets(month);
create index if not exists idx_budgets_category on public.budgets(category_id);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_category on public.tasks(category_id);
create index if not exists idx_notifications_created on public.notifications(created_at);
create index if not exists idx_notifications_read on public.notifications(read);

-- Insert default categories
insert into public.categories (name, type, icon, color, is_default)
values
    ('Groceries', 'expense', 'shopping-cart', '#4CAF50', true),
    ('Transportation', 'expense', 'directions-car', '#2196F3', true),
    ('Utilities', 'expense', 'lightbulb', '#FFC107', true),
    ('Entertainment', 'expense', 'movie', '#9C27B0', true),
    ('Dining Out', 'expense', 'restaurant', '#F44336', true),
    ('Healthcare', 'expense', 'medical-services', '#00BCD4', true),
    ('Salary', 'earning', 'work', '#4CAF50', true),
    ('Freelance', 'earning', 'laptop', '#2196F3', true),
    ('Investments', 'earning', 'trending-up', '#FFC107', true),
    ('Other Income', 'earning', 'attach-money', '#9C27B0', true)
on conflict do nothing; 