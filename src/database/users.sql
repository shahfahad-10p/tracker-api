CREATE TABLE public.users (
    id serial NOT NULL,
    "name" varchar(30) NULL,
    email varchar NULL,
    CONSTRAINT users_pk PRIMARY KEY (id)
);

INSERT INTO
    users (name, email)
VALUES
    ('Jerry', 'jerry@example.com'),
    ('George', 'george@example.com');