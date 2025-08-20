import React, { useState, useEffect, useRef } from 'react';
import {
    X, Save, Trash2, Copy, Bell, MapPin, Calendar,
    Clock, Users, Tag, Repeat, AlertCircle, ChevronDown, Search
} from 'lucide-react';
import './ActivityModal.css';

// Hjälpfunktion för att beräkna veckor mellan två datum
const getWeeksBetween = (startDate, endDate) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay));
    return Math.ceil(diffDays / 7);
};


const ActivityModal = ({
    isOpen,
    activity,
    familyMembers,
    activityTypes,
    currentWeek,
    currentYear,
    onSave,
    onDelete,
    onClose
}) => {
    const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'];

    const getInitialFormData = () => ({
        participants: [],
        type: 'school',
        day: 'Måndag',
        startTime: '08:00',
        endTime: '09:00',
        location: '',
        notes: '',
        recurring: false,
        recurringEndDate: '',
        updateAllRecurring: false,
        reminder: false,
        reminderTime: '15'
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [errors, setErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRecurringOptions, setShowRecurringOptions] = useState(false);

    // --- Nya states för de önskade funktionerna ---
    const [participantSearch, setParticipantSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [isTagsExpanded, setIsTagsExpanded] = useState(false);
    const searchRef = useRef(null);


    // Initiera formulärdata när modalen öppnas
    useEffect(() => {
        if (!isOpen) return;

        let initialData;
        if (activity) {
            if (activity.isNew) {
                // Ny aktivitet från klick i schemat
                initialData = {
                    ...getInitialFormData(),
                    day: activity.day,
                    startTime: activity.startTime,
                    endTime: activity.endTime,
                };
            } else {
                // Redigera existerande aktivitet
                initialData = {
                    ...getInitialFormData(),
                    ...activity,
                    participants: activity.participants || [],
                };
                if (activity.recurringGroupId) {
                    setShowRecurringOptions(true);
                }
            }
        } else {
            // Helt ny aktivitet från "Ny aktivitet"-knappen
            initialData = getInitialFormData();
        }
        setFormData(initialData);
        // Återställ allt annat
        setErrors({});
        setShowDeleteConfirm(false);
        setParticipantSearch('');
        setIsTagsExpanded(false);

    }, [activity, isOpen]);

    // Filtrera deltagare baserat på sökning
    useEffect(() => {
        if (!familyMembers) return;
        const availableMembers = familyMembers.filter(
            (member) => !formData.participants.includes(member.id)
        );

        if (participantSearch === '') {
            setFilteredParticipants(availableMembers);
        } else {
            setFilteredParticipants(
                availableMembers.filter((member) =>
                    member.name.toLowerCase().includes(participantSearch.toLowerCase())
                )
            );
        }
    }, [participantSearch, formData.participants, familyMembers]);


    // Hantera klick utanför deltagar-sök för att stänga dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    // Validera formulär
    const validateForm = () => {
        const newErrors = {};
        if (formData.participants.length === 0) newErrors.participants = 'Välj minst en deltagare';
        if (!formData.type) newErrors.type = 'Välj en aktivitetstyp';
        if (!formData.day) newErrors.day = 'Välj en dag';
        if (!formData.startTime) newErrors.startTime = 'Ange starttid';
        if (!formData.endTime) newErrors.endTime = 'Ange sluttid';

        if (formData.startTime && formData.endTime) {
            const start = formData.startTime.split(':').map(Number);
            const end = formData.endTime.split(':').map(Number);
            if (end[0] * 60 + end[1] <= start[0] * 60 + start[1]) {
                newErrors.endTime = 'Sluttid måste vara efter starttid';
            }
        }
        if (formData.recurring && !formData.recurringEndDate) {
            newErrors.recurringEndDate = 'Ange ett slutdatum';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    // --- Funktioner för deltagarhantering ---
    const addParticipant = (memberId) => {
        handleChange('participants', [...formData.participants, memberId]);
        setParticipantSearch('');
        setIsDropdownOpen(false);
    };

    const removeParticipant = (memberId) => {
        handleChange('participants', formData.participants.filter(id => id !== memberId));
    };


    // Hantera sparande
    const handleSave = () => {
        if (validateForm()) {
            let dataToSave = { ...formData };
            if (dataToSave.recurring && dataToSave.recurringEndDate) {
                // Logik för att omvandla slutdatum till 'recurringWeeks' om det behövs av useSchedule
                // Denna logik kan behöva justeras beroende på hur `useSchedule` uppdateras.
                const startDate = new Date(); // Detta bör baseras på aktivitetens startdatum
                const endDate = new Date(dataToSave.recurringEndDate);
                dataToSave.recurringWeeks = getWeeksBetween(startDate, endDate);
            }
            onSave(dataToSave);
        }
    };


    const handleDelete = () => {
        if (activity && !activity.isNew) {
            onDelete(activity.id, showRecurringOptions && formData.updateAllRecurring);
        }
        setShowDeleteConfirm(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{activity && !activity.isNew ? 'Redigera aktivitet' : 'Ny aktivitet'}</h2>
                    <button className="close-button" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {/* Deltagare med sökfunktion */}
                    <div className="form-group" ref={searchRef}>
                        <label><Users size={16} /> Deltagare <span className="required">*</span></label>
                        <div className="participant-pills">
                            {formData.participants.map(id => {
                                const member = familyMembers.find(m => m.id === id);
                                if (!member) return null;
                                return (
                                    <span key={id} className="pill">
                                        <span className="member-dot-small" style={{ backgroundColor: member.color }} />
                                        {member.name}
                                        <button onClick={() => removeParticipant(id)}><X size={12} /></button>
                                    </span>
                                );
                            })}
                        </div>
                        <div className="search-container">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                value={participantSearch}
                                onChange={(e) => setParticipantSearch(e.target.value)}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Sök och lägg till deltagare..."
                                className="participant-search-input"
                            />
                        </div>
                        {isDropdownOpen && filteredParticipants.length > 0 && (
                            <ul className="participant-dropdown">
                                {filteredParticipants.map(member => (
                                    <li key={member.id} onClick={() => addParticipant(member.id)} tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && addParticipant(member.id)}>
                                        <span className="member-dot-small" style={{ backgroundColor: member.color }} />
                                        {member.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.participants && <span className="error-message">{errors.participants}</span>}
                    </div>

                    {/* Hopfällbar aktivitetstyp */}
                    <div className="form-group">
                        <button className="expandable-header" onClick={() => setIsTagsExpanded(!isTagsExpanded)}>
                            <label><Tag size={16} /> Aktivitet <span className="required">*</span></label>
                            <ChevronDown size={20} className={`chevron-icon ${isTagsExpanded ? 'expanded' : ''}`} />
                        </button>
                        {isTagsExpanded && (
                            <div className="activity-type-grid">
                                {activityTypes.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`type-select-btn ${formData.type === type.id ? 'selected' : ''}`}
                                        onClick={() => handleChange('type', type.id)}
                                        style={{ borderColor: formData.type === type.id ? type.color : '#e5e7eb' }}
                                    >
                                        <span className="type-icon">{type.icon}</span>
                                        <span className="type-name">{type.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.type && <span className="error-message">{errors.type}</span>}
                    </div>

                    {/* Dag och tid */}
                    <div className="form-row">
                        <div className="form-group">
                            <label><Calendar size={16} /> Dag <span className="required">*</span></label>
                            <select value={formData.day} onChange={(e) => handleChange('day', e.target.value)} className={errors.day ? 'error' : ''}>
                                {days.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                            {errors.day && <span className="error-message">{errors.day}</span>}
                        </div>
                        <div className="form-group">
                            <label><Clock size={16} /> Starttid <span className="required">*</span></label>
                            <input type="time" value={formData.startTime} onChange={(e) => handleChange('startTime', e.target.value)} className={errors.startTime ? 'error' : ''} />
                            {errors.startTime && <span className="error-message">{errors.startTime}</span>}
                        </div>
                        <div className="form-group">
                            <label>Sluttid <span className="required">*</span></label>
                            <input type="time" value={formData.endTime} onChange={(e) => handleChange('endTime', e.target.value)} className={errors.endTime ? 'error' : ''} />
                            {errors.endTime && <span className="error-message">{errors.endTime}</span>}
                        </div>
                    </div>

                    {/* Plats & Anteckningar */}
                    <div className="form-group">
                        <label><MapPin size={16} /> Plats</label>
                        <input type="text" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="T.ex. Sporthallen..." />
                    </div>
                    <div className="form-group">
                        <label>Anteckningar</label>
                        <textarea value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} rows="3" placeholder="T.ex. Ta med gympakläder..." />
                    </div>

                    {/* Återkommande med slutdatum */}
                    <div className="form-options">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={formData.recurring} onChange={(e) => handleChange('recurring', e.target.checked)} />
                            <Repeat size={16} /> <span>Återkommande aktivitet</span>
                        </label>
                        {formData.recurring && (
                            <div className="recurring-options">
                                <label htmlFor="recurringEndDate">Återkommande till och med:</label>
                                <input
                                    type="date"
                                    id="recurringEndDate"
                                    value={formData.recurringEndDate}
                                    onChange={(e) => handleChange('recurringEndDate', e.target.value)}
                                    className={`weeks-input ${errors.recurringEndDate ? 'error' : ''}`}
                                />
                                {errors.recurringEndDate && <span className="error-message">{errors.recurringEndDate}</span>}
                            </div>
                        )}

                        {showRecurringOptions && (
                            <label className="checkbox-label warning-option">
                                <input type="checkbox" checked={formData.updateAllRecurring} onChange={(e) => handleChange('updateAllRecurring', e.target.checked)} />
                                <AlertCircle size={16} /> <span>Uppdatera alla i serien</span>
                            </label>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="footer-left">
                        {activity && !activity.isNew && (
                            showDeleteConfirm ? (
                                <div className="delete-confirm">
                                    <span>Säker?</span>
                                    {showRecurringOptions && (
                                        <label className="inline-checkbox">
                                            <input type="checkbox" checked={formData.updateAllRecurring} onChange={(e) => handleChange('updateAllRecurring', e.target.checked)} />
                                            <span>Ta bort alla</span>
                                        </label>
                                    )}
                                    <button className="btn btn-danger-confirm" onClick={handleDelete}>Ja, ta bort</button>
                                    <button className="btn btn-text" onClick={() => setShowDeleteConfirm(false)}>Avbryt</button>
                                </div>
                            ) : (
                                <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}><Trash2 size={16} /> Ta bort</button>
                            )
                        )}
                    </div>
                    <div className="footer-right">
                        <button className="btn btn-text" onClick={onClose}>Avbryt</button>
                        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Spara</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityModal;