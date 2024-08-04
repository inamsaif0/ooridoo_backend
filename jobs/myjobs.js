// src/jobs/myCronJob.js
const cron = require('node-cron');
const { rentalUpdateByMinutes } = require("../utils/index")
// Schedule a task to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running a task every minute');
  
  await rentalUpdateByMinutes();
  // Add your task logic here
});
