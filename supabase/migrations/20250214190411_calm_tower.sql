/*
  # Initial Schema for TipHub

  1. Tables
    - users
      - id (uuid, primary key)
      - username (text, unique)
      - full_name (text)
      - avatar_url (text)
      - bio (text)
      - created_at (timestamp)
    
    - categories
      - id (uuid, primary key)
      - name (text)
      - slug (text, unique)
      - description (text)
      - created_at (timestamp)
    
    - tips
      - id (uuid, primary key)
      - title (text)
      - content (text)
      - user_id (uuid, foreign key)
      - category_id (uuid, foreign key)
      - published (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - votes
      - id (uuid, primary key)
      - tip_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - value (integer)
      - created_at (timestamp)
    
    - comments
      - id (uuid, primary key)
      - tip_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - content (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE users (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create categories table
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create tips table
CREATE TABLE tips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_id uuid REFERENCES tips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  value integer CHECK (value = 1 OR value = -1),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tip_id, user_id)
);

-- Create comments table
CREATE TABLE comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_id uuid REFERENCES tips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Tips policies
CREATE POLICY "Anyone can view published tips"
  ON tips FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Users can view their own unpublished tips"
  ON tips FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can create tips"
  ON tips FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own tips"
  ON tips FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Votes policies
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote once per tip"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can change their vote"
  ON votes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Comments policies
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Cooking', 'cooking', 'Culinary tips and recipes'),
  ('Technology', 'technology', 'Tech tips and tricks'),
  ('Fitness', 'fitness', 'Exercise and wellness advice'),
  ('DIY', 'diy', 'Do-it-yourself projects and crafts'),
  ('Career', 'career', 'Professional development tips');