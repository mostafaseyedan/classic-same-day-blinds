import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

type ModalTab = 'profile' | 'password';

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { currentUser, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<ModalTab>('profile');

  // Profile form state
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const passwordStrength = (pw: string): { level: number; label: string; color: string } => {
    if (pw.length === 0) return { level: 0, label: '', color: '' };
    if (pw.length < 6) return { level: 1, label: 'Too short', color: 'bg-red-400' };
    if (pw.length < 8) return { level: 2, label: 'Weak', color: 'bg-orange-400' };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNum = /\d/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
    if (score >= 2) return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
    return { level: 3, label: 'Fair', color: 'bg-yellow-400' };
  };

  const strength = passwordStrength(newPassword);

  const handleProfileSave = async () => {
    setProfileError('');
    setProfileSuccess(false);

    if (!name.trim()) { setProfileError('Name cannot be empty.'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile(name.trim(), email.trim());
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message ?? 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) { setPasswordError('Please enter your current password.'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (newPassword === currentPassword) { setPasswordError('New password must be different from your current password.'); return; }

    setPasswordLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message ?? 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-emerald-100 rounded-xl">
              <i className="ri-user-settings-line text-emerald-600 text-lg"></i>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Account Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {([
              { id: 'profile', label: 'Edit Profile', icon: 'ri-user-line' },
              { id: 'password', label: 'Change Password', icon: 'ri-lock-line' },
            ] as { id: ModalTab; label: string; icon: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="px-6 py-6">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <i className="ri-user-line text-3xl text-white"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <i className="ri-user-line text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <i className="ri-mail-line text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Feedback */}
            {profileError && (
              <div className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                <i className="ri-error-warning-line shrink-0"></i>
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
                <i className="ri-checkbox-circle-line shrink-0"></i>
                Profile updated successfully!
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                disabled={profileLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                {profileLoading ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Saving...</>
                ) : (
                  <><i className="ri-save-line"></i> Save Changes</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="px-6 py-6">
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <i className="ri-lock-line text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className={showCurrentPw ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'}></i>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <i className="ri-lock-password-line text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className={showNewPw ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'}></i>
                  </button>
                </div>
                {/* Strength meter */}
                {newPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            bar <= strength.level ? strength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength.level <= 1 ? 'text-red-500' : strength.level === 2 ? 'text-orange-500' : strength.level === 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <i className="ri-shield-check-line text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-red-300 focus:ring-red-200'
                        : confirmPassword && confirmPassword === newPassword
                        ? 'border-emerald-300 focus:ring-emerald-200'
                        : 'border-gray-200 focus:ring-emerald-300 focus:border-emerald-400'
                    }`}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className={showConfirmPw ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'}></i>
                  </button>
                  {confirmPassword && confirmPassword === newPassword && (
                    <div className="absolute inset-y-0 right-9 flex items-center pointer-events-none">
                      <i className="ri-checkbox-circle-fill text-emerald-500 text-sm"></i>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback */}
            {passwordError && (
              <div className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                <i className="ri-error-warning-line shrink-0"></i>
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
                <i className="ri-checkbox-circle-line shrink-0"></i>
                Password changed successfully!
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSave}
                disabled={passwordLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                {passwordLoading ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Updating...</>
                ) : (
                  <><i className="ri-lock-password-line"></i> Update Password</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
