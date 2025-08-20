// Generera tidsslots för schemat
export const generateTimeSlots = (startHour = 7, endHour = 18) => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

// Beräkna position och höjd för aktivitetsblock
export const calculatePosition = (startTime, endTime, hourHeight = 60) => {
  const baseHour = 7; // Schemat börjar kl 07:00
  
  // Parsa start- och sluttid
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  // Beräkna position från toppen (i pixlar)
  const startMinutes = (startHour - baseHour) * 60 + startMin;
  const endMinutes = (endHour - baseHour) * 60 + endMin;
  
  const top = (startMinutes / 60) * hourHeight;
  const height = ((endMinutes - startMinutes) / 60) * hourHeight;
  
  return { top, height };
};

// Konvertera tid till minuter sedan midnatt
export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Konvertera minuter till tid (HH:MM)
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Kontrollera om två aktiviteter överlappar
export const isOverlapping = (activity1, activity2) => {
  const start1 = timeToMinutes(activity1.startTime);
  const end1 = timeToMinutes(activity1.endTime);
  const start2 = timeToMinutes(activity2.startTime);
  const end2 = timeToMinutes(activity2.endTime);
  
  return start1 < end2 && start2 < end1;
};

// Gruppera överlappande aktiviteter
export const groupOverlappingActivities = (activities) => {
  if (activities.length === 0) return [];
  
  // Sortera aktiviteter efter starttid
  const sorted = [...activities].sort((a, b) => {
    const timeA = timeToMinutes(a.startTime);
    const timeB = timeToMinutes(b.startTime);
    return timeA - timeB;
  });
  
  const groups = [];
  let currentGroup = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const activity = sorted[i];
    let overlapsWithGroup = false;
    
    // Kontrollera om aktiviteten överlappar med någon i gruppen
    for (const groupActivity of currentGroup) {
      if (isOverlapping(groupActivity, activity)) {
        overlapsWithGroup = true;
        break;
      }
    }
    
    if (overlapsWithGroup) {
      currentGroup.push(activity);
    } else {
      groups.push(currentGroup);
      currentGroup = [activity];
    }
  }
  
  // Lägg till sista gruppen
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  return groups;
};

// Formatera tid för visning
export const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

// Formatera tidsintervall
export const formatTimeRange = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// Beräkna duration i minuter
export const calculateDuration = (startTime, endTime) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return end - start;
};

// Formatera duration till läsbar text
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} tim`;
  } else {
    return `${hours} tim ${mins} min`;
  }
};

// Validera tid
export const isValidTime = (time) => {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};

// Validera att sluttid är efter starttid
export const isEndTimeAfterStartTime = (startTime, endTime) => {
  return timeToMinutes(endTime) > timeToMinutes(startTime);
};

// Runda tid till närmaste kvart
export const roundToQuarter = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const roundedMinutes = Math.round(minutes / 15) * 15;
  
  if (roundedMinutes === 60) {
    return `${(hours + 1).toString().padStart(2, '0')}:00`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
  }
};

// Hämta närmaste tidslot baserat på musposition
export const getTimeFromPosition = (yPosition, hourHeight = 60, baseHour = 7) => {
  const minutes = (yPosition / hourHeight) * 60;
  const totalMinutes = baseHour * 60 + minutes;
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round((totalMinutes % 60) / 15) * 15; // Runda till närmaste kvart
  
  if (mins === 60) {
    return `${(hours + 1).toString().padStart(2, '0')}:00`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
};

// Hämta veckonummer för ett datum
export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Hämta datum för en vecka
export const getDatesForWeek = (weekNumber, year = new Date().getFullYear()) => {
  // Skapa en datum för 4 januari (alltid i vecka 1)
  const jan4 = new Date(year, 0, 4);
  
  // Hitta måndagen i vecka 1
  const dayOfWeek = jan4.getDay();
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  // Beräkna måndagen för önskad vecka
  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (weekNumber - 1) * 7);
  
  const dates = [];
  for (let i = 0; i < 5; i++) { // Måndag till fredag
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

// Formatera datum
export const formatDate = (date) => {
  const day = date.getDate();
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 
                      'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const month = monthNames[date.getMonth()];
  return `${day} ${month}`;
};

// Hämta datumintervall för en vecka
export const getWeekDateRange = (weekNumber, year = new Date().getFullYear()) => {
  const dates = getDatesForWeek(weekNumber, year);
  return {
    start: dates[0],
    end: dates[dates.length - 1]
  };
};

// Formatera veckointerval för visning
export const formatWeekRange = (startDate, endDate) => {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  
  const monthNames = ['januari', 'februari', 'mars', 'april', 'maj', 'juni',
                      'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
  
  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${monthNames[startMonth]}`;
  } else {
    return `${startDay} ${monthNames[startMonth]} - ${endDay} ${monthNames[endMonth]}`;
  }
};

// Kontrollera om en tid är inom arbetstid
export const isWithinWorkHours = (time, startHour = 7, endHour = 18) => {
  const minutes = timeToMinutes(time);
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  
  return minutes >= startMinutes && minutes <= endMinutes;
};

// Sortera aktiviteter efter starttid
export const sortActivitiesByTime = (activities) => {
  return [...activities].sort((a, b) => {
    const timeA = timeToMinutes(a.startTime);
    const timeB = timeToMinutes(b.startTime);
    return timeA - timeB;
  });
};

// Hitta lediga tider i schemat
export const findFreeSlots = (activities, dayStart = '07:00', dayEnd = '18:00', minDuration = 30) => {
  const freeSlots = [];
  const sorted = sortActivitiesByTime(activities);
  
  let currentTime = timeToMinutes(dayStart);
  const endTime = timeToMinutes(dayEnd);
  
  sorted.forEach(activity => {
    const activityStart = timeToMinutes(activity.startTime);
    const activityEnd = timeToMinutes(activity.endTime);
    
    // Om det finns en lucka före aktiviteten
    if (activityStart - currentTime >= minDuration) {
      freeSlots.push({
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(activityStart),
        duration: activityStart - currentTime
      });
    }
    
    currentTime = Math.max(currentTime, activityEnd);
  });
  
  // Kontrollera om det finns tid kvar efter sista aktiviteten
  if (endTime - currentTime >= minDuration) {
    freeSlots.push({
      startTime: minutesToTime(currentTime),
      endTime: minutesToTime(endTime),
      duration: endTime - currentTime
    });
  }
  
  return freeSlots;
};