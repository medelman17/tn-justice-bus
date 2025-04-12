-- Tennessee Justice Bus Client Screening Database Schema
-- This schema defines the core tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;

-- Enable Row Level Security
ALTER DATABASE current_database() SET "app.jwt_secret" TO 'your-jwt-secret';

-- User accounts and profiles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  preferred_contact_method VARCHAR(10) CHECK (preferred_contact_method IN ('email', 'phone', 'sms')),
  preferred_language VARCHAR(50) DEFAULT 'english',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Legal cases/intake information
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  legal_category VARCHAR(100) NOT NULL,
  legal_subcategory VARCHAR(100),
  priority VARCHAR(20) CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  conflict_check_completed BOOLEAN DEFAULT FALSE,
  has_deadline BOOLEAN DEFAULT FALSE,
  deadline_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Justice Bus visit locations and schedules
CREATE TABLE justice_bus_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  visit_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_slots INTEGER NOT NULL,
  booked_slots INTEGER DEFAULT 0,
  legal_services_offered TEXT[],
  additional_notes TEXT,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments for Justice Bus consultations
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  justice_bus_visit_id UUID NOT NULL REFERENCES justice_bus_visits(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, justice_bus_visit_id)
);

-- Client document uploads
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  description TEXT,
  blob_url TEXT NOT NULL,
  blob_key TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intake questions answers (for storing response to guided interview)
CREATE TABLE intake_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL,
  question_text TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session management for offline synchronization
CREATE TABLE client_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL,
  expired BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_visit_id ON appointments(justice_bus_visit_id);
CREATE INDEX idx_intake_responses_case_id ON intake_responses(case_id);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_responses ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY users_self_access ON users 
  FOR ALL 
  TO authenticated 
  USING (id = auth.uid());

-- Cases policies
CREATE POLICY cases_self_access ON cases 
  FOR ALL 
  TO authenticated 
  USING (user_id = auth.uid());

-- Documents policies
CREATE POLICY documents_self_access ON documents 
  FOR ALL 
  TO authenticated 
  USING (user_id = auth.uid());

-- Appointments policies
CREATE POLICY appointments_self_access ON appointments 
  FOR ALL 
  TO authenticated 
  USING (user_id = auth.uid());

-- Intake responses policies
CREATE POLICY intake_responses_self_access ON intake_responses 
  FOR ALL 
  TO authenticated 
  USING (
    case_id IN (
      SELECT id FROM cases WHERE user_id = auth.uid()
    )
  );

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_cases_timestamp BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_justice_bus_visits_timestamp BEFORE UPDATE ON justice_bus_visits FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_appointments_timestamp BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_documents_timestamp BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_intake_responses_timestamp BEFORE UPDATE ON intake_responses FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_client_sessions_timestamp BEFORE UPDATE ON client_sessions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
