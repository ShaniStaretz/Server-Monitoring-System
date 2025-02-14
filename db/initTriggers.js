const { executeQuery } = require("./db_functions"); // Import the pool from your pool.js

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
    trigger: `
          CREATE TRIGGER server_status_trigger
          AFTER UPDATE ON servers_list
          FOR EACH ROW
          WHEN (NEW.current_status = 'Unhealthy')
          EXECUTE FUNCTION notify_on_unhealthy_status();
      `,
  },
  {
    name: "monitor_success_trigger",
    function: `
          CREATE OR REPLACE FUNCTION update_server_status_on_success()
          RETURNS TRIGGER AS $$
          BEGIN
              IF (
                  SELECT COUNT(*) 
                  FROM monitor_history 
                  WHERE server_id = NEW.server_id 
                  AND status = 'Success'
                  ORDER BY timestamp DESC
                  LIMIT 5
              ) = 5 THEN
                  UPDATE servers_list
                  SET current_status = 'Healthy',
                      last_updated = CURRENT_TIMESTAMP
                  WHERE server_id = NEW.server_id;
              END IF;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
      `,
    trigger: `
          CREATE TRIGGER monitor_success_trigger
          AFTER INSERT ON monitor_history
          FOR EACH ROW
          EXECUTE FUNCTION update_server_status_on_success();
      `,
  },
  {
    name: "monitor_unsuccess_trigger",
    function: `
          CREATE OR REPLACE FUNCTION update_server_status_on_unsuccessful()
          RETURNS TRIGGER AS $$
          BEGIN
              IF (
                  SELECT COUNT(*) 
                  FROM monitor_history 
                  WHERE server_id = NEW.server_id 
                  AND status = 'Unsuccessful'
                  ORDER BY timestamp DESC
                  LIMIT 3
              ) = 3 THEN
                  UPDATE servers_list
                  SET current_status = 'Unhealthy',
                      last_updated = CURRENT_TIMESTAMP
                  WHERE server_id = NEW.server_id;
              END IF;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
      `,
    trigger: `
          CREATE TRIGGER monitor_unsuccessful_trigger
          AFTER INSERT ON monitor_history
          FOR EACH ROW
          EXECUTE FUNCTION update_server_status_on_unsuccessful();
      `,
  },
];

// Function to create all triggers from the list
const createTriggers = async () => {
  try {
    console.log("🔧 Setting up database triggers...");

    await Promise.all(
      triggers.map(async (t) => {
        console.log(`Creating trigger function for: ${t.name}`);
        await executeQuery(t.function);

        console.log(`Creating trigger: ${t.name}`);
        await executeQuery(t.trigger);
      })
    );

    console.log("All triggers set up successfully!");
  } catch (error) {
    console.error("Error setting up triggers:", error);
  }
};
module.exports = createTriggers;
