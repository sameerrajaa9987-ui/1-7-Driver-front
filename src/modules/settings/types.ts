export type HolidayBilling = "pause" | "prorate" | "continue";
export type MidMonthLeaving = "refund" | "prorate" | "none";

export interface Settings {
  holidayBilling: HolidayBilling;
  suspendAfterOverdueDays: number;
  midMonthLeaving: MidMonthLeaving;
  enforceVehicleCapacity: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  waitingTimerMinutes: number;
  reminderDaysBefore: number[];
  prorateFirstLastMonth: boolean;
}

export type SettingsPayload = Partial<Settings>;
