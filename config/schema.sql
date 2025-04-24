-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Categories Table
create table if not exists categories (
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
create table if not exists expenses (
    id uuid primary key default uuid_generate_v4(),
    amount decimal(10,2) not null check (amount > 0),
    category_id uuid references categories(id) on delete restrict,
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
create table if not exists earnings (
    id uuid primary key default uuid_generate_v4(),
    amount decimal(10,2) not null check (amount > 0),
    source text not null,
    category_id uuid references categories(id) on delete restrict,
    date date not null,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    is_recurring boolean default false,
    recurrence_pattern jsonb
);

-- Budgets Table
create table if not exists budgets (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid references categories(id) on delete restrict,
    limit_amount decimal(10,2) not null check (limit_amount > 0),
    month date not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    rollover_amount decimal(10,2) default 0 check (rollover_amount >= 0),
    notifications_enabled boolean default true,
    constraint unique_category_month unique (category_id, month)
);

-- Tasks Table
create table if not exists tasks (
    id uuid primary key default uuid_generate_v4(),
    task_description text not null,
    due_date timestamp with time zone,
    completed boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    priority text check (priority in ('low', 'medium', 'high')),
    category_id uuid references categories(id) on delete set null,
    reminder_time timestamp with time zone
);

-- Notifications Table
create table if not exists notifications (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    message text not null,
    type text check (type in ('budget', 'task', 'system')),
    created_at timestamp with time zone default now(),
    read boolean default false,
    action_url text,
    metadata jsonb,
    related_id uuid,  -- Can reference any table (expense, task, budget)
    related_type text check (related_type in ('expense', 'task', 'budget', 'earning'))
);

-- Create indexes for better performance
create index if not exists idx_expenses_date on expenses(date);
create index if not exists idx_expenses_category on expenses(category_id);
create index if not exists idx_earnings_date on earnings(date);
create index if not exists idx_earnings_category on earnings(category_id);
create index if not exists idx_budgets_month on budgets(month);
create index if not exists idx_budgets_category on budgets(category_id);
create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_tasks_category on tasks(category_id);
create index if not exists idx_notifications_created on notifications(created_at);
create index if not exists idx_notifications_read on notifications(read);

-- Create trigger function for updating updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;

-- Create triggers for all tables
create trigger update_categories_updated_at
    before update on categories
    for each row
    execute function update_updated_at_column();

create trigger update_expenses_updated_at
    before update on expenses
    for each row
    execute function update_updated_at_column();

create trigger update_earnings_updated_at
    before update on earnings
    for each row
    execute function update_updated_at_column();

create trigger update_budgets_updated_at
    before update on budgets
    for each row
    execute function update_updated_at_column();

create trigger update_tasks_updated_at
    before update on tasks
    for each row
    execute function update_updated_at_column();

-- Insert default categories
insert into categories (name, type, icon, color, is_default)
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