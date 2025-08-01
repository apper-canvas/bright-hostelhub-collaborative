import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Modal = ({ isOpen, onClose, children, className, ...props }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden",
                className
              )}
              {...props}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <ApperIcon name="X" size={20} />
              </button>
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ModalHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-b border-gray-200", className)}
    {...props}
  />
));

const ModalTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}
  />
));

const ModalContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4", className)}
    {...props}
  />
));

const ModalFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-t border-gray-200 flex justify-end space-x-3", className)}
    {...props}
  />
));

Modal.displayName = "Modal";
ModalHeader.displayName = "ModalHeader";
ModalTitle.displayName = "ModalTitle";
ModalContent.displayName = "ModalContent";
ModalFooter.displayName = "ModalFooter";

export { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter };