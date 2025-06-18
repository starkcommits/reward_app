import React, { useState } from 'react'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function DateTimePicker({
  onChange,
  value: propValue,
  placeholder = 'Select date and time...',
  disabled,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(propValue || null)
  const [viewDate, setViewDate] = useState(value || new Date())
  const today = new Date()

  const handleChange = (newValue) => {
    setValue(newValue)
    onChange?.(newValue)
  }

  const handleDateClick = (day, isCurrentMonth) => {
    const newDate = new Date(viewDate)

    if (!isCurrentMonth) {
      if (day > 20) {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
    }

    newDate.setDate(day)

    if (value) {
      newDate.setHours(value.getHours())
      newDate.setMinutes(value.getMinutes())
      newDate.setSeconds(value.getSeconds())
    } else {
      const now = new Date()
      newDate.setHours(now.getHours())
      newDate.setMinutes(now.getMinutes())
      newDate.setSeconds(now.getSeconds())
    }

    handleChange(newDate)
  }

  const handleTimeChange = (type, newValue) => {
    if (!value) return
    const newDate = new Date(value)

    switch (type) {
      case 'hours':
        newDate.setHours(newValue)
        break
      case 'minutes':
        newDate.setMinutes(newValue)
        break
      case 'seconds':
        newDate.setSeconds(newValue)
        break
    }

    handleChange(newDate)
  }

  const handleNow = () => {
    handleChange(new Date())
  }

  const handleClear = () => {
    handleChange(null)
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const getPreviousMonthDays = (year, month) => {
    const firstDay = getFirstDayOfMonth(year, month)
    const prevMonthDays = []

    if (firstDay > 0) {
      const daysInPrevMonth = getDaysInMonth(year, month - 1)
      for (let i = 0; i < firstDay; i++) {
        prevMonthDays.unshift(daysInPrevMonth - i)
      }
    }

    return prevMonthDays
  }

  const getNextMonthDays = (year, month, daysInCurrentMonth, firstDay) => {
    const totalCells = 42
    const filledCells = firstDay + daysInCurrentMonth
    const remainingCells = totalCells - filledCells
    return Array.from({ length: remainingCells }, (_, i) => i + 1)
  }

  const formatTimeDisplay = (value) => {
    return value.toString().padStart(2, '0')
  }

  const formatDisplayValue = () => {
    if (!value) return ''
    return value.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    })
  }

  const renderCalendar = () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const prevMonthDays = getPreviousMonthDays(year, month)
    const currentMonthDays = Array.from(
      { length: daysInMonth },
      (_, i) => i + 1
    )
    const nextMonthDays = getNextMonthDays(year, month, daysInMonth, firstDay)

    const isToday = (day) => {
      return (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day
      )
    }

    const isSelected = (day) => {
      return (
        value &&
        value.getFullYear() === year &&
        value.getMonth() === month &&
        value.getDate() === day
      )
    }

    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <button
              className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              onClick={() =>
                setViewDate((prev) => {
                  const newDate = new Date(prev)
                  newDate.setMonth(prev.getMonth() - 1)
                  return newDate
                })
              }
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-medium mx-2">
              {MONTHS[viewDate.getMonth()]}, {viewDate.getFullYear()}
            </h2>
            <button
              className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              onClick={() =>
                setViewDate((prev) => {
                  const newDate = new Date(prev)
                  newDate.setMonth(prev.getMonth() + 1)
                  return newDate
                })
              }
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <button
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm font-medium touch-manipulation"
            onClick={handleNow}
          >
            Now
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mt-4">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-700 h-8 flex items-center justify-center text-sm"
            >
              {day}
            </div>
          ))}

          {prevMonthDays.map((day) => (
            <div
              key={`prev-${day}`}
              className="text-center text-gray-400 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors touch-manipulation"
              onClick={() => handleDateClick(day, false)}
            >
              {day}
            </div>
          ))}

          {currentMonthDays.map((day) => (
            <div
              key={`current-${day}`}
              className={`text-center h-10 flex items-center justify-center cursor-pointer rounded-md transition-all touch-manipulation
                ${
                  isSelected(day)
                    ? 'bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800'
                    : 'hover:bg-gray-100 active:bg-gray-200'
                }
                ${
                  isToday(day) && !isSelected(day)
                    ? 'border border-blue-500 font-medium'
                    : ''
                }
              `}
              onClick={() => handleDateClick(day, true)}
            >
              {day}
            </div>
          ))}

          {nextMonthDays.map((day) => (
            <div
              key={`next-${day}`}
              className="text-center text-gray-400 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors touch-manipulation"
              onClick={() => handleDateClick(day, false)}
            >
              {day}
            </div>
          ))}
        </div>
      </>
    )
  }

  const renderTimePicker = () => {
    if (!value) return null

    return (
      <div className="w-full mt-4">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-gray-500 mr-2" />
          <div className="text-xl font-medium tracking-wider">
            {formatTimeDisplay(value.getHours())} :{' '}
            {formatTimeDisplay(value.getMinutes())} :{' '}
            {formatTimeDisplay(value.getSeconds())}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Hours</span>
              <span>{formatTimeDisplay(value.getHours())}</span>
            </div>
            <input
              type="range"
              min={0}
              max={23}
              value={value.getHours()}
              onChange={(e) =>
                handleTimeChange('hours', parseInt(e.target.value))
              }
              className="w-full touch-manipulation"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Minutes</span>
              <span>{formatTimeDisplay(value.getMinutes())}</span>
            </div>
            <input
              type="range"
              min={0}
              max={59}
              value={value.getMinutes()}
              onChange={(e) =>
                handleTimeChange('minutes', parseInt(e.target.value))
              }
              className="w-full touch-manipulation"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Seconds</span>
              <span>{formatTimeDisplay(value.getSeconds())}</span>
            </div>
            <input
              type="range"
              min={0}
              max={59}
              value={value.getSeconds()}
              onChange={(e) =>
                handleTimeChange('seconds', parseInt(e.target.value))
              }
              className="w-full touch-manipulation"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <button
        className="flex items-center justify-end w-full disabled:cursor-not-allowed border-gray-300 rounded-lg bg-white transition-all duration-200 cursor-pointer touch-manipulation"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!disabled}
      >
        <Calendar className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
        {/* <input
          type="text"
          className="w-full outline-none placeholder-gray-400 cursor-pointer text-base sm:text-sm"
          placeholder={placeholder}
          value={formatDisplayValue()}
          readOnly
        /> */}
      </button>

      {isOpen && (
        <div className="mb-16 fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-[90%] sm:w-[50%] bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            {renderCalendar()}
            {renderTimePicker()}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg sm:rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200 text-base sm:text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
              >
                Clear
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg sm:rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 text-base sm:text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// function App() {
//   const [selectedDateTime, setSelectedDateTime] = useState(null);

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
//         <div className="space-y-2">
//           <h1 className="text-2xl font-semibold text-gray-800">Date & Time Picker</h1>
//           <p className="text-gray-600">Select a date and time for your appointment</p>
//         </div>

//         <DateTimePicker
//           value={selectedDateTime}
//           onChange={setSelectedDateTime}
//           placeholder="Select date and time..."
//         />

//         {selectedDateTime && (
//           <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
//             <p className="text-sm text-gray-700 mb-1">Selected Date & Time:</p>
//             <p className="font-medium text-blue-800">
//               {selectedDateTime.toLocaleString('en-US', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//                 hour: 'numeric',
//                 minute: 'numeric',
//                 second: 'numeric',
//                 hour12: true
//               })}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;
