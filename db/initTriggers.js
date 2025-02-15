const { executeQuery, executeFunction } = require("./db_functions"); 

//List of triggers
const triggers = [
  {
    name: "server_status_trigger",
    function: `
          CREATE OR REPLACE FUNCTION notify_on_unhealthy_status()
          RETURNS TRIGGER AS $$
          BEGIN
              -- Check if the current_status is 'Unhealthy'
              IF NEW.current_status = 'Unhealthy' THEN
                  -- Send notification when server status is 'Unhealthy'
                  PERFORM pg_notify('server_status_change', 'Server ' || NEW.server_id || ' is now Unhealthy.');
              END IF;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
      `,
    trigger: "create_notify_on_unhealthy_status_trigger",
  },
  {
    name: "monitor_success_trigger",
    function: `
         CREATE OR REPLACE FUNCTION update_server_status_on_success()
          RETURNS TRIGGER AS $$
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
          $$ LANGUAGE plpgsql;

      `,
    trigger: "create_monitor_success_trigger",
  },
  {
    name: "monitor_unsuccessful_trigger",
    function: `
          CREATE OR REPLACE FUNCTION update_server_status_on_unsuccessful()
          RETURNS TRIGGER AS $$
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
          $$ LANGUAGE plpgsql;
      `,
    trigger: "create_monitor_unsuccessful_trigger",
  },
];


// Create all triggers from the list
const createTriggers = async () => {
  try {
    console.log("[initTriggers] Setting up database triggers...");

    await Promise.all(
      triggers.map(async (t) => {
        console.log(`[initTriggers] Creating trigger function for: ${t.name}`);
        await executeQuery(t.function);

        console.log(`[initTriggers] Creating trigger: ${t.name}`);
        await executeFunction(true,t.trigger);
      })
    );

    console.log("[initTriggers] All triggers set up successfully!");
  } catch (error) {
    console.error("[initTriggers] Error setting up triggers:", error);
  }
};
module.exports = createTriggers;
