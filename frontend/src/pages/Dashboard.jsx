import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/')
      setStats(res.data)
    } catch {
      navigate('/login')
    }
  }

  const Bar = ({ label, value, total, color }) => {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span className="text-gray-500">{value} tasks ({percent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${color} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Manager</h1>
        <div className="flex gap-4">
          <Link to="/projects" className="hover:underline">Projects</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {stats && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-gray-500 mt-1">Total Tasks</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-3xl font-bold text-gray-600">{stats.todo}</p>
                <p className="text-gray-500 mt-1">To Do</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.in_progress}</p>
                <p className="text-gray-500 mt-1">In Progress</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-3xl font-bold text-green-600">{stats.done}</p>
                <p className="text-gray-500 mt-1">Done</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="font-bold text-lg mb-4">Task Progress</h3>
              <Bar label="To Do" value={stats.todo} total={stats.total} color="bg-gray-400" />
              <Bar label="In Progress" value={stats.in_progress} total={stats.total} color="bg-yellow-400" />
              <Bar label="Done" value={stats.done} total={stats.total} color="bg-green-500" />
              {stats.overdue > 0 && (
                <Bar label="Overdue" value={stats.overdue} total={stats.total} color="bg-red-500" />
              )}
            </div>

            {stats.overdue > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-red-700 mb-3">
                  Overdue Tasks ({stats.overdue})
                </h3>
                <div className="space-y-2">
                  {stats.overdue_tasks.map(task => (
                    <div key={task.id} className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-red-500">Due: {task.due_date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.overdue === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium">✅ No overdue tasks — great work!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

