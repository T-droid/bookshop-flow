import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorMessage = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="mt-1 text-[12px] text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 shadow-sm"
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export default ErrorMessage;
