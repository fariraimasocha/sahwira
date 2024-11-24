export const badges = {
  taskMaster: {
    id: 'taskMaster',
    name: 'Task Master',
    description: 'Complete 50 tasks',
    requirement: 50,
    icon: '🏆',
  },
  quickStarter: {
    id: 'quickStarter',
    name: 'Quick Starter',
    description: 'Complete 10 tasks',
    requirement: 10,
    icon: '🌟',
  },
  productivityNinja: {
    id: 'productivityNinja',
    name: 'Productivity Ninja',
    description: 'Complete 25 tasks',
    requirement: 25,
    icon: '⚡',
  },
  consistentAchiever: {
    id: 'consistentAchiever',
    name: 'Consistent Achiever',
    description: 'Complete 100 tasks',
    requirement: 100,
    icon: '🎯',
  },
  grandMaster: {
    id: 'grandMaster',
    name: 'Grand Master',
    description: 'Complete 200 tasks',
    requirement: 200,
    icon: '👑',
  },
};

export const calculateLevel = (points) => {
  const basePoints = 100;
  const level = Math.floor(points / basePoints) + 1;
  const nextLevelPoints = level * basePoints;
  const progress = ((points % basePoints) / basePoints) * 100;
  
  return {
    current: level,
    nextLevelPoints,
    progress: Math.round(progress),
    totalPoints: points,
  };
};

export const getEarnedBadges = (completedTasks) => {
  return Object.values(badges).filter(badge => completedTasks >= badge.requirement);
};
