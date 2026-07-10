import type { LucideIcon } from "lucide-react-native";
import {
  LayoutDashboard,
  GraduationCap,
  History,
  Crown,
  UserCog,
  Bus,
  Route as RouteIcon,
  Navigation,
  Wallet,
  Bell,
  User,
  MapPin,
  PlayCircle,
  MessageSquareWarning,
  Coins,
  Settings as SettingsIcon,
  ShieldAlert,
  Wrench,
  Gauge,
  Building2,
  Plug,
  ScanLine,
} from "lucide-react-native";
import type { Role } from "@shared/permissions";

import DashboardScreen from "@modules/dashboard/screens/DashboardScreen";
import StudentsNavigator from "@modules/student/StudentsNavigator";
import DriversNavigator from "@modules/driver/DriversNavigator";
import VehiclesNavigator from "@modules/vehicle/VehiclesNavigator";
import RoutesNavigator from "@modules/route/RoutesNavigator";
import AdminTripsScreen from "@modules/trip/screens/AdminTripsScreen";
import TrackingScreen from "@modules/tracking/screens/TrackingScreen";
import PaymentsScreen from "@modules/payment/screens/PaymentsScreen";
import NotificationsScreen from "@modules/notification/screens/NotificationsScreen";
import ProfileScreen from "@modules/profile/screens/ProfileScreen";

import DriverTodayNavigator from "@modules/trip/DriverTodayNavigator";
import DriverPaymentsScreen from "@modules/payment/screens/DriverPaymentsScreen";

import ParentTrackScreen from "@modules/tracking/screens/ParentTrackScreen";
import ParentDashboardScreen from "@modules/dashboard/screens/ParentDashboardScreen";
import ParentPaymentsScreen from "@modules/payment/screens/ParentPaymentsScreen";

// Phase 2
import ComplaintsNavigator from "@modules/complaint/ComplaintsNavigator";
import EarningsScreen from "@modules/earnings/screens/EarningsScreen";
import DriverEarningsScreen from "@modules/earnings/screens/DriverEarningsScreen";
import SettingsScreen from "@modules/settings/screens/SettingsScreen";
import SosScreen from "@modules/sos/screens/SosScreen";
import DriverSosScreen from "@modules/sos/screens/DriverSosScreen";

// Phase 3
import ActivityLogScreen from "@modules/activity-log/screens/ActivityLogScreen";
import SubscriptionScreen from "@modules/subscription/screens/SubscriptionScreen";
import SchoolDashboardScreen from "@modules/dashboard/screens/SchoolDashboardScreen";
import AttendanceReportScreen from "@modules/attendance/screens/AttendanceReportScreen";
import MaintenanceScreen from "@modules/maintenance/screens/MaintenanceScreen";
import BehaviourScreen from "@modules/telematics/screens/BehaviourScreen";
import BranchesScreen from "@modules/branch/screens/BranchesScreen";
import IntegrationScreen from "@modules/integration/screens/IntegrationScreen";
import DriverScanScreen from "@modules/attendance/screens/DriverScanScreen";

export interface NavItem {
  name: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType;
  /** Shown as a bottom-dock tab (max 4 per role); the rest live in the Menu hub. */
  primary?: boolean;
  /** Tint used for the Menu hub bento tile. */
  tint?: import("@shared/designSystem").TintName;
}

const ADMIN: NavItem[] = [
  {
    name: "Dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    component: DashboardScreen,
    primary: true,
    tint: "teal",
  },
  {
    name: "Tracking",
    label: "Live Map",
    icon: Navigation,
    component: TrackingScreen,
    primary: true,
    tint: "blue",
  },
  {
    name: "Trips",
    label: "Trips",
    icon: PlayCircle,
    component: AdminTripsScreen,
    primary: true,
    tint: "violet",
  },
  {
    name: "Students",
    label: "Students",
    icon: GraduationCap,
    component: StudentsNavigator,
    primary: true,
    tint: "green",
  },
  {
    name: "Drivers",
    label: "Drivers",
    icon: UserCog,
    component: DriversNavigator,
    tint: "violet",
  },
  {
    name: "Vehicles",
    label: "Vehicles",
    icon: Bus,
    component: VehiclesNavigator,
    tint: "amber",
  },
  {
    name: "Routes",
    label: "Routes",
    icon: RouteIcon,
    component: RoutesNavigator,
    tint: "blue",
  },
  {
    name: "Payments",
    label: "Payments",
    icon: Wallet,
    component: PaymentsScreen,
    tint: "green",
  },
  {
    name: "Earnings",
    label: "Driver Pay",
    icon: Coins,
    component: EarningsScreen,
    tint: "amber",
  },
  {
    name: "Maintenance",
    label: "Fleet & Fuel",
    icon: Wrench,
    component: MaintenanceScreen,
    tint: "neutral",
  },
  {
    name: "Behaviour",
    label: "Driver Safety",
    icon: Gauge,
    component: BehaviourScreen,
    tint: "red",
  },
  {
    name: "Branches",
    label: "Cities",
    icon: Building2,
    component: BranchesScreen,
    tint: "blue",
  },
  {
    name: "Complaints",
    label: "Complaints",
    icon: MessageSquareWarning,
    component: ComplaintsNavigator,
    tint: "red",
  },
  {
    name: "Sos",
    label: "SOS Alerts",
    icon: ShieldAlert,
    component: SosScreen,
    tint: "red",
  },
  {
    name: "Integration",
    label: "Integration",
    icon: Plug,
    component: IntegrationScreen,
    tint: "neutral",
  },
  {
    name: "ActivityLog",
    label: "Activity Log",
    icon: History,
    component: ActivityLogScreen,
    tint: "violet",
  },
  {
    name: "Notifications",
    label: "Alerts",
    icon: Bell,
    component: NotificationsScreen,
    tint: "amber",
  },
  {
    name: "Subscription",
    label: "Subscription",
    icon: Crown,
    component: SubscriptionScreen,
    tint: "amber",
  },
  {
    name: "Settings",
    label: "Settings",
    icon: SettingsIcon,
    component: SettingsScreen,
    tint: "neutral",
  },
  {
    name: "Profile",
    label: "Profile",
    icon: User,
    component: ProfileScreen,
    tint: "teal",
  },
];

const DRIVER: NavItem[] = [
  {
    name: "Today",
    label: "Today",
    icon: PlayCircle,
    component: DriverTodayNavigator,
    primary: true,
    tint: "teal",
  },
  {
    name: "Scan",
    label: "Scan",
    icon: ScanLine,
    component: DriverScanScreen,
    primary: true,
    tint: "violet",
  },
  {
    name: "Payments",
    label: "Collect",
    icon: Wallet,
    component: DriverPaymentsScreen,
    primary: true,
    tint: "green",
  },
  {
    name: "Sos",
    label: "SOS",
    icon: ShieldAlert,
    component: DriverSosScreen,
    primary: true,
    tint: "red",
  },
  {
    name: "Students",
    label: "My Students",
    icon: GraduationCap,
    component: StudentsNavigator,
    tint: "green",
  },
  {
    name: "Earnings",
    label: "My Earnings",
    icon: Coins,
    component: DriverEarningsScreen,
    tint: "amber",
  },
  {
    name: "Notifications",
    label: "Alerts",
    icon: Bell,
    component: NotificationsScreen,
    tint: "amber",
  },
  {
    name: "Profile",
    label: "Profile",
    icon: User,
    component: ProfileScreen,
    tint: "teal",
  },
];

const PARENT: NavItem[] = [
  {
    name: "Dashboard",
    label: "Home",
    icon: LayoutDashboard,
    component: ParentDashboardScreen,
    primary: true,
    tint: "violet",
  },
  {
    name: "Track",
    label: "Track",
    icon: MapPin,
    component: ParentTrackScreen,
    tint: "teal",
  },
  {
    name: "Children",
    label: "Children",
    icon: GraduationCap,
    component: StudentsNavigator,
    primary: true,
    tint: "green",
  },
  {
    name: "Payments",
    label: "Fees",
    icon: Wallet,
    component: ParentPaymentsScreen,
    primary: true,
    tint: "green",
  },
  {
    name: "Notifications",
    label: "Alerts",
    icon: Bell,
    component: NotificationsScreen,
    primary: true,
    tint: "amber",
  },
  {
    name: "Complaints",
    label: "Complaints",
    icon: MessageSquareWarning,
    component: ComplaintsNavigator,
    tint: "red",
  },
  {
    name: "Profile",
    label: "Profile",
    icon: User,
    component: ProfileScreen,
    tint: "teal",
  },
];

const SCHOOL: NavItem[] = [
  {
    name: "Dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    component: SchoolDashboardScreen,
    primary: true,
    tint: "teal",
  },
  {
    name: "Tracking",
    label: "Live Map",
    icon: Navigation,
    component: TrackingScreen,
    primary: true,
    tint: "blue",
  },
  {
    name: "Students",
    label: "Students",
    icon: GraduationCap,
    component: StudentsNavigator,
    primary: true,
    tint: "green",
  },
  {
    name: "Attendance",
    label: "Attendance",
    icon: ScanLine,
    component: AttendanceReportScreen,
    primary: true,
    tint: "violet",
  },
  {
    name: "Notifications",
    label: "Alerts",
    icon: Bell,
    component: NotificationsScreen,
    tint: "amber",
  },
  {
    name: "Profile",
    label: "Profile",
    icon: User,
    component: ProfileScreen,
    tint: "teal",
  },
];

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  admin: ADMIN,
  driver: DRIVER,
  parent: PARENT,
  school: SCHOOL,
};
