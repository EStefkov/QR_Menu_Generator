import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { registerAccount } from "../api/account";
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineHome, HiInformationCircle } from "react-icons/hi";

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, redirectUrl, clearRedirectUrl } = useAuth();
  const [formData, setFormData] = useState({
    accountName: "",
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationFeedback, setValidationFeedback] = useState({
    accountName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Real-time validation feedback
    if (name === "accountName") {
      if (value.length === 0) {
        // Clear validation feedback when field is empty
        setValidationFeedback(prev => ({ ...prev, accountName: "" }));
      } else if (value.length < 3) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          accountName: t('register.validation.usernameLength') || "Username must be at least 3 characters" 
        }));
      } else if (value.length > 30) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          accountName: t('register.validation.usernameMaxLength') || "Username cannot exceed 30 characters" 
        }));
      } else if (value.includes(" ")) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          accountName: t('register.validation.usernameSpaces') || "Username cannot contain spaces" 
        }));
      } else {
        setValidationFeedback(prev => ({ ...prev, accountName: "" }));
      }
    }
    
    if (name === "firstName" || name === "lastName") {
      if (value.length === 0) {
        setValidationFeedback(prev => ({ ...prev, [name]: "" }));
      } else if (value.length > 50) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          [name]: name === "firstName" 
            ? (t('register.validation.firstNameMaxLength') || "First name cannot exceed 50 characters")
            : (t('register.validation.lastNameMaxLength') || "Last name cannot exceed 50 characters")
        }));
      } else {
        setValidationFeedback(prev => ({ ...prev, [name]: "" }));
      }
    }
    
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value) && value.length > 0) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          email: t('register.validation.emailInvalid') || "Please enter a valid email address" 
        }));
      } else if (value.length > 100) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          email: t('register.validation.emailMaxLength') || "Email cannot exceed 100 characters" 
        }));
      } else {
        setValidationFeedback(prev => ({ ...prev, email: "" }));
      }
    }
    
    if (name === "number" && value.length > 0) {
      // Only allow numbers and + for country code
      const phoneRegex = /^[0-9+]+$/;
      if (!phoneRegex.test(value)) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          number: t('register.validation.phoneNumberFormat') || "Phone number can only contain numbers and + symbol" 
        }));
      } else if (value.length > 20) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          number: t('register.validation.phoneNumberMaxLength') || "Phone number cannot exceed 20 characters" 
        }));
      } else {
        setValidationFeedback(prev => ({ ...prev, number: "" }));
      }
    }
    
    if (name === "password") {
      if (value.length === 0) {
        // Clear validation feedback when field is empty
        setValidationFeedback(prev => ({ ...prev, password: "" }));
      } else if (value.length < 6) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          password: t('register.validation.passwordMinLength') || "Password must be at least 6 characters long" 
        }));
      } else if (value.length > 50) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          password: t('register.validation.passwordMaxLength') || "Password cannot exceed 50 characters" 
        }));
      } else if (!/[A-Z]/.test(value)) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          password: t('register.validation.passwordUppercase') || "Password should contain at least one uppercase letter" 
        }));
      } else if (!/[0-9]/.test(value)) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          password: t('register.validation.passwordNumber') || "Password should contain at least one number" 
        }));
      } else {
        setValidationFeedback(prev => ({ ...prev, password: "" }));
      }
      
      // Check confirm password match
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          confirmPassword: t('register.validation.passwordsDoNotMatch') || "Passwords do not match" 
        }));
      } else if (formData.confirmPassword) {
        setValidationFeedback(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
    
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setValidationFeedback(prev => ({ 
          ...prev, 
          confirmPassword: t('register.validation.passwordsDoNotMatch') || "Passwords do not match" 
        }));
      } else {
        setValidationFeedback(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Enhanced validation
    if (formData.accountName.length === 0) {
      setError(t('register.validation.usernameRequired') || "Username is required");
      return;
    }
    
    if (formData.accountName.length < 3) {
      setError(t('register.validation.usernameLength') || "Username must be at least 3 characters long");
      return;
    }
    
    if (formData.accountName.length > 30) {
      setError(t('register.validation.usernameMaxLength') || "Username cannot exceed 30 characters");
      return;
    }
    
    if (formData.firstName.length > 50) {
      setError(t('register.validation.firstNameMaxLength') || "First name cannot exceed 50 characters");
      return;
    }
    
    if (formData.lastName.length > 50) {
      setError(t('register.validation.lastNameMaxLength') || "Last name cannot exceed 50 characters");
      return;
    }
    
    if (formData.email.length > 100) {
      setError(t('register.validation.emailMaxLength') || "Email cannot exceed 100 characters");
      return;
    }
    
    if (formData.number) {
      const phoneRegex = /^[0-9+]+$/;
      if (!phoneRegex.test(formData.number)) {
        setError(t('register.validation.phoneNumberFormat') || "Phone number can only contain numbers and + symbol");
        return;
      }
      
      if (formData.number.length > 20) {
        setError(t('register.validation.phoneNumberMaxLength') || "Phone number cannot exceed 20 characters");
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.validation.passwordsDoNotMatch') || "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError(t('register.validation.passwordMinLength') || "Password must be at least 6 characters long");
      return;
    }
    
    if (formData.password.length > 50) {
      setError(t('register.validation.passwordMaxLength') || "Password cannot exceed 50 characters");
      return;
    }
    
    if (!/[A-Z]/.test(formData.password)) {
      setError(t('register.validation.passwordUppercase') || "Password must contain at least one uppercase letter");
      return;
    }
    
    if (!/[0-9]/.test(formData.password)) {
      setError(t('register.validation.passwordNumber') || "Password must contain at least one number");
      return;
    }

    // Prepare registration data
    const registrationData = {
      accountName: formData.accountName.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      mailAddress: formData.email.trim().toLowerCase(),
      number: formData.number ? formData.number.trim() : null,
      password: formData.password,
      accountType: "ROLE_USER"
    };

    setIsLoading(true);

    try {
      const response = await registerAccount(registrationData);
      if (response === "Account successfully created") {
        // If registration needs login afterward, navigate to login
        navigate("/login");
      } else {
        // If response contains token, user is automatically logged in
        const savedRedirectUrl = login(response);
        
        // Navigate to the saved redirect URL or home page
        if (savedRedirectUrl) {
          console.log(`Redirecting to saved URL after registration: ${savedRedirectUrl}`);
          clearRedirectUrl();
          navigate(savedRedirectUrl);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      // Clear sensitive data on error
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            {t('register.createAccount') || "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('register.haveAccount') || "Already have an account?"}{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
              {t('register.signIn') || "Sign in"}
            </Link>
          </p>
          {redirectUrl && (
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              {t('register.redirectMessage') || "You'll be redirected to your previous page after registration"}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="accountName"
                name="accountName"
                type="text"
                required
                maxLength={30}
                className={`appearance-none block w-full pl-10 pr-3 py-3 border ${validationFeedback.accountName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder={t('register.username') || "Username"}
                value={formData.accountName}
                onChange={handleChange}
              />
              {validationFeedback.accountName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <HiInformationCircle className="mr-1 h-4 w-4" />
                  {validationFeedback.accountName}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                maxLength={50}
                className={`appearance-none block w-full pl-10 pr-3 py-3 border ${validationFeedback.firstName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder={t('register.firstName') || "First Name"}
                value={formData.firstName}
                onChange={handleChange}
              />
              {validationFeedback.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <HiInformationCircle className="mr-1 h-4 w-4" />
                  {validationFeedback.firstName}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                maxLength={50}
                className={`appearance-none block w-full pl-10 pr-3 py-3 border ${validationFeedback.lastName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder={t('register.lastName') || "Last Name"}
                value={formData.lastName}
                onChange={handleChange}
              />
              {validationFeedback.lastName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <HiInformationCircle className="mr-1 h-4 w-4" />
                  {validationFeedback.lastName}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineMail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={100}
                className={`appearance-none block w-full pl-10 pr-3 py-3 border ${validationFeedback.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder={t('register.email') || "Email address"}
                value={formData.email}
                onChange={handleChange}
              />
              {validationFeedback.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <HiInformationCircle className="mr-1 h-4 w-4" />
                  {validationFeedback.email}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="number"
                name="number"
                type="tel"
                maxLength={20}
                pattern="[0-9+]+"
                className={`appearance-none block w-full pl-10 pr-3 py-3 border ${validationFeedback.number ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder={t('register.phoneNumber') || "Phone Number (numbers and + only)"}
                value={formData.number}
                onChange={handleChange}
              />
              {validationFeedback.number && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <HiInformationCircle className="mr-1 h-4 w-4" />
                  {validationFeedback.number}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                maxLength={50}
                className={`appearance-none block w-full pl-10 pr-3 py-3 border ${validationFeedback.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder={t('register.password') || "Password (6-50 characters)"}
                value={formData.password}
                onChange={handleChange}
              />
              {validationFeedback.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <HiInformationCircle className="mr-1 h-4 w-4" />
                  {validationFeedback.password}
                </p>
              )}
              {!validationFeedback.password && formData.password && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  Password meets requirements
                </p>
              )}
              
              {/* Password requirements checklist - only show after user starts typing */}
              {formData.password.length > 0 && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <p className="font-medium mb-1">{t('register.validation.passwordRequirements') || "Password must:"}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className={formData.password.length >= 6 ? "text-green-600 dark:text-green-400" : ""}>
                      {t('register.validation.passwordMinLength') || "Be at least 6 characters long"}
                    </li>
                    <li className={formData.password.length <= 50 ? "text-green-600 dark:text-green-400" : ""}>
                      {t('register.validation.passwordMaxLength') || "Not exceed 50 characters"}
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : ""}>
                      {t('register.validation.passwordUppercase') || "Contain at least one uppercase letter"}
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? "text-green-600 dark:text-green-400" : ""}>
                      {t('register.validation.passwordNumber') || "Contain at least one number"}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                maxLength={50}
                className={`appearance-none block w-full pl-10 pr-3 py-3 border ${validationFeedback.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                placeholder={t('register.confirmPassword') || "Confirm Password"}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {validationFeedback.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <HiInformationCircle className="mr-1 h-4 w-4" />
                  {validationFeedback.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('register.creatingAccount') || "Creating account..."}
                </span>
              ) : (
                t('register.createButton') || "Create Account"
              )}
            </button>

            <Link to="/" className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
              <span className="flex items-center">
                <HiOutlineHome className="mr-2 h-5 w-5" />
                {t('register.backToHome') || "Back to Home"}
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;