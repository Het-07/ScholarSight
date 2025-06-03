export const useToast = () => {
  const toast = ({ title, description }) => {
    // For now, we'll just console.log the toast
    console.log(`${title}: ${description}`);
  };

  return { toast };
};
