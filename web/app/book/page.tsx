"use client"

import { useState } from "react"
import Calendar from "@/components/booking/Calendar"
import TimeSlotSelector from "@/components/booking/TimeSlotSelector"
import BookingForm from "@/components/booking/BookingForm"

export default function BookPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Book a Meeting</h1>
        <p className="text-gray-500 text-sm mt-1">Select a date, time, and confirm your booking.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 items-start">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d)
              setSelectedTime(null)
            }}
          />
        </div>

        {/* Time slots */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <TimeSlotSelector
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-400 shadow-sm flex items-center justify-center min-h-[200px]">
              Select a date to view available times.
            </div>
          )}
        </div>

        {/* Booking form */}
        <div className="lg:col-span-1">
          {selectedDate && selectedTime ? (
            <BookingForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-400 shadow-sm flex items-center justify-center min-h-[200px]">
              Select a date and time to confirm your booking.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
