--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

-- Started on 2025-02-17 22:56:15

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

--
-- TOC entry 238 (class 1255 OID 16523)
-- Name: add_monitor_log_to_history(integer, text); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.add_monitor_log_to_history(IN p_server_id integer, IN p_status text DEFAULT 'Success'::text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert the monitoring status into the monitor_history table
    INSERT INTO monitor_history (server_id, status)
    VALUES (p_server_id, p_status);
END;
$$;


ALTER PROCEDURE public.add_monitor_log_to_history(IN p_server_id integer, IN p_status text) OWNER TO postgres;

--
-- TOC entry 248 (class 1255 OID 16591)
-- Name: add_server_to_list(text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_server_to_list(in_server_name text, in_server_url text, in_username text DEFAULT NULL::text, in_password text DEFAULT NULL::text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_server_id INT;
BEGIN
    -- Insert the new server into the servers_list table and return the server_id
    INSERT INTO servers_list (server_name, server_url, username,password,current_status)
    VALUES (
	in_server_name,
	in_server_url,
	COALESCE(in_username, null),
	COALESCE(in_password, null),
	'Healthy')  -- Default to 'Healthy'
    RETURNING server_id INTO new_server_id;
    
    -- Return the new server_id
    RETURN new_server_id;
END;
$$;


ALTER FUNCTION public.add_server_to_list(in_server_name text, in_server_url text, in_username text, in_password text) OWNER TO postgres;

--
-- TOC entry 239 (class 1255 OID 16407)
-- Name: create_monitor_history_table(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.create_monitor_history_table()
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'monitor_history') THEN
        -- Create the monitor_history table
        CREATE TABLE monitor_history (
            monitor_id SERIAL PRIMARY KEY,
            server_id INTEGER REFERENCES servers_list(server_id) ON DELETE CASCADE,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL DEFAULT 'Success' CHECK (status IN ('Success', 'Failed'))
        );
    END IF;
END;
$$;


ALTER PROCEDURE public.create_monitor_history_table() OWNER TO postgres;

--
-- TOC entry 240 (class 1255 OID 16564)
-- Name: create_monitor_success_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_monitor_success_trigger() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'monitor_success_trigger'
    ) THEN
        EXECUTE '
            CREATE TRIGGER monitor_success_trigger 
            AFTER INSERT ON monitor_history
            FOR EACH ROW 
            EXECUTE FUNCTION update_server_status_on_success()
        ';
    END IF;
END $$;


ALTER FUNCTION public.create_monitor_success_trigger() OWNER TO postgres;

--
-- TOC entry 241 (class 1255 OID 16565)
-- Name: create_monitor_unsuccessful_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_monitor_unsuccessful_trigger() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'monitor_unsuccessful_trigger'
    ) THEN
        EXECUTE '
            CREATE TRIGGER monitor_unsuccessful_trigger 
            AFTER INSERT ON monitor_history
            FOR EACH ROW 
            EXECUTE FUNCTION update_server_status_on_unsuccessful()
        ';
    END IF;
END $$;


ALTER FUNCTION public.create_monitor_unsuccessful_trigger() OWNER TO postgres;

--
-- TOC entry 242 (class 1255 OID 16566)
-- Name: create_notify_on_unhealthy_status_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_notify_on_unhealthy_status_trigger() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'notify_on_unhealthy_status_trigger'
    ) THEN
        EXECUTE '
            CREATE TRIGGER notify_on_unhealthy_status_trigger
            AFTER UPDATE ON servers_list
            FOR EACH ROW 
            WHEN (NEW.current_status = ''Unhealthy'')
            EXECUTE FUNCTION notify_on_unhealthy_status()
        ';
    END IF;
END $$;


ALTER FUNCTION public.create_notify_on_unhealthy_status_trigger() OWNER TO postgres;

--
-- TOC entry 236 (class 1255 OID 16518)
-- Name: create_protocols_list_table(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.create_protocols_list_table()
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'protocols_list') THEN
        CREATE TABLE protocols_list (
            protocol_id SERIAL PRIMARY KEY,
            protocol_name TEXT UNIQUE NOT NULL CHECK (protocol_name = UPPER(protocol_name))
        );
    END IF;

    -- Insert predefined protocols if they don't already exist
    INSERT INTO protocols_list (protocol_name)
    SELECT unnest(ARRAY['HTTP', 'HTTPS', 'FTP', 'SSH'])
    WHERE NOT EXISTS (
        SELECT 1 FROM protocols_list WHERE protocol_name IN ('HTTP', 'HTTPS', 'FTP', 'SSH')
    );
END;
$$;


ALTER PROCEDURE public.create_protocols_list_table() OWNER TO postgres;

--
-- TOC entry 247 (class 1255 OID 16593)
-- Name: create_servers_list_table(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.create_servers_list_table()
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'servers_list') THEN
        CREATE TABLE servers_list (
            server_id SERIAL PRIMARY KEY,
            current_status TEXT NOT NULL DEFAULT 'Healthy' CHECK (current_status IN ('Healthy', 'Unhealthy')), 
            server_name TEXT NOT NULL UNIQUE,
			server_url TEXT NOT NULL,
     		username TEXT NULL DEFAULT NULL,
			password TEXT NULL DEFAULT NULL,
			last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP			
        );
    END IF;
END;
$$;


ALTER PROCEDURE public.create_servers_list_table() OWNER TO postgres;

--
-- TOC entry 222 (class 1255 OID 16404)
-- Name: delete_server_by_id(integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.delete_server_by_id(IN p_server_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if the server exists before deleting
    IF EXISTS (SELECT 1 FROM servers_list WHERE server_id = p_server_id) THEN
        DELETE FROM servers_list WHERE server_id = p_server_id;
    ELSE
        RAISE EXCEPTION 'Server with ID % does not exist.', p_server_id
            USING ERRCODE = 'no_data_found';
    END IF;
END;
$$;


ALTER PROCEDURE public.delete_server_by_id(IN p_server_id integer) OWNER TO postgres;

--
-- TOC entry 221 (class 1255 OID 16403)
-- Name: delete_server_by_name(text); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.delete_server_by_name(IN p_server_name text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if the server exists before deleting
    IF EXISTS (SELECT 1 FROM servers_list WHERE server_name = p_server_name) THEN
        DELETE FROM servers_list WHERE server_name = p_server_name;
    ELSE
        RAISE EXCEPTION 'Server with name "%" does not exist.', p_server_name
            USING ERRCODE = 'no_data_found';
    END IF;
END;
$$;


ALTER PROCEDURE public.delete_server_by_name(IN p_server_name text) OWNER TO postgres;

--
-- TOC entry 246 (class 1255 OID 16592)
-- Name: get_all_servers_list(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_servers_list() RETURNS TABLE(server_id integer, server_name text, server_url text, current_status text, username text, password text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Perform the JOIN between servers_list and protocol_list to get protocol_name
    RETURN QUERY
    SELECT s.server_id, s.server_name,s.server_url,s.current_status,s.username,s.password
    FROM servers_list s
	ORDER BY s.server_id ASC;  -- Order by server_id in ascending order
END;
$$;


ALTER FUNCTION public.get_all_servers_list() OWNER TO postgres;

--
-- TOC entry 237 (class 1255 OID 16522)
-- Name: get_monitor_history_by_server(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_monitor_history_by_server(p_server_id integer) RETURNS TABLE(id integer, server_id integer, monitor_timestamp timestamp without time zone, status text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Return monitor history for the given server_id
    RETURN QUERY 
    SELECT mh.monitor_id, mh.server_id, mh."timestamp" AS monitor_timestamp, mh.status
    FROM monitor_history mh
    WHERE mh.server_id = p_server_id;
END;
$$;


ALTER FUNCTION public.get_monitor_history_by_server(p_server_id integer) OWNER TO postgres;

--
-- TOC entry 235 (class 1255 OID 16505)
-- Name: get_protocol_id_by_name(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_protocol_id_by_name(in_protocol_name text) RETURNS TABLE(result integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Query to get the protocol_id from in_protocol_name
    RETURN QUERY
    SELECT protocol_id
    FROM protocols_list
    WHERE UPPER(protocols_list.protocol_name) = UPPER(in_protocol_name)  -- Use the new input parameter
    LIMIT 1;
END;
$$;


ALTER FUNCTION public.get_protocol_id_by_name(in_protocol_name text) OWNER TO postgres;

--
-- TOC entry 245 (class 1255 OID 16594)
-- Name: get_server_by_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_server_by_id(p_server_id integer) RETURNS TABLE(id integer, server_name text, server_url text, last_updated timestamp without time zone, current_status text, username text, password text, history jsonb)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure the server exists before returning data
    IF NOT EXISTS (SELECT 1 FROM servers_list WHERE server_id = p_server_id) THEN
        RAISE EXCEPTION 'Server with ID % does not exist.', p_server_id
        USING ERRCODE = 'P0002';  -- Error code for "no_data_found"
    END IF;

    -- Return server details along with the last 10 monitor history records as JSON
    RETURN QUERY 
    SELECT 
        s.server_id AS id,  
        s.server_name, 
		s.server_url,
        s.last_updated,
        s.current_status,
		s.username,
		s.password,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'timestamp', mh.timestamp,
                    'status', mh.status
                ) ORDER BY mh.timestamp DESC  -- ✅ ORDER BY moved inside jsonb_agg()
            )
            FROM monitor_history mh  
            WHERE mh.server_id = s.server_id  
            LIMIT 10  -- ✅ LIMIT still applies
        ) AS history
    FROM servers_list s
    WHERE s.server_id = p_server_id;
END;
$$;


ALTER FUNCTION public.get_server_by_id(p_server_id integer) OWNER TO postgres;

--
-- TOC entry 234 (class 1255 OID 16412)
-- Name: is_server_healthy(integer, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_server_healthy(p_server_id integer, p_timestamp timestamp without time zone) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    last_status TEXT;
BEGIN
    -- Get the most recent monitor status for the server before or at the given timestamp
    SELECT status
    INTO last_status
    FROM monitor_history
    WHERE server_id = p_server_id
    AND "timestamp" BETWEEN (p_timestamp::timestamp - INTERVAL '1 minute') AND (p_timestamp::timestamp + INTERVAL '1 minute')
    ORDER BY "timestamp" DESC
    LIMIT 1;

    -- If no record is found, the server is considered unhealthy by default
    IF last_status IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Return true if the last status is 'Healthy', otherwise false
    RETURN last_status = 'Success';
END;
$$;


ALTER FUNCTION public.is_server_healthy(p_server_id integer, p_timestamp timestamp without time zone) OWNER TO postgres;

--
-- TOC entry 243 (class 1255 OID 16638)
-- Name: notify_on_unhealthy_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_on_unhealthy_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
          BEGIN
              -- Check if the current_status is 'Unhealthy'
              IF NEW.current_status = 'Unhealthy' THEN
                  -- Send notification when server status is 'Unhealthy'
                  PERFORM pg_notify('server_status_change', 'Server ' || NEW.server_id || ' is now Unhealthy.');
              END IF;
              RETURN NEW;
          END;
          $$;


ALTER FUNCTION public.notify_on_unhealthy_status() OWNER TO postgres;

--
-- TOC entry 244 (class 1255 OID 16581)
-- Name: update_server(integer, text, text, integer, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_server(p_server_id integer, p_server_name text DEFAULT NULL::text, p_server_url text DEFAULT NULL::text, p_port integer DEFAULT NULL::integer, p_protocol_id integer DEFAULT NULL::integer, p_current_status text DEFAULT NULL::text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    updated_server_id INTEGER;
BEGIN
	 -- Check if server_id exists
    IF NOT EXISTS (SELECT 1 FROM servers_list WHERE server_id = p_server_id) THEN
        RAISE EXCEPTION 'Server with ID % does not exist.', p_server_id
        USING ERRCODE = 'P0002';  -- Custom error code
    END IF;
    -- Update the server and capture the updated server_id
    UPDATE servers_list
    SET 
     
        server_name = COALESCE(p_server_name, server_name),
        server_url=COALESCE(p_server_url, server_url),
		port = COALESCE(p_port, port),
        protocol_id = COALESCE(p_protocol_id, protocol_id),
		current_status = COALESCE(p_current_status, current_status)
    WHERE server_id = p_server_id
    RETURNING server_id INTO updated_server_id;

    -- Return the updated server_id
    RETURN updated_server_id;
END;
$$;


ALTER FUNCTION public.update_server(p_server_id integer, p_server_name text, p_server_url text, p_port integer, p_protocol_id integer, p_current_status text) OWNER TO postgres;

--
-- TOC entry 249 (class 1255 OID 16639)
-- Name: update_server_status_on_success(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_server_status_on_success() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
          DECLARE
          success_count INT;
          BEGIN
              -- Count the last 5 records where status is 'Success'
              SELECT COUNT(*) INTO success_count
              FROM (
                  SELECT mh.status
                  FROM monitor_history mh
                  WHERE mh.server_id = NEW.server_id
                  ORDER BY mh.timestamp DESC
                  LIMIT 5
              ) AS last_five
              WHERE last_five.status = 'Success';

              -- If all 5 records are 'Success', update servers_list
              IF success_count = 5 THEN
                  UPDATE servers_list sl
                  SET current_status = 'Healthy', last_updated = CURRENT_TIMESTAMP
                  WHERE sl.server_id = NEW.server_id;
              END IF;

              RETURN NEW;
          END;
          $$;


ALTER FUNCTION public.update_server_status_on_success() OWNER TO postgres;

--
-- TOC entry 250 (class 1255 OID 16640)
-- Name: update_server_status_on_unsuccessful(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_server_status_on_unsuccessful() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
          DECLARE
              failed_count INT;
          BEGIN
              -- Count the last 3 records where status is 'Failed'
              SELECT COUNT(*) INTO failed_count
              FROM (
                  SELECT mh.status
                  FROM monitor_history mh
                  WHERE mh.server_id = NEW.server_id
                  ORDER BY mh.timestamp DESC
                  LIMIT 3
              ) AS last_three
              WHERE last_three.status = 'Failed';

              -- If all 3 records are 'Failed', update servers_list
              IF failed_count = 3 THEN
                  UPDATE servers_list sl
                  SET current_status = 'Unhealthy', last_updated = CURRENT_TIMESTAMP
                  WHERE sl.server_id = NEW.server_id;
              END IF;
              RETURN NEW;
          END;
          $$;


ALTER FUNCTION public.update_server_status_on_unsuccessful() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16622)
-- Name: monitor_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monitor_history (
    monitor_id integer NOT NULL,
    server_id integer,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status text DEFAULT 'Success'::text NOT NULL,
    CONSTRAINT monitor_history_status_check CHECK ((status = ANY (ARRAY['Success'::text, 'Failed'::text])))
);


ALTER TABLE public.monitor_history OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16621)
-- Name: monitor_history_monitor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monitor_history_monitor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monitor_history_monitor_id_seq OWNER TO postgres;

--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 219
-- Name: monitor_history_monitor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monitor_history_monitor_id_seq OWNED BY public.monitor_history.monitor_id;


--
-- TOC entry 216 (class 1259 OID 16596)
-- Name: protocols_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocols_list (
    protocol_id integer NOT NULL,
    protocol_name text NOT NULL,
    CONSTRAINT protocols_list_protocol_name_check CHECK ((protocol_name = upper(protocol_name)))
);


ALTER TABLE public.protocols_list OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16595)
-- Name: protocols_list_protocol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.protocols_list_protocol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.protocols_list_protocol_id_seq OWNER TO postgres;

--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 215
-- Name: protocols_list_protocol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.protocols_list_protocol_id_seq OWNED BY public.protocols_list.protocol_id;


--
-- TOC entry 218 (class 1259 OID 16608)
-- Name: servers_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servers_list (
    server_id integer NOT NULL,
    current_status text DEFAULT 'Healthy'::text NOT NULL,
    server_name text NOT NULL,
    server_url text NOT NULL,
    username text,
    password text,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT servers_list_current_status_check CHECK ((current_status = ANY (ARRAY['Healthy'::text, 'Unhealthy'::text])))
);


ALTER TABLE public.servers_list OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16607)
-- Name: servers_list_server_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servers_list_server_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servers_list_server_id_seq OWNER TO postgres;

--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 217
-- Name: servers_list_server_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servers_list_server_id_seq OWNED BY public.servers_list.server_id;


--
-- TOC entry 4768 (class 2604 OID 16625)
-- Name: monitor_history monitor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_history ALTER COLUMN monitor_id SET DEFAULT nextval('public.monitor_history_monitor_id_seq'::regclass);


--
-- TOC entry 4764 (class 2604 OID 16599)
-- Name: protocols_list protocol_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocols_list ALTER COLUMN protocol_id SET DEFAULT nextval('public.protocols_list_protocol_id_seq'::regclass);


--
-- TOC entry 4765 (class 2604 OID 16611)
-- Name: servers_list server_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servers_list ALTER COLUMN server_id SET DEFAULT nextval('public.servers_list_server_id_seq'::regclass);


--
-- TOC entry 4936 (class 0 OID 16622)
-- Dependencies: 220
-- Data for Name: monitor_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monitor_history (monitor_id, server_id, "timestamp", status) FROM stdin;
118	4	2025-02-17 21:02:00.082227	Failed
119	4	2025-02-17 21:04:05.466231	Failed
120	4	2025-02-17 21:05:05.482137	Failed
121	4	2025-02-17 21:08:32.335591	Failed
122	4	2025-02-17 21:12:49.753232	Failed
6	4	2025-02-17 20:28:38.574259	Failed
123	4	2025-02-17 21:16:40.910296	Failed
124	4	2025-02-17 21:19:56.331704	Failed
125	4	2025-02-17 21:20:56.316294	Failed
10	4	2025-02-17 20:29:38.568743	Failed
126	4	2025-02-17 21:21:56.344347	Failed
127	4	2025-02-17 21:23:14.512899	Failed
128	4	2025-02-17 21:25:58.793739	Failed
14	4	2025-02-17 20:30:38.58101	Failed
129	4	2025-02-17 21:26:58.798176	Failed
130	4	2025-02-17 21:28:42.130168	Failed
131	4	2025-02-17 21:31:40.10275	Failed
19	4	2025-02-17 20:31:38.702235	Failed
132	8	2025-02-17 21:31:40.114751	Failed
133	4	2025-02-17 21:32:40.224418	Failed
134	8	2025-02-17 21:32:40.228953	Failed
24	4	2025-02-17 20:35:39.149795	Failed
135	4	2025-02-17 21:33:40.085816	Failed
136	8	2025-02-17 21:33:40.090485	Failed
137	4	2025-02-17 21:35:19.014847	Failed
29	4	2025-02-17 20:37:30.919352	Failed
138	8	2025-02-17 21:35:19.020024	Failed
139	4	2025-02-17 21:37:47.759375	Failed
140	8	2025-02-17 21:37:59.128108	Failed
34	4	2025-02-17 20:40:37.086486	Failed
141	4	2025-02-17 21:38:47.898989	Failed
142	8	2025-02-17 21:38:59.191365	Failed
143	4	2025-02-17 21:40:15.02257	Failed
39	4	2025-02-17 20:42:41.576075	Failed
144	8	2025-02-17 21:40:26.328218	Failed
145	4	2025-02-17 21:41:15.133358	Failed
146	8	2025-02-17 21:41:26.468451	Failed
44	4	2025-02-17 20:43:41.568479	Failed
147	4	2025-02-17 21:42:15.26899	Failed
148	8	2025-02-17 21:42:26.557987	Failed
149	4	2025-02-17 21:43:15.063859	Failed
49	4	2025-02-17 20:44:41.549537	Failed
150	8	2025-02-17 21:43:26.332748	Failed
151	4	2025-02-17 21:59:15.792105	Failed
152	8	2025-02-17 21:59:17.955644	Success
54	4	2025-02-17 20:45:41.559886	Failed
153	4	2025-02-17 22:00:15.804121	Failed
154	8	2025-02-17 22:00:17.706904	Success
155	4	2025-02-17 22:01:15.840191	Failed
59	4	2025-02-17 20:46:41.559157	Failed
156	8	2025-02-17 22:01:17.79431	Success
157	4	2025-02-17 22:02:15.843642	Failed
158	8	2025-02-17 22:02:17.801588	Success
64	4	2025-02-17 20:47:41.569873	Failed
159	4	2025-02-17 22:03:15.841699	Failed
160	8	2025-02-17 22:03:17.743899	Success
161	4	2025-02-17 22:04:15.89445	Failed
69	4	2025-02-17 20:48:41.577986	Failed
162	8	2025-02-17 22:04:17.801747	Success
163	4	2025-02-17 22:05:15.863303	Failed
164	8	2025-02-17 22:05:17.850222	Success
74	4	2025-02-17 20:49:41.609655	Failed
165	4	2025-02-17 22:06:49.497713	Failed
166	8	2025-02-17 22:06:52.215676	Failed
167	4	2025-02-17 22:08:31.185546	Failed
79	4	2025-02-17 20:50:41.5853	Failed
168	8	2025-02-17 22:08:33.907529	Failed
169	4	2025-02-17 22:14:41.770431	Failed
170	8	2025-02-17 22:14:41.775182	Failed
84	4	2025-02-17 20:51:41.593468	Failed
171	4	2025-02-17 22:19:13.973119	Failed
172	8	2025-02-17 22:19:13.986021	Failed
173	4	2025-02-17 22:22:03.962586	Failed
89	4	2025-02-17 20:52:41.61744	Failed
174	8	2025-02-17 22:22:03.967438	Failed
175	4	2025-02-17 22:26:16.736297	Success
176	8	2025-02-17 22:26:18.640982	Success
94	4	2025-02-17 20:53:41.609746	Failed
177	4	2025-02-17 22:27:16.75504	Success
178	8	2025-02-17 22:27:18.655186	Success
179	4	2025-02-17 22:36:06.086267	Success
99	4	2025-02-17 20:54:41.638389	Failed
180	8	2025-02-17 22:36:08.015191	Success
181	4	2025-02-17 22:37:06.088089	Success
182	8	2025-02-17 22:37:07.986405	Success
104	4	2025-02-17 20:55:41.655556	Failed
183	4	2025-02-17 22:38:06.158109	Success
184	8	2025-02-17 22:38:08.048156	Success
185	4	2025-02-17 22:39:06.112573	Success
109	4	2025-02-17 20:56:41.623688	Failed
186	8	2025-02-17 22:39:08.014028	Success
187	4	2025-02-17 22:40:06.135422	Success
188	8	2025-02-17 22:40:08.025977	Success
114	4	2025-02-17 20:57:41.636777	Failed
116	4	2025-02-17 20:59:27.97885	Failed
189	4	2025-02-17 22:41:06.146374	Success
190	8	2025-02-17 22:41:08.049416	Success
191	4	2025-02-17 22:42:06.188453	Success
192	8	2025-02-17 22:42:08.087144	Success
193	4	2025-02-17 22:43:06.212991	Success
194	8	2025-02-17 22:43:08.129691	Success
195	4	2025-02-17 22:44:06.176724	Success
196	8	2025-02-17 22:44:08.06396	Success
197	4	2025-02-17 22:45:06.202703	Success
198	8	2025-02-17 22:45:08.113863	Success
199	4	2025-02-17 22:46:06.154794	Success
200	8	2025-02-17 22:46:08.043587	Success
201	4	2025-02-17 22:47:06.174006	Success
202	8	2025-02-17 22:47:08.058603	Success
203	4	2025-02-17 22:48:06.184352	Success
204	8	2025-02-17 22:48:08.075984	Success
205	4	2025-02-17 22:49:06.180281	Success
206	8	2025-02-17 22:49:08.066354	Success
207	4	2025-02-17 22:50:06.267374	Success
208	8	2025-02-17 22:50:08.312262	Success
209	4	2025-02-17 22:51:06.224776	Success
210	8	2025-02-17 22:51:08.113626	Success
211	4	2025-02-17 22:52:06.215444	Success
212	8	2025-02-17 22:52:08.163265	Success
213	4	2025-02-17 22:53:06.219099	Success
214	8	2025-02-17 22:53:08.120615	Success
215	4	2025-02-17 22:54:06.229913	Success
216	8	2025-02-17 22:54:08.135095	Success
217	4	2025-02-17 22:55:06.291099	Success
218	8	2025-02-17 22:55:08.188467	Success
219	4	2025-02-17 22:56:06.266097	Success
220	8	2025-02-17 22:56:08.185253	Success
\.


--
-- TOC entry 4932 (class 0 OID 16596)
-- Dependencies: 216
-- Data for Name: protocols_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocols_list (protocol_id, protocol_name) FROM stdin;
1	HTTP
2	HTTPS
3	FTP
4	SSH
\.


--
-- TOC entry 4934 (class 0 OID 16608)
-- Dependencies: 218
-- Data for Name: servers_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servers_list (server_id, current_status, server_name, server_url, username, password, last_updated) FROM stdin;
4	Healthy	http	ftp.dlptest.com	dlpuser	c4c392e53bad4cf3711f50ef3bc72f60:237ff3f8d00a978a85fad9b55d2278d3a0858e260dc7a418f70892835f009450	2025-02-17 22:56:06.266097
8	Healthy	ftp2	ftp://ftp.dlptest.com/	dlpuser	c4c392e53bad4cf3711f50ef3bc72f60:237ff3f8d00a978a85fad9b55d2278d3a0858e260dc7a418f70892835f009450	2025-02-17 22:56:08.185253
\.


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 219
-- Name: monitor_history_monitor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monitor_history_monitor_id_seq', 220, true);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 215
-- Name: protocols_list_protocol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.protocols_list_protocol_id_seq', 4, true);


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 217
-- Name: servers_list_server_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servers_list_server_id_seq', 8, true);


--
-- TOC entry 4783 (class 2606 OID 16632)
-- Name: monitor_history monitor_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_history
    ADD CONSTRAINT monitor_history_pkey PRIMARY KEY (monitor_id);


--
-- TOC entry 4775 (class 2606 OID 16604)
-- Name: protocols_list protocols_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocols_list
    ADD CONSTRAINT protocols_list_pkey PRIMARY KEY (protocol_id);


--
-- TOC entry 4777 (class 2606 OID 16606)
-- Name: protocols_list protocols_list_protocol_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocols_list
    ADD CONSTRAINT protocols_list_protocol_name_key UNIQUE (protocol_name);


--
-- TOC entry 4779 (class 2606 OID 16618)
-- Name: servers_list servers_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servers_list
    ADD CONSTRAINT servers_list_pkey PRIMARY KEY (server_id);


--
-- TOC entry 4781 (class 2606 OID 16620)
-- Name: servers_list servers_list_server_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servers_list
    ADD CONSTRAINT servers_list_server_name_key UNIQUE (server_name);


--
-- TOC entry 4786 (class 2620 OID 16642)
-- Name: monitor_history monitor_success_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER monitor_success_trigger AFTER INSERT ON public.monitor_history FOR EACH ROW EXECUTE FUNCTION public.update_server_status_on_success();


--
-- TOC entry 4787 (class 2620 OID 16643)
-- Name: monitor_history monitor_unsuccessful_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER monitor_unsuccessful_trigger AFTER INSERT ON public.monitor_history FOR EACH ROW EXECUTE FUNCTION public.update_server_status_on_unsuccessful();


--
-- TOC entry 4785 (class 2620 OID 16641)
-- Name: servers_list notify_on_unhealthy_status_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_on_unhealthy_status_trigger AFTER UPDATE ON public.servers_list FOR EACH ROW WHEN ((new.current_status = 'Unhealthy'::text)) EXECUTE FUNCTION public.notify_on_unhealthy_status();


--
-- TOC entry 4784 (class 2606 OID 16633)
-- Name: monitor_history monitor_history_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_history
    ADD CONSTRAINT monitor_history_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers_list(server_id) ON DELETE CASCADE;


-- Completed on 2025-02-17 22:56:16

--
-- PostgreSQL database dump complete
--

