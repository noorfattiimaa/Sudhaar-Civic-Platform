import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Lock, User, Phone, ArrowRight, Loader2, Building2,
  CreditCard, Eye, EyeOff, AlertCircle, Shield
} from "lucide-react";
import AuthLayout from "../../../components/layout/AuthLayout";
import { authService } from "../../../services/auth";

// Types
type UserRole = "citizen" | "ngo";

interface FormData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone: string;
  cnic: string;
  role: UserRole;
  organization_name: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Constants
const PASSWORD_MIN_LENGTH = 8;
const FULL_NAME_MAX_LENGTH = 50;
const CNIC_MAX_LENGTH = 15;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "ngo", label: "NGO" },
];

// Validation utilities
const validatePassword = (password: string): string | null => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one symbol (!@#$%^&* etc.)";
  }
  return null;
};

const formatErrorMessages = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const errorMessages = Object.entries(error)
      .map(([field, messages]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
        const messageList = Array.isArray(messages) ? messages : [messages];
        return `${fieldName}: ${messageList.join(', ')}`;
      })
      .join(' | ');
    return errorMessages || "Registration failed. Please check your inputs.";
  }

  return "An unexpected error occurred. Please try again.";
};

// Sub-components
const FormInput: React.FC<{
  id: string;
  type: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  maxLength?: number;
  helperText?: string;
  error?: string;
}> = ({ id, type, name, value, onChange, placeholder, icon, required, maxLength, helperText, error }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-slate-700">
      {placeholder.split(' ').slice(-2).join(' ')}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>

      <input
        id={id}
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 placeholder:text-slate-400"

        {...(error && { "aria-invalid": "true" })}
        {...(helperText && { "aria-describedby": `${id}-helper` })}
      />
    </div>


    {helperText && (
      <p id={`${id}-helper`} className="text-xs text-slate-500 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" aria-hidden="true" />
        {helperText}
      </p>
    )}
    {error && (
      <p className="text-xs text-red-600 font-medium flex items-center gap-1" role="alert">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {error}
      </p>
    )}
  </div>
);

const PasswordInput: React.FC<{
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  helperText?: string;
  error?: string;
}> = ({ id, value, onChange, placeholder, showPassword, onToggleVisibility, helperText, error }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-slate-700">
      {placeholder.split(' ').slice(-1)[0]}
    </label>
    <div className="relative">
      <Lock
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
        aria-hidden="true"
      />

      <input
        id={id}
        type={showPassword ? "text" : "password"}
        required
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-12 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 placeholder:text-slate-400"

        {...(error && { "aria-invalid": "true" })}
        {...(helperText && { "aria-describedby": `${id}-helper` })}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
    {helperText && (
      <p id={`${id}-helper`} className="text-xs text-slate-500 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" aria-hidden="true" />
        {helperText}
      </p>
    )}
    {error && (
      <p className="text-xs text-red-600 font-medium flex items-center gap-1" role="alert">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {error}
      </p>
    )}
  </div>
);

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded"
    role="alert"
    aria-live="assertive"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="font-semibold">Registration Failed</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
    </div>
  </div>
);

// Main component
export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    phone: "",
    cnic: "",
    role: "citizen",
    organization_name: "",
  });

  // Memoized computed values
  const isPasswordMatch = useMemo(
    () => formData.password2.length > 0 && formData.password === formData.password2,
    [formData.password, formData.password2]
  );

  const fullName = useMemo(
    () => `${formData.first_name} ${formData.last_name}`.trim(),
    [formData.first_name, formData.last_name]
  );

  // Handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Numeric enforcement for cnic and phone
    if ((name === 'cnic' || name === 'phone') && value !== '') {
      if (!/^\d+$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const names = value.split(" ");
    setFormData(prev => ({
      ...prev,
      first_name: names[0] || "",
      last_name: names.slice(1).join(" ") || "",
    }));
    setError(null);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const togglePassword2Visibility = useCallback(() => {
    setShowPassword2(prev => !prev);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (fullName.length > FULL_NAME_MAX_LENGTH) {
      setError(`Full name cannot exceed ${FULL_NAME_MAX_LENGTH} characters`);
      setIsLoading(false);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.cnic.length !== 13) {
      setError("CNIC must be exactly 13 digits");
      setIsLoading(false);
      return;
    }

    if (formData.phone.length !== 11) {
      setError("Phone number must be exactly 11 digits");
      setIsLoading(false);
      return;
    }

    try {
      // Generate username from email
      const username = formData.email.split('@')[0] || `user_${Date.now()}`;

      const registerData = {
        ...formData,
        username,
      };

      const response = await authService.register(registerData);

      if (response.error) {
        setError(formatErrorMessages(response.error));
        setIsLoading(false);
        return;
      }

      alert("Registration successful! Please log in with your credentials.");
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.response?.data) {
        setError(formatErrorMessages(err.response.data));
      } else if (err.request) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join the movement for a better city today."
    >
      <form onSubmit={handleRegister} className="space-y-5 max-w-md w-full" noValidate>

        {/* Full Name */}
        <FormInput
          id="fullName"
          type="text"
          value={fullName}
          onChange={handleNameChange}
          placeholder="Enter your Full Name"
          icon={<User className="h-5 w-5" />}
          required
        />

        {/* Email */}
        <FormInput
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email"
          icon={<Mail className="h-5 w-5" />}
          required
        />

        {/* CNIC */}
        <FormInput
          id="cnic"
          type="text"
          name="cnic"
          value={formData.cnic}
          onChange={handleChange}
          placeholder="CNIC number (13 digits)"
          icon={<CreditCard className="h-5 w-5" />}
          required
          maxLength={13}
          helperText="Format: 13 digits (numeric only)"
        />

        {/* Phone & Role */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="11 digits (e.g. 03001234567)"
                maxLength={11}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">
              I am a...
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" aria-hidden="true" />
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 appearance-none cursor-pointer"
              >
                {ROLE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Password */}
        <PasswordInput
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a strong Password"
          showPassword={showPassword}
          onToggleVisibility={togglePasswordVisibility}
          helperText="8+ characters with number and symbol (!@#$%^&*)"
        />

        {/* Confirm Password */}
        <PasswordInput
          id="password2"
          value={formData.password2}
          onChange={handleChange}
          placeholder="Confirm your password"
          showPassword={showPassword2}
          onToggleVisibility={togglePassword2Visibility}
          error={formData.password2.length > 0 && !isPasswordMatch ? "Passwords do not match" : undefined}
        />

        {/* Error Message */}
        {error && <ErrorAlert message={error} />}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

          {...(isLoading && { "aria-busy": "true" })}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" aria-hidden="true" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </button>


        {/* Footer Link */}
        <div className="pt-4 text-center">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-full border border-slate-200">
            <Shield className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
            <span>Secure Registration</span>
          </div>
        </div>

      </form>
    </AuthLayout>
  );
}