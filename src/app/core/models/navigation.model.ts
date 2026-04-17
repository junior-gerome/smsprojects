export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  description: string;
}

export interface NavigationItemDefinition {
  labelKey: string;
  icon: string;
  route: string;
  descriptionKey: string;
}

export const APP_NAVIGATION: NavigationItemDefinition[] = [
  {
    labelKey: "nav.dashboard.label",
    icon: "/assets/icons/navigation/dashboard.svg",
    route: "/dashboard",
    descriptionKey: "nav.dashboard.description",
  },
  {
    labelKey: "nav.contacts.label",
    icon: "/assets/icons/navigation/contacts.svg",
    route: "/contacts",
    descriptionKey: "nav.contacts.description",
  },
  {
    labelKey: "nav.campaigns.label",
    icon: "/assets/icons/navigation/campaigns.svg",
    route: "/campaigns",
    descriptionKey: "nav.campaigns.description",
  },
  {
    labelKey: "nav.chat.label",
    icon: "/assets/icons/navigation/chat.svg",
    route: "/chat",
    descriptionKey: "nav.chat.description",
  },
  {
    labelKey: "nav.templates.label",
    icon: "/assets/icons/navigation/templates.svg",
    route: "/templates",
    descriptionKey: "nav.templates.description",
  },
  {
    labelKey: "nav.analytics.label",
    icon: "/assets/icons/navigation/analytics.svg",
    route: "/analytics",
    descriptionKey: "nav.analytics.description",
  },
  {
    labelKey: "nav.automation.label",
    icon: "/assets/icons/navigation/automation.svg",
    route: "/automation",
    descriptionKey: "nav.automation.description",
  },
  {
    labelKey: "nav.settings.label",
    icon: "/assets/icons/navigation/settings.svg",
    route: "/settings",
    descriptionKey: "nav.settings.description",
  },
];
