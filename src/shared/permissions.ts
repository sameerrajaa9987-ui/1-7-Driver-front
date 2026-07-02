/** Mirrors the backend role + permission keys (config/roles.js). */

export type Role = "admin" | "driver" | "parent";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  MANAGE_USERS: "users.manage",
  DRIVERS_MANAGE: "drivers.manage",
  VEHICLES_MANAGE: "vehicles.manage",
  STUDENTS_VIEW: "students.view",
  STUDENTS_ADD: "students.add",
  STUDENTS_APPROVE: "students.approve",
  ROUTES_MANAGE: "routes.manage",
  TRIPS_RUN: "trips.run",
  TRACKING_VIEW: "tracking.view",
  PAYMENTS_RECORD: "payments.record",
  PAYMENTS_VERIFY: "payments.verify",
  PAYMENTS_PAY: "payments.pay",
  NOTIFICATIONS_VIEW: "notifications.view",
  COMPLAINTS_RAISE: "complaints.raise",
  COMPLAINTS_RESOLVE: "complaints.resolve",
  AUDIT_VIEW: "audit.view",
  SETTINGS_MANAGE: "settings.manage",
} as const;

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Operator",
  driver: "Driver",
  parent: "Parent",
};
