import React, { useState } from 'react';
import { Clock, MapPin, FileText, AlertCircle, Users, Repeat } from 'lucide-react';
import { calculatePosition } from '../utils/timeHelpers';
import './ActivityBlock.css';

const ActivityBlock = ({ 
  activity, 
  familyMembers, 
  activityTypes,
  onClick, 
  style,
  columnCount,
  columnIndex
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Beräkna position och höjd baserat på tid
  const { top, height } = calculatePosition(activity.startTime, activity.endTime);
  
  // Bestäm om vi ska visa kompakt vy (för korta aktiviteter eller många kolumner)
  const isCompact = height < 50 || columnCount > 2;
  
  // Hämta deltagare
  const participants = activity.participants?.map(id => 
    familyMembers.find(m => m.id === id)
  ).filter(Boolean) || [];
  
  // Formatera tid för visning
  const formatTimeRange = (start, end) => {
    return `${start} - ${end}`;
  };
  
  // Kontrollera om aktiviteten har viktig information
  const hasImportantInfo = activity.notes && 
    (activity.notes.toLowerCase().includes('viktig') || 
     activity.notes.toLowerCase().includes('glöm inte') ||
     activity.notes.toLowerCase().includes('obs'));
  
  // Bestäm bakgrundsfärg baserat på deltagare
  const getBackgroundStyle = () => {
    if (participants.length === 0) {
      return { backgroundColor: '#94a3b8' };
    }
    
    if (participants.length === 1) {
      return { backgroundColor: participants[0].color };
    }
    
    // Flera deltagare - använd gradient
    const colors = participants.map(p => p.color);
    if (colors.length === 2) {
      return {
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 49%, ${colors[1]} 51%, ${colors[1]} 100%)`
      };
    } else {
      // Fler än 2 deltagare - använd aktivitetens färg med deltagarprickar
      return { backgroundColor: '#64748b' };
    }
  };
  
  // Visa deltagarlista
  const renderParticipants = () => {
    if (participants.length === 0) return null;
    
    if (isCompact) {
      // Kompakt vy - visa bara ikoner
      return (
        <div className="participants-compact">
          {participants.slice(0, 3).map(p => (
            <span key={p.id} className="participant-icon" title={p.name}>
              {p.icon}
            </span>
          ))}
          {participants.length > 3 && (
            <span className="more-participants">+{participants.length - 3}</span>
          )}
        </div>
      );
    }
    
    // Normal vy
    return (
      <div className="participants-list">
        {participants.map(p => (
          <span key={p.id} className="participant-tag">
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </span>
        ))}
      </div>
    );
  };
  
  // Z-index baserat på kolumn för att undvika överlappningsproblem
  const zIndex = 5 + (columnCount - columnIndex);

  return (
    <div
      className={`activity-block ${isCompact ? 'compact' : ''} ${isHovered ? 'hovered' : ''} ${columnCount > 2 ? 'narrow' : ''}`}
      style={{
        ...getBackgroundStyle(),
        top: `${top}px`,
        height: `${height}px`,
        ...style,
        zIndex: isHovered ? 50 : zIndex
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${activity.name} - ${participants.map(p => p.name).join(', ')} ${formatTimeRange(activity.startTime, activity.endTime)}`}
    >
      <div className="activity-content">
        {/* Header med aktivitetsnamn och varningar */}
        <div className="activity-header">
          <span className="activity-name" title={activity.name}>
            {activity.name}
          </span>
          {hasImportantInfo && (
            <AlertCircle className="important-indicator" size={12} />
          )}
          {activity.recurring && (
            <Repeat className="recurring-indicator" size={12} title="Återkommande" />
          )}
        </div>

        {/* Deltagare */}
        {renderParticipants()}

        {/* Tid */}
        <div className="activity-time">
          <Clock size={10} />
          <span>{formatTimeRange(activity.startTime, activity.endTime)}</span>
        </div>

        {/* Plats om det finns och inte kompakt */}
        {activity.location && !isCompact && (
          <div className="activity-location">
            <MapPin size={10} />
            <span>{activity.location}</span>
          </div>
        )}

        {/* Anteckningar om det finns och inte kompakt */}
        {activity.notes && !isCompact && (
          <div className="activity-notes">
            <FileText size={10} />
            <span className="notes-text">{activity.notes}</span>
          </div>
        )}
      </div>

      {/* Hover tooltip för kompakt vy eller smala kolumner */}
      {(isCompact || columnCount > 2) && isHovered && (
        <div className="activity-tooltip">
          <div className="tooltip-content">
            <div className="tooltip-header">
              <strong>{activity.name}</strong>
            </div>
            
            <div className="tooltip-participants">
              <Users size={12} />
              {participants.map(p => (
                <span key={p.id} className="tooltip-participant">
                  {p.icon} {p.name}
                </span>
              ))}
            </div>
            
            <div className="tooltip-time">
              <Clock size={12} />
              {formatTimeRange(activity.startTime, activity.endTime)}
            </div>
            
            {activity.location && (
              <div className="tooltip-location">
                <MapPin size={12} />
                {activity.location}
              </div>
            )}
            
            {activity.notes && (
              <div className="tooltip-notes">
                <FileText size={12} />
                {activity.notes}
              </div>
            )}
            
            {activity.recurring && (
              <div className="tooltip-recurring">
                <Repeat size={12} />
                Återkommande aktivitet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visuell indikator för flera deltagare */}
      {participants.length > 2 && !isCompact && (
        <div className="multi-participant-dots">
          {participants.slice(0, 5).map(p => (
            <span 
              key={p.id}
              className="participant-dot"
              style={{ backgroundColor: p.color }}
              title={p.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityBlock;