-- Deploy ksl-notify:initial_schema to pg

BEGIN;

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Homebrew)
-- Dumped by pg_dump version 16.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    ksl_id text NOT NULL,
    title text,
    price numeric,
    location text
);


--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.listings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.listings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: search_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_listings (
    id integer NOT NULL,
    search_id integer NOT NULL,
    listing_id integer NOT NULL
);


--
-- Name: search_listings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.search_listings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.search_listings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.searches (
    id integer NOT NULL,
    url text
);


--
-- Name: searches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.searches ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.searches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: listings idx_listings_ksl_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT idx_listings_ksl_id_unique UNIQUE (ksl_id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: search_listings search_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_listings
    ADD CONSTRAINT search_listings_pkey PRIMARY KEY (id);


--
-- Name: searches searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT searches_pkey PRIMARY KEY (id);


--
-- Name: idx_search_listings_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_search_listings_unique ON public.search_listings USING btree (search_id, listing_id);


--
-- Name: search_listings search_listings_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_listings
    ADD CONSTRAINT search_listings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: search_listings search_listings_search_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_listings
    ADD CONSTRAINT search_listings_search_id_fkey FOREIGN KEY (search_id) REFERENCES public.searches(id);


--
-- PostgreSQL database dump complete
--



COMMIT;
