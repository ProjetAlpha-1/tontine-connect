import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Phone, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

// Validation schemas
const phoneSchema = yup.object({
  phone: yup
    .string()
    .required('Le numéro de téléphone est requis')
    .matches(/^\+241[0-9]{8}$/, 'Format: +241XXXXXXXX (Gabon)'),
});

const otpSchema = yup.object({
  phone: yup.string().required(),
  otp: yup
    .string()
    .required('Le code OTP est requis')
    .matches(/^\d{6}$/, 'Le code doit contenir 6 chiffres'),
  name: yup.string().when('isNewUser', {
    is: true,
    then: (schema) => schema.required('Le nom est requis').min(2, 'Minimum 2 caractères'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Formulaire téléphone
  const phoneForm = useForm({
    resolver: yupResolver(phoneSchema),
    defaultValues: { phone: '+241' },
  });

  // Formulaire OTP
  const otpForm = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: { phone: '', otp: '', name: '' },
  });

  // Envoyer OTP
  const handleSendOtp = async (data: { phone: string }) => {
    setIsLoading(true);
    try {
      const response = await authApi.sendOtp({ phone: data.phone });
      setPhoneNumber(data.phone);
      setStep('otp');
      
      // Afficher le code en développement
      if (response.otp) {
        setOtpCode(response.otp);
        toast.success(`Code OTP: ${response.otp}`, { duration: 5000 });
      } else {
        toast.success(response.message);
      }
      
      otpForm.setValue('phone', data.phone);
    } catch (error) {
      console.error('Erreur envoi OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier OTP
  const handleVerifyOtp = async (data: { phone: string; otp: string; name?: string }) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({
        phone: data.phone,
        otp: data.otp,
        name: data.name,
      });

      // Sauvegarder l'authentification
      setAuth(response.user, response.tokens.accessToken, response.tokens.refreshToken);
      
      toast.success(`Bienvenue ${response.user.name} ! 🎉`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-app">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="header">
          <div className="flex items-center">
            <button
              onClick={() => step === 'otp' ? setStep('phone') : navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="ml-4 text-xl font-bold text-gray-900">
              {step === 'phone' ? 'Connexion' : 'Vérification'}
            </h1>
          </div>
        </div>

        <div className="main-content flex-1 flex flex-col justify-center">
          {step === 'phone' ? (
            /* Étape 1: Téléphone */
            <div className="fade-in">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Entrez votre numéro
                </h2>
                <p className="text-gray-600">
                  Nous vous enverrons un code de vérification
                </p>
              </div>

              <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    {...phoneForm.register('phone')}
                    type="tel"
                    placeholder="+241062345678"
                    className={`input-field ${phoneForm.formState.errors.phone ? 'input-error' : ''}`}
                    disabled={isLoading}
                  />
                  {phoneForm.formState.errors.phone && (
                    <p className="mt-2 text-sm text-red-600">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? 'Envoi en cours...' : 'Recevoir le code'}
                </button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Sécurité TontineConnect
                    </p>
                    <p className="text-sm text-blue-700">
                      Vos données sont protégées et votre numéro ne sera jamais partagé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Étape 2: OTP */
            <div className="slide-up">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-success-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Code de vérification
                </h2>
                <p className="text-gray-600">
                  Code envoyé au <span className="font-medium">{phoneNumber}</span>
                </p>
                {otpCode && (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-800">
                      <strong>Code de test:</strong> {otpCode}
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code à 6 chiffres
                  </label>
                  <input
                    {...otpForm.register('otp')}
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className={`input-field text-center text-2xl tracking-widest ${
                      otpForm.formState.errors.otp ? 'input-error' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="mt-2 text-sm text-red-600">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet (nouveaux utilisateurs)
                  </label>
                  <input
                    {...otpForm.register('name')}
                    type="text"
                    placeholder="Jean Nguema"
                    className={`input-field ${otpForm.formState.errors.name ? 'input-error' : ''}`}
                    disabled={isLoading}
                  />
                  {otpForm.formState.errors.name && (
                    <p className="mt-2 text-sm text-red-600">
                      {otpForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-success w-full"
                >
                  {isLoading ? 'Vérification...' : 'Se connecter'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtp({ phone: phoneNumber })}
                  disabled={isLoading}
                  className="w-full text-center text-primary-600 hover:text-primary-700 font-medium py-3"
                >
                  Renvoyer le code
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
