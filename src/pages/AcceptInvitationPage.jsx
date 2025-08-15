// src/pages/AcceptInvitationPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFormWithValidation } from '../hooks/useFormWithValidation';
import { setPasswordSchema } from '../utils/schemas';
import { FaDotCircle, FaEye, FaEyeSlash } from "react-icons/fa";

const AcceptInvitationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formError, setFormError] = useState('');

    const { completeInvitation, isLoading, error } = useAuthStore();
    const { register, handleSubmit, formState: { errors } } = useFormWithValidation(setPasswordSchema);

    useEffect(() => {
        if (!token) {
            setFormError('No invitation token found. Please use the link from your email.');
        }
    }, [token]);

    useEffect(() => {
        if (error) {
            setFormError(error);
        }
    }, [error]);

    const onSubmit = async (data) => {
        if (!token) return;
        setFormError('');
        const success = await completeInvitation({ token, password: data.password });
        if (success) {
            navigate('/dashboard', { replace: true });
        }
    };

    return (
        <div className="flex relative h-screen w-full justify-between">
            <div className="w-full flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                    <div className="flex items-center mb-8">
                        <div className="bg-primary p-2 rounded-lg">
                            <FaDotCircle className="text-white text-2xl" />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-xl font-medium">Set Your Password</h1>
                            <p className="text-gray-500 text-sm">Welcome! Create a password to activate your account.</p>
                        </div>
                    </div>

                    {formError && (
                        <div className="bg-red-100 text-red-500 p-3 rounded mb-4 text-center">
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full border border-gray-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                    {...register('password')}
                                    disabled={isLoading || !token}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full border border-gray-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                    {...register('confirmPassword')}
                                    disabled={isLoading || !token}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !token}
                            className="mx-auto cursor-pointer w-1/2 bg-primary text-white py-2.5 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:bg-gray-400"
                        >
                            {isLoading ? (
                                <span className="flex justify-center items-center">
                                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Activating Account...
                                </span>
                            ) : (
                                'Activate Account'
                            )}
                        </button>
                    </form>
                </div>
            </div>
            <div className="w-[40%] shrink-0 p-2 flex">
                <img src="/assets/loginBg.png" alt="Background" className="w-full" />
            </div>
        </div>
    );
};

export default AcceptInvitationPage;