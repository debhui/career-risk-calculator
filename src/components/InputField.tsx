// Helper component for styled input field with icon and error handling
export const InputField = ({
  icon: Icon,
  id,
  label,
  placeholder,
  register,
  errors,
  type = "text",
  value,
}: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      {/* Icon inside the input field */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-teal-600 dark:text-indigo-400" />
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        // Register field with React Hook Form
        {...register(id)}
        defaultValue={value || ""}
        className={`block w-full rounded-lg border-2 bg-gray-300 dark:bg-gray-700 py-3 pl-12 pr-3 text-gray-800 dark:text-white placeholder-gray-400 shadow-inner sm:text-sm transition-all duration-200
                    ${
                      errors[id]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-teal-600 dark:border-gray-600 focus:border-teal-500 focus:dark:border-indigo-500 focus:ring-teal-500 focus:dark:ring-indigo-500"
                    }`}
      />
    </div>
    {/* Display validation error */}
    {errors[id] && <p className="mt-1 text-xs text-red-400">{errors[id].message?.toString()}</p>}
  </div>
);
