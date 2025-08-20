import React, { useState, useEffect, useRef } from 'react';
import {
    X, Save, Trash2, MapPin, Calendar, Clock, Users, Tag, Repeat, AlertCircle, Search
} from 'lucide-react';
import './ActivityModal.css';

const ActivityModal = ({
    isOpen,
    activity,
    familyMembers,
    onSave,
    onDelete,
    onClose
}) => {
    const allDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'];

    const getInitialFormData = () => ({
        participants: [],
        name: '',
        days: [],
        startTime: '08:00',
        endTime: '09:00',
        location: '',
        notes: '',
        recurring: false,
        recurringEndDate: '',
        updateAllRecurring: false,
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [errors, setErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // States för deltagarsök
    const [participantSearch, setParticipantSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const searchRef = useRef(null);

    // Initiera formulärdata
    useEffect(() => {
        if (!isOpen) return;

        let initialData;
        if (activity) {
            if (activity.isNew) {
                initialData = {
                    ...getInitialFormData(),
                    days: [activity.day],
                    startTime: activity.startTime,
                    endTime: activity.endTime,
                };
            } else {
                initialData = {
                    ...getInitialFormData(),
                    ...activity,
                    days: [activity.day],
                    participants: activity.participants || [],
                };
            }
        } else {
            initialData = getInitialFormData();
        }
        
        setFormData(initialData);
        setErrors({});
        setShowDeleteConfirm(false);
        setParticipantSearch('');

    }, [activity, isOpen]);

    // Filtrera deltagare
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

    // Stäng dropdown vid klick utanför
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Ange ett namn för aktiviteten';
        if (formData.participants.length === 0) newErrors.participants = 'Välj minst en deltagare';
        if (formData.days.length === 0) newErrors.days = 'Välj minst en dag';
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
            newErrors.recurringEndDate = 'Ange slutdatum för återkommande aktivitet';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const toggleDay = (day) => {
        const newDays = formData.days.includes(day)
            ? formData.days.filter(d => d !== day)
            : [...formData.days, day];
        handleChange('days', newDays);
    };

    const addParticipant = (memberId) => {
        handleChange('participants', [...formData.participants, memberId]);
        setParticipantSearch('');
        setIsDropdownOpen(false);
    };

    const removeParticipant = (memberId) => {
        handleChange('participants', formData.participants.filter(id => id !== memberId));
    };

    const handleSave = () => {
        if (validateForm()) {
            onSave(formData);
        }
    };

    const handleDelete = () => {
        if (activity && !activity.isNew) {
            onDelete(activity.id);
        }
        setShowDeleteConfirm(false);
    };

    // Beräkna antal veckor för återkommande aktivitet
    const calculateWeeks = () => {
        if (!formData.recurring || !formData.recurringEndDate) return 0;
        
        const today = new Date();
        const endDate = new Date(formData.recurringEndDate);
        const diffTime = endDate - today;
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        return Math.max(1, diffWeeks);
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
                    {/* Aktivitetsnamn */}
                    <div className="form-group">
                        <label><Tag size={16} /> Aktivitet <span className="required">*</span></label>
                        <input
                            type="text"
                            placeholder="Namnge aktiviteten (t.ex. Fotbollsträning)"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    {/* Deltagare */}
                    <div className="form-group" ref={searchRef}>
                         <label><Users size={16} /> Deltagare <span className="required">*</span></label>
                         <div className="participant-pills">
                            {formData.participants.map(id => {
                                const member = familyMembers.find(m => m.id === id);
                                if (!member) return null;
                                return (
                                    <span key={id} className="pill">
                                        <span className="member-icon">{member.icon}</span>
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
                                    <li key={member.id} onClick={() => addParticipant(member.id)}>
                                        <span className="member-icon">{member.icon}</span>
                                        <span className="member-dot-small" style={{ backgroundColor: member.color }} />
                                        {member.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.participants && <span className="error-message">{errors.participants}</span>}
                    </div>

                    {/* Val av flera dagar */}
                    <div className="form-group">
                        <label><Calendar size={16} /> Dagar <span className="required">*</span></label>
                        <div className="day-selector">
                            {allDays.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`day-btn ${formData.days.includes(day) ? 'selected' : ''}`}
                                >
                                    {day.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                        {errors.days && <span className="error-message">{errors.days}</span>}
                    </div>

                    {/* Tid */}
                     <div className="form-row">
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

                    {/* Återkommande aktivitet */}
                    <div className="form-group">
                        <div className="recurring-checkbox">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.recurring}
                                    onChange={(e) => handleChange('recurring', e.target.checked)}
                                />
                                <Repeat size={16} />
                                Återkommande aktivitet
                            </label>
                        </div>
                        
                        {formData.recurring && (
                            <div className="recurring-options">
                                <div className="recurring-info">
                                    <AlertCircle size={16} className="info-icon" />
                                    <span>Aktiviteten kommer att upprepas varje vecka på valda dagar</span>
                                </div>
                                
                                <div className="form-group">
                                    <label>Upprepa till och med <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.recurringEndDate}
                                        onChange={(e) => handleChange('recurringEndDate', e.target.value)}
                                        className={errors.recurringEndDate ? 'error' : ''}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.recurringEndDate && <span className="error-message">{errors.recurringEndDate}</span>}
                                </div>

                                {formData.recurringEndDate && (
                                    <div className="recurring-preview">
                                        <span className="preview-text">
                                            Skapar ca {calculateWeeks()} aktiviteter ({formData.days.length} dagar/vecka)
                                        </span>
                                    </div>
                                )}

                                {activity && !activity.isNew && activity.recurringGroupId && (
                                    <div className="recurring-update-options">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.updateAllRecurring}
                                                onChange={(e) => handleChange('updateAllRecurring', e.target.checked)}
                                            />
                                            Uppdatera alla framtida aktiviteter i serien
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="footer-left">
                        {activity && !activity.isNew && (
                            showDeleteConfirm ? (
                                <div className="delete-confirm">
                                    <span>Säker?</span>
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