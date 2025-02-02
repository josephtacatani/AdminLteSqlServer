// utils/timeslotHelper.js

/**
 * Generates timeslots between startTime and endTime with specified intervals.
 * @param {string} startTime - The start time in HH:mm format.
 * @param {string} endTime - The end time in HH:mm format.
 * @param {number} intervalMinutes - Duration of each timeslot (default: 60 mins).
 * @returns {Array} - List of timeslot objects with start_time and end_time.
 */
const generateTimeslots = (startTime, endTime, intervalMinutes = 60) => {
    const timeslots = [];
    let current = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);
  
    while (current < end) {
      const slotStart = current.toISOString().substring(11, 16); // Format HH:mm
      current.setMinutes(current.getMinutes() + intervalMinutes);
      const slotEnd = current.toISOString().substring(11, 16);
  
      if (current <= end) {
        timeslots.push({ start_time: slotStart, end_time: slotEnd });
      }
    }
  
    return timeslots;
  };
  
  module.exports = { generateTimeslots };