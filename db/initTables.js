
const {executeFunction} = require("./db_functions"); // Import the executeFunction from your db_functions.js

let procedureCalled = new Set(); // Track procedures that have been called

async function callProcedureOnce(procedureName) {
  if (procedureCalled.has(procedureName)) {
    console.log(`Procedure ${procedureName} has already been called.`);
    return; // Skip calling the procedure if it was already called
  }

  try {
    console.log(`Calling procedure ${procedureName}...`);
    await executeFunction(false,procedureName); // Assuming you're calling stored procedures by name

    console.log(`Procedure ${procedureName} executed successfully.`);
    procedureCalled.add(procedureName); // Mark this procedure as called
  } catch (error) {
    console.error(`Error calling procedure ${procedureName}:`, error);
  }
}

async function initTables() {
  const procedures = [
    "create_protocol_list_table", // Replace with actual procedure names
    "create_servers_list_table", // Replace with actual procedure names
   
    "create_monitor_history_table" // Replace with actual procedure names
  ];

  // Create an array of promises to call each procedure
  const procedurePromises = procedures.map((procedure) =>
    callProcedureOnce(procedure)
  );

  try {
    // Execute all the procedure calls in parallel
    await Promise.all(procedurePromises);
    console.log("All procedures have been executed.");
  } catch (error) {
    console.error("Error executing procedures:", error);
  }

  console.log("All procedures have been executed.");
}

module.exports = initTables; // Export initTables function
