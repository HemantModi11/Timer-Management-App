export const groupTimersByCategory = (timers) => {
    return timers.reduce((groups, timer) => {
      if (!groups[timer.category]) {
        groups[timer.category] = [];
      }
      groups[timer.category].push(timer);
      return groups;
    }, {});
  };  