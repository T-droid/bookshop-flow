import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { FieldError } from 'react-hook-form';

interface ErrorMessageProps {
  message?: string | FieldError;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const errorMessage =
    typeof message === 'string'
      ? message
      : message && typeof message === 'object' && 'message' in message
      ? message.message
      : '';

  return (
    <AnimatePresence>
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mt-1"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700">{errorMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface SuccessMessageProps {
  message: string;
  children?: React.ReactNode; // For additional content like badges
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, children }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mt-1"
          role="alert"
        >
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700">{message}</span>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
