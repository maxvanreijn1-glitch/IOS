"use client"

interface Props {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

export default function Calendar({ selectedDate, onSelectDate }: Props) {
  const today = new Date()

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-semibold mb-4">Select Date</h2>
      <button
        onClick={() => onSelectDate(today)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Today
      </button>

      {selectedDate && (
        <p className="mt-4 text-sm text-gray-600">
          Selected: {selectedDate.toDateString()}
        </p>
      )}
    </div>
  )
}