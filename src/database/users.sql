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

CREATE TABLE public.tracker (
    "name" varchar(50) NOT NULL,
    latitude float8 NULL,
    longitude float8 NULL,
    id serial NOT NULL,
    CONSTRAINT tracker_pk PRIMARY KEY ("name")
);


INSERT INTO public.tracker
("name", latitude, longitude)
VALUES('tracker-01', 45.12345678, 35.12345678);



INSERT INTO public.tracker
("name", latitude, longitude)
VALUES('tracker-01', 45.11, 35.22)
on conflict (name)
do
	UPDATE set latitude=37.87654321, longitude=42.87654321;



CREATE TABLE public.archive (
	"name" varchar(50) NOT NULL,
	latitude float8 NULL,
	longitude float8 NULL,
	id serial NOT NULL,
	CONSTRAINT archive_pk PRIMARY KEY (id)
);
CREATE INDEX archive_name_idx ON public.archive ("name");


ALTER TABLE public.archive ADD date_time timestamp(0) NULL;
ALTER TABLE public.archive ADD date_time_z timestamptz(0) NULL;






CREATE TABLE public.regions (
	id serial NOT NULL,
	"name" varchar(50) NOT NULL,
	polygon varchar(1000) NOT NULL
);


ALTER TABLE public.tracker ADD CONSTRAINT tracker_unique UNIQUE ("name");

ALTER TABLE public.tracker ADD email varchar(100) NOT NULL DEFAULT 'm11_user1@mailinator.com';


ALTER TABLE public.regions ADD CONSTRAINT regions_pk PRIMARY KEY (id);





ALTER TABLE public.tracker ADD region_id int4 NULL;
ALTER TABLE public.tracker ADD CONSTRAINT tracker_fk FOREIGN KEY (region_id) REFERENCES public.regions(id);






ALTER TABLE public.tracker ADD date_time timestamp(0) NULL;
ALTER TABLE public.tracker ALTER COLUMN date_time TYPE timestamptz(0) USING date_time::timestamptz;
ALTER TABLE public.archive ADD tracker_id int4 NULL;


ALTER TABLE public.tracker DROP CONSTRAINT tracker_fk;
ALTER TABLE public.tracker ADD CONSTRAINT tracker_fk FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE SET NULL;
ALTER TABLE public.tracker ALTER COLUMN date_time TYPE timestamp(0) USING date_time::timestamp;
ALTER TABLE public.tracker ALTER COLUMN date_time TYPE timestamptz(0) USING date_time::timestamptz;
