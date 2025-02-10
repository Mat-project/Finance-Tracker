import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    email_notifications: user?.email_notifications || false,
    preferred_currency: user?.preferred_currency || 'USD',
    budget_alert_threshold: user?.budget_alert_threshold || 80,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.users.updateSettings(settings);
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => setSettings({
                  ...settings,
                  email_notifications: e.target.checked
                })}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="text-gray-700 dark:text-gray-500">Enable email notifications</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
              Preferred Currency
            </label>
            <select
              value={settings.preferred_currency}
              onChange={(e) => setSettings({
                ...settings,
                preferred_currency: e.target.value
              })}
              className="mt-1 text-gray-900 dark:text-gray-400 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <Input
            label="Budget Alert Threshold (%)"
            type="number"
            min="1"
            max="100"
            value={settings.budget_alert_threshold}
            onChange={(e) => setSettings({
              ...settings,
              budget_alert_threshold: e.target.value
            })}
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}

          <Button
            type="submit"
            isLoading={loading}
          >
            Save Settings
          </Button>
        </form>
      </div>

      <div className="card max-w-2xl bg-red-50">
        <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>
        <p className="mt-1 text-sm text-red-600">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <div className="mt-4 ">
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                // Handle account deletion
              }
            }}
            className="border-2 bg-red-700 hover:bg-red-500"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}