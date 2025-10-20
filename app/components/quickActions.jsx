import "./quickActions.css";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function QuickActions() {
    const [showPopup, setShowPopup] = useState(false);
    const [currentAction, setCurrentAction] = useState("");
    const supabase = createClient();

    const handleActionClick = (action) => {
        setShowPopup(true);
        setCurrentAction(action.type);
        if (action.type === "deleteExercise") {
            fetchTodayExercises();
        }
    }

    const closePopup = () => {
        setShowPopup(false);
    }

    const handleExerciseSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
    
        // Find or create today's workout
        const today = new Date().toISOString().slice(0, 10);
        const title = `Quick Entry ${today}`;
        
        const { data: existing, error: findErr } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', title)
          .gte('performed_at', `${today}T00:00:00Z`)
          .lte('performed_at', `${today}T23:59:59Z`)
          .limit(1);

        if (findErr) {
          alert('Error finding workout: ' + findErr.message);
          return;
        }

        let workoutId = existing?.[0]?.id;
        if (!workoutId) {
          const { data: created, error: createErr } = await supabase
            .from('workouts')
            .insert({ user_id: user.id, title })
            .select('id')
            .single();
          if (createErr) {
            alert('Error creating workout: ' + createErr.message);
            return;
          }
          workoutId = created.id;
        }

        // Insert exercise using your schema
        const { error: exerciseError } = await supabase
          .from('workout_exercises')
          .insert({
            workout_id: workoutId,
            name: formData.get('exercise'),
            sets_x_reps: formData.get('sets_x_reps'),
            weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
            muscle_group: formData.get('muscle_group')
          });
    
        if (exerciseError) {
          alert('Error adding exercise: ' + exerciseError.message);
        } else {
          alert('Exercise added successfully!');
          closePopup();
        }
      };


    const quickActions = [
        {
            title: "+ Add Exercise",
            type: "newExercise"
        },
        {
            title: "+ Log Calories", 
            type: "logCalories"
        },
        {
            title: "+ Delete Exercise",
            type: "deleteExercise"
        }
    ]

    // Different popup content based on action type
    const renderPopupContent = () => {
        switch(currentAction) {
            case "newExercise":
                return (
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <div className="popup-header">
                            <h2 className="popup-title">Add Exercise</h2>
                            <button className="close-btn" onClick={closePopup}>×</button>
                        </div>
                        <form className="workout-form" onSubmit={handleExerciseSubmit}>
                            <div className="form-group">
                                <label htmlFor="exercise">Exercise</label>
                                <input type="text" id="exercise" name="exercise" placeholder="e.g. Bench Press" required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="sets_x_reps">Sets × Reps</label>
                                    <input type="text" id="sets_x_reps" name="sets_x_reps" placeholder="3x8" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="weight">Weight</label>
                                    <input type="number" id="weight" name="weight" step="0.1" placeholder="145" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="muscle_group">Muscle Group</label>
                                <input type="text" id="muscle_group" name="muscle_group" placeholder="Chest" required />
                            </div>
                            <button type="submit" className="log-workout-btn">Add Exercise</button>
                        </form>
                    </div>
                );
            
                case "logCalories":
                    return (
                      <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <div className="popup-header">
                          <h2 className="popup-title">Log Food Entry</h2>
                          <button className="close-btn" onClick={closePopup}>×</button>
                        </div>
                        <form className="calorie-form" onSubmit={handleCalorieSubmit}>
                          <div className="form-group">
                            <label htmlFor="food">Food / Notes</label>
                            <input type="text" id="food" name="food" placeholder="e.g. Chicken Bowl" required />
                          </div>
                          <div className="form-group">
                            <label htmlFor="calories">Calories</label>
                            <input type="number" id="calories" name="calories" placeholder="650" required />
                          </div>
                          <button type="submit" className="log-workout-btn">Add Entry</button>
                        </form>
                      </div>
                    );
            
            case "deleteExercise":
                return (
                  <div className="popup-content" onClick={e => e.stopPropagation()}>
                    <div className="popup-header">
                      <h2 className="popup-title">Delete Exercise</h2>
                      <button className="close-btn" onClick={closePopup}>×</button>
                    </div>
                    <div className="delete-form">
                      <p>Select an exercise to delete:</p>
                      {todayExercises.length === 0 ? (
                        <p>No exercises found for today.</p>
                      ) : (
                        <div className="exercise-list">
                          {todayExercises.map((exercise) => (
                            <div key={exercise.id} className="exercise-item">
                              <span>{exercise.name} - {exercise.sets_x_reps} - {exercise.weight}lbs - {exercise.muscle_group}</span>
                              <button 
                                type="button" 
                                className="delete-exercise-btn"
                                onClick={() => handleDeleteExercise(exercise.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
            
            default:
                return <p>No content available</p>;
        }
    };

    const handleCalorieSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const foodName = formData.get('food');
        const calories = formData.get('calories');

        if (!foodName || !calories) {
          alert('Please fill in all required fields');
          return;
        }
    
        const { error } = await supabase
          .from('food_entries')
          .insert({
            user_id: user.id,
            food_name: foodName,
            calories: parseInt(calories)
          });
    
        if (error) {
          alert('Error logging food: ' + error.message);
        } else {
          alert('Food logged successfully!');
          closePopup();
        }
      };
    
    const [todayExercises, setTodayExercises] = useState([]);

    const fetchTodayExercises = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().slice(0, 10);
        const title = `Quick Entry ${today}`;
        
        const { data: workout, error: workoutError } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', user.id)
          .eq('title', title)
          .gte('performed_at', `${today}T00:00:00Z`)
          .lte('performed_at', `${today}T23:59:59Z`)
          .limit(1);

        if (workoutError || !workout?.[0]) {
          setTodayExercises([]);
          return;
        }

        const { data: exercises, error: exercisesError } = await supabase
          .from('workout_exercises')
          .select('*')
          .eq('workout_id', workout[0].id)
          .order('id', { ascending: false });

        if (exercisesError) {
          setTodayExercises([]);
        } else {
          setTodayExercises(exercises || []);
        }
      };

    const handleDeleteExercise = async (exerciseId) => {
        const { error: deleteError } = await supabase
          .from('workout_exercises')
          .delete()
          .eq('id', exerciseId);

        if (deleteError) {
          alert('Error deleting exercise: ' + deleteError.message);
        } else {
          alert('Exercise deleted successfully!');
          fetchTodayExercises();
          closePopup();
        }
      };
    
    return (
        <div>
            <div className="quickActions-container">
                <div className="title">Quick Actions</div>
                {quickActions.map((action, index) => (
                    <div key={index} 
                        className="quickActions-item" 
                        onClick={() => handleActionClick(action)}>
                        <div className="action-title">{action.title}</div>
                    </div>
                ))}
            </div>
            {showPopup && (
                    <div className="popup-container" onClick={closePopup}>
                        <div className="popup-content" onClick={e => e.stopPropagation()}>
                            {renderPopupContent()}
                    </div>
                </div>
            )}
        </div>
    );
}