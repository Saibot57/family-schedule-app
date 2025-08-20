import { useState, useEffect, useCallback } from 'react';
import { getWeekNumber } from '../utils/timeHelpers';

// Initial familjemedlemmar (kan anpassas)
const getInitialFamilyMembers = () => {
  const stored = localStorage.getItem('familyMembers');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return [
    { id: 'rut', name: 'Rut', color: '#ef4444', type: 'child', icon: '👧' },
    { id: 'pim', name: 'Pim', color: '#3b82f6', type: 'child', icon: '👦' },
    { id: 'siv', name: 'Siv', color: '#10b981', type: 'child', icon: '👧' },
    { id: 'parent1', name: 'Mamma', color: '#8b5cf6', type: 'adult', icon: '👩' },
    { id: 'parent2', name: 'Pappa', color: '#f59e0b', type: 'adult', icon: '👨' },
    { id: 'family', name: 'Hela familjen', color: '#ec4899', type: 'group', icon: '👨‍👩‍👧‍👦' }
  ];
};

// Initial aktivitetstyper (kan anpassas)
const getInitialActivityTypes = () => {
  const stored = localStorage.getItem('activityTypes');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return [
    { id: 'school', name: 'Skola', color: '#3b82f6' },
    { id: 'preschool', name: 'Förskola', color: '#8b5cf6' },
    { id: 'afterschool', name: 'Fritids', color: '#f59e0b' },
    { id: 'sport', name: 'Sport', color: '#10b981' },
    { id: 'music', name: 'Musik', color: '#ec4899' },
    { id: 'doctor', name: 'Läkarbesök', color: '#ef4444' },
    { id: 'dentist', name: 'Tandläkare', color: '#06b6d4' },
    { id: 'party', name: 'Kalas', color: '#f97316' },
    { id: 'homework', name: 'Läxor', color: '#6366f1' },
    { id: 'meal', name: 'Måltid', color: '#84cc16' },
    { id: 'meeting', name: 'Möte', color: '#64748b' },
    { id: 'travel', name: 'Resa', color: '#0ea5e9' },
    { id: 'shopping', name: 'Handla', color: '#fb923c' },
    { id: 'cleaning', name: 'Städning', color: '#a855f7' },
    { id: 'other', name: 'Annat', color: '#94a3b8' }
  ];
};

// Hook för schemahantering
export const useSchedule = () => {
  const STORAGE_KEY = 'familySchedule';
  const MEMBERS_KEY = 'familyMembers';
  const TYPES_KEY = 'activityTypes';
  
  // State för familjemedlemmar
  const [familyMembers, setFamilyMembers] = useState(getInitialFamilyMembers);
  
  // State för aktivitetstyper
  const [activityTypes, setActivityTypes] = useState(getInitialActivityTypes);
  
  // State för aktiviteter
  const [activities, setActivities] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.activities || [];
      } catch (error) {
        console.error('Fel vid laddning av schema:', error);
        return [];
      }
    }
    return [];
  });

  // Spara till localStorage när state ändras
  useEffect(() => {
    const dataToStore = {
      activities,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem(TYPES_KEY, JSON.stringify(activityTypes));
  }, [activityTypes]);

  // Hjälpfunktion för att beräkna veckor mellan datum
  const getWeeksBetweenDates = (startDate, endDate) => {
    const weeks = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const weekNumber = getWeekNumber(current);
      const year = current.getFullYear();
      weeks.push({ week: weekNumber, year });
      current.setDate(current.getDate() + 7);
    }
    
    return weeks;
  };

  // Lägg till aktivitet
  const addActivity = useCallback((activityData) => {
    const currentDate = new Date();
    const currentWeekNumber = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    // Om det är en återkommande aktivitet
    if (activityData.recurring && activityData.recurringEndDate) {
      const activities = [];
      const endDate = new Date(activityData.recurringEndDate);
      const weeks = getWeeksBetweenDates(currentDate, endDate);
      const recurringGroupId = `recurring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Skapa en aktivitet för varje dag i varje vecka
      weeks.forEach(({ week, year }) => {
        activityData.days.forEach(day => {
          const newActivity = {
            ...activityData,
            id: `activity-${Date.now()}-${week}-${day}-${Math.random().toString(36).substr(2, 9)}`,
            day: day,
            week: week,
            year: year,
            recurringGroupId: recurringGroupId,
            createdAt: new Date().toISOString()
          };
          
          // Ta bort temporära fält
          delete newActivity.days;
          delete newActivity.recurringEndDate;
          
          activities.push(newActivity);
        });
      });
      
      setActivities(prev => [...prev, ...activities]);
      return activities;
    } else {
      // Vanlig aktivitet eller enstaka aktivitet
      const activities = [];
      
      activityData.days.forEach(day => {
        const newActivity = {
          ...activityData,
          id: `activity-${Date.now()}-${day}-${Math.random().toString(36).substr(2, 9)}`,
          day: day,
          week: currentWeekNumber,
          year: currentYear,
          createdAt: new Date().toISOString()
        };
        
        // Ta bort temporära fält
        delete newActivity.days;
        delete newActivity.recurringEndDate;
        
        activities.push(newActivity);
      });
      
      setActivities(prev => [...prev, ...activities]);
      return activities;
    }
  }, []);

  // Uppdatera aktivitet
  const updateActivity = useCallback((id, updates) => {
    setActivities(prev => {
      const activity = prev.find(a => a.id === id);
      
      if (activity?.recurringGroupId && updates.updateAllRecurring) {
        // Uppdatera alla i gruppen
        return prev.map(a => 
          a.recurringGroupId === activity.recurringGroupId
            ? { ...a, ...updates, id: a.id, week: a.week, year: a.year, day: a.day }
            : a
        );
      } else {
        // Uppdatera bara denna
        return prev.map(a => 
          a.id === id 
            ? { ...a, ...updates }
            : a
        );
      }
    });
  }, []);

  // Ta bort aktivitet
  const deleteActivity = useCallback((id, deleteAll = false) => {
    setActivities(prev => {
      const activity = prev.find(a => a.id === id);
      if (activity?.recurringGroupId && deleteAll) {
        // Ta bort alla i gruppen
        return prev.filter(a => a.recurringGroupId !== activity.recurringGroupId);
      } else {
        // Ta bort bara denna
        return prev.filter(a => a.id !== id);
      }
    });
  }, []);

  // Hämta aktiviteter för en specifik vecka
  const getActivitiesForWeek = useCallback((weekNumber, year) => {
    return activities.filter(activity => {
      // Filtrera på vecka och år
      if (activity.week && activity.year) {
        return activity.week === weekNumber && activity.year === year;
      }
      
      // Bakåtkompatibilitet för aktiviteter utan vecka/år
      return !activity.week;
    });
  }, [activities]);

  // Lägg till familjemedlem
  const addFamilyMember = useCallback((memberData) => {
    const newMember = {
      ...memberData,
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setFamilyMembers(prev => [...prev, newMember]);
    return newMember;
  }, []);

  // Uppdatera familjemedlem
  const updateFamilyMember = useCallback((id, updates) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === id 
          ? { ...member, ...updates }
          : member
      )
    );
  }, []);

  // Ta bort familjemedlem
  const deleteFamilyMember = useCallback((id) => {
    // Ta bort medlemmen
    setFamilyMembers(prev => prev.filter(member => member.id !== id));
    
    // Ta bort eller uppdatera aktiviteter som inkluderar denna medlem
    setActivities(prev => 
      prev.map(activity => {
        if (activity.participants?.includes(id)) {
          const newParticipants = activity.participants.filter(p => p !== id);
          return newParticipants.length > 0 
            ? { ...activity, participants: newParticipants }
            : null;
        }
        return activity;
      }).filter(Boolean)
    );
  }, []);

  // Lägg till aktivitetstyp
  const addActivityType = useCallback((typeData) => {
    const newType = {
      ...typeData,
      id: `type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setActivityTypes(prev => [...prev, newType]);
    return newType;
  }, []);

  // Uppdatera aktivitetstyp
  const updateActivityType = useCallback((id, updates) => {
    setActivityTypes(prev => 
      prev.map(type => 
        type.id === id 
          ? { ...type, ...updates }
          : type
      )
    );
  }, []);

  // Ta bort aktivitetstyp
  const deleteActivityType = useCallback((id) => {
    setActivityTypes(prev => prev.filter(type => type.id !== id));
  }, []);

  // Kopiera vecka
  const copyWeek = useCallback((fromWeek, fromYear, toWeek, toYear) => {
    const activitiesToCopy = getActivitiesForWeek(fromWeek, fromYear);
    const copiedActivities = activitiesToCopy.map(activity => ({
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      week: toWeek,
      year: toYear,
      recurring: false,
      recurringGroupId: null
    }));
    
    setActivities(prev => [...prev, ...copiedActivities]);
    return copiedActivities;
  }, [getActivitiesForWeek]);

  // Hämta statistik
  const getStatistics = useCallback((weekNumber, year) => {
    const weekActivities = getActivitiesForWeek(weekNumber, year);
    
    const stats = {
      totalActivities: weekActivities.length,
      byMember: {},
      byType: {},
      byDay: {},
      totalHours: 0,
      conflicts: [],
      recurringActivities: weekActivities.filter(a => a.recurringGroupId).length
    };

    // Analysera aktiviteter
    weekActivities.forEach(activity => {
      // Per medlem
      if (activity.participants) {
        activity.participants.forEach(participantId => {
          if (!stats.byMember[participantId]) {
            stats.byMember[participantId] = {
              count: 0,
              hours: 0,
              activities: []
            };
          }
          stats.byMember[participantId].count++;
          stats.byMember[participantId].activities.push(activity);
          
          // Beräkna timmar
          const [startH, startM] = activity.startTime.split(':').map(Number);
          const [endH, endM] = activity.endTime.split(':').map(Number);
          const hours = (endH - startH) + (endM - startM) / 60;
          stats.byMember[participantId].hours += hours;
        });
      }
      
      // Per typ (använd aktivitetsnamn istället för typ)
      const activityName = activity.name || 'Okänd aktivitet';
      if (!stats.byType[activityName]) {
        stats.byType[activityName] = 0;
      }
      stats.byType[activityName]++;
      
      // Per dag
      if (!stats.byDay[activity.day]) {
        stats.byDay[activity.day] = 0;
      }
      stats.byDay[activity.day]++;
    });

    // Hitta konflikter (överlappande aktiviteter för samma person)
    Object.values(stats.byMember).forEach(memberData => {
      memberData.activities.forEach((activity1, i) => {
        memberData.activities.slice(i + 1).forEach(activity2 => {
          if (activity1.day === activity2.day) {
            const start1 = activity1.startTime.split(':').map(Number);
            const end1 = activity1.endTime.split(':').map(Number);
            const start2 = activity2.startTime.split(':').map(Number);
            const end2 = activity2.endTime.split(':').map(Number);
            
            const start1Min = start1[0] * 60 + start1[1];
            const end1Min = end1[0] * 60 + end1[1];
            const start2Min = start2[0] * 60 + start2[1];
            const end2Min = end2[0] * 60 + end2[1];
            
            if (start1Min < end2Min && start2Min < end1Min) {
              stats.conflicts.push({
                activity1,
                activity2,
                day: activity1.day
              });
            }
          }
        });
      });
    });

    return stats;
  }, [getActivitiesForWeek]);

  // Exportera schema
  const exportSchedule = useCallback((weekNumber, year) => {
    const data = {
      week: weekNumber,
      year,
      activities: getActivitiesForWeek(weekNumber, year),
      familyMembers,
      activityTypes,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `veckoschema-v${weekNumber}-${year}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [getActivitiesForWeek, familyMembers, activityTypes]);

  // Importera schema
  const importSchedule = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          
          if (imported.activities) {
            setActivities(prev => [...prev, ...imported.activities]);
          }
          
          if (imported.familyMembers) {
            // Merga med befintliga medlemmar
            const existingIds = familyMembers.map(m => m.id);
            const newMembers = imported.familyMembers.filter(m => !existingIds.includes(m.id));
            if (newMembers.length > 0) {
              setFamilyMembers(prev => [...prev, ...newMembers]);
            }
          }
          
          if (imported.activityTypes) {
            // Merga med befintliga typer
            const existingIds = activityTypes.map(t => t.id);
            const newTypes = imported.activityTypes.filter(t => !existingIds.includes(t.id));
            if (newTypes.length > 0) {
              setActivityTypes(prev => [...prev, ...newTypes]);
            }
          }
          
          resolve(imported);
        } catch (error) {
          console.error('Fel vid import av schema:', error);
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }, [familyMembers, activityTypes]);

  return {
    // Aktiviteter
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForWeek,
    copyWeek,
    
    // Familjemedlemmar
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    
    // Aktivitetstyper
    activityTypes,
    addActivityType,
    updateActivityType,
    deleteActivityType,
    
    // Verktyg
    getStatistics,
    exportSchedule,
    importSchedule,
    
    // Barn (bakåtkompatibilitet)
    children: familyMembers.filter(m => m.type === 'child')
  };
};