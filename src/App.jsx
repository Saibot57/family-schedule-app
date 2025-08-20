import React, { useState } from 'react';
import WeekView from './components/WeekView';
import ActivityModal from './components/ActivityModal';
import FamilySettingsModal from './components/FamilySettingsModal';
import { useSchedule } from './hooks/useSchedule';
import {
  Calendar, Plus, ChevronLeft, ChevronRight, CalendarDays,
  Home, Settings, Users, Download, Upload, Copy
} from 'lucide-react';
import { getWeekNumber, getWeekDateRange, formatWeekRange } from './utils/timeHelpers';
import './App.css';

const App = () => {
  const {
    activities,
    familyMembers,
    activityTypes,
    addActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForWeek,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    addActivityType,
    updateActivityType,
    deleteActivityType,
    copyWeek,
    exportSchedule,
    importSchedule,
    getStatistics
  } = useSchedule();

  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Veckohantering
  const today = new Date();
  const currentWeekNumber = getWeekNumber(today);
  const currentYear = today.getFullYear();

  const [selectedWeek, setSelectedWeek] = useState(currentWeekNumber);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Visa/dölj olika medlemstyper
  const [showAdults, setShowAdults] = useState(true);
  const [showChildren, setShowChildren] = useState(true);

  // Beräkna om vi visar nuvarande vecka
  const isCurrentWeek = selectedWeek === currentWeekNumber && selectedYear === currentYear;

  // Hämta datumintervall för vald vecka
  const weekDateRange = getWeekDateRange(selectedWeek, selectedYear);
  const weekRangeText = formatWeekRange(weekDateRange.start, weekDateRange.end);

  // Hämta statistik för veckan
  const weekStats = getStatistics(selectedWeek, selectedYear);

  // Hantera öppning av modal
  const handleOpenModal = (activity = null) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  // Hantera sparande av aktivitet
  const handleSaveActivity = (activityData) => {
    // Säkerställ att 'days' är en array för att undvika krascher.
    const daysToCreate = Array.isArray(activityData.days) ? activityData.days : [];

    // Ta bort temporära fält från objektet som ska sparas.
    const { days, ...restOfActivityData } = activityData;

    if (editingActivity && !editingActivity.isNew) {
        // VID REDIGERING: Uppdatera endast en aktivitet.
        // Använd den första dagen från listan som den nya dagen.
        const updatedActivity = {
            ...restOfActivityData,
            day: daysToCreate[0] || editingActivity.day, // Fallback till originaldagen
        };
        updateActivity(editingActivity.id, updatedActivity);

    } else {
        // VID NYSKAPANDE: Skapa en separat aktivitet för varje vald dag.
        daysToCreate.forEach(day => {
            const newActivity = {
                ...restOfActivityData,
                day: day, // Sätt den specifika dagen för denna aktivitet
                week: selectedWeek,
                year: selectedYear,
            };
            addActivity(newActivity);
        });
    }

    setModalOpen(false);
    setEditingActivity(null);
  };


  // Hantera borttagning av aktivitet
  const handleDeleteActivity = (id, deleteAll = false) => {
    deleteActivity(id, deleteAll);
    setModalOpen(false);
    setEditingActivity(null);
  };

  // Navigera veckor
  const navigateWeek = (direction) => {
    const newDate = new Date(selectedYear, 0, 1);
    newDate.setDate(newDate.getDate() + (selectedWeek - 1) * 7 + direction * 7);

    const newWeek = getWeekNumber(newDate);
    const newYear = newDate.getFullYear();

    setSelectedWeek(newWeek);
    setSelectedYear(newYear);
  };

  // Gå till dagens vecka
  const goToCurrentWeek = () => {
    setSelectedWeek(currentWeekNumber);
    setSelectedYear(currentYear);
  };

  // Kopiera denna vecka
  const handleCopyWeek = () => {
    const targetWeek = prompt(
      `Kopiera vecka ${selectedWeek} till vilken vecka? (1-52)`,
      String(selectedWeek + 1)
    );

    if (targetWeek) {
      const weekNum = parseInt(targetWeek);
      if (weekNum >= 1 && weekNum <= 52) {
        copyWeek(selectedWeek, selectedYear, weekNum, selectedYear);
        alert(`Vecka ${selectedWeek} kopierad till vecka ${weekNum}`);
      }
    }
  };

  // Hantera import
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importSchedule(file).then(() => {
        alert('Schema importerat!');
      }).catch(error => {
        alert('Kunde inte importera schemat: ' + error.message);
      });
    }
  };

  // Visa veckoväljare
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  // Filtrera synliga medlemmar
  const visibleMembers = familyMembers.filter(member => {
    if (member.type === 'child') return showChildren;
    if (member.type === 'adult') return showAdults;
    return true;
  });

  return (
    <div className="app">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <Calendar className="header-icon" />
              <div>
                <h1>Familjens Veckoschema</h1>
                <p className="week-info">
                  Vecka {selectedWeek}, {selectedYear} • {weekRangeText}
                </p>
              </div>
            </div>

            <div className="header-actions">
              <button
                onClick={() => handleOpenModal()}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Ny aktivitet
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                className="btn btn-secondary"
                title="Familjemedlemmar & Inställningar"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Familjeöversikt */}
          <div className="family-overview">
            <div className="family-members">
              {visibleMembers.map(member => (
                <div key={member.id} className="family-member-indicator">
                  <span className="member-icon">{member.icon}</span>
                  <span
                    className="member-dot"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="member-name">{member.name}</span>
                </div>
              ))}
            </div>

            <div className="view-toggles">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showChildren}
                  onChange={(e) => setShowChildren(e.target.checked)}
                />
                <span>Barn</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showAdults}
                  onChange={(e) => setShowAdults(e.target.checked)}
                />
                <span>Vuxna</span>
              </label>
            </div>
          </div>

          {/* Veckonavigering */}
          <div className="week-navigation">
            <div className="week-nav-group">
              <button
                onClick={() => navigateWeek(-1)}
                className="btn btn-icon"
                aria-label="Föregående vecka"
                title="Föregående vecka"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={goToCurrentWeek}
                className={`btn ${isCurrentWeek ? 'btn-primary' : 'btn-secondary'}`}
                disabled={isCurrentWeek}
                title="Gå till nuvarande vecka"
              >
                <Home size={16} />
                Denna vecka
              </button>

              <button
                onClick={() => navigateWeek(1)}
                className="btn btn-icon"
                aria-label="Nästa vecka"
                title="Nästa vecka"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="week-actions">
              <button
                onClick={() => setShowWeekPicker(!showWeekPicker)}
                className="btn btn-secondary"
                title="Välj specifik vecka"
              >
                <CalendarDays size={16} />
                Välj vecka
              </button>

              <button
                onClick={handleCopyWeek}
                className="btn btn-secondary"
                title="Kopiera denna vecka"
              >
                <Copy size={16} />
              </button>

              <button
                onClick={() => exportSchedule(selectedWeek, selectedYear)}
                className="btn btn-secondary"
                title="Exportera vecka"
              >
                <Download size={16} />
              </button>

              <label className="btn btn-secondary" title="Importera schema">
                <Upload size={16} />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Veckoväljare */}
          {showWeekPicker && (
            <div className="week-picker">
              <div className="week-picker-header">
                <label>År:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[...Array(5)].map((_, i) => {
                    const year = currentYear - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div className="week-picker-grid">
                {[...Array(52)].map((_, i) => {
                  const weekNum = i + 1;
                  const isSelected = weekNum === selectedWeek && selectedYear === selectedYear;
                  const isCurrent = weekNum === currentWeekNumber && selectedYear === currentYear;

                  return (
                    <button
                      key={weekNum}
                      onClick={() => {
                        setSelectedWeek(weekNum);
                        setShowWeekPicker(false);
                      }}
                      className={`week-picker-btn ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      {weekNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statistik */}
          {weekStats.conflicts.length > 0 && (
            <div className="week-conflicts">
              <span className="conflict-warning">
                ⚠️ {weekStats.conflicts.length} överlappande aktiviteter denna vecka
              </span>
            </div>
          )}

          {/* Visa om vi tittar på en annan vecka */}
          {!isCurrentWeek && (
            <div className="week-notice">
              <span>
                Du tittar på {selectedWeek < currentWeekNumber ? 'en tidigare' : 'en kommande'} vecka
              </span>
              {Math.abs(selectedWeek - currentWeekNumber) > 4 && (
                <span className="week-distance">
                  ({Math.abs(selectedWeek - currentWeekNumber)} veckor {selectedWeek < currentWeekNumber ? 'sedan' : 'framåt'})
                </span>
              )}
            </div>
          )}
        </header>

        {/* Veckoschema */}
        <main className="app-main">
          <WeekView
            activities={getActivitiesForWeek(selectedWeek, selectedYear)}
            familyMembers={visibleMembers}
            activityTypes={activityTypes}
            currentWeek={selectedWeek}
            currentYear={selectedYear}
            onActivityClick={handleOpenModal}
            weekDateRange={weekDateRange}
          />
        </main>

        {/* Modal för aktivitetshantering */}
        {modalOpen && (
          <ActivityModal
            isOpen={modalOpen}
            activity={editingActivity}
            familyMembers={familyMembers}
            onSave={handleSaveActivity}
            onDelete={handleDeleteActivity}
            onClose={() => {
              setModalOpen(false);
              setEditingActivity(null);
            }}
          />
        )}

        {/* Modal för familjeinställningar */}
        {settingsOpen && (
          <FamilySettingsModal
            isOpen={settingsOpen}
            familyMembers={familyMembers}
            activityTypes={activityTypes}
            onAddMember={addFamilyMember}
            onUpdateMember={updateFamilyMember}
            onDeleteMember={deleteFamilyMember}
            onAddType={addActivityType}
            onUpdateType={updateActivityType}
            onDeleteType={deleteActivityType}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default App;