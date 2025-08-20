import React from 'react';
import ActivityBlock from './ActivityBlock';
import './DayColumn.css';

const DayColumn = ({ 
  day, 
  date,
  isToday,
  activities, 
  familyMembers, 
  activityTypes,
  timeSlots, 
  onActivityClick 
}) => {
  // Sortera aktiviteter efter starttid och duration
  const sortedActivities = [...activities].sort((a, b) => {
    const timeA = timeToMinutes(a.startTime);
    const timeB = timeToMinutes(b.startTime);
    if (timeA !== timeB) return timeA - timeB;
    
    // Om samma starttid, sortera längre aktiviteter först
    const durationA = timeToMinutes(a.endTime) - timeA;
    const durationB = timeToMinutes(b.endTime) - timeB;
    return durationB - durationA;
  });

  // Konvertera tid till minuter
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Kontrollera om två aktiviteter överlappar
  const isOverlapping = (activity1, activity2) => {
    const start1 = timeToMinutes(activity1.startTime);
    const end1 = timeToMinutes(activity1.endTime);
    const start2 = timeToMinutes(activity2.startTime);
    const end2 = timeToMinutes(activity2.endTime);

    return start1 < end2 && start2 < end1;
  };

  // Skapa kolumner för överlappande aktiviteter
  const createColumns = (activities) => {
    const columns = [];
    
    activities.forEach(activity => {
      let placed = false;
      
      // Försök placera i befintlig kolumn
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        let canPlace = true;
        
        // Kolla om aktiviteten överlappar med någon i kolumnen
        for (const existingActivity of column) {
          if (isOverlapping(activity, existingActivity)) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          column.push(activity);
          placed = true;
          break;
        }
      }
      
      // Om den inte kunde placeras, skapa ny kolumn
      if (!placed) {
        columns.push([activity]);
      }
    });
    
    return columns;
  };

  // Gruppera överlappande aktiviteter
  const groupOverlappingActivities = (activities) => {
    const groups = [];
    const used = new Set();
    
    activities.forEach((activity, index) => {
      if (used.has(index)) return;
      
      const group = [activity];
      used.add(index);
      
      // Hitta alla som överlappar med denna grupp
      let changed = true;
      while (changed) {
        changed = false;
        activities.forEach((otherActivity, otherIndex) => {
          if (used.has(otherIndex)) return;
          
          // Kolla om den överlappar med någon i gruppen
          for (const groupActivity of group) {
            if (isOverlapping(groupActivity, otherActivity)) {
              group.push(otherActivity);
              used.add(otherIndex);
              changed = true;
              break;
            }
          }
        });
      }
      
      groups.push(group);
    });
    
    return groups;
  };

  // Skapa layout för aktiviteter
  const activityGroups = groupOverlappingActivities(sortedActivities);

  return (
    <div className={`day-column ${isToday ? 'today-column' : ''}`}>
      {/* Bakgrundsrutnät för tidsslots */}
      <div className="day-grid">
        {timeSlots.map((time, index) => (
          <div 
            key={time} 
            className="hour-slot"
            data-time={time}
          >
            {/* Halvtimmeslinje */}
            <div className="half-hour-line" />
          </div>
        ))}
      </div>

      {/* Aktiviteter */}
      <div className="activities-container">
        {activityGroups.map((group, groupIndex) => {
          const columns = createColumns(group);
          const columnCount = columns.length;
          
          return (
            <div key={groupIndex} className="activity-group">
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="activity-column">
                  {column.map(activity => {
                    // Beräkna bredd och position
                    const width = columnCount > 1 
                      ? `calc(${100 / columnCount}% - 2px)` 
                      : 'calc(100% - 4px)';
                    const left = columnCount > 1 
                      ? `${(100 / columnCount) * columnIndex}%` 
                      : '0';
                    
                    return (
                      <ActivityBlock
                        key={activity.id}
                        activity={activity}
                        familyMembers={familyMembers}
                        activityTypes={activityTypes}
                        onClick={() => onActivityClick(activity)}
                        style={{
                          width,
                          left,
                          position: 'absolute',
                          marginLeft: columnIndex > 0 ? '2px' : '0'
                        }}
                        columnCount={columnCount}
                        columnIndex={columnIndex}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}

        {/* Klickbar yta för att lägga till ny aktivitet */}
        <div 
          className="add-activity-overlay"
          onClick={(e) => {
            // Beräkna vilken tid som klickades
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const hourIndex = Math.floor(y / 60);
            const minutes = Math.floor(((y % 60) / 60) * 60 / 15) * 15; // Runda till närmaste kvart
            
            const startHour = 7 + hourIndex;
            const startTime = `${String(startHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            const endTime = `${String(startHour + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            
            // Skapa ny aktivitet med förvalda värden
            onActivityClick({
              day,
              startTime,
              endTime,
              isNew: true
            });
          }}
          title={`Klicka för att lägga till aktivitet på ${day}`}
        />
      </div>

      {/* Visuell indikator för många överlappningar */}
      {activityGroups.some(group => group.length > 3) && (
        <div className="overlap-warning" title="Många överlappande aktiviteter">
          ⚠️
        </div>
      )}
    </div>
  );
};

export default DayColumn;