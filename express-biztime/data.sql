-- filepath: /c:/Users/Joshl/express_biztime/express-biztime/data.sql

\c biztime

DROP TABLE IF EXISTS companies_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

-- Create the companies table
CREATE TABLE companies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- Create the invoices table
CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code TEXT NOT NULL REFERENCES companies(code) ON DELETE CASCADE,
    amt FLOAT NOT NULL,
    paid BOOLEAN DEFAULT false NOT NULL,
    add_date DATE DEFAULT CURRENT_DATE NOT NULL,
    paid_date DATE,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

-- Create the industries table
CREATE TABLE industries (
    code TEXT PRIMARY KEY,
    industry TEXT NOT NULL
);

-- Create the companies_industries table to establish a many-to-many relationship
CREATE TABLE companies_industries (
    company_code TEXT REFERENCES companies(code) ON DELETE CASCADE,
    industry_code TEXT REFERENCES industries(code) ON DELETE CASCADE,
    PRIMARY KEY (company_code, industry_code)
);

-- Insert sample data into companies
INSERT INTO companies (code, name, description) VALUES
('apple', 'Apple Computer', 'Maker of OSX.'),
('ibm', 'IBM', 'Big blue.');

-- Insert sample data into invoices
INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES
('apple', 100, false, null),
('apple', 200, false, null),
('apple', 300, true, '2018-01-01'),
('ibm', 400, false, null);

-- Insert sample data into industries
INSERT INTO industries (code, industry) VALUES
('acct', 'Accounting'),
('tech', 'Technology'),
('fin', 'Finance');

-- Insert sample data into companies_industries
INSERT INTO companies_industries (company_code, industry_code) VALUES
('apple', 'tech'),
('ibm', 'tech'),
('ibm', 'acct');
