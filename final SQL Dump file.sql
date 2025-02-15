--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

-- Started on 2025-02-15 23:22:19

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
-- TOC entry 241 (class 1255 OID 16523)
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
-- TOC entry 248 (class 1255 OID 16574)
-- Name: add_server_to_list(text, text, integer, integer, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_server_to_list(in_server_name text, in_server_url text, in_port integer, in_protocol_id integer, in_username text, in_password text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_server_id INT;
BEGIN
    -- Insert the new server into the servers_list table and return the server_id
    INSERT INTO servers_list (server_name, server_url,port, protocol_id, current_status,username,password)
    VALUES (in_server_name,in_server_url, in_port, in_protocol_id, 'Healthy',in_username,in_password)  -- Default to 'Healthy'
    RETURNING server_id INTO new_server_id;
    
    -- Return the new server_id
    RETURN new_server_id;
END;
$$;


ALTER FUNCTION public.add_server_to_list(in_server_name text, in_server_url text, in_port integer, in_protocol_id integer, in_username text, in_password text) OWNER TO postgres;

--
-- TOC entry 242 (class 1255 OID 16407)
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
-- TOC entry 243 (class 1255 OID 16564)
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
-- TOC entry 244 (class 1255 OID 16565)
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
-- TOC entry 245 (class 1255 OID 16566)
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
-- TOC entry 239 (class 1255 OID 16518)
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
-- TOC entry 236 (class 1255 OID 16400)
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
            port INTEGER NOT NULL,
            protocol_id INTEGER NOT NULL REFERENCES protocols_list(protocol_id) ON DELETE CASCADE,
			username TEXT NULL DEFAULT NULL,
			password TEXT NULL DEFAULT NULL,
			last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP			
        );
    END IF;
END;
$$;


ALTER PROCEDURE public.create_servers_list_table() OWNER TO postgres;

--
-- TOC entry 223 (class 1255 OID 16404)
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
-- TOC entry 222 (class 1255 OID 16403)
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
-- TOC entry 247 (class 1255 OID 16575)
-- Name: get_all_servers_list(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_all_servers_list() RETURNS TABLE(server_id integer, server_name text, server_url text, port integer, protocol_name text, current_status text, username text, password text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Perform the JOIN between servers_list and protocol_list to get protocol_name
    RETURN QUERY
    SELECT s.server_id, s.server_name,s.server_url,s.port, p.protocol_name,s.current_status,s.username,s.password
    FROM servers_list s
    JOIN protocols_list p
    ON s.protocol_id = p.protocol_id
	ORDER BY s.server_id ASC;  -- Order by server_id in ascending order
END;
$$;


ALTER FUNCTION public.get_all_servers_list() OWNER TO postgres;

--
-- TOC entry 240 (class 1255 OID 16522)
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
-- TOC entry 237 (class 1255 OID 16505)
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
-- TOC entry 249 (class 1255 OID 16576)
-- Name: get_server_by_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_server_by_id(p_server_id integer) RETURNS TABLE(id integer, server_name text, server_url text, port integer, protocol_name text, last_updated timestamp without time zone, current_status text, username text, password text, history jsonb)
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
        s.port, 
        p.protocol_name,
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
    JOIN protocols_list p ON s.protocol_id = p.protocol_id
    WHERE s.server_id = p_server_id;
END;
$$;


ALTER FUNCTION public.get_server_by_id(p_server_id integer) OWNER TO postgres;

--
-- TOC entry 235 (class 1255 OID 16412)
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
-- TOC entry 246 (class 1255 OID 16551)
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
-- TOC entry 250 (class 1255 OID 16581)
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
-- TOC entry 238 (class 1255 OID 16547)
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
-- TOC entry 251 (class 1255 OID 16544)
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
-- TOC entry 221 (class 1259 OID 16582)
-- Name: last_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.last_status (
    status text
);


ALTER TABLE public.last_status OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16527)
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
-- TOC entry 219 (class 1259 OID 16526)
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
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 219
-- Name: monitor_history_monitor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monitor_history_monitor_id_seq OWNED BY public.monitor_history.monitor_id;


--
-- TOC entry 216 (class 1259 OID 16431)
-- Name: protocols_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocols_list (
    protocol_id integer NOT NULL,
    protocol_name text NOT NULL,
    CONSTRAINT protocol_list_protocol_name_check CHECK ((protocol_name = upper(protocol_name)))
);


ALTER TABLE public.protocols_list OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16430)
-- Name: protocol_list_protocol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.protocol_list_protocol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.protocol_list_protocol_id_seq OWNER TO postgres;

--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 215
-- Name: protocol_list_protocol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.protocol_list_protocol_id_seq OWNED BY public.protocols_list.protocol_id;


--
-- TOC entry 218 (class 1259 OID 16455)
-- Name: servers_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servers_list (
    server_id integer NOT NULL,
    current_status text DEFAULT 'Healthy'::text NOT NULL,
    server_name text NOT NULL,
    port integer NOT NULL,
    protocol_id integer NOT NULL,
    username text,
    password text,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    server_url text NOT NULL,
    CONSTRAINT servers_list_current_status_check CHECK ((current_status = ANY (ARRAY['Healthy'::text, 'Unhealthy'::text])))
);


ALTER TABLE public.servers_list OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16454)
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
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 217
-- Name: servers_list_server_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servers_list_server_id_seq OWNED BY public.servers_list.server_id;


--
-- TOC entry 4772 (class 2604 OID 16530)
-- Name: monitor_history monitor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_history ALTER COLUMN monitor_id SET DEFAULT nextval('public.monitor_history_monitor_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 16434)
-- Name: protocols_list protocol_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocols_list ALTER COLUMN protocol_id SET DEFAULT nextval('public.protocol_list_protocol_id_seq'::regclass);


--
-- TOC entry 4769 (class 2604 OID 16458)
-- Name: servers_list server_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servers_list ALTER COLUMN server_id SET DEFAULT nextval('public.servers_list_server_id_seq'::regclass);


--
-- TOC entry 4945 (class 0 OID 16582)
-- Dependencies: 221
-- Data for Name: last_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.last_status (status) FROM stdin;
Success
\.


--
-- TOC entry 4944 (class 0 OID 16527)
-- Dependencies: 220
-- Data for Name: monitor_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monitor_history (monitor_id, server_id, "timestamp", status) FROM stdin;
89	10	2025-02-15 14:20:19	Success
46	7	2025-02-15 14:08:22.327452	Failed
47	8	2025-02-15 14:08:22.330529	Failed
49	7	2025-02-15 14:08:28.321811	Failed
50	8	2025-02-15 14:08:28.324642	Failed
52	7	2025-02-15 14:08:34.337752	Failed
53	8	2025-02-15 14:08:34.342389	Failed
55	7	2025-02-15 14:08:40.339785	Failed
56	8	2025-02-15 14:08:40.342661	Failed
58	7	2025-02-15 14:08:46.341188	Failed
59	8	2025-02-15 14:08:46.34422	Failed
61	7	2025-02-15 14:08:52.349615	Failed
62	8	2025-02-15 14:08:52.353205	Failed
64	7	2025-02-15 14:13:57.603368	Failed
65	8	2025-02-15 14:13:57.607359	Failed
67	7	2025-02-15 14:14:57.607043	Failed
68	8	2025-02-15 14:14:57.610757	Failed
70	7	2025-02-15 14:15:57.509495	Failed
71	8	2025-02-15 14:15:57.514327	Failed
72	9	2025-02-15 14:16:18.673007	Failed
74	7	2025-02-15 14:16:57.603808	Failed
75	8	2025-02-15 14:16:57.607395	Failed
76	9	2025-02-15 14:17:18.822291	Failed
78	7	2025-02-15 14:17:57.599993	Failed
79	8	2025-02-15 14:17:57.603678	Failed
80	9	2025-02-15 14:18:18.762057	Failed
82	7	2025-02-15 14:18:57.625565	Failed
83	8	2025-02-15 14:18:57.628714	Failed
84	9	2025-02-15 14:19:18.752505	Failed
86	7	2025-02-15 14:19:57.750532	Failed
87	8	2025-02-15 14:19:57.753263	Failed
88	9	2025-02-15 14:20:18.898902	Failed
91	7	2025-02-15 14:20:57.653912	Failed
92	8	2025-02-15 14:20:57.656559	Failed
93	9	2025-02-15 14:21:18.821214	Failed
94	10	2025-02-15 14:21:19.80556	Success
96	7	2025-02-15 14:21:57.640178	Failed
97	8	2025-02-15 14:21:57.643523	Failed
98	9	2025-02-15 14:22:18.770075	Failed
99	10	2025-02-15 14:22:19.420356	Success
101	7	2025-02-15 14:22:57.650361	Failed
102	8	2025-02-15 14:22:57.653245	Failed
103	9	2025-02-15 14:23:18.77366	Failed
104	10	2025-02-15 14:23:19.663062	Success
106	7	2025-02-15 14:23:57.659254	Failed
107	8	2025-02-15 14:23:57.662246	Failed
108	9	2025-02-15 14:24:18.830503	Failed
109	10	2025-02-15 14:24:19.479863	Success
111	7	2025-02-15 14:24:57.674581	Failed
112	8	2025-02-15 14:24:57.677773	Failed
113	9	2025-02-15 14:25:18.803479	Failed
114	10	2025-02-15 14:25:19.251072	Success
116	7	2025-02-15 15:59:33.830477	Failed
117	8	2025-02-15 15:59:33.859057	Failed
119	7	2025-02-15 16:06:53.799649	Failed
120	8	2025-02-15 16:06:53.82745	Failed
122	7	2025-02-15 18:00:00.283838	Failed
123	8	2025-02-15 18:00:00.314046	Failed
125	7	2025-02-15 19:08:01.603501	Failed
126	8	2025-02-15 19:08:01.614934	Failed
\.


--
-- TOC entry 4940 (class 0 OID 16431)
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
-- TOC entry 4942 (class 0 OID 16455)
-- Dependencies: 218
-- Data for Name: servers_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servers_list (server_id, current_status, server_name, port, protocol_id, username, password, last_updated, server_url) FROM stdin;
7	Unhealthy	New Server1	8080	1	\N	\N	2025-02-15 19:08:01.603501	google.com
9	Unhealthy	google.com	8080	1	\N	\N	2025-02-15 14:25:18.803479	google.com
10	Healthy	httpbin.org	443	2	\N	\N	2025-02-15 14:25:19.251072	httpbin.org
11	Healthy	 ftp.dlptest.com	22	3	\N	\N	2025-02-15 17:07:31.290008	httpbin.org
12	Healthy	ser	80	2	\N	\N	2025-02-15 17:10:43.983188	httpbin.org
14	Healthy	sers	80	2	use	517c2ef201c15709d1adf6a4b404c78f:0390a83594cbdec150f021efa4cfe62ae7adf7abc33135e0a506104fee29ce80	2025-02-15 17:11:02.65869	httpbin.org
20	Healthy	 ftp.dlptest.coms	22	3	\N	\N	2025-02-15 17:14:22.869138	httpbin.org
21	Healthy	 ftp.dlptest.com3	22	3	dlpuser	517c2ef201c15709d1adf6a4b404c78f:0390a83594cbdec150f021efa4cfe62ae7adf7abc33135e0a506104fee29ce80	2025-02-15 17:14:51.271731	httpbin.org
22	Healthy	 ftp.dlptest.com4	22	3	dlpuser	517c2ef201c15709d1adf6a4b404c78f:0390a83594cbdec150f021efa4cfe62ae7adf7abc33135e0a506104fee29ce80	2025-02-15 17:18:53.16004	 ftp://ftp.dlptest.com/
23	Healthy	 ftp.dlptest.com5	22	3	dlpuser	517c2ef201c15709d1adf6a4b404c78f:0390a83594cbdec150f021efa4cfe62ae7adf7abc33135e0a506104fee29ce80	2025-02-15 17:45:23.023391	 ftp://ftp.dlptest.com/
26	Healthy	ftp.dlptest.com5	22	3	dlpuser	2288b5652b28474f720a339185f51831:70288db085a104953339d819c8f92a4f1a057df3207a4ab497a316c91aa6a37f	2025-02-15 21:08:44.975442	ftp.dlptest.com
28	Healthy	ftp	22	3	dlpuser	d6b92cc4a0b115f658b7471b9200133f:fe7045f567c8ae19443edbee42b5cdc6b24076766dc18e07f6ce965f4f81a426	2025-02-15 21:14:31.447113	ftp.dlptest.com
29	Healthy	ftp2	22	3	dlpuser	df93da30270e352aa4e807464f79a95c:5987694f38bf3d67b55a0ac52996f44de9ea50a66cffd7dabb151b0cafe930e3	2025-02-15 21:15:59.753536	ftp.dlptest.com
31	Healthy	ftp3	21	3	dlpuser	c5051e8ef1414c5ebbf4201e19f897e7:88430de9fa11ed6b48a95c1fe798301c2fe0f2e3819b01b35ad021e169462f6c	2025-02-15 21:44:10.636077	ftp://ftp.dlptest.com
32	Healthy	ftp4	21	3	dlpuser	787d4770d7ab9a343967cef43305696f:1f6c0c36054ed4e10dd9a27acba0661391e18352df0107e5f801b1460adde72e	2025-02-15 22:40:13.45308	ftp://ftp.dlptest.co
34	Healthy	ftp5	21	3	dlpuser	4c256be0dc6b6a31d8d36399477322f5:1812441c2a640bdb2248e4a432884c530761df5d319300670351cf36768508c0	2025-02-15 22:40:26.90452	ftp://ftp.dlptest
25	Healthy	 ftp.dlptest.com6	21	3	\N	\N	2025-02-15 18:06:37.134542	ftp://ftp.dlptests.com/
8	Unhealthy	update-server	8080	1	\N	\N	2025-02-15 19:08:01.614934	https://update-server.com
\.


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 219
-- Name: monitor_history_monitor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monitor_history_monitor_id_seq', 126, true);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 215
-- Name: protocol_list_protocol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.protocol_list_protocol_id_seq', 4, true);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 217
-- Name: servers_list_server_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servers_list_server_id_seq', 34, true);


--
-- TOC entry 4787 (class 2606 OID 16537)
-- Name: monitor_history monitor_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_history
    ADD CONSTRAINT monitor_history_pkey PRIMARY KEY (monitor_id);


--
-- TOC entry 4779 (class 2606 OID 16439)
-- Name: protocols_list protocol_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocols_list
    ADD CONSTRAINT protocol_list_pkey PRIMARY KEY (protocol_id);


--
-- TOC entry 4781 (class 2606 OID 16441)
-- Name: protocols_list protocol_list_protocol_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocols_list
    ADD CONSTRAINT protocol_list_protocol_name_key UNIQUE (protocol_name);


--
-- TOC entry 4783 (class 2606 OID 16465)
-- Name: servers_list servers_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servers_list
    ADD CONSTRAINT servers_list_pkey PRIMARY KEY (server_id);


--
-- TOC entry 4785 (class 2606 OID 16467)
-- Name: servers_list servers_list_server_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servers_list
    ADD CONSTRAINT servers_list_server_name_key UNIQUE (server_name);


--
-- TOC entry 4793 (class 2620 OID 16568)
-- Name: monitor_history monitor_success_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER monitor_success_trigger AFTER INSERT ON public.monitor_history FOR EACH ROW EXECUTE FUNCTION public.update_server_status_on_success();


--
-- TOC entry 4790 (class 2620 OID 16553)
-- Name: servers_list monitor_unhealthy_status_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER monitor_unhealthy_status_trigger AFTER UPDATE OF current_status ON public.servers_list FOR EACH ROW WHEN ((new.current_status = 'Unhealthy'::text)) EXECUTE FUNCTION public.notify_on_unhealthy_status();


--
-- TOC entry 4794 (class 2620 OID 16546)
-- Name: monitor_history monitor_unsuccess_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER monitor_unsuccess_trigger AFTER INSERT ON public.monitor_history FOR EACH ROW EXECUTE FUNCTION public.update_server_status_on_unsuccessful();


--
-- TOC entry 4795 (class 2620 OID 16570)
-- Name: monitor_history monitor_unsuccessful_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER monitor_unsuccessful_trigger AFTER INSERT ON public.monitor_history FOR EACH ROW EXECUTE FUNCTION public.update_server_status_on_unsuccessful();


--
-- TOC entry 4791 (class 2620 OID 16567)
-- Name: servers_list notify_on_unhealthy_status_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER notify_on_unhealthy_status_trigger AFTER UPDATE ON public.servers_list FOR EACH ROW WHEN ((new.current_status = 'Unhealthy'::text)) EXECUTE FUNCTION public.notify_on_unhealthy_status();


--
-- TOC entry 4792 (class 2620 OID 16569)
-- Name: servers_list server_status_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER server_status_trigger AFTER UPDATE ON public.servers_list FOR EACH ROW WHEN ((new.current_status = 'Unhealthy'::text)) EXECUTE FUNCTION public.notify_on_unhealthy_status();


--
-- TOC entry 4789 (class 2606 OID 16538)
-- Name: monitor_history monitor_history_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_history
    ADD CONSTRAINT monitor_history_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.servers_list(server_id) ON DELETE CASCADE;


--
-- TOC entry 4788 (class 2606 OID 16468)
-- Name: servers_list servers_list_protocol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servers_list
    ADD CONSTRAINT servers_list_protocol_id_fkey FOREIGN KEY (protocol_id) REFERENCES public.protocols_list(protocol_id) ON DELETE CASCADE;


-- Completed on 2025-02-15 23:22:20

--
-- PostgreSQL database dump complete
--

