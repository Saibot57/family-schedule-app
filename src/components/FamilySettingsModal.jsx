import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, Users, Tag, Palette } from 'lucide-react';
import './FamilySettingsModal.css';

const FamilySettingsModal = ({
  isOpen,
  familyMembers,
  activityTypes,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onAddType,
  onUpdateType,
  onDeleteType,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('members');
  const [editingMember, setEditingMember] = useState(null);
  const [editingType, setEditingType] = useState(null);
  
  // Formulärdata för ny/redigera medlem
  const [memberForm, setMemberForm] = useState({
    name: '',
    type: 'child',
    color: '#3b82f6',
    icon: '👶'
  });
  
  // Formulärdata för ny/redigera aktivitetstyp
  const [typeForm, setTypeForm] = useState({
    name: '',
    icon: '📌',
    color: '#94a3b8'
  });

  // Tillgängliga ikoner
  const memberIcons = {
    child: ['👶', '👧', '👦', '🧒', '👨‍🎓', '👩‍🎓'],
    adult: ['👩', '👨', '👵', '👴', '🧑', '👤'],
    group: ['👨‍👩‍👧‍👦', '👨‍👩‍👧', '👨‍👩‍👦', '👪', '👥', '👫']
  };
  
  const activityIcons = [
    '🎒', '🧸', '🎨', '⚽', '🎵', '🏥', '🦷', '🎂', '📚', '🍽️',
    '💼', '🚗', '🛒', '🧹', '🏠', '✈️', '🎯', '🎮', '📖', '🎭',
    '🏊', '🚴', '🏃', '🧘', '💊', '🛌', '📞', '💻', '🎬', '📌'
  ];
  
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b', '#71717a', '#171717'
  ];

  // Hantera medlem formulär
  const handleSaveMember = () => {
    if (memberForm.name) {
      if (editingMember) {
        onUpdateMember(editingMember.id, memberForm);
        setEditingMember(null);
      } else {
        onAddMember(memberForm);
      }
      setMemberForm({ name: '', type: 'child', color: '#3b82f6', icon: '👶' });
    }
  };
  
  const handleEditMember = (member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      type: member.type,
      color: member.color,
      icon: member.icon
    });
  };
  
  const handleCancelEditMember = () => {
    setEditingMember(null);
    setMemberForm({ name: '', type: 'child', color: '#3b82f6', icon: '👶' });
  };

  // Hantera aktivitetstyp formulär
  const handleSaveType = () => {
    if (typeForm.name) {
      if (editingType) {
        onUpdateType(editingType.id, typeForm);
        setEditingType(null);
      } else {
        onAddType(typeForm);
      }
      setTypeForm({ name: '', icon: '📌', color: '#94a3b8' });
    }
  };
  
  const handleEditType = (type) => {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      icon: type.icon,
      color: type.color
    });
  };
  
  const handleCancelEditType = () => {
    setEditingType(null);
    setTypeForm({ name: '', icon: '📌', color: '#94a3b8' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Familjeinställningar</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} />
            Familjemedlemmar
          </button>
          <button
            className={`tab-button ${activeTab === 'types' ? 'active' : ''}`}
            onClick={() => setActiveTab('types')}
          >
            <Tag size={16} />
            Aktivitetstyper
          </button>
        </div>

        <div className="modal-body">
          {/* Familjemedlemmar */}
          {activeTab === 'members' && (
            <div className="settings-section">
              <div className="form-section">
                <h3>{editingMember ? 'Redigera medlem' : 'Lägg till familjemedlem'}</h3>
                
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Namn"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                    className="form-input"
                  />
                  
                  <select
                    value={memberForm.type}
                    onChange={(e) => setMemberForm({...memberForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="child">Barn</option>
                    <option value="adult">Vuxen</option>
                    <option value="group">Grupp</option>
                  </select>
                </div>
                
                <div className="icon-picker">
                  <label>Välj ikon:</label>
                  <div className="icon-grid">
                    {memberIcons[memberForm.type].map(icon => (
                      <button
                        key={icon}
                        className={`icon-btn ${memberForm.icon === icon ? 'selected' : ''}`}
                        onClick={() => setMemberForm({...memberForm, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="color-picker">
                  <label>Välj färg:</label>
                  <div className="color-grid">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${memberForm.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setMemberForm({...memberForm, color})}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  {editingMember && (
                    <button onClick={handleCancelEditMember} className="btn btn-secondary">
                      Avbryt
                    </button>
                  )}
                  <button onClick={handleSaveMember} className="btn btn-primary">
                    <Save size={16} />
                    {editingMember ? 'Spara ändringar' : 'Lägg till'}
                  </button>
                </div>
              </div>
              
              <div className="list-section">
                <h3>Nuvarande familjemedlemmar</h3>
                <div className="member-list">
                  {familyMembers.map(member => (
                    <div key={member.id} className="member-item">
                      <div className="member-info">
                        <span className="member-icon">{member.icon}</span>
                        <span 
                          className="member-color"
                          style={{ backgroundColor: member.color }}
                        />
                        <span className="member-name">{member.name}</span>
                        <span className="member-type">({member.type === 'child' ? 'Barn' : member.type === 'adult' ? 'Vuxen' : 'Grupp'})</span>
                      </div>
                      <div className="member-actions">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="btn btn-icon"
                          title="Redigera"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Ta bort ${member.name}?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="btn btn-icon btn-danger"
                          title="Ta bort"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Aktivitetstyper */}
          {activeTab === 'types' && (
            <div className="settings-section">
              <div className="form-section">
                <h3>{editingType ? 'Redigera aktivitetstyp' : 'Lägg till aktivitetstyp'}</h3>
                
                <input
                  type="text"
                  placeholder="Namn på aktivitet"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                  className="form-input"
                />
                
                <div className="icon-picker">
                  <label>Välj ikon:</label>
                  <div className="icon-grid">
                    {activityIcons.map(icon => (
                      <button
                        key={icon}
                        className={`icon-btn ${typeForm.icon === icon ? 'selected' : ''}`}
                        onClick={() => setTypeForm({...typeForm, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="color-picker">
                  <label>Välj färg:</label>
                  <div className="color-grid">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${typeForm.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTypeForm({...typeForm, color})}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  {editingType && (
                    <button onClick={handleCancelEditType} className="btn btn-secondary">
                      Avbryt
                    </button>
                  )}
                  <button onClick={handleSaveType} className="btn btn-primary">
                    <Save size={16} />
                    {editingType ? 'Spara ändringar' : 'Lägg till'}
                  </button>
                </div>
              </div>
              
              <div className="list-section">
                <h3>Nuvarande aktivitetstyper</h3>
                <div className="type-list">
                  {activityTypes.map(type => (
                    <div key={type.id} className="type-item">
                      <div className="type-info">
                        <span className="type-icon">{type.icon}</span>
                        <span 
                          className="type-color"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="type-name">{type.name}</span>
                      </div>
                      <div className="type-actions">
                        <button
                          onClick={() => handleEditType(type)}
                          className="btn btn-icon"
                          title="Redigera"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Ta bort ${type.name}?`)) {
                              onDeleteType(type.id);
                            }
                          }}
                          className="btn btn-icon btn-danger"
                          title="Ta bort"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilySettingsModal;