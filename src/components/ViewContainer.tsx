import React from "react";
import { AnimatePresence } from "motion/react";
import { TodayView } from "../views/TodayView";
import { DashboardView } from "../views/DashboardView";
import { GoalsView } from "../views/GoalsView";
import { GoalDetailView } from "../views/GoalDetailView";
import { CategoriesView } from "../views/CategoriesView";
import { HabitsView } from "../views/HabitsView";
import { PlannerView } from "../views/PlannerView";
import { CalendarView } from "../views/CalendarView";
import { AssignTasksView } from "../views/AssignTasksView";
import { InitialDataSkeleton } from "./InitialDataSkeleton";
import type { ViewType } from "../hooks/useAppRouter";

interface ViewContainerProps {
  view: ViewType;
  sharedViewProps: any;
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
    <AnimatePresence mode="wait">
      {view === "today" ? (
        <TodayView {...sharedViewProps} />
      ) : view === "dashboard" ? (
        <DashboardView {...sharedViewProps} />
      ) : view === "goals" ? (
        <GoalsView {...sharedViewProps} />
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
  );
};
