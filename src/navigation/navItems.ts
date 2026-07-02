import type { LucideIcon } from "lucide-react-native";
import {
  LayoutDashboard,
  GraduationCap,
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
import ParentPaymentsScreen from "@modules/payment/screens/ParentPaymentsScreen";

// Phase 2
import ComplaintsNavigator from "@modules/complaint/ComplaintsNavigator";
import EarningsScreen from "@modules/earnings/screens/EarningsScreen";
import DriverEarningsScreen from "@modules/earnings/screens/DriverEarningsScreen";
import SettingsScreen from "@modules/settings/screens/SettingsScreen";
import SosScreen from "@modules/sos/screens/SosScreen";
import DriverSosScreen from "@modules/sos/screens/DriverSosScreen";

// Phase 3
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
}

const ADMIN: NavItem[] = [
  {
    name: "Dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    component: DashboardScreen,
  },
  {
    name: "Tracking",
    label: "Live Map",
    icon: Navigation,
    component: TrackingScreen,
  },
  {
    name: "Trips",
    label: "Trips",
    icon: PlayCircle,
    component: AdminTripsScreen,
  },
  {
    name: "Students",
    label: "Students",
    icon: GraduationCap,
    component: StudentsNavigator,
  },
  {
    name: "Drivers",
    label: "Drivers",
    icon: UserCog,
    component: DriversNavigator,
  },
  {
    name: "Vehicles",
    label: "Vehicles",
    icon: Bus,
    component: VehiclesNavigator,
  },
  {
    name: "Routes",
    label: "Routes",
    icon: RouteIcon,
    component: RoutesNavigator,
  },
  {
    name: "Payments",
    label: "Payments",
    icon: Wallet,
    component: PaymentsScreen,
  },
  {
    name: "Earnings",
    label: "Driver Pay",
    icon: Coins,
    component: EarningsScreen,
  },
  {
    name: "Maintenance",
    label: "Fleet & Fuel",
    icon: Wrench,
    component: MaintenanceScreen,
  },
  {
    name: "Behaviour",
    label: "Driver Safety",
    icon: Gauge,
    component: BehaviourScreen,
  },
  {
    name: "Branches",
    label: "Cities",
    icon: Building2,
    component: BranchesScreen,
  },
  {
    name: "Complaints",
    label: "Complaints",
    icon: MessageSquareWarning,
    component: ComplaintsNavigator,
  },
  { name: "Sos", label: "SOS Alerts", icon: ShieldAlert, component: SosScreen },
  {
    name: "Integration",
    label: "Integration",
    icon: Plug,
    component: IntegrationScreen,
  },
  {
    name: "Notifications",
    label: "Alerts",
    icon: Bell,
    component: NotificationsScreen,
  },
  {
    name: "Settings",
    label: "Settings",
    icon: SettingsIcon,
    component: SettingsScreen,
  },
  { name: "Profile", label: "Profile", icon: User, component: ProfileScreen },
];

const DRIVER: NavItem[] = [
  {
    name: "Today",
    label: "Today's Trips",
    icon: PlayCircle,
    component: DriverTodayNavigator,
  },
  {
    name: "Scan",
    label: "Scan QR",
    icon: ScanLine,
    component: DriverScanScreen,
  },
  {
    name: "Students",
    label: "My Students",
    icon: GraduationCap,
    component: StudentsNavigator,
  },
  {
    name: "Payments",
    label: "Collect Fees",
    icon: Wallet,
    component: DriverPaymentsScreen,
  },
  {
    name: "Earnings",
    label: "My Earnings",
    icon: Coins,
    component: DriverEarningsScreen,
  },
  {
    name: "Sos",
    label: "Emergency SOS",
    icon: ShieldAlert,
    component: DriverSosScreen,
  },
  {
    name: "Notifications",
    label: "Alerts",
    icon: Bell,
    component: NotificationsScreen,
  },
  { name: "Profile", label: "Profile", icon: User, component: ProfileScreen },
];

const PARENT: NavItem[] = [
  {
    name: "Track",
    label: "Track Ride",
    icon: MapPin,
    component: ParentTrackScreen,
  },
  {
    name: "Children",
    label: "My Children",
    icon: GraduationCap,
    component: StudentsNavigator,
  },
  {
    name: "Payments",
    label: "Fees",
    icon: Wallet,
    component: ParentPaymentsScreen,
  },
  {
    name: "Complaints",
    label: "Complaints",
    icon: MessageSquareWarning,
    component: ComplaintsNavigator,
  },
  {
    name: "Notifications",
    label: "Alerts",
    icon: Bell,
    component: NotificationsScreen,
  },
  { name: "Profile", label: "Profile", icon: User, component: ProfileScreen },
];

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  admin: ADMIN,
  driver: DRIVER,
  parent: PARENT,
};
