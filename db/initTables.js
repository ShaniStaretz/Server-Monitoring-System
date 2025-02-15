
const {executeFunction} = require("./db_functions"); // Import the executeFunction from your db_functions.js

let procedureCalled = new Set(); // Track procedures that have been called

async function callProcedureOnce(procedureName) {
  if (procedureCalled.has(procedureName)) {
    console.log(`[initTables] Procedure ${procedureName} has already been called.`);
    return; // Skip calling the procedure if it was already called
  }

  try {
    console.info(`[initTables] Calling procedure ${procedureName}...`);
    await executeFunction(false,procedureName); 

    console.info(`[initTables] Procedure ${procedureName} executed successfully.`);
    procedureCalled.add(procedureName); // Mark this procedure as called
  } catch (error) {
    console.error(`[initTables] Error calling procedure ${procedureName}:`, error);
  }
}

async function initTables() {
  const procedures = [
    "create_protocols_list_table", 
    "create_servers_list_table", 
    "create_monitor_history_table" 
  ];

  // Create an array of promises to call each procedure
  const procedurePromises = procedures.map((procedure) =>
    callProcedureOnce(procedure)
  );

  try {
    // Execute all the procedure calls in parallel
    await Promise.all(procedurePromises);
    console.info("[initTables] All procedures have been executed.");
  } catch (error) {
    console.error("[initTables] Error executing procedures:", error);
  }

  console.log("[initTables] All procedures have been executed.");
}

module.exports = initTables; 
