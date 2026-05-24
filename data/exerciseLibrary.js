// ============================================
// EXERCISE LIBRARY — Pre-seeded Data
// ============================================

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'
];

const MUSCLE_GROUP_EMOJIS = {
  'Chest': '🫁',
  'Back': '🔙',
  'Shoulders': '💪',
  'Arms': '💪',
  'Legs': '🦵',
  'Core': '🎯',
  'Cardio': '❤️‍🔥'
};

const MUSCLE_GROUP_COLORS = {
  'Chest': 'purple',
  'Back': 'navy',
  'Shoulders': 'coral',
  'Arms': 'deep',
  'Legs': 'green',
  'Core': 'coral',
  'Cardio': 'purple'
};

const CATEGORIES = [
  'Push/Pull/Legs',
  'Upper/Lower',
  'Cardio',
  'Full Body',
  'Custom'
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const EQUIPMENT_LIST = [
  'Bodyweight',
  'Dumbbells',
  'Resistance Band',
  'Pull-up Bar',
  'Kettlebell'
];

const DEFAULT_EXERCISES = [
  // ===== CHEST =====
  {
    id: 'ex-chest-001',
    name: 'Push-ups',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders', 'Arms'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'The classic bodyweight chest exercise. Works the entire upper body with emphasis on the chest.',
    instructions: [
      'Start in a high plank position, hands slightly wider than shoulder-width apart.',
      'Keep your body in a straight line from head to heels.',
      'Lower your body until your chest nearly touches the floor.',
      'Push back up to the starting position.',
      'Keep your core engaged throughout the movement.'
    ]
  },
  {
    id: 'ex-chest-002',
    name: 'Wide Push-ups',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A push-up variation with wider hand placement to emphasize the outer chest.',
    instructions: [
      'Start in a plank position with hands placed wider than shoulder-width.',
      'Keep elbows pointing outward at about 45 degrees.',
      'Lower your chest toward the ground slowly.',
      'Push back up, squeezing your chest at the top.',
      'Maintain a straight body line throughout.'
    ]
  },
  {
    id: 'ex-chest-003',
    name: 'Diamond Push-ups',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Arms'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'Hands form a diamond shape beneath the chest, targeting the inner chest and triceps.',
    instructions: [
      'Place your hands close together under your chest, forming a diamond shape with your index fingers and thumbs.',
      'Keep your body straight from head to heels.',
      'Lower your chest toward your hands.',
      'Push back up, keeping elbows close to your body.',
      'Squeeze your triceps at the top of the movement.'
    ]
  },
  {
    id: 'ex-chest-004',
    name: 'Incline Push-ups',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'Push-ups performed with hands elevated, great for targeting the lower chest and for beginners.',
    instructions: [
      'Place your hands on an elevated surface (chair, bench, or wall).',
      'Walk your feet back until your body forms a straight line.',
      'Lower your chest toward the surface.',
      'Push back up to the starting position.',
      'Keep your core tight throughout.'
    ]
  },
  {
    id: 'ex-chest-005',
    name: 'Chest Press (DB)',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders', 'Arms'],
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'A fundamental chest exercise using dumbbells for balanced muscle development.',
    instructions: [
      'Lie on a flat bench or floor with a dumbbell in each hand.',
      'Hold dumbbells at chest level with palms facing forward.',
      'Press the dumbbells up until arms are fully extended.',
      'Lower back down slowly to the starting position.',
      'Keep your back flat and feet planted.'
    ]
  },
  {
    id: 'ex-chest-006',
    name: 'Chest Fly (DB)',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Shoulders'],
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'An isolation exercise that stretches and contracts the chest muscles through a wide arc.',
    instructions: [
      'Lie on a flat bench or floor with dumbbells held above your chest.',
      'With a slight bend in your elbows, lower the weights out to the sides.',
      'Lower until you feel a stretch in your chest.',
      'Bring the dumbbells back together above your chest.',
      'Squeeze your chest muscles at the top.'
    ]
  },

  // ===== BACK =====
  {
    id: 'ex-back-001',
    name: 'Pull-ups',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms'],
    difficulty: 'Advanced',
    equipment: 'Pull-up Bar',
    timeBased: false,
    description: 'The king of back exercises. Builds a wide, strong back and powerful grip.',
    instructions: [
      'Grip the bar with hands slightly wider than shoulder-width, palms facing away.',
      'Hang with arms fully extended.',
      'Pull yourself up until your chin clears the bar.',
      'Lower yourself back down with control.',
      'Avoid swinging or using momentum.'
    ]
  },
  {
    id: 'ex-back-002',
    name: 'Chin-ups',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms'],
    difficulty: 'Intermediate',
    equipment: 'Pull-up Bar',
    timeBased: false,
    description: 'Similar to pull-ups but with an underhand grip, emphasizing the biceps more.',
    instructions: [
      'Grip the bar with hands shoulder-width apart, palms facing toward you.',
      'Hang with arms fully extended.',
      'Pull yourself up until your chin is above the bar.',
      'Lower yourself with control.',
      'Focus on squeezing your back muscles.'
    ]
  },
  {
    id: 'ex-back-003',
    name: 'Bent-over Row (DB)',
    muscleGroup: 'Back',
    secondaryMuscles: ['Arms'],
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'A compound pulling exercise for overall back thickness and strength.',
    instructions: [
      'Stand with feet hip-width apart, hold dumbbells at your sides.',
      'Hinge forward at the hips to about 45 degrees, keeping your back straight.',
      'Let the dumbbells hang at arm\'s length.',
      'Pull the dumbbells up to your lower ribcage, squeezing your shoulder blades.',
      'Lower back down with control.'
    ]
  },
  {
    id: 'ex-back-004',
    name: 'Superman',
    muscleGroup: 'Back',
    secondaryMuscles: ['Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A bodyweight exercise that strengthens the lower back and posterior chain.',
    instructions: [
      'Lie face down with arms extended overhead.',
      'Simultaneously lift your arms, chest, and legs off the floor.',
      'Hold for 1-2 seconds at the top.',
      'Lower back down with control.',
      'Keep your neck neutral throughout.'
    ]
  },
  {
    id: 'ex-back-005',
    name: 'Reverse Snow Angel',
    muscleGroup: 'Back',
    secondaryMuscles: ['Shoulders'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A unique exercise that targets the upper back and rear deltoids.',
    instructions: [
      'Lie face down with arms at your sides, palms facing down.',
      'Lift your chest and arms slightly off the floor.',
      'Sweep your arms in an arc from your sides to overhead.',
      'Reverse the movement back to the starting position.',
      'Keep your arms straight and off the floor throughout.'
    ]
  },

  // ===== SHOULDERS =====
  {
    id: 'ex-shoulders-001',
    name: 'Overhead Press (DB)',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Arms'],
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'The primary shoulder-building exercise. Develops overall shoulder mass and strength.',
    instructions: [
      'Stand or sit with dumbbells at shoulder height, palms facing forward.',
      'Press the dumbbells overhead until arms are fully extended.',
      'Lower back down to shoulder level with control.',
      'Keep your core engaged and avoid arching your back.',
      'Don\'t lock out your elbows at the top.'
    ]
  },
  {
    id: 'ex-shoulders-002',
    name: 'Lateral Raise (DB)',
    muscleGroup: 'Shoulders',
    secondaryMuscles: [],
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'Isolates the lateral deltoid for wider-looking shoulders.',
    instructions: [
      'Stand with dumbbells at your sides, palms facing in.',
      'With a slight bend in your elbows, raise the weights out to the sides.',
      'Lift until arms are parallel to the floor.',
      'Lower back down slowly.',
      'Avoid using momentum — keep the movement controlled.'
    ]
  },
  {
    id: 'ex-shoulders-003',
    name: 'Front Raise',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Chest'],
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'Targets the front deltoids. Can be performed with dumbbells or bodyweight.',
    instructions: [
      'Stand holding dumbbells in front of your thighs, palms facing back.',
      'Raise one or both arms forward to shoulder height.',
      'Hold briefly at the top.',
      'Lower back down with control.',
      'Alternate arms or do both simultaneously.'
    ]
  },
  {
    id: 'ex-shoulders-004',
    name: 'Pike Push-ups',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Arms', 'Chest'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A bodyweight overhead pressing movement that heavily targets the shoulders.',
    instructions: [
      'Start in a downward dog position, hands and feet on the floor, hips high.',
      'Place hands shoulder-width apart.',
      'Bend your elbows and lower the top of your head toward the floor.',
      'Push back up to the starting position.',
      'Keep your hips elevated throughout the movement.'
    ]
  },

  // ===== ARMS =====
  {
    id: 'ex-arms-001',
    name: 'Bicep Curl (DB)',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'The classic arm exercise for building bicep size and strength.',
    instructions: [
      'Stand with dumbbells at your sides, palms facing forward.',
      'Curl the weights up toward your shoulders.',
      'Squeeze your biceps at the top.',
      'Lower back down slowly.',
      'Keep your elbows pinned to your sides — don\'t swing.'
    ]
  },
  {
    id: 'ex-arms-002',
    name: 'Hammer Curl',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'Targets the brachialis and forearms in addition to the biceps.',
    instructions: [
      'Stand with dumbbells at your sides, palms facing your body.',
      'Curl the weights up while keeping palms facing inward.',
      'Squeeze at the top.',
      'Lower back down with control.',
      'Keep your upper arms stationary.'
    ]
  },
  {
    id: 'ex-arms-003',
    name: 'Tricep Dip',
    muscleGroup: 'Arms',
    secondaryMuscles: ['Chest', 'Shoulders'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A compound bodyweight exercise that builds tricep strength and size.',
    instructions: [
      'Place your hands on a sturdy chair or bench behind you.',
      'Extend your legs out in front (easier bent, harder straight).',
      'Lower your body by bending your elbows to about 90 degrees.',
      'Push back up to the starting position.',
      'Keep your back close to the chair.'
    ]
  },
  {
    id: 'ex-arms-004',
    name: 'Skull Crusher (DB)',
    muscleGroup: 'Arms',
    secondaryMuscles: [],
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'An isolation exercise for the triceps, performed lying down.',
    instructions: [
      'Lie on your back holding dumbbells with arms extended above your chest.',
      'Keeping upper arms stationary, bend at the elbows.',
      'Lower the dumbbells toward your forehead.',
      'Extend your arms back to the starting position.',
      'Keep your elbows pointing toward the ceiling.'
    ]
  },
  {
    id: 'ex-arms-005',
    name: 'Close-grip Push-up',
    muscleGroup: 'Arms',
    secondaryMuscles: ['Chest'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A push-up variation that emphasizes the triceps more than the chest.',
    instructions: [
      'Start in push-up position with hands placed closer than shoulder-width.',
      'Keep your elbows close to your body as you lower down.',
      'Lower until your chest nearly touches the floor.',
      'Push back up, focusing on squeezing your triceps.',
      'Maintain a tight core throughout.'
    ]
  },

  // ===== LEGS =====
  {
    id: 'ex-legs-001',
    name: 'Squats',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'The fundamental lower body exercise. Builds legs, glutes, and core strength.',
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly turned out.',
      'Push your hips back and bend your knees to lower down.',
      'Go as deep as comfortable (aim for thighs parallel to floor).',
      'Drive through your heels to stand back up.',
      'Keep your chest up and core tight throughout.'
    ]
  },
  {
    id: 'ex-legs-002',
    name: 'Jump Squats',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Cardio'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'An explosive squat variation that builds power and burns calories.',
    instructions: [
      'Start in a squat position with feet shoulder-width apart.',
      'Lower into a squat.',
      'Explosively jump up, extending your body fully.',
      'Land softly and immediately drop into the next squat.',
      'Keep your knees tracking over your toes on landing.'
    ]
  },
  {
    id: 'ex-legs-003',
    name: 'Lunges',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A unilateral leg exercise that improves balance and leg strength.',
    instructions: [
      'Stand with feet hip-width apart.',
      'Step forward with one leg, lowering your hips until both knees are at 90 degrees.',
      'Your back knee should nearly touch the floor.',
      'Push back to the starting position.',
      'Alternate legs each rep.'
    ]
  },
  {
    id: 'ex-legs-004',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    difficulty: 'Advanced',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A challenging single-leg exercise that builds serious leg strength and balance.',
    instructions: [
      'Stand a couple of feet in front of a bench or chair.',
      'Place the top of your rear foot on the bench behind you.',
      'Lower your body by bending your front knee.',
      'Go down until your front thigh is parallel to the floor.',
      'Push through your front heel to return to the starting position.'
    ]
  },
  {
    id: 'ex-legs-005',
    name: 'Glute Bridge',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'Targets the glutes and hamstrings. Great for hip strength and posture.',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place arms at your sides.',
      'Drive through your heels to lift your hips toward the ceiling.',
      'Squeeze your glutes at the top.',
      'Lower back down with control.'
    ]
  },
  {
    id: 'ex-legs-006',
    name: 'Deadlift (DB)',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Back', 'Core'],
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    timeBased: false,
    description: 'A compound exercise that targets the entire posterior chain.',
    instructions: [
      'Stand with feet hip-width apart, holding dumbbells in front of your thighs.',
      'Hinge at the hips, pushing your butt back.',
      'Lower the dumbbells along your legs, keeping them close to your body.',
      'Go until you feel a stretch in your hamstrings.',
      'Drive your hips forward to return to standing.'
    ]
  },
  {
    id: 'ex-legs-007',
    name: 'Calf Raises',
    muscleGroup: 'Legs',
    secondaryMuscles: [],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'Isolates the calf muscles for lower leg development.',
    instructions: [
      'Stand with feet hip-width apart.',
      'Rise up onto the balls of your feet.',
      'Hold at the top for a moment, squeezing your calves.',
      'Lower back down slowly.',
      'For extra range, stand on an elevated surface.'
    ]
  },

  // ===== CORE =====
  {
    id: 'ex-core-001',
    name: 'Plank',
    muscleGroup: 'Core',
    secondaryMuscles: ['Shoulders'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: true,
    description: 'The ultimate core stability exercise. Strengthens the entire midsection.',
    instructions: [
      'Start in a forearm plank position, elbows under shoulders.',
      'Keep your body in a straight line from head to heels.',
      'Engage your core by pulling your belly button toward your spine.',
      'Hold the position for the prescribed time.',
      'Don\'t let your hips sag or pike up.'
    ]
  },
  {
    id: 'ex-core-002',
    name: 'Side Plank',
    muscleGroup: 'Core',
    secondaryMuscles: ['Shoulders'],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    timeBased: true,
    description: 'Targets the obliques and improves lateral core stability.',
    instructions: [
      'Lie on your side with your forearm on the ground, elbow under shoulder.',
      'Stack your feet on top of each other.',
      'Lift your hips off the ground, creating a straight line.',
      'Hold the position for the prescribed time.',
      'Switch sides and repeat.'
    ]
  },
  {
    id: 'ex-core-003',
    name: 'Crunches',
    muscleGroup: 'Core',
    secondaryMuscles: [],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A basic abdominal exercise that targets the upper abs.',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place your hands behind your head or crossed over your chest.',
      'Curl your upper body toward your knees, lifting shoulders off the floor.',
      'Hold briefly at the top.',
      'Lower back down with control. Don\'t pull on your neck.'
    ]
  },
  {
    id: 'ex-core-004',
    name: 'Leg Raises',
    muscleGroup: 'Core',
    secondaryMuscles: [],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'Targets the lower abdominals with a leg-lifting movement.',
    instructions: [
      'Lie on your back with legs straight and arms at your sides.',
      'Keeping legs straight, lift them up until they\'re perpendicular to the floor.',
      'Lower them back down slowly, stopping just before they touch the ground.',
      'Keep your lower back pressed into the floor.',
      'For easier version, bend your knees slightly.'
    ]
  },
  {
    id: 'ex-core-005',
    name: 'Russian Twists',
    muscleGroup: 'Core',
    secondaryMuscles: [],
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A rotational exercise that targets the obliques and entire core.',
    instructions: [
      'Sit on the floor with knees bent and feet slightly lifted.',
      'Lean back slightly, keeping your back straight.',
      'Clasp your hands together in front of your chest.',
      'Rotate your torso to one side, then the other.',
      'Each twist to both sides counts as one rep.'
    ]
  },
  {
    id: 'ex-core-006',
    name: 'Mountain Climbers',
    muscleGroup: 'Core',
    secondaryMuscles: ['Cardio', 'Shoulders'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'A dynamic plank exercise that also raises your heart rate.',
    instructions: [
      'Start in a high plank position with hands under shoulders.',
      'Drive one knee toward your chest.',
      'Quickly switch legs, bringing the other knee in.',
      'Continue alternating at a rapid pace.',
      'Keep your hips level and core engaged.'
    ]
  },

  // ===== CARDIO =====
  {
    id: 'ex-cardio-001',
    name: 'Jumping Jacks',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Legs', 'Shoulders'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: true,
    description: 'A full-body warm-up exercise that elevates heart rate quickly.',
    instructions: [
      'Stand with feet together and arms at your sides.',
      'Jump feet out wide while raising arms overhead.',
      'Jump feet back together while lowering arms.',
      'Repeat at a steady, brisk pace.',
      'Land softly on the balls of your feet.'
    ]
  },
  {
    id: 'ex-cardio-002',
    name: 'Burpees',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Chest', 'Legs', 'Core'],
    difficulty: 'Advanced',
    equipment: 'Bodyweight',
    timeBased: false,
    description: 'The ultimate full-body conditioning exercise. High intensity, high reward.',
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Drop into a squat and place hands on the floor.',
      'Jump your feet back into a plank position.',
      'Perform a push-up.',
      'Jump feet forward to your hands and explosively jump up.'
    ]
  },
  {
    id: 'ex-cardio-003',
    name: 'High Knees',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Legs', 'Core'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: true,
    description: 'A running-in-place exercise that builds cardio endurance and leg speed.',
    instructions: [
      'Stand with feet hip-width apart.',
      'Run in place, driving your knees up toward your chest.',
      'Aim to get your knees to hip height.',
      'Pump your arms in sync with your legs.',
      'Maintain a fast, steady pace.'
    ]
  },
  {
    id: 'ex-cardio-004',
    name: 'Jump Rope (simulated)',
    muscleGroup: 'Cardio',
    secondaryMuscles: ['Legs', 'Arms'],
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    timeBased: true,
    description: 'Simulate jump rope movements for excellent cardio without equipment.',
    instructions: [
      'Stand with feet together, arms at your sides.',
      'Make small circles with your wrists as if holding a rope.',
      'Jump lightly on the balls of your feet.',
      'Keep jumps small and fast.',
      'Stay light on your feet and keep a steady rhythm.'
    ]
  }
];

function getAllExercises() {
  const customExercises = (window.storage && window.storage.getCustomExercises) ? window.storage.getCustomExercises() : [];
  return [...DEFAULT_EXERCISES, ...customExercises];
}

function getExerciseById(id) {
  return getAllExercises().find(ex => ex.id === id);
}

function getExercisesByMuscleGroup(group) {
  return getAllExercises().filter(ex => ex.muscleGroup === group);
}

function getExercisesByDifficulty(difficulty) {
  return getAllExercises().filter(ex => ex.difficulty === difficulty);
}

function getExercisesByEquipment(equipment) {
  return getAllExercises().filter(ex => ex.equipment === equipment);
}

function searchExercises(query) {
  const q = query.toLowerCase();
  return getAllExercises().filter(ex =>
    ex.name.toLowerCase().includes(q) ||
    ex.muscleGroup.toLowerCase().includes(q) ||
    ex.equipment.toLowerCase().includes(q)
  );
}

// Expose to global namespace
window.exerciseLibrary = {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_EMOJIS,
  MUSCLE_GROUP_COLORS,
  CATEGORIES,
  DIFFICULTIES,
  EQUIPMENT_LIST,
  getAllExercises,
  getExerciseById,
  getExercisesByMuscleGroup,
  getExercisesByDifficulty,
  getExercisesByEquipment,
  searchExercises
};
