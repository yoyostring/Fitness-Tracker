'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import './calories.css'

export default function Calories() {
  const [todayCalories, setTodayCalories] = useState(0)
  const [todayProtein, setTodayProtein] = useState(0)
  const [todayCarbs, setTodayCarbs] = useState(0)
  const [todayFat, setTodayFat] = useState(0)
  const [weeklyCalories, setWeeklyCalories] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchTodayEntries()
    fetchWeeklyEntries()
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

    // Calculate today's totals
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

  const fetchWeeklyEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)
    
    const { data, error } = await supabase
      .from('food_entries')
      .select('calories')
      .eq('user_id', user.id)
      .gte('logged_at', startOfWeek.toISOString())

    if (error) {
      console.error('Error fetching weekly entries:', error)
      return
    }

    const weeklyTotal = data?.reduce((acc, entry) => acc + (entry.calories || 0), 0) || 0
    setWeeklyCalories(weeklyTotal)
  }

  // Calculate progress percentages
  const dailyGoal = 2200
  const weeklyGoal = 15400
  const proteinGoal = 150
  const carbsGoal = 300
  const fatGoal = 80

  const dailyProgress = Math.min((todayCalories / dailyGoal) * 100, 100)
  const weeklyProgress = Math.min((weeklyCalories / weeklyGoal) * 100, 100)
  const proteinProgress = Math.min((todayProtein / proteinGoal) * 100, 100)
  const carbsProgress = Math.min((todayCarbs / carbsGoal) * 100, 100)
  const fatProgress = Math.min((todayFat / fatGoal) * 100, 100)

  return (
    <div className="calories-container">
      <div className="calories-card">
        <h2 className="calories-title">Today's Calories</h2>
        
        <div className="calorie-display">
          <span className="calorie-number">{todayCalories}</span>
          <span className="calorie-target">/ {dailyGoal} kcal</span>
        </div>

        <div className="macro-breakdown">
          <div className="macro-item">
            <div className="macro-label">
              <span>Protein</span>
              <span className="macro-amount">{todayProtein}g</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${proteinProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="macro-item">
            <div className="macro-label">
              <span>Carbs</span>
              <span className="macro-amount">{todayCarbs}g</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${carbsProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="macro-item">
            <div className="macro-label">
              <span>Fat</span>
              <span className="macro-amount">{todayFat}g</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${fatProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="weekly-summary">
          <span className="weekly-label">This Week:</span>
          <span className="weekly-amount">{weeklyCalories} / {weeklyGoal} kcal</span>
        </div>
      </div>
    </div>
  )
}
