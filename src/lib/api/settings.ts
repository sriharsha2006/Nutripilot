import { client } from "./client";

export interface UserSettings {
  email: string;
  name: string;
  unitSystem: "metric" | "imperial";
  currencySymbol: string;
  theme: "system" | "light" | "dark";
  notifications: {
    mealReminders: boolean;
    pantryExpiryAlerts: boolean;
    weeklyReportDigest: boolean;
    marketingEmails: boolean;
  };
}

export const settingsApi = {
  getSettings: async (): Promise<UserSettings> => {
    return client.get<UserSettings>("/api/settings");
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    return client.put<UserSettings>("/api/settings", settings);
  },

  changePassword: async (passwords: { current: string; new: string }): Promise<{ success: boolean; message: string }> => {
    return client.post<{ success: boolean; message: string }>("/api/settings", { action: "change_password", ...passwords });
  },

  exportUserData: async (): Promise<any> => {
    return client.get<any>("/api/settings?export=true");
  },
};
