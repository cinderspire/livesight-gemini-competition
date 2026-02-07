import React, { useState, useCallback, memo } from 'react';
import { useLiveSight } from '../contexts/LiveSightContext';
import type { EmergencyContact } from '../types';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Emergency Contacts Modal
 * Manage emergency contacts for SOS feature
 */
const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = memo(({
  isOpen,
  onClose,
}) => {
  const { emergencyContacts, setEmergencyContacts } = useLiveSight();

  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
  });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ name: '', phone: '', email: '', relationship: '' });
    setEditingContact(null);
  }, []);

  // Handle adding new contact
  const handleAddContact = useCallback(() => {
    if (!formData.name || !formData.phone) return;

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      relationship: formData.relationship || 'Other',
      isPrimary: emergencyContacts.length === 0,
    };

    setEmergencyContacts([...emergencyContacts, newContact]);
    resetForm();
  }, [formData, emergencyContacts, setEmergencyContacts, resetForm]);

  // Handle editing contact
  const handleEditContact = useCallback((contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      relationship: contact.relationship,
    });
  }, []);

  // Handle updating contact
  const handleUpdateContact = useCallback(() => {
    if (!editingContact || !formData.name || !formData.phone) return;

    const updated = emergencyContacts.map(c =>
      c.id === editingContact.id
        ? { ...c, ...formData, email: formData.email || undefined }
        : c
    );

    setEmergencyContacts(updated);
    resetForm();
  }, [editingContact, formData, emergencyContacts, setEmergencyContacts, resetForm]);

  // Handle deleting contact
  const handleDeleteContact = useCallback((id: string) => {
    const filtered = emergencyContacts.filter(c => c.id !== id);
    // If deleted contact was primary, make first one primary
    if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
      const first = filtered[0];
      if (first) {
        filtered[0] = { ...first, isPrimary: true };
      }
    }
    setEmergencyContacts(filtered);
  }, [emergencyContacts, setEmergencyContacts]);

  // Handle setting primary contact
  const handleSetPrimary = useCallback((id: string) => {
    const updated = emergencyContacts.map(c => ({
      ...c,
      isPrimary: c.id === id,
    }));
    setEmergencyContacts(updated);
  }, [emergencyContacts, setEmergencyContacts]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contacts-modal-title"
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 id="contacts-modal-title" className="text-lg font-bold text-white">
            Emergency Contacts
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Contact Form */}
          <div className="space-y-3 p-4 bg-gray-800/50 rounded-xl">
            <h3 className="text-sm font-bold text-cyan-400">
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </h3>

            <input
              type="text"
              placeholder="Name *"
              aria-label="Contact name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 outline-none"
            />

            <input
              type="tel"
              placeholder="Phone Number *"
              aria-label="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 outline-none"
            />

            <input
              type="email"
              placeholder="Email (optional)"
              aria-label="Email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 outline-none"
            />

            <select
              value={formData.relationship}
              aria-label="Relationship"
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
            >
              <option value="">Relationship</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Caregiver">Caregiver</option>
              <option value="Medical">Medical Professional</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex gap-2">
              {editingContact ? (
                <>
                  <button
                    onClick={handleUpdateContact}
                    disabled={!formData.name || !formData.phone}
                    className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg transition"
                  >
                    Update
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddContact}
                  disabled={!formData.name || !formData.phone}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg transition"
                >
                  Add Contact
                </button>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider">
              Your Contacts ({emergencyContacts.length})
            </h3>

            {emergencyContacts.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No emergency contacts added yet.
              </p>
            ) : (
              emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 rounded-xl border ${
                    contact.isPrimary
                      ? 'bg-cyan-900/20 border-cyan-500'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{contact.name}</p>
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-mono rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{contact.phone}</p>
                      {contact.email && (
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">{contact.relationship}</p>
                    </div>

                    <div className="flex gap-1">
                      {!contact.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(contact.id)}
                          className="p-2 text-gray-500 hover:text-cyan-400 transition"
                          aria-label="Set as primary contact"
                          title="Set as primary"
                        >
                          ⭐
                        </button>
                      )}
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="p-2 text-gray-500 hover:text-white transition"
                        aria-label={`Edit ${contact.name}`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition"
                        aria-label={`Delete ${contact.name}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Primary contact will be notified first during emergencies
          </p>
        </div>
      </div>
    </div>
  );
});

EmergencyContactsModal.displayName = 'EmergencyContactsModal';

export default EmergencyContactsModal;
