import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, BookOpen, 
  Edit2, Save, X, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await studentService.getProfile();
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await authService.updateProfile(formData);
      updateUser(response.data.user);
      setProfile(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">
                  {profile?.user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{profile?.user?.fullName}</h3>
              <p className="text-gray-600">{profile?.user?.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile?.user?.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Student
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={formData.user?.fullName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        user: { ...formData.user, fullName: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.user?.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{profile?.user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      className="input"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {editing ? (
                    <input
                      type="date"
                      className="input"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Academic Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <p className="text-gray-900">{profile?.rollNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={formData.class || ''}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.class}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={formData.section || ''}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.section}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Name</label>
                  {editing ? (
                    <input
                      type="text"
                      className="input"
                      value={formData.parentName || ''}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.parentName || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Additional Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {editing ? (
                  <textarea
                    className="input h-20 resize-none"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900">{profile?.address || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Information</label>
                {editing ? (
                  <textarea
                    className="input h-20 resize-none"
                    value={formData.medicalInfo || ''}
                    onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900">{profile?.medicalInfo || 'None provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Account Settings</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <button className="btn-secondary">Change Password</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Manage email preferences</p>
              </div>
              <button className="btn-secondary">Manage</button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Privacy Settings</h4>
                <p className="text-sm text-gray-600">Control your privacy preferences</p>
              </div>
              <button className="btn-secondary">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
