import { Order, useOrderStore } from "@/stores/order-store";

const normalSteps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const errorSteps = ["CANCELLED", "FAILED"] as const;

type NormalStep = typeof normalSteps[number]; // "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED"
type ErrorStep = typeof errorSteps[number]; // "CANCELLED" | "FAILED"

export default function Stepper({ currentStep }: { currentStep: Order["status"] }) {
  const { steps } = useOrderStore();

  const isError = errorSteps.includes(currentStep as ErrorStep);

  // currentIndex in normalSteps or -1 if error status
  const currentIndex = normalSteps.indexOf(currentStep as NormalStep);

  return (
    <div className="flex items-center justify-between w-full max-w-xl mx-auto my-4">
      {steps.map((step) => {
        // Narrow step to OrderStatus
        const s = step as Order["status"];

        const isStepError = errorSteps.includes(s as ErrorStep);
        const isCompleted = !isError && normalSteps.includes(s as NormalStep) && normalSteps.indexOf(s as NormalStep) <= currentIndex;
        const isCurrent = s === currentStep;

        // Circle classes
        let circleClass = "w-8 h-8 rounded-full border-2 flex items-center justify-center ";
        if (isStepError) {
          circleClass += isCurrent
            ? "bg-red-600 border-red-600 text-white"
            : "border-red-400 text-red-400";
        } else if (isCompleted) {
          circleClass += "bg-blue-600 border-blue-600 text-white";
        } else {
          circleClass += "border-gray-300 text-gray-400";
        }

        // Line logic: only between normal steps, and only if completed
        const stepIndex = normalSteps.indexOf(s as NormalStep);
        const showLine = stepIndex !== -1 && stepIndex < normalSteps.length - 1 && stepIndex < currentIndex;

        const lineClass = showLine ? "bg-blue-600" : "bg-gray-300";

        return (
          <div key={step} className="flex-1 flex items-center">
            <div className={circleClass}>{stepIndex !== -1 ? stepIndex + 1 : "!"}</div>
            {step !== steps[steps.length - 1] && <div className={`flex-1 h-1 ${lineClass}`} />}
          </div>
        );
      })}
    </div>
  );
}