-- This script was generated by a beta version of the ERD tool in pgAdmin 4.
-- Please log an issue at https://redmine.postgresql.org/projects/pgadmin4/issues/new if you find any bugs, including reproduction steps.
BEGIN;


DROP TABLE IF EXISTS public.tickets;

CREATE TABLE IF NOT EXISTS public.tickets
(
    ticket_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    message character varying(200) COLLATE pg_catalog."default" NOT NULL,
    done boolean NOT NULL,
    create_at date DEFAULT CURRENT_DATE,
    user_id integer,
    CONSTRAINT tickets_pkey PRIMARY KEY (ticket_id)
);
END;