import { 
  isSameDay, 
  isSameWeek, 
  isSameMonth, 
  parseISO, 
  startOfDay, 
  startOfWeek, 
  startOfMonth,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths
} from 'date-fns';
import { supabase } from './lib/supabase';

const dateCache = new Map<string, Date>();
function fastParseISO(dateStr: string): Date {
  if (!dateStr) return new Date();
  if (dateCache.has(dateStr)) return dateCache.get(dateStr)!;
  const d = parseISO(dateStr);
  // Keep cache size reasonable
  if (dateCache.size > 2000) dateCache.clear();
  dateCache.set(dateStr, d);
  return d;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: string;
  repeat: 'Daily' | 'Weekly' | 'Monthly';
  due_date?: string;
  color?: string;
  created_at: string;
  completed_dates: string[];
  streak: number;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  done: boolean;
  due_date?: string;
  note?: string;
  completed_at?: string;
  repeat?: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  completed_dates?: string[];
  created_at?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline?: string;
  note?: string;
  progress: number;
  streak: number;
  milestones: Milestone[];
  created_at?: string;
  repeat?: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  completed_dates?: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export function isDueOnDate(item: { created_at?: string, repeat?: string, due_date?: string, deadline?: string }, date: Date) {
  if (!item.repeat || item.repeat === 'None') {
    const dDate = item.due_date || item.deadline;
    if (dDate) return isSameDay(fastParseISO(dDate), date);
    return false;
  }
  
  const created = item.created_at ? fastParseISO(item.created_at) : new Date();
  if (item.created_at && startOfDay(date) < startOfDay(created)) return false;
  
  const dDate = item.due_date || item.deadline;
  if (dDate && startOfDay(date) > startOfDay(fastParseISO(dDate))) return false;
  
  if (item.repeat === 'Daily') return true;
  if (item.repeat === 'Weekly') return date.getDay() === created.getDay();
  if (item.repeat === 'Monthly') return date.getDate() === created.getDate();
  
  return false;
}

export function isCompletedOnDate(item: { repeat?: string, completed_dates?: string[], done?: boolean, completed_at?: string }, date: Date) {
  if (!item.repeat || item.repeat === 'None') {
    if (item.done) {
      if (item.completed_at) {
        return isSameDay(fastParseISO(item.completed_at), date);
      }
      // Fallback if completed_at is missing: assume it was completed on its due date
      const dDate = (item as any).due_date || (item as any).deadline;
      if (dDate) return isSameDay(fastParseISO(dDate), date);
      return isSameDay(new Date(), date); // If no due date, assume completed today
    }
    return false;
  }
  
  if (!item.completed_dates) return false;
  
  return item.completed_dates.some(d => {
    const dDate = fastParseISO(d);
    if (item.repeat === 'Daily') return isSameDay(dDate, date);
    if (item.repeat === 'Weekly') return isSameWeek(dDate, date);
    if (item.repeat === 'Monthly') return isSameMonth(dDate, date);
    return false;
  });
}

function setCompletedDateState(
  completedDates: string[] | undefined,
  repeat: string | undefined,
  targetDate: Date,
  done: boolean,
) {
  const currentDates = completedDates || [];
  const alreadyCompleted = isCompletedOnDate(
    { repeat, completed_dates: currentDates },
    targetDate,
  );

  if (done && !alreadyCompleted) {
    return [...currentDates, targetDate.toISOString()];
  }

  if (!done && alreadyCompleted) {
    return currentDates.filter((d: string) => {
      const dDate = fastParseISO(d);
      if (repeat === 'Daily') return !isSameDay(dDate, targetDate);
      if (repeat === 'Weekly') return !isSameWeek(dDate, targetDate);
      if (repeat === 'Monthly') return !isSameMonth(dDate, targetDate);
      return true;
    });
  }

  return currentDates;
}

function addDaysToDate(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function getLatestHabitOccurrence(habit: Habit, today = new Date()) {
  if (!habit.created_at) return startOfDay(today);

  const anchor = startOfDay(fastParseISO(habit.created_at));
  let end = startOfDay(today);
  if (habit.due_date) {
    const dueDate = startOfDay(fastParseISO(habit.due_date));
    if (dueDate < end) end = dueDate;
  }
  if (end < anchor) return null;

  if (habit.repeat === 'Daily') return end;

  if (habit.repeat === 'Weekly') {
    const daysBack = (end.getDay() - anchor.getDay() + 7) % 7;
    const occurrence = addDaysToDate(end, -daysBack);
    return occurrence >= anchor ? occurrence : null;
  }

  if (habit.repeat === 'Monthly') {
    const anchorDay = anchor.getDate();
    for (let i = 0; i <= 24; i++) {
      const month = end.getMonth() - i;
      const occurrence = startOfDay(new Date(end.getFullYear(), month, anchorDay));
      if (occurrence.getDate() !== anchorDay) continue;
      if (occurrence > end) continue;
      return occurrence >= anchor ? occurrence : null;
    }
  }

  return null;
}

function getPreviousHabitOccurrence(habit: Habit, occurrence: Date) {
  const anchor = habit.created_at ? startOfDay(fastParseISO(habit.created_at)) : null;
  let previous: Date | null = null;

  if (habit.repeat === 'Daily') {
    previous = addDaysToDate(occurrence, -1);
  } else if (habit.repeat === 'Weekly') {
    previous = addDaysToDate(occurrence, -7);
  } else if (habit.repeat === 'Monthly') {
    const anchorDay = habit.created_at
      ? startOfDay(fastParseISO(habit.created_at)).getDate()
      : occurrence.getDate();
    for (let i = 1; i <= 24; i++) {
      const month = occurrence.getMonth() - i;
      const candidate = startOfDay(new Date(occurrence.getFullYear(), month, anchorDay));
      if (candidate.getDate() === anchorDay && candidate < occurrence) {
        previous = candidate;
        break;
      }
    }
  }

  if (!previous) return null;
  if (anchor && previous < anchor) return null;
  return previous;
}

function countTotalOccurrences(item: { created_at?: string, repeat?: string, due_date?: string, deadline?: string }) {
  if (!item.repeat || item.repeat === 'None') return 1;
  const start = item.created_at ? fastParseISO(item.created_at) : new Date();
  const endStr = item.due_date || item.deadline;
  if (!endStr) return 1;
  const end = fastParseISO(endStr);
  
  if (startOfDay(end) < startOfDay(start)) return 1;
  
  if (item.repeat === 'Daily') {
    return Math.max(1, differenceInCalendarDays(end, start) + 1);
  } else if (item.repeat === 'Weekly') {
    return Math.max(1, differenceInCalendarWeeks(end, start) + 1);
  } else if (item.repeat === 'Monthly') {
    return Math.max(1, differenceInCalendarMonths(end, start) + 1);
  }
  return 1;
}

function countCompletedOccurrences(item: { repeat?: string, completed_dates?: string[] }) {
  if (!item.repeat || item.repeat === 'None') return 0;
  if (!item.completed_dates) return 0;
  
  const uniquePeriods = new Set<number>();
  item.completed_dates.forEach(d => {
    const date = fastParseISO(d);
    if (item.repeat === 'Daily') {
      uniquePeriods.add(startOfDay(date).getTime());
    } else if (item.repeat === 'Weekly') {
      uniquePeriods.add(startOfWeek(date).getTime());
    } else if (item.repeat === 'Monthly') {
      uniquePeriods.add(startOfMonth(date).getTime());
    }
  });
  return uniquePeriods.size;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Health", color: "#10b981", icon: "🏃" },
  { id: "2", name: "Career", color: "#6366f1", icon: "💼" },
  { id: "3", name: "Learning", color: "#f59e0b", icon: "📖" },
  { id: "4", name: "Finance", color: "#0ea5e9", icon: "💰" },
  { id: "5", name: "Creative", color: "#ec4899", icon: "🎨" },
  { id: "6", name: "Personal", color: "#8b5cf6", icon: "🌱" },
  { id: "7", name: "Other", color: "#64748b", icon: "⚡" }
];

export const storage = {
  _user: null as any,

  async getUser() {
    if (this._user) return this._user;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) console.error('Error getting user:', error);
    if (user) this._user = user;
    return user;
  },

  clearCache() {
    this._user = null;
  },

  async getGoals(): Promise<Goal[]> {
    const user = await this.getUser();
    if (!user) {
      return [];
    }

    // Fetch goals and milestones in parallel
    const [goalsResult, milestonesResult] = await Promise.all([
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
    ]);

    if (goalsResult.error) {
      console.error('Error fetching goals:', goalsResult.error);
      return [];
    }

    if (milestonesResult.error) {
      console.error('Error fetching milestones:', milestonesResult.error);
    }

    const goalsData = goalsResult.data || [];
    const milestonesData = milestonesResult.data || [];

    const goals: Goal[] = goalsData.map(g => {
      const goalMilestones = milestonesData
        .filter(m => m.goal_id === g.id)
        .map(m => ({
          ...m,
          completed_dates: m.completed_dates || []
        }));

      return {
        ...g,
        completed_dates: g.completed_dates || [],
        milestones: goalMilestones
      };
    });

    return goals;
  },

  async addGoal(goal: Goal) {
    const user = await this.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .insert({
        id: goal.id,
        user_id: user.id,
        title: goal.title,
        category: goal.category,
        priority: goal.priority,
        deadline: goal.deadline || null,
        note: goal.note,
        progress: 0,
        streak: 0,
        repeat: goal.repeat || 'None',
        completed_dates: [],
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  async updateGoal(id: string, updates: Partial<Goal>) {
    const user = await this.getUser();
    if (!user) return;

    // Remove milestones from updates as they are in a separate table
    const { milestones, ...goalUpdates } = updates;

    const { error } = await supabase
      .from('goals')
      .update(goalUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Error updating goal:', error);
  },

  async deleteGoal(id: string) {
    const user = await this.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Error deleting goal:', error);
  },

  async addMilestone(milestone: Milestone): Promise<Goal | null> {
    const user = await this.getUser();
    if (!user) return null;

    const { error } = await supabase
      .from('milestones')
      .insert({
        id: milestone.id,
        user_id: user.id,
        goal_id: milestone.goal_id,
        title: milestone.title,
        done: false,
        due_date: milestone.due_date || null,
        note: milestone.note,
        repeat: milestone.repeat || 'None',
        completed_dates: [],
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding milestone:', error);
      return null;
    }
    
    // Update goal progress
    return await this.recalculateGoalProgress(milestone.goal_id);
  },

  async setMilestoneCompleted(id: string, date: Date | undefined, done: boolean) {
    const user = await this.getUser();
    if (!user) return;

    const { data: milestone, error: fetchError } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !milestone) return;

    const updates: any = {};
    if (milestone.repeat && milestone.repeat !== 'None') {
      const targetDate = date || new Date();
      updates.completed_dates = setCompletedDateState(
        milestone.completed_dates,
        milestone.repeat,
        targetDate,
        done,
      );
    } else {
      updates.done = done;
      updates.completed_at = done ? new Date().toISOString() : null;
    }

    const { error: updateError } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Update parent goal progress
    return await this.recalculateGoalProgress(milestone.goal_id);
  },

  async toggleMilestone(id: string, date?: Date) {
    const user = await this.getUser();
    if (!user) return;

    const { data: milestone, error: fetchError } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !milestone) return;

    const targetDate = date || new Date();
    const done =
      milestone.repeat && milestone.repeat !== 'None'
        ? !isCompletedOnDate(milestone, targetDate)
        : !milestone.done;

    return await this.setMilestoneCompleted(id, targetDate, done);
  },

  async setGoalCompleted(id: string, date: Date | undefined, done: boolean): Promise<Goal | null> {
    const user = await this.getUser();
    if (!user) return null;

    const { data: goal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !goal) return null;

    if (goal.repeat && goal.repeat !== 'None') {
      const targetDate = date || new Date();
      const completed_dates = setCompletedDateState(
        goal.completed_dates,
        goal.repeat,
        targetDate,
        done,
      );
      
      const { error: updateError } = await supabase
        .from('goals')
        .update({ completed_dates })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
        
      return await this.recalculateGoalProgress(id);
    }
    return null;
  },

  async toggleGoalCompletion(id: string, date?: Date): Promise<Goal | null> {
    const user = await this.getUser();
    if (!user) return null;

    const { data: goal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !goal) return null;

    const targetDate = date || new Date();
    return await this.setGoalCompleted(
      id,
      targetDate,
      !isCompletedOnDate(goal, targetDate),
    );
  },

  async setMilestonesDone(ids: string[], done: boolean, date?: Date) {
    const user = await this.getUser();
    if (!user) return;

    const updatedGoalIds: string[] = [];

    for (const id of ids) {
      const { data: milestone } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!milestone) continue;
      updatedGoalIds.push(milestone.goal_id);

      const updates: any = {};
      if (milestone.repeat && milestone.repeat !== 'None') {
        const targetDate = date || new Date();
        const isCompleted = isCompletedOnDate(milestone, targetDate);
        let completed_dates = milestone.completed_dates || [];
        
        if (done && !isCompleted) {
          completed_dates = [...completed_dates, targetDate.toISOString()];
          updates.completed_dates = completed_dates;
        } else if (!done && isCompleted) {
          completed_dates = completed_dates.filter((d: string) => {
            const dDate = fastParseISO(d);
            if (milestone.repeat === 'Daily') return !isSameDay(dDate, targetDate);
            if (milestone.repeat === 'Weekly') return !isSameWeek(dDate, targetDate);
            if (milestone.repeat === 'Monthly') return !isSameMonth(dDate, targetDate);
            return true;
          });
          updates.completed_dates = completed_dates;
        }
      } else {
        if (milestone.done !== done) {
          updates.done = done;
          updates.completed_at = done ? new Date().toISOString() : null;
        }
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('milestones')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);
      }
    }

    // Refresh affected goals to update progress
    const uniqueGoalIds = Array.from(new Set(updatedGoalIds));
    const updatedGoals = await Promise.all(uniqueGoalIds.map(id => this.recalculateGoalProgress(id)));
    return updatedGoals.filter(Boolean) as Goal[];
  },

  async deleteMilestone(id: string) {
    const user = await this.getUser();
    if (!user) return;

    const { data: milestone } = await supabase
      .from('milestones')
      .select('goal_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    const goalId = milestone?.goal_id;

    await supabase
      .from('milestones')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (goalId) {
      return await this.recalculateGoalProgress(goalId);
    }
    return null;
  },

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Goal | null> {
    const user = await this.getUser();
    if (!user) return null;

    const { error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Error updating milestone:', error);

    // Update parent goal progress
    const { data: milestone } = await supabase
      .from('milestones')
      .select('goal_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (milestone?.goal_id) {
      return await this.recalculateGoalProgress(milestone.goal_id);
    }
    return null;
  },

  async recalculateGoalProgress(goalId: string): Promise<Goal | null> {
    const user = await this.getUser();
    if (!user) return null;

    const [goalResult, milestonesResult] = await Promise.all([
      supabase.from('goals').select('*').eq('id', goalId).eq('user_id', user.id).single(),
      supabase.from('milestones').select('*').eq('goal_id', goalId).eq('user_id', user.id).order('created_at', { ascending: true })
    ]);

    if (goalResult.error || !goalResult.data) return null;

    const goal = { 
      ...goalResult.data, 
      milestones: (milestonesResult.data || []).map(m => ({
        ...m,
        completed_dates: m.completed_dates || []
      }))
    };
    this.updateGoalProgress(goal);
    
    await this.updateGoal(goal.id, { progress: goal.progress });
    return goal;
  },

  updateGoalProgress(goal: Goal) {
    if (!goal.milestones || goal.milestones.length === 0) {
      goal.progress = 0;
      return;
    }
    
    let totalProgress = 0;
    const milestoneShare = 100 / goal.milestones.length;
    
    goal.milestones.forEach(m => {
      if (m.repeat && m.repeat !== 'None') {
        const totalOccurrences = countTotalOccurrences(m);
        const completedOccurrences = countCompletedOccurrences(m);
        totalProgress += (Math.min(completedOccurrences, totalOccurrences) / totalOccurrences) * milestoneShare;
      } else {
        if (m.done) totalProgress += milestoneShare;
      }
    });
    
    goal.progress = Math.min(100, Math.round(totalProgress));
  },

  async getCategories(): Promise<Category[]> {
    const user = await this.getUser();
    if (!user) return DEFAULT_CATEGORIES;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching categories:', error);
      return DEFAULT_CATEGORIES;
    }

    if (!data || data.length === 0) {
      // Seed default categories if none exist
      for (const cat of DEFAULT_CATEGORIES) {
        await this.addCategory(cat);
      }
      return DEFAULT_CATEGORIES;
    }

    return data;
  },

  async addCategory(category: Category) {
    const user = await this.getUser();
    if (!user) return;

    await supabase
      .from('categories')
      .insert({
        id: category.id,
        user_id: user.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        created_at: new Date().toISOString()
      });
  },

  async updateCategory(id: string, name: string, color: string, icon: string) {
    const user = await this.getUser();
    if (!user) return;

    await supabase
      .from('categories')
      .update({ name, color, icon })
      .eq('id', id)
      .eq('user_id', user.id);
  },

  async deleteCategory(id: string) {
    const user = await this.getUser();
    if (!user) return;

    await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  },

  async getHabits(): Promise<Habit[]> {
    const user = await this.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }

    return (data || []).map(h => ({
      ...h,
      completed_dates: h.completed_dates || [],
      streak: this.calculateHabitStreak(h)
    }));
  },

  async addHabit(habit: Habit) {
    const user = await this.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('habits')
      .insert({
        id: habit.id,
        user_id: user.id,
        title: habit.title,
        description: habit.description || null,
        category: habit.category,
        repeat: habit.repeat,
        due_date: habit.due_date || null,
        color: habit.color || null,
        completed_dates: [],
        streak: 0,
        created_at: habit.created_at || new Date().toISOString()
      });

    if (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  },

  async updateHabit(id: string, updates: Partial<Habit>) {
    const user = await this.getUser();
    if (!user) return;

    await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);
  },

  async deleteHabit(id: string) {
    const user = await this.getUser();
    if (!user) return;

    await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  },

  async setHabitCompleted(id: string, date: Date | undefined, done: boolean): Promise<Habit | null> {
    const user = await this.getUser();
    if (!user) return null;

    const { data: habit } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!habit) return null;

    const targetDate = date || new Date();
    const completed_dates = setCompletedDateState(
      habit.completed_dates,
      habit.repeat,
      targetDate,
      done,
    );
    
    const streak = this.calculateHabitStreak({ ...habit, completed_dates });
    
    const { data: updatedHabit, error: updateError } = await supabase
      .from('habits')
      .update({ completed_dates, streak })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
      
    return updatedHabit;
  },

  async toggleHabit(id: string, date?: Date): Promise<Habit | null> {
    const user = await this.getUser();
    if (!user) return null;

    const { data: habit } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!habit) return null;

    const targetDate = date || new Date();
    return await this.setHabitCompleted(
      id,
      targetDate,
      !isCompletedOnDate(habit, targetDate),
    );
  },

  calculateHabitStreak(habit: Habit): number {
    if (!habit.completed_dates || habit.completed_dates.length === 0) return 0;

    const today = startOfDay(new Date());
    let cursor = getLatestHabitOccurrence(habit, today);
    if (!cursor) return 0;

    if (!isCompletedOnDate(habit, cursor)) {
      if (!isSameDay(cursor, today)) return 0;
      cursor = getPreviousHabitOccurrence(habit, cursor);
    }

    let streak = 0;
    while (cursor && isCompletedOnDate(habit, cursor)) {
      streak++;
      cursor = getPreviousHabitOccurrence(habit, cursor);
    }

    return streak;
  }
};
