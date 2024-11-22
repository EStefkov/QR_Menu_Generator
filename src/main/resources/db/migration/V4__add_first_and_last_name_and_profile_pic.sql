ALTER TABLE account ADD COLUMN first_name VARCHAR(255);
ALTER TABLE account ADD COLUMN last_name VARCHAR(255);
ALTER TABLE account ADD COLUMN profile_picture VARCHAR(255) DEFAULT 'default-profile.png';
