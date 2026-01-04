/**
 * Booking Date Helpers
 * 
 * Utility functions for generating booking dates and handling date calculations.
 */

import type { RecurringFrequency } from '@/types';

/**
 * Get recurring discount based on frequency
 */
export const getRecurringDiscount = (frequency: RecurringFrequency): number => {
  switch (frequency) {
    case 'daily': return 0.0;
    case 'weekly': return 0.0;
    case 'monthly': return 0.10; // 10% discount
    default: return 0.0;
  }
};

/**
 * Generate booking dates for recurring series
 * Supports multiple visits per day for weekly/monthly frequencies
 * Supports per-day schedule configuration for weekly bookings
 */
export const generateBookingDates = (
  startDate: Date,
  preferredTime: string,
  frequency: RecurringFrequency,
  preferredDays: number[],
  count: number,
  visitsPerDay: number = 1,
  timeIntervalMinutes: number = 60, // Default 1 hour between visits
  daySchedules?: Array<{ dayOfWeek: number; enabled: boolean; numberOfVisits: number; visitTimes: string[] }>
): Date[] => {
  console.log('🔍 [DEBUG] generateBookingDates called:', {
    startDate: startDate.toISOString(),
    preferredTime,
    frequency,
    preferredDays,
    count,
    visitsPerDay,
    timeIntervalMinutes,
    daySchedules
  });
  
  const dates: Date[] = [];
  
  // Parse preferred time (fallback if daySchedules not provided)
  const [timeStr, period] = preferredTime.split(' ');
  const [hours, minutes] = timeStr.split(':').map(Number);
  let baseHour = hours;
  if (period === 'PM' && baseHour < 12) baseHour += 12;
  if (period === 'AM' && baseHour === 12) baseHour = 0;

  // Helper to parse time string (HH:mm format)
  const parseTime = (timeStr: string): { hour: number; minute: number } => {
    const [h, m] = timeStr.split(':').map(Number);
    return { hour: h, minute: m || 0 };
  };

  // Special handling for weekly with daySchedules
  if (frequency === 'weekly' && daySchedules && Array.isArray(daySchedules) && daySchedules.length > 0) {
    console.log('🔍 [DEBUG] daySchedules provided:', daySchedules);
    const enabledDays = daySchedules.filter(day => day.enabled && day.visitTimes && day.visitTimes.length > 0);
    console.log('🔍 [DEBUG] Enabled days after filtering:', enabledDays);
    
    if (enabledDays.length === 0) {
      console.warn('🔍 [DEBUG] No enabled days with visit times in daySchedules, falling back to preferredDays');
      // Don't return - fall through to old logic below
    } else {
      console.log('🔍 [DEBUG] Using daySchedules for weekly booking:', enabledDays);
      
      // Calculate visits per week from enabled days
      const visitsPerWeek = enabledDays.reduce((sum, day) => sum + day.numberOfVisits, 0);
      console.log('🔍 [DEBUG] Visits per week:', visitsPerWeek, 'Total visits needed:', count);
      
      // Calculate how many weeks we need
      let totalVisitsGenerated = 0;
      let weekOffset = 0;
      const maxWeeks = Math.ceil(count / visitsPerWeek) + 1; // Safety limit
    
      while (totalVisitsGenerated < count && weekOffset < maxWeeks) {
        for (const daySchedule of enabledDays) {
          if (totalVisitsGenerated >= count) break;
          
          // Calculate the date for this day in this week
          // Always start from the original startDate
          const baseDate = new Date(startDate);
          const targetDate = new Date(startDate);
        
          if (weekOffset === 0) {
            // First week: find the first occurrence of this day on or after start date
            const currentDayOfWeek = baseDate.getDay();
            let daysToAdd = (daySchedule.dayOfWeek + 7 - currentDayOfWeek) % 7;
            // If target day is before start date's day, move to next week
            if (daysToAdd === 0 && daySchedule.dayOfWeek !== currentDayOfWeek) {
              daysToAdd = 7;
            } else if (daySchedule.dayOfWeek < currentDayOfWeek) {
              daysToAdd += 7;
            }
            targetDate.setTime(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
          } else {
            // Subsequent weeks: add weekOffset * 7 days from start date, then adjust to target day
            const weekStartDate = new Date(baseDate);
            weekStartDate.setDate(baseDate.getDate() + (weekOffset * 7));
            const currentDayOfWeek = weekStartDate.getDay();
            const daysToAdd = (daySchedule.dayOfWeek + 7 - currentDayOfWeek) % 7;
            targetDate.setTime(weekStartDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
          }
          
          console.log(`🔍 [DEBUG] Generated date for week ${weekOffset}, day ${daySchedule.dayOfWeek}:`, {
            weekOffset,
            dayOfWeek: daySchedule.dayOfWeek,
            targetDate: targetDate.toISOString(),
            visitTimes: daySchedule.visitTimes
          });
          
          // Generate visits for this day at specified times
          for (const visitTime of daySchedule.visitTimes) {
            if (totalVisitsGenerated >= count) {
              console.log(`🔍 [DEBUG] Reached count limit (${count}), stopping visit generation`);
              break;
            }
            
            const { hour, minute } = parseTime(visitTime);
            const visitDate = new Date(targetDate);
            visitDate.setHours(hour, minute, 0, 0);
            dates.push(visitDate);
            totalVisitsGenerated++;
            
            console.log(`🔍 [DEBUG] Added visit ${totalVisitsGenerated}/${count}:`, {
              date: visitDate.toISOString(),
              time: visitTime,
              hour,
              minute
            });
          }
        }
        weekOffset++;
      }
      
      console.log('🔍 [DEBUG] Generated dates from daySchedules:', {
        totalVisitsGenerated,
        requestedCount: count,
        weeksProcessed: weekOffset,
        visitsPerWeek,
        enabledDaysCount: enabledDays.length,
        datesCount: dates.length,
        dates: dates.map(d => d.toISOString())
      });
      
      if (dates.length === 0) {
        console.error('❌ [ERROR] No dates generated! Check daySchedules configuration.');
      } else if (dates.length < count) {
        console.warn(`⚠️ [WARNING] Generated ${dates.length} dates but requested ${count}. Check date generation logic.`);
      }
      
      // Return early if we successfully generated dates from daySchedules
      if (dates.length > 0) {
        const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
        console.log('🔍 [DEBUG] Final sorted dates from daySchedules:', sortedDates.map(d => d.toISOString()));
        return sortedDates;
      }
      // If no dates generated, fall through to old logic
      console.log('🔍 [DEBUG] Falling back to old preferredDays logic');
    }
  }
  
  // Original logic for daily/monthly or weekly without daySchedules
  {
    const uniqueDaysNeeded = Math.ceil(count / visitsPerDay);
    console.log('🔍 [DEBUG] Date generation params:', { uniqueDaysNeeded, visitsPerDay, count });
    let visitIndex = 0;

    for (let dayIndex = 0; dayIndex < uniqueDaysNeeded && visitIndex < count; dayIndex++) {
      const start = new Date(startDate);
      let nextDate = new Date(start);

      switch (frequency) {
        case 'daily':
          nextDate.setDate(start.getDate() + dayIndex);
          break;
        case 'weekly':
          if (preferredDays && preferredDays.length > 0) {
            console.log(`🔍 [DEBUG] Weekly booking - dayIndex ${dayIndex}, preferredDays:`, preferredDays);
            // Calculate which week and which day in that week
            const totalDaysSelected = preferredDays.length;
            const weekOffset = Math.floor(dayIndex / totalDaysSelected);
            const dayInWeekIndex = dayIndex % totalDaysSelected;
            const targetDay = preferredDays[dayInWeekIndex];
            
            console.log(`🔍 [DEBUG] Weekly calculation:`, {
              dayIndex,
              totalDaysSelected,
              weekOffset,
              dayInWeekIndex,
              targetDay
            });
            
            // Start from base date
            nextDate = new Date(start);
            nextDate.setDate(start.getDate() + (weekOffset * 7));
            
            // Get current day of week (0 = Sunday, 6 = Saturday)
            const currentDayOfWeek = nextDate.getDay();
            // Calculate days to add to reach target day
            let daysToAdd = (targetDay + 7 - currentDayOfWeek) % 7;
            // If same day, don't add 0 (unless it's week 0 and we're on that day)
            if (daysToAdd === 0 && weekOffset === 0 && currentDayOfWeek === targetDay) {
              daysToAdd = 0; // Stay on same day
            } else if (daysToAdd === 0 && weekOffset > 0) {
              daysToAdd = 7; // Move to next week
            }
            nextDate.setDate(nextDate.getDate() + daysToAdd);
            
            console.log(`🔍 [DEBUG] Weekly date calculated:`, {
              startDate: start.toISOString(),
              weekOffset,
              currentDayOfWeek,
              targetDay,
              daysToAdd,
              resultDate: nextDate.toISOString()
            });
          } else {
            console.log(`🔍 [DEBUG] Weekly booking - no preferredDays, using dayIndex * 7`);
            nextDate.setDate(start.getDate() + (dayIndex * 7));
          }
          break;
        case 'monthly':
          if (preferredDays && preferredDays.length > 0) {
            // For monthly with preferred days, cycle through months and days
            const totalDaysSelected = preferredDays.length;
            const monthOffset = Math.floor(dayIndex / totalDaysSelected);
            const dayInMonthIndex = dayIndex % totalDaysSelected;
            const targetDayOfMonth = preferredDays[dayInMonthIndex];
            
            nextDate = new Date(start);
            nextDate.setMonth(start.getMonth() + monthOffset);
            // Set to the target day of month (clamp to max days in that month)
            const maxDaysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
            nextDate.setDate(Math.min(targetDayOfMonth, maxDaysInMonth));
          } else {
            // Use same day of month each time
            nextDate = new Date(start);
            nextDate.setMonth(start.getMonth() + dayIndex);
          }
          break;
      }

      // Generate multiple visits for this day
      for (let visitInDay = 0; visitInDay < visitsPerDay && visitIndex < count; visitInDay++) {
        const visitDate = new Date(nextDate);
        const visitHour = baseHour + Math.floor((visitInDay * timeIntervalMinutes) / 60);
        const visitMinute = minutes + ((visitInDay * timeIntervalMinutes) % 60);
        
        visitDate.setHours(visitHour, visitMinute, 0, 0);
        dates.push(visitDate);
        visitIndex++;
        
        console.log(`🔍 [DEBUG] Added visit ${visitIndex}/${count} for dayIndex ${dayIndex}, visitInDay ${visitInDay}:`, visitDate.toISOString());
      }
    }
    
    console.log('🔍 [DEBUG] Old logic completed:', {
      requestedCount: count,
      generatedCount: dates.length,
      uniqueDaysNeeded,
      visitsPerDay
    });
  }

  const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
  console.log('🔍 [DEBUG] generateBookingDates result:', {
    requestedCount: count,
    generatedCount: sortedDates.length,
    dates: sortedDates.map(d => d.toISOString())
  });
  return sortedDates;
};

