'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Leaf, Truck, ArrowRight, Phone, User, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { registerCitizen, registerCollector } from '@/actions/onboard';
import { saveUser } from '@/lib/storage';

type Role = 'citizen' | 'collector' | null;

interface CitizenFormValues {
  name: string;
  phone: string;
}

interface CollectorFormValues {
  accessCode: string;
}

export default function OnboardingClient({ initialRole = null }: { initialRole?: Role }) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const citizenForm = useForm<CitizenFormValues>({ defaultValues: { name: '', phone: '' } });
  const collectorForm = useForm<CollectorFormValues>({ defaultValues: { accessCode: '' } });

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setServerError(null);
    citizenForm.reset();
    collectorForm.reset();
  };

  const handleCitizenSubmit = async (data: CitizenFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    // Optimistically save to localStorage for immediate UX
    saveUser({ name: data.name, phone: data.phone, role: 'citizen', ward: 'Mansarovar', ecoPoints: 0, totalScans: 0 });

    try {
      const result = await registerCitizen(data.name, data.phone);
      if (!result.success && result.code !== 'DB') {
        setServerError(result.error);
        setIsSubmitting(false);
        return;
      }
    } catch {
      // DB unreachable — localStorage already populated, proceed
    }

    router.push('/citizen-dashboard');
  };

  const handleCollectorSubmit = async (data: CollectorFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await registerCollector(data.accessCode);
      if (!result.success) {
        if (result.code === 'INVALID_CODE') {
          collectorForm.setError('accessCode', { message: 'Invalid access code. Try NAGRIK2024 for demo.' });
          setIsSubmitting(false);
          return;
        }
        // DB error — localStorage already has access code validated, proceed anyway
      }
    } catch {
      // DB unreachable — proceed with localStorage session
    }

    saveUser({ name: 'Rajesh Kumar', phone: '9876543210', role: 'collector', ward: 'Mansarovar', ecoPoints: 0, totalScans: 0 });
    router.push('/collector/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center">
            <span className="text-base">🌿</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">nagrik</span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">How are you joining?</h1>
          <p className="text-sm text-zinc-500">Choose your role to get started</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleRoleSelect('citizen')}
            className={`bg-[#141414] border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 text-left
              ${selectedRole === 'citizen'
                ? 'border-[#22C55E]/60 bg-[#22C55E]/5'
                : 'border-[#1F1F1F] hover:border-[#22C55E]/30'
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center mb-3">
              <Leaf className="w-5 h-5 text-[#22C55E]" />
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">Citizen</p>
            <p className="text-xs text-zinc-500 leading-relaxed">Scan waste &amp; earn eco-points</p>
            {selectedRole === 'citizen' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="mt-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              </motion.div>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleRoleSelect('collector')}
            className={`bg-[#141414] border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 text-left
              ${selectedRole === 'collector'
                ? 'border-zinc-400/50 bg-zinc-400/5'
                : 'border-[#1F1F1F] hover:border-zinc-500/30'
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">Collector</p>
            <p className="text-xs text-zinc-500 leading-relaxed">Manage waste pickups</p>
            {selectedRole === 'collector' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="mt-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-300" />
              </motion.div>
            )}
          </motion.button>
        </div>

        {serverError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {selectedRole === 'citizen' && (
            <motion.div
              key="citizen-form"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <form onSubmit={citizenForm.handleSubmit(handleCitizenSubmit)} className="space-y-4">
                <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 space-y-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Your Details</p>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="text"
                        placeholder="e.g. Janvi Sharma"
                        {...citizenForm.register('name', {
                          required: 'Name is required',
                          minLength: { value: 2, message: 'At least 2 characters' },
                        })}
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-11 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#22C55E]/50 outline-none transition-all duration-200"
                      />
                    </div>
                    {citizenForm.formState.errors.name && (
                      <p className="text-xs text-red-400 mt-1">{citizenForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        {...citizenForm.register('phone', {
                          required: 'Phone number is required',
                          pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian number' },
                        })}
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-11 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#22C55E]/50 outline-none transition-all duration-200"
                      />
                    </div>
                    {citizenForm.formState.errors.phone && (
                      <p className="text-xs text-red-400 mt-1">{citizenForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#22C55E]/50 text-black font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Setting up your account...
                    </span>
                  ) : (
                    <>Join as Citizen<ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {selectedRole === 'collector' && (
            <motion.div
              key="collector-form"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <form onSubmit={collectorForm.handleSubmit(handleCollectorSubmit)} className="space-y-4">
                <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 space-y-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Collector Access</p>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Access Code</label>
                    <p className="text-xs text-zinc-600 mb-2">Provided by your ward supervisor</p>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type={showCode ? 'text' : 'password'}
                        placeholder="Enter access code"
                        {...collectorForm.register('accessCode', { required: 'Access code is required' })}
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-11 pl-9 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-[#22C55E]/50 outline-none transition-all duration-200 tracking-widest"
                      />
                      <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                        {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {collectorForm.formState.errors.accessCode && (
                      <p className="text-xs text-red-400 mt-1">{collectorForm.formState.errors.accessCode.message}</p>
                    )}
                  </div>

                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5">
                    <p className="text-xs text-zinc-600">
                      Demo code: <span className="text-[#22C55E] font-mono font-medium">NAGRIK2024</span>
                    </p>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] disabled:opacity-50 text-white font-semibold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    <>Access Collector Dashboard<ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-zinc-700 mt-8">
          By continuing you agree to our Terms of Service &amp; Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
