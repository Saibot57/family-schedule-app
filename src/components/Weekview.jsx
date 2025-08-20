import React from 'react';
import DayColumn from './DayColumn';
import { generateTimeSlots, getDatesForWeek, formatDate } from '../utils/timeHelpers';
import './WeekView.css';

const WeekView = ({
  activities,
  familyMembers,
  activityTypes,
  currentWeek,
  currentYear,
  onActivityClick,
  weekDateRange
}) => {
  const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'];
  const timeSlots = generateTimeSlots(7, 18); // 07:00 - 18:00

  // Hämta datum för varje dag i veckan
  const weekDates = getDatesForWeek(currentWeek, currentYear);

  // Sortera aktiviteter per dag
  const getActivitiesForDay = (day) => {
    return activities.filter(activity => activity.day === day);
  };

  // Kontrollera om en dag är idag
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Kontrollera om veckan innehåller dagens datum
  const weekContainsToday = weekDates.some(date => isToday(date));

  // Räkna totala aktiviteter per dag för statistik
  const getActivityCount = (day) => {
    return getActivitiesForDay(day).length;
  };

  // Hitta konflikter per dag
  const getDayConflicts = (day) => {
    const dayActivities = getActivitiesForDay(day);
    const conflicts = [];

    dayActivities.forEach((activity1, i) => {
      dayActivities.slice(i + 1).forEach(activity2 => {
        // Kontrollera om samma personer är med i båda aktiviteterna
        const sharedParticipants = activity1.participants?.filter(p =>
          activity2.participants?.includes(p)
        ) || [];

        if (sharedParticipants.length > 0) {
          // Kontrollera om tiderna överlappar
          const start1 = activity1.startTime.split(':').map(Number);
          const end1 = activity1.endTime.split(':').map(Number);
          const start2 = activity2.startTime.split(':').map(Number);
          const end2 = activity2.endTime.split(':').map(Number);

          const start1Min = start1[0] * 60 + start1[1];
          const end1Min = end1[0] * 60 + end1[1];
          const start2Min = start2[0] * 60 + start2[1];
          const end2Min = end2[0] * 60 + end2[1];

          if (start1Min < end2Min && start2Min < end1Min) {
            conflicts.push({ activity1, activity2, sharedParticipants });
          }
        }
      });
    });

    return conflicts;
  };

  return (
    <div className="week-view">
      <div className="week-grid">
        {/* Tidsskala - vänster kolumn */}
        <div className="time-column">
          <div className="time-header">Tid</div>
          <div className="time-slots">
            {timeSlots.map(time => (
              <div key={time} className="time-slot">
                <span className="time-label">{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dagkolumner */}
        <div className="days-container">
          <div className="days-header">
            {days.map((day, index) => {
              const date = weekDates[index];
              const dateIsToday = isToday(date);
              const activityCount = getActivityCount(day);
              const conflicts = getDayConflicts(day);

              return (
                <div
                  key={day}
                  className={`day-header ${dateIsToday ? 'today' : ''}`}
                >
                  <span className="day-name">{day}</span>
                  <span className={`day-date ${dateIsToday ? 'today-date' : ''}`}>
                    {formatDate(date)}
                  </span>
                  {dateIsToday && (
                    <span className="today-badge">Idag</span>
                  )}
                  {activityCount > 0 && (
                    <span className="activity-count" title={`${activityCount} aktiviteter`}>
                      {activityCount}
                    </span>
                  )}
                  {conflicts.length > 0 && (
                    <span className="conflict-indicator" title={`${conflicts.length} konflikter`}>
                      ⚠️
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="days-content">
            {days.map((day, index) => {
              const date = weekDates[index];
              const dateIsToday = isToday(date);

              return (
                <DayColumn
                  key={`${day}-${currentWeek}-${currentYear}`}
                  day={day}
                  date={date}
                  isToday={dateIsToday}
                  activities={getActivitiesForDay(day)}
                  familyMembers={familyMembers}
                  activityTypes={activityTypes}
                  timeSlots={timeSlots}
                  onActivityClick={onActivityClick}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;