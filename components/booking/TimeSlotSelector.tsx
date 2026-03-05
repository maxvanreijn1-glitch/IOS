"use client"

interface Props {
  selectedTime: string | null
  onSelectTime: (time: string) => void
}

export default function TimeSlotSelector({
  selectedTime,
  onSelectTime,
}: Props) {
  const times = ["09:00", "10:00", "11:00", "14:00", "15:00"]

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-semibold mb-4">Select Time</h2>

      <div className="grid grid-cols-2 gap-2">
        {times.map((time) => (
          <button
            key={time}
            onClick={() => onSelectTime(time)}
            className={`px-4 py-2 rounded border ${
              selectedTime === time
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  )
}