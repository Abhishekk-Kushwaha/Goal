import React, { Suspense } from "react";
import { AnimatePresence } from "motion/react";
import { InitialDataSkeleton } from "./InitialDataSkeleton";
import type { ViewType } from "../hooks/useAppRouter";
import type { TodayView as TodayViewType } from "../views/TodayView";
import type { DashboardView as DashboardViewType } from "../views/DashboardView";
import type { GoalsView as GoalsViewType } from "../views/GoalsView";
import type { GoalInsightsView as GoalInsightsViewType } from "../views/GoalInsightsView";
import type { GoalDetailView as GoalDetailViewType } from "../views/GoalDetailView";
import type { CategoriesView as CategoriesViewType } from "../views/CategoriesView";
import type { HabitsView as HabitsViewType } from "../views/HabitsView";
import type { PlannerView as PlannerViewType } from "../views/PlannerView";
import type { CalendarView as CalendarViewType } from "../views/CalendarView";
import type { AssignTasksView as AssignTasksViewType } from "../views/AssignTasksView";

const TodayView = React.lazy(() =>
  import("../views/TodayView").then((module) => ({ default: module.TodayView })),
);
const DashboardView = React.lazy(() =>
  import("../views/DashboardView").then((module) => ({
    default: module.DashboardView,
  })),
);
const GoalsView = React.lazy(() =>
  import("../views/GoalsView").then((module) => ({ default: module.GoalsView })),
);
const GoalInsightsView = React.lazy(() =>
  import("../views/GoalInsightsView").then((module) => ({
    default: module.GoalInsightsView,
  })),
);
const GoalDetailView = React.lazy(() =>
  import("../views/GoalDetailView").then((module) => ({
    default: module.GoalDetailView,
  })),
);
const CategoriesView = React.lazy(() =>
  import("../views/CategoriesView").then((module) => ({
    default: module.CategoriesView,
  })),
);
const HabitsView = React.lazy(() =>
  import("../views/HabitsView").then((module) => ({ default: module.HabitsView })),
);
const PlannerView = React.lazy(() =>
  import("../views/PlannerView").then((module) => ({
    default: module.PlannerView,
  })),
);
const CalendarView = React.lazy(() =>
  import("../views/CalendarView").then((module) => ({
    default: module.CalendarView,
  })),
);
const AssignTasksView = React.lazy(() =>
  import("../views/AssignTasksView").then((module) => ({
    default: module.AssignTasksView,
  })),
);

type SharedViewProps = React.ComponentProps<typeof TodayViewType> &
  React.ComponentProps<typeof DashboardViewType> &
  React.ComponentProps<typeof GoalsViewType> &
  React.ComponentProps<typeof GoalInsightsViewType> &
  React.ComponentProps<typeof GoalDetailViewType> &
  React.ComponentProps<typeof CategoriesViewType> &
  React.ComponentProps<typeof HabitsViewType> &
  React.ComponentProps<typeof PlannerViewType> &
  React.ComponentProps<typeof CalendarViewType> &
  React.ComponentProps<typeof AssignTasksViewType> & {
    isInitialDataLoading: boolean;
  };

interface ViewContainerProps {
  view: ViewType;
  sharedViewProps: SharedViewProps;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({ view, sharedViewProps }) => {
  if (sharedViewProps.isInitialDataLoading) {
    return (
      <AnimatePresence mode="wait">
        <InitialDataSkeleton key={`initial-${view}`} view={view} />
      </AnimatePresence>
    );
  }

  return (
    <Suspense fallback={<InitialDataSkeleton view={view} />}>
      <AnimatePresence mode="wait">
        {view === "today" ? (
          <TodayView {...sharedViewProps} />
        ) : view === "dashboard" ? (
          <DashboardView {...sharedViewProps} />
        ) : view === "goals" ? (
          <GoalsView {...sharedViewProps} />
        ) : view === "goal-insights" ? (
          <GoalInsightsView {...sharedViewProps} />
        ) : view === "detail" ? (
          <GoalDetailView {...sharedViewProps} />
        ) : view === "categories" ? (
          <CategoriesView {...sharedViewProps} />
        ) : view === "habits" ? (
          <HabitsView {...sharedViewProps} />
        ) : view === "planner" ? (
          <PlannerView {...sharedViewProps} />
        ) : view === "calendar" ? (
          <CalendarView {...sharedViewProps} />
        ) : view === "assign-tasks" ? (
          <AssignTasksView {...sharedViewProps} />
        ) : null}
      </AnimatePresence>
    </Suspense>
  );
};
