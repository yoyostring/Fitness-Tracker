'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import './workouts.css'

export default function Workouts() {
  const [weeklyPlans, setWeeklyPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [dailyExercises, setDailyExercises] = useState({})
  const [userEmail, setUserEmail] = useState('')
  const [showPlanSelector, setShowPlanSelector] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')
  const [editingExercise, setEditingExercise] = useState(null)
  // header labels are no longer editable
  const [editingWorkoutType, setEditingWorkoutType] = useState({})
  const [dayTypes, setDayTypes] = useState({})
  const supabase = createClient()

  useEffect(() => {
    fetchUserEmail()
    fetchWeeklyPlans()
  }, [])

  useEffect(() => {
    if (selectedPlan) {
      fetchDailyExercises()
      fetchDayTypes()
    }
  }, [selectedPlan])

  //from now to line 100, it is all demonstration of how to retrieve SQL data and display it through the frontend using mapping methods

  const fetchUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserEmail(user.email || '')
    }
  }

  const fetchWeeklyPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching plans:', error)
      return
    }

    setWeeklyPlans(data || [])
    
    // Check if there's a saved selected plan ID in localStorage
    const savedPlanId = localStorage.getItem('selectedWorkoutPlanId')
    
    if (data && data.length > 0) {
      if (savedPlanId) {
        // Try to find the saved plan
        const savedPlan = data.find(plan => plan.id === savedPlanId)
        if (savedPlan) {
          setSelectedPlan(savedPlan)
        } else {
          // If saved plan not found, use the first one
          setSelectedPlan(data[0])
        }
      } else {
        // No saved plan, use the first one
        setSelectedPlan(data[0])
      }
    }
  }

  const fetchDailyExercises = async () => {
    if (!selectedPlan) return

    const { data, error } = await supabase
      .from('daily_workout_exercises')
      .select('*')
      .eq('weekly_plan_id', selectedPlan.id)
      .order('day_of_week', { ascending: true })
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching exercises:', error)
      return
    }

    // Group exercises by day
    const exercisesByDay = {}
    data?.forEach(exercise => {
      if (!exercisesByDay[exercise.day_of_week]) {
        exercisesByDay[exercise.day_of_week] = []
      }
      exercisesByDay[exercise.day_of_week].push(exercise)
    })

    setDailyExercises(exercisesByDay)
  }

  const fetchDayTypes = async () => {
    if (!selectedPlan) return
    const { data, error } = await supabase
      .from('plan_day_meta')
      .select('day_of_week, day_type')
      .eq('weekly_plan_id', selectedPlan.id)

    if (error) {
      console.error('Error fetching day types:', error)
      return
    }

    const typesByDay = {}
    data?.forEach(r => { typesByDay[r.day_of_week] = r.day_type })
    setDayTypes(typesByDay)
  }

  const createNewPlan = async (planName) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('weekly_plans')
      .insert({
        user_id: user.id,
        plan_name: planName
      })
      .select()
      .single()

    if (error) {
      alert('Error creating plan: ' + error.message)
    } else {
      fetchWeeklyPlans()
      setSelectedPlan(data)
      // Save the new plan as selected
      localStorage.setItem('selectedWorkoutPlanId', data.id)
    }
  }

  const deletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    const { error } = await supabase
      .from('weekly_plans')
      .delete()
      .eq('id', planId)

    if (error) {
      alert('Error deleting plan: ' + error.message)
    } else {
      fetchWeeklyPlans()
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null)
        // Clear the saved plan ID if we deleted the selected plan
        localStorage.removeItem('selectedWorkoutPlanId')
      }
    }
  }

  const addExercise = async (day, exerciseName, setsXReps, weight, muscleGroup) => {
    if (!selectedPlan) return

    // Get the next order index for this day
    const dayExercises = dailyExercises[day] || []
    const nextOrderIndex = dayExercises.length

    const { error } = await supabase
      .from('daily_workout_exercises')
      .insert({
        weekly_plan_id: selectedPlan.id,
        day_of_week: day,
        exercise_name: exerciseName,
        sets_x_reps: setsXReps,
        weight: weight ? parseFloat(weight) : null,
        muscle_group: muscleGroup,
        order_index: nextOrderIndex
      })

    if (error) {
      alert('Error adding exercise: ' + error.message)
    } else {
      fetchDailyExercises()
      setShowAddExercise(false)
    }
  }

  const updateExercise = async (exerciseId, exerciseName, setsXReps, weight, muscleGroup) => {
    const { error } = await supabase
      .from('daily_workout_exercises')
      .update({
        exercise_name: exerciseName,
        sets_x_reps: setsXReps,
        weight: weight ? parseFloat(weight) : null,
        muscle_group: muscleGroup
      })
      .eq('id', exerciseId)

    if (error) {
      alert('Error updating exercise: ' + error.message)
    } else {
      fetchDailyExercises()
      setEditingExercise(null)
    }
  }

  const deleteExercise = async (exerciseId) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return

    const { error } = await supabase
      .from('daily_workout_exercises')
      .delete()
      .eq('id', exerciseId)

    if (error) {
      alert('Error deleting exercise: ' + error.message)
    } else {
      fetchDailyExercises()
    }
  }

  const duplicateDay = async (sourceDay, targetDay) => {
    if (!selectedPlan) return

    const sourceExercises = dailyExercises[sourceDay] || []
    
    // Delete existing exercises for target day
    await supabase
      .from('daily_workout_exercises')
      .delete()
      .eq('weekly_plan_id', selectedPlan.id)
      .eq('day_of_week', targetDay)

    // Copy exercises from source to target day
    for (let i = 0; i < sourceExercises.length; i++) {
      const exercise = sourceExercises[i]
      await supabase
        .from('daily_workout_exercises')
        .insert({
          weekly_plan_id: selectedPlan.id,
          day_of_week: targetDay,
          exercise_name: exercise.exercise_name,
          sets_x_reps: exercise.sets_x_reps,
          weight: exercise.weight,
          muscle_group: exercise.muscle_group,
          order_index: i
        })
    }

    fetchDailyExercises()
  }

  const clearDay = async (day) => {
    if (!selectedPlan || !confirm(`Clear ${day}?`)) return

    const { error } = await supabase
      .from('daily_workout_exercises')
      .delete()
      .eq('weekly_plan_id', selectedPlan.id)
      .eq('day_of_week', day)

    if (error) {
      alert('Error clearing day: ' + error.message)
    } else {
      fetchDailyExercises()
    }
  }

  const moveDay = async (sourceDay, targetDay) => {
    if (!selectedPlan) return
    if (!sourceDay || !targetDay || sourceDay === targetDay) return
  
    const sourceExercises = dailyExercises[sourceDay] || []
    const targetExercises = dailyExercises[targetDay] || []
    
    // Swap the exercises between days
    // First, update source day with target day's exercises
    await supabase
      .from('daily_workout_exercises')
      .delete()
      .eq('weekly_plan_id', selectedPlan.id)
      .eq('day_of_week', sourceDay)

    for (let i = 0; i < targetExercises.length; i++) {
      const exercise = targetExercises[i]
      await supabase
        .from('daily_workout_exercises')
        .insert({
          weekly_plan_id: selectedPlan.id,
          day_of_week: sourceDay,
          exercise_name: exercise.exercise_name,
          sets_x_reps: exercise.sets_x_reps,
          weight: exercise.weight,
          muscle_group: exercise.muscle_group,
          order_index: i
        })
    }

    // Then, update target day with source day's exercises
    await supabase
      .from('daily_workout_exercises')
      .delete()
      .eq('weekly_plan_id', selectedPlan.id)
      .eq('day_of_week', targetDay)

    for (let i = 0; i < sourceExercises.length; i++) {
      const exercise = sourceExercises[i]
      await supabase
        .from('daily_workout_exercises')
        .insert({
          weekly_plan_id: selectedPlan.id,
          day_of_week: targetDay,
          exercise_name: exercise.exercise_name,
          sets_x_reps: exercise.sets_x_reps,
          weight: exercise.weight,
          muscle_group: exercise.muscle_group,
          order_index: i
        })
    }

    fetchDailyExercises()
  }

  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
    'Legs', 'Hamstrings', 'Calves', 'Core', 'Cardio', 'Other'
  ]

  const workoutTypes = [
    'Upper', 'Lower', 'Push', 'Pull', 'Legs', 'Cardio', 'Rest'
  ]

  // header label editing removed

  const handleWorkoutTypeEdit = (dayKey) => {
    setEditingWorkoutType(prev => ({
      ...prev,
      [dayKey]: true
    }))
  }

  const saveWorkoutType = async (dayKey, newWorkoutType) => {
    if (!selectedPlan) return

    const upsert = {
      weekly_plan_id: selectedPlan.id,
      day_of_week: dayKey,
      day_type: newWorkoutType
    }

    const { error } = await supabase
      .from('plan_day_meta')
      .upsert(upsert, { onConflict: 'weekly_plan_id,day_of_week' })

    if (error) {
      alert('Error saving day type: ' + error.message)
    } else {
      setEditingWorkoutType(prev => ({ ...prev, [dayKey]: false }))
      fetchDayTypes()
    }
  }

  const getWorkoutTypeColor = (workout) => {
    if (!workout || workout === '[-]') return 'gray'
    const lower = workout.toLowerCase()
    if (lower.includes('push')) return 'red'
    if (lower.includes('pull')) return 'blue'
    if (lower.includes('legs') || lower.includes('squat')) return 'green'
    if (lower.includes('cardio') || lower.includes('run')) return 'orange'
    if (lower.includes('upper')) return 'purple'
    if (lower.includes('lower')) return 'teal'
    return 'gray'
  }

  const getWorkoutType = (workout) => {
    if (!workout || workout === '[-]') return 'Other'
    const lower = workout.toLowerCase()
    if (lower.includes('push')) return 'Push'
    if (lower.includes('pull')) return 'Pull'
    if (lower.includes('legs') || lower.includes('squat')) return 'Legs'
    if (lower.includes('cardio') || lower.includes('run')) return 'Cardio'
    if (lower.includes('upper')) return 'Upper'
    if (lower.includes('lower')) return 'Lower'
    return 'Other'
  }

  const days = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ]


  return (
    <div className="workouts-container">
      <div className="workouts-header">
        <h1>Weekly Workout Planner</h1>
        <div className="header-actions">
          <button 
            className="plan-selector-btn"
            onClick={() => setShowPlanSelector(!showPlanSelector)}
          >
            {selectedPlan ? selectedPlan.plan_name : 'Select Plan'} ▼
          </button>
          <button 
            className="back-btn" 
            onClick={() => window.location.href = '/'}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {showPlanSelector && (
        <div className="plan-selector">
          <h3>Select or Create Plan</h3>
          <div className="existing-plans">
            {weeklyPlans.map((plan) => (
              <div key={plan.id} className="plan-option">
                <button 
                  className={`plan-btn ${selectedPlan?.id === plan.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPlan(plan)
                    // Save the selected plan ID to localStorage
                    localStorage.setItem('selectedWorkoutPlanId', plan.id)
                    setShowPlanSelector(false)
                  }}
                >
                  {plan.plan_name}
                </button>
                <button 
                  className="delete-plan-btn"
                  onClick={() => deletePlan(plan.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button 
            className="create-plan-btn"
            onClick={() => {
              const planName = prompt('Enter plan name:')
              if (planName) createNewPlan(planName)
            }}
          >
            + Create New Plan
          </button>
        </div>
      )}

      {selectedPlan ? (
        <div className="workout-plan-card">
          <div className="plan-title">{selectedPlan.plan_name}</div>
          
          <div className="week-container">
            {days.map((day) => (
              <div key={day.key} className="day-plan-container">
                <div className="day-header">
                  <div className="day-title">{day.label}</div>
                  <div className="day-actions">
                    <button 
                      className="action-btn-small"
                      onClick={() => {
                        setSelectedDay(day.key)
                        setShowAddExercise(true)
                      }}
                      title="Add exercise"
                    >
                      + Add
                    </button>
                    <button 
                      className="action-btn-small"
                      onClick={() => {
                        const from = prompt('Move FROM day (monday, tuesday, etc.):')
                        const to = prompt('Move TO day (monday, tuesday, etc.):')
                        if (from && to) moveDay(from, to)
                      }}
                      title="Move day"
                    >
                      Move
                    </button>
                    <button 
                      className="action-btn-small"
                      onClick={() => {
                        const sourceDay = prompt('Copy from day (monday, tuesday, etc.):')
                        const targetDay = prompt('Copy to day (monday, tuesday, etc.):')
                        if (sourceDay && targetDay) duplicateDay(sourceDay, targetDay)
                      }}
                      title="Duplicate day"
                    >
                      Duplicate
                    </button>
                    <button 
                      className="clear-day-btn"
                      onClick={() => clearDay(day.key)}
                      title="Clear day"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {editingWorkoutType[day.key] ? (
                  <div className="workout-type-edit">
                    <select 
                      className="workout-type-select"
                      defaultValue={dayTypes[day.key] || 'Rest'}
                      onChange={(e) => saveWorkoutType(day.key, e.target.value)}
                    >
                      {workoutTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <button 
                      className="cancel-edit-btn"
                      onClick={() => setEditingWorkoutType(prev => ({ ...prev, [day.key]: false }))}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div 
                    className="plan-day"
                    style={{
                      backgroundColor: getWorkoutTypeColor(dayTypes[day.key] || 'Rest') === 'red' ? '#dc2626'
                        : getWorkoutTypeColor(dayTypes[day.key] || 'Rest') === 'blue' ? '#2563eb'
                        : getWorkoutTypeColor(dayTypes[day.key] || 'Rest') === 'green' ? '#16a34a'
                        : getWorkoutTypeColor(dayTypes[day.key] || 'Rest') === 'purple' ? '#7c3aed'
                        : getWorkoutTypeColor(dayTypes[day.key] || 'Rest') === 'orange' ? '#ea580c'
                        : getWorkoutTypeColor(dayTypes[day.key] || 'Rest') === 'teal' ? '#0d9488'
                        : '#6b7280'
                    }}
                    onClick={() => handleWorkoutTypeEdit(day.key)}
                  >
                    {dayTypes[day.key] || 'Rest'}
                  </div>
                )}

                <div className="plan-items header-row">
                  <span>Exercise</span>
                  <span>Sets x Reps</span>
                  <span>Weight</span>
                  <span>Muscle Group</span>
                  <span>Actions</span>
                </div>
                
                {dailyExercises[day.key] && dailyExercises[day.key].length > 0 ? (
                  dailyExercises[day.key].map((exercise) => (
                    <div key={exercise.id} className="plan-items data-row">
                      <span>{exercise.exercise_name}</span>
                      <span>{exercise.sets_x_reps}</span>
                      <span>{exercise.weight ? `${exercise.weight} lbs` : 'BW'}</span>
                      <span>{exercise.muscle_group}</span>
                      <span>
                        <button 
                          className="edit-exercise-btn"
                          onClick={() => setEditingExercise(exercise)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-exercise-btn"
                          onClick={() => deleteExercise(exercise.id)}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="plan-items data-row">
                    <span>cardio</span>
                    <span>0 x 0</span>
                    <span>0</span>
                    <span>Cardio</span>
                    <span></span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => {
                const planName = prompt('Enter plan name:')
                if (planName) createNewPlan(planName)
              }}
            >
              Create New Plan
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                const sourceDay = prompt('Copy from day (monday, tuesday, etc.):')
                const targetDay = prompt('Copy to day (monday, tuesday, etc.):')
                if (sourceDay && targetDay) duplicateDay(sourceDay, targetDay)
              }}
            >
              Duplicate Day
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                const from = prompt('Move FROM day (monday, tuesday, etc.):')
                const to = prompt('Move TO day (monday, tuesday, etc.):')
                if (from && to) moveDay(from, to)
              }}
            >
              Move
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                const day = prompt('Clear which day? (monday, tuesday, etc.):')
                if (day) clearDay(day)
              }}
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="no-plan">
          <p>No workout plan created yet. Create one to get started!</p>
          <button 
            className="create-first-plan-btn"
            onClick={() => {
              const planName = prompt('Enter plan name:')
              if (planName) createNewPlan(planName)
            }}
          >
            Create Your First Plan
          </button>
        </div>
      )}

      {showAddExercise && (
        <div className="add-exercise-modal">
          <div className="modal-content">
            <h3>Add Exercise to {selectedDay}</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              addExercise(
                selectedDay,
                formData.get('exerciseName'),
                formData.get('setsXReps'),
                formData.get('weight'),
                formData.get('muscleGroup')
              )
            }}>
              <input 
                type="text" 
                name="exerciseName" 
                placeholder="Exercise name" 
                required 
              />
              <input 
                type="text" 
                name="setsXReps" 
                placeholder="Sets × Reps (e.g., 3x8)" 
                required 
              />
              <input 
                type="number" 
                name="weight" 
                placeholder="Weight (optional)" 
                step="0.1"
              />
              <select name="muscleGroup" required>
                <option value="">Select muscle group</option>
                {muscleGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button type="submit">Add Exercise</button>
                <button type="button" onClick={() => setShowAddExercise(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingExercise && (
        <div className="edit-exercise-modal">
          <div className="modal-content">
            <h3>Edit Exercise</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              updateExercise(
                editingExercise.id,
                formData.get('exerciseName'),
                formData.get('setsXReps'),
                formData.get('weight'),
                formData.get('muscleGroup')
              )
            }}>
              <input 
                type="text" 
                name="exerciseName" 
                defaultValue={editingExercise.exercise_name}
                placeholder="Exercise name" 
                required 
              />
              <input 
                type="text" 
                name="setsXReps" 
                defaultValue={editingExercise.sets_x_reps}
                placeholder="Sets × Reps (e.g., 3x8)" 
                required 
              />
              <input 
                type="number" 
                name="weight" 
                defaultValue={editingExercise.weight || ''}
                placeholder="Weight (optional)" 
                step="0.1"
              />
              <select name="muscleGroup" defaultValue={editingExercise.muscle_group} required>
                <option value="">Select muscle group</option>
                {muscleGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button type="submit">Update Exercise</button>
                <button type="button" onClick={() => setEditingExercise(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}