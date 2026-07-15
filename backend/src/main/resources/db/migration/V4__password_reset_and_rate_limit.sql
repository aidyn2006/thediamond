-- Password reset via emailed token
alter table users add column password_reset_token   varchar(64);
alter table users add column password_reset_expires timestamptz;
create index idx_users_reset_token on users (password_reset_token);

-- Rate limiting for email verification codes
alter table users add column verification_code_sent_at timestamptz;
alter table users add column verification_attempts     int not null default 0;
