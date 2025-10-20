'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import './nutrition.css'

export default function Nutrition() {
  const [foodEntries, setFoodEntries] = useState([])
  const [todayCalories, setTodayCalories] = useState(0)
  const [todayProtein, setTodayProtein] = useState(0)
  const [todayCarbs, setTodayCarbs] = useState(0)
  const [todayFat, setTodayFat] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTodayEntries()
  }, [])

  const fetchTodayEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', today)
      .order('logged_at', { ascending: false })

    if (error) {
      console.error('Error fetching entries:', error)
      return
    }

    setFoodEntries(data || [])
    
    // Calculate totals
    const totals = data?.reduce((acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 }) || { calories: 0, protein: 0, carbs: 0, fat: 0 }

    setTodayCalories(totals.calories)
    setTodayProtein(totals.protein)
    setTodayCarbs(totals.carbs)
    setTodayFat(totals.fat)
  }

  const addFoodEntry = async (formData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const entryData = {
      user_id: user.id,
      food_name: formData.food_name,
      calories: parseInt(formData.calories),
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0
    }

    const { error } = await supabase
      .from('food_entries')
      .insert(entryData)

    if (error) {
      alert('Error adding food entry: ' + error.message)
    } else {
      fetchTodayEntries()
      setShowAddForm(false)
    }
  }

  const updateFoodEntry = async (id, formData) => {
    const entryData = {
      food_name: formData.food_name,
      calories: parseInt(formData.calories),
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0
    }

    const { error } = await supabase
      .from('food_entries')
      .update(entryData)
      .eq('id', id)

    if (error) {
      alert('Error updating food entry: ' + error.message)
    } else {
      fetchTodayEntries()
      setEditingEntry(null)
    }
  }

  const deleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    const { error } = await supabase
      .from('food_entries')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting entry: ' + error.message)
    } else {
      fetchTodayEntries()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    if (editingEntry) {
      await updateFoodEntry(editingEntry.id, formData)
    } else {
      await addFoodEntry(formData)
    }
  }

  // Calculate macro percentages for chart
  const totalMacros = todayProtein * 4 + todayCarbs * 4 + todayFat * 9
  const proteinPercent = totalMacros > 0 ? (todayProtein * 4 / totalMacros) * 100 : 0
  const carbsPercent = totalMacros > 0 ? (todayCarbs * 4 / totalMacros) * 100 : 0
  const fatPercent = totalMacros > 0 ? (todayFat * 9 / totalMacros) * 100 : 0

  return (
    <div className="nutrition-container">
      <div className="nutrition-header">
        <h1>Nutrition Tracker</h1>
        <button 
          className="back-btn" 
          onClick={() => window.location.href = '/'}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="nutrition-card">
        <h2>Daily Summary</h2>
        <div className="calorie-display">
          <span className="calorie-number">{todayCalories}</span>
          <span className="calorie-target">/ 2200 kcal</span>
        </div>
        <div className="macro-breakdown">
          <span>Protein {todayProtein}g • Carbs {todayCarbs}g • Fat {todayFat}g</span>
        </div>
        
        {/* Macro Chart */}
        {totalMacros > 0 && (
          <div className="macro-chart">
            <h3>Macro Distribution</h3>
            <div className="chart-container">
              <div className="pie-chart">
                <div 
                  className="chart-segment protein" 
                  style={{ 
                    background: `conic-gradient(#ef4444 0deg ${proteinPercent * 3.6}deg, #3b82f6 ${proteinPercent * 3.6}deg ${(proteinPercent + carbsPercent) * 3.6}deg, #10b981 ${(proteinPercent + carbsPercent) * 3.6}deg 360deg)`
                  }}
                >
                  <div className="chart-center">
                    <span className="chart-label">Macros</span>
                  </div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color protein"></span>
                  <span>Protein {proteinPercent.toFixed(1)}%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color carbs"></span>
                  <span>Carbs {carbsPercent.toFixed(1)}%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color fat"></span>
                  <span>Fat {fatPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="nutrition-card">
        <div className="card-header">
          <h2>Today's Entries</h2>
          <button 
            className="add-entry-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Entry
          </button>
        </div>

        {showAddForm && (
          <form className="add-entry-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input 
                type="text" 
                name="food_name" 
                placeholder="Food name" 
                required 
              />
              <input 
                type="number" 
                name="calories" 
                placeholder="Calories" 
                required 
              />
            </div>
            <div className="form-row">
              <input 
                type="number" 
                name="protein" 
                placeholder="Protein (g)" 
                step="0.1"
              />
              <input 
                type="number" 
                name="carbs" 
                placeholder="Carbs (g)" 
                step="0.1"
              />
              <input 
                type="number" 
                name="fat" 
                placeholder="Fat (g)" 
                step="0.1"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Add Entry</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {editingEntry && (
          <form className="edit-entry-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input 
                type="text" 
                name="food_name" 
                defaultValue={editingEntry.food_name}
                required 
              />
              <input 
                type="number" 
                name="calories" 
                defaultValue={editingEntry.calories}
                required 
              />
            </div>
            <div className="form-row">
              <input 
                type="number" 
                name="protein" 
                defaultValue={editingEntry.protein}
                step="0.1"
              />
              <input 
                type="number" 
                name="carbs" 
                defaultValue={editingEntry.carbs}
                step="0.1"
              />
              <input 
                type="number" 
                name="fat" 
                defaultValue={editingEntry.fat}
                step="0.1"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Update Entry</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setEditingEntry(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {foodEntries.length === 0 ? (
          <p className="no-entries">No entries today</p>
        ) : (
          <div className="entries-list">
            {foodEntries.map((entry) => (
              <div key={entry.id} className="entry-item">
                <div className="entry-info">
                  <span className="food-name">{entry.food_name}</span>
                  <span className="entry-time">
                    {new Date(entry.logged_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="entry-macros">
                    P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                  </span>
                </div>
                <div className="entry-actions">
                  <span className="calories">{entry.calories} kcal</span>
                  <button 
                    className="edit-btn"
                    onClick={() => setEditingEntry(entry)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}