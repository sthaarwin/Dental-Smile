
import { CheckCircle2 } from "lucide-react";

interface TimeSlotSelectorProps {
  availableSlots: string[];
  selectedSlot: string | null;
  setSelectedSlot: (slot: string | null) => void;
}

const TimeSlotSelector = ({
  availableSlots,
  selectedSlot,
  setSelectedSlot,
}: TimeSlotSelectorProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Available Time Slots</h3>
      <div className="grid grid-cols-3 gap-2">
        {availableSlots.map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot === selectedSlot ? null : slot)}
            className={`flex items-center justify-center p-2 rounded-md text-sm font-medium transition-colors ${
              slot === selectedSlot
                ? "bg-dentist-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {slot}
            {slot === selectedSlot && <CheckCircle2 className="ml-1 h-3 w-3" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
