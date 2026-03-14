-- Add updated_at to repos
ALTER TABLE repos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS tr_repos_updated_at ON repos;
CREATE TRIGGER tr_repos_updated_at
BEFORE UPDATE ON repos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
